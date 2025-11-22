import { prisma } from "@/lib/prisma";
import { response } from "@/lib/response";
import { getAuthUser } from "@/lib/getAuthUser";
import { logHistorial } from "@/lib/logHistorial";
import { validateBody } from "@/lib/validateBody";
import { ventaProductoCreateSchema } from "@/schemas/ventaProducto";
import { ventaProductoUpdateSchema } from "@/schemas/ventaProductoUpdate";

// GET /api/ventas/:ventaId/items → lista ítems activos de una venta
export async function GET(req: Request, { params }: { params: { ventaId: string } }) {
  try {
    const items = await prisma.ventaProducto.findMany({
      where: {
        ventaId: Number(params.ventaId),
        NOT: { cantidad: 0 },   // 👈 solo ítems no anulados
      },
      include: { producto: true },
    });
    return response({ data: items, message: "Ítems de venta listados correctamente" });
  } catch (e: any) {
    return response({ error: e.message || "Error al listar ítems de venta" }, 500);
  }
}

// POST /api/ventas/:ventaId/items → agregar ítem
export async function POST(req: Request, { params }: { params: { ventaId: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user || !["ADMIN", "TRABAJADOR"].includes(user.rol)) {
      return response({ error: "No autorizado" }, 403);
    }

    const body = await validateBody(req, ventaProductoCreateSchema);
    const ventaId = Number(params.ventaId);

    const result = await prisma.$transaction(async (tx) => {
      const venta = await tx.venta.findUnique({ where: { id: ventaId } });
      if (!venta) throw new Error("Venta no encontrada");
      if (venta.estado === "ANULADA") throw new Error("No se pueden agregar ítems a una venta anulada");

      const producto = await tx.producto.findUnique({ where: { id: body.productoId } });
      if (!producto) throw new Error("Producto no encontrado");
      if (producto.estado === "BLOQUEADO") throw new Error("Producto bloqueado");
      if (producto.stock < body.cantidad) throw new Error(`Stock insuficiente para ${producto.nombre}`);

      const item = await tx.ventaProducto.create({
        data: {
          ventaId,
          productoId: body.productoId,
          cantidad: body.cantidad,
          precioUnitario: body.precioUnitario,
          subtotal: body.precioUnitario * body.cantidad,
          descuento: body.descuento,
          iva: body.iva,
          observaciones: body.observaciones,
        },
        include: { producto: true },
      });

      const items = await tx.ventaProducto.findMany({ where: { ventaId } });
      const total = items.reduce((acc, i) => acc + Number(i.subtotal), 0);
      await tx.venta.update({ where: { id: ventaId }, data: { total } });

      return item;
    });

    await logHistorial({
      tipo: "CREAR",
      accion: `Ítem agregado a venta #${params.ventaId}`,
      entidad: "VentaProducto",
      entidadId: result.id,
      usuarioId: user.id,
      detalle: result,
      ip: req.headers.get("x-forwarded-for") || undefined,
    });

    return response({ data: result, message: "Ítem agregado correctamente" }, 201);
  } catch (e: any) {
    if (e.code === "VALIDATION") return response({ error: e.error }, 400);
    return response({ error: e.message || "Error al agregar ítem a la venta" }, 500);
  }
}

// PUT /api/ventas/:ventaId/items/:itemId → actualizar ítem
export async function PUT(req: Request, { params }: { params: { ventaId: string; itemId: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user || !["ADMIN", "TRABAJADOR"].includes(user.rol)) {
      return response({ error: "No autorizado" }, 403);
    }

    const body = await validateBody(req, ventaProductoUpdateSchema);

    const existing = await prisma.ventaProducto.findUnique({
      where: { id: Number(params.itemId) },
      include: { producto: true, venta: true },
    });
    if (!existing) return response({ error: "Ítem no encontrado" }, 404);

    if (existing.cantidad === 0 && existing.subtotal === 0) {
      return response({ error: "Ítem anulado, no editable" }, 403);
    }

    const updated = await prisma.ventaProducto.update({
      where: { id: Number(params.itemId) },
      data: body,
      include: { producto: true, venta: true },
    });

    await logHistorial({
      tipo: "ACTUALIZAR",
      accion: `Ítem de venta #${updated.id} actualizado`,
      entidad: "VentaProducto",
      entidadId: updated.id,
      usuarioId: user.id,
      detalle: updated,
      ip: req.headers.get("x-forwarded-for") || undefined,
    });

    return response({ data: updated, message: "Ítem de venta actualizado correctamente" });
  } catch (e: any) {
    if (e.code === "P2025") return response({ error: "Ítem no encontrado" }, 404);
    if (e.code === "VALIDATION") return response({ error: e.error }, 400);
    return response({ error: e.message || "Error al actualizar ítem de venta" }, 500);
  }
}
export async function DELETE(req: Request, { params }: { params: { ventaId: string; itemId: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user || !["ADMIN", "TRABAJADOR"].includes(user.rol)) {
      return response({ error: "No autorizado" }, 403);
    }

    const existing = await prisma.ventaProducto.findUnique({
      where: { id: Number(params.itemId) },
      include: { producto: true, venta: true },
    });
    if (!existing) return response({ error: "Ítem no encontrado" }, 404);

    const anulada = await prisma.ventaProducto.update({
      where: { id: Number(params.itemId) },
      data: {
        observaciones: (existing.observaciones ?? "") + " | Ítem anulado",
        cantidad: 0,
        subtotal: 0,
      },
      include: { producto: true, venta: true },
    });

    const items = await prisma.ventaProducto.findMany({ where: { ventaId: Number(params.ventaId) } });
    const total = items.reduce((acc, i) => acc + Number(i.subtotal), 0);
    await prisma.venta.update({ where: { id: Number(params.ventaId) }, data: { total } });

    await logHistorial({
      tipo: "ACTUALIZAR",
      accion: `Ítem de venta #${anulada.id} anulado`,
      entidad: "VentaProducto",
      entidadId: anulada.id,
      usuarioId: user.id,
      detalle: anulada,
      ip: req.headers.get("x-forwarded-for") || undefined,
    });

    return response({ data: { id: anulada.id }, message: "Ítem de venta anulado correctamente" });
  } catch (e: any) {
    return response({ error: e.message || "Error al anular ítem de venta" }, 500);
  }
}
