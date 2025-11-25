import { prisma } from "@/lib/prisma";
import { response } from "@/lib/response";
import { getAuthUser } from "@/lib/getAuthUser";
import { logHistorial } from "@/lib/logHistorial";
import { validateBody } from "@/lib/validateBody";
import { ventaSchema } from "@/schemas/venta";

// GET /api/ventas?page=1&limit=50 → lista todas con paginación
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Math.min(Number(searchParams.get('limit') ?? 50), 100);
    const skip = (page - 1) * limit;

    const [ventas, total] = await Promise.all([
      prisma.venta.findMany({
        include: {
          cliente: true,
          usuario: true,
          items: { include: { producto: true } },
        },
        skip,
        take: limit,
        orderBy: { creadoEn: 'desc' },
      }),
      prisma.venta.count(),
    ]);

    return response({
      data: { items: ventas, total, page, limit },
      message: "Ventas listadas correctamente",
    });
  } catch (e: unknown) {
    const error = e as any;
    console.error("Error en /api/ventas GET:", {
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
    });
    return response({ error: error.message || "Error al listar ventas" }, 500);
  }
}

// POST /api/ventas → crea una nueva venta (EN_PROCESO)
export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || !["ADMIN", "TRABAJADOR"].includes(user.rol)) {
      return response({ error: "No autorizado" }, 403);
    }

    // ✅ Validación con Zod
    const body = await validateBody(req, ventaSchema);

    const created = await prisma.$transaction(async (tx) => {
      // Validar stock dentro de la transacción
      for (const item of body.items) {
        const producto = await tx.producto.findUnique({ where: { id: item.productoId } });
        if (!producto) throw new Error(`Producto ${item.productoId} no encontrado`);
        if (producto.stock < item.cantidad) {
          throw new Error(`Stock insuficiente para ${producto.nombre}`);
        }
      }

      // Crear venta con items
      const venta = await tx.venta.create({
        data: {
          referencia: `FAC-${Date.now()}`, // referencia única
          clienteId: body.clienteId,
          usuarioId: user.id,
          metodoPago: body.metodoPago,
          observaciones: body.observaciones,
          impuesto: body.impuesto,
          descuento: body.descuento,
          total: 0, // se recalcula abajo
          items: {
            create: body.items.map((i) => ({
              productoId: i.productoId,
              cantidad: i.cantidad,
              precioUnitario: i.precioUnitario,
              subtotal: i.precioUnitario * i.cantidad,
              descuento: i.descuento,
              iva: i.iva,
              observaciones: i.observaciones,
            })),
          },
        },
        include: { items: true },
      });

      // Calcular total
      const total = venta.items.reduce((acc, i) => acc + Number(i.subtotal), 0);

      // Actualizar total
      return await tx.venta.update({
        where: { id: venta.id },
        data: { total },
        include: { cliente: true, usuario: true, items: { include: { producto: true } } },
      });
    });

    // Registrar en historial (fuera de la transacción principal)
    await logHistorial({
      tipo: "CREAR",
      accion: `Venta ${created.referencia} creada`,
      entidad: "Venta",
      entidadId: created.id,
      usuarioId: user.id,
      detalle: created,
      ip: req.headers.get("x-forwarded-for") || undefined,
    });

    return response({ data: created, message: "Venta creada correctamente" }, 201);
  } catch (e: any) {
    if (e.code === "VALIDATION") return response({ error: e.error }, 400);
    return response({ error: e.message || "Error al crear venta" }, 500);
  }
}
