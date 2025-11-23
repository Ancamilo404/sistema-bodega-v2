import { prisma } from '@/lib/prisma';
import { response } from '@/lib/response';
import { getAuthUser } from '@/lib/getAuthUser';
import { logHistorial } from '@/lib/logHistorial';
import { validateBody } from '@/lib/validateBody';
import { productoSchema } from '@/schemas/producto';

// GET /api/productos?search=...&estado=...&precioMin=...&precioMax=...&fechaInicio=...&fechaFin=...&limit=50&offset=0
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || '';
    const estado = searchParams.get('estado')?.toUpperCase();
    const precioMin = searchParams.get('precioMin');
    const precioMax = searchParams.get('precioMax');
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));

    // ✅ Usar findMany en lugar de raw queries para evitar prepared statement conflicts
    const where: any = {
      deletedAt: null,
    };

    // Búsqueda en múltiples campos
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
        { categoria: { contains: search, mode: 'insensitive' } },
        { unidad: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (estado && ['ACTIVO', 'BLOQUEADO'].includes(estado)) {
      where.estado = estado;
    }

    if (precioMin && precioMax) {
      where.precio = {
        gte: parseFloat(precioMin),
        lte: parseFloat(precioMax),
      };
    }

    if (fechaInicio && fechaFin) {
      where.creadoEn = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
      };
    }

    // ✅ Obtener total y lista con paginación (evita prepared statement conflicts)
    const [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        include: {
          aliado: {
            select: { id: true, nombre: true, documento: true },
          },
        },
        skip: offset,
        take: limit,
        orderBy: { creadoEn: 'desc' },
      }),
      prisma.producto.count({ where }),
    ]);

    // ✅ Serializar fechas
    const productosSerializados = productos.map((p: any) => ({
      ...p,
      creadoEn: p.creadoEn?.toISOString() || null,
      actualizadoEn: p.actualizadoEn?.toISOString() || null,
    }));

    return response({
      data: { items: productosSerializados, total, limit, offset },
      message: 'Productos listados correctamente',
    });
  } catch (e: unknown) {
    const error = e as any;
    console.error('Error en /api/productos:', {
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
    });
    return response({ error: error.message || 'Error al listar productos' }, 500);
  }
}

// POST /api/productos → crea o reactiva producto
export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || !['ADMIN', 'TRABAJADOR'].includes(user.rol)) {
      return response({ error: 'No autorizado' }, 403);
    }

    const body = await validateBody(req, productoSchema);

    // ⚡ Normalizar aliadoId vacío
    const data = {
      ...body,
      aliadoId: body.aliadoId ?? undefined,
    };

    // Buscar duplicados
    const existing = await prisma.producto.findFirst({
      where: {
        nombre: data.nombre,
        aliadoId: data.aliadoId ?? null,
      },
    });

    let result;
    if (existing && existing.deletedAt) {
      // ✅ Reactivar producto archivado
      result = await prisma.producto.update({
        where: { id: existing.id },
        data: { ...data, deletedAt: null, estado: 'ACTIVO' },
      });

      await logHistorial({
        tipo: 'ACTUALIZAR',
        accion: `Producto ${result.nombre} reactivado`,
        entidad: 'Producto',
        entidadId: result.id,
        usuarioId: user.id,
        detalle: result,
        ip: req.headers.get('x-forwarded-for') || undefined,
      });

      return response(
        {
          data: {
            ...result,
            creadoEn: result.creadoEn.toISOString(),
            actualizadoEn: result.actualizadoEn.toISOString(),
          },
          message: 'Producto reactivado correctamente',
        },
        200
      );
    } else if (existing) {
      return response({ error: 'Producto ya registrado para este aliado' }, 409);
    }

    // ✅ Crear producto nuevo
    result = await prisma.producto.create({ data });

    await logHistorial({
      tipo: 'CREAR',
      accion: `Producto ${result.nombre} creado`,
      entidad: 'Producto',
      entidadId: result.id,
      usuarioId: user.id,
      detalle: result,
      ip: req.headers.get('x-forwarded-for') || undefined,
    });

    return response(
      {
        data: {
          ...result,
          creadoEn: result.creadoEn.toISOString(),
          actualizadoEn: result.actualizadoEn.toISOString(),
        },
        message: 'Producto creado correctamente',
      },
      201
    );
  } catch (e: any) {
    if (e.code === 'VALIDATION') return response({ error: e.error }, 400);
    return response({ error: e.message || 'Error al crear producto' }, 500);
  }
}
