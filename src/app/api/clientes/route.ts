import { prisma } from '@/lib/prisma';
import { response } from '@/lib/response';
import { getAuthUser } from '@/lib/getAuthUser';
import { logHistorial } from '@/lib/logHistorial';
import { validateBody } from '@/lib/validateBody';
import { clienteSchema } from '@/schemas/cliente';
import DOMPurify from 'isomorphic-dompurify';

// GET /api/clientes?search=...&estado=...&documento=...&fechaInicio=...&fechaFin=...&limit=50&offset=0
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || '';
    const estado = searchParams.get('estado')?.toUpperCase();
    const documento = searchParams.get('documento') || '';
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));

    // ✅ Usar findMany en lugar de raw queries para evitar prepared statement conflicts
    const where: any = {
      deletedAt: null,
      OR: [
        { nombre: { contains: search, mode: 'insensitive' } },
        { documento: { contains: search, mode: 'insensitive' } },
        { direccion: { contains: search, mode: 'insensitive' } },
        { telefono: { contains: search, mode: 'insensitive' } },
      ],
    };

    if (estado && ['ACTIVO', 'BLOQUEADO'].includes(estado)) {
      where.estado = estado;
    }

    if (documento) {
      where.documento = documento;
    }

    if (fechaInicio && fechaFin) {
      where.fechaRegistro = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
      };
    }

    // ✅ Obtener total y lista con paginación
    // ⚠️ OPTIMIZACIÓN: Si search está presente, NO hacer count (reduce conexiones en búsquedas)
    let total = 0;
    const clientes = await prisma.cliente.findMany({
      where,
      include: {
        _count: {
          select: { ventas: { where: { estado: 'CONFIRMADA' } } },
        },
      },
      skip: offset,
      take: limit,
      orderBy: { fechaRegistro: 'desc' },
    });

    // Count solo si NO hay búsqueda
    if (!search) {
      total = await prisma.cliente.count({ where });
    } else {
      total = offset + clientes.length;
    }

    // ✅ Serializar fechas y agregar conteo
    const clientesSerializados = clientes
      .map((c: any) => ({
        ...c,
        fechaRegistro: c.fechaRegistro?.toISOString() || null,
        ventas: c._count?.ventas || 0,
      }))
      .map(({ _count, ...rest }: any) => rest);

    return response({
      data: { items: clientesSerializados, total, limit, offset },
      message: 'Clientes listados correctamente',
    });
  } catch (e: unknown) {
    const error = e as any;
    console.error('Error en /api/clientes:', {
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
    });
    return response({ error: error.message || 'Error al listar clientes' }, 500);
  }
}

// POST /api/clientes → crea o reactiva cliente
export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || !['ADMIN', 'TRABAJADOR'].includes(user.rol)) {
      return response({ error: 'No autorizado' }, 403);
    }

    const body = await validateBody(req, clienteSchema);
    if (body.documento) {
      body.documento = DOMPurify.sanitize(body.documento.trim());
    }
    if (body.telefono) body.telefono = body.telefono.trim();

    const existing = await prisma.cliente.findUnique({
      where: { documento: body.documento },
    });

    let result;
    if (existing && existing.deletedAt) {
      result = await prisma.cliente.update({
        where: { id: existing.id },
        data: {
          ...body,
          deletedAt: null,
          estado: 'ACTIVO',
        },
      });

      await logHistorial({
        tipo: 'ACTUALIZAR',
        accion: `Cliente ${result.nombre} reactivado`,
        entidad: 'Cliente',
        entidadId: result.id,
        usuarioId: user.id,
        detalle: result,
        ip: req.headers.get('x-forwarded-for') || undefined,
      });

      return response(
        {
          data: {
            ...result,
            fechaRegistro: result.fechaRegistro.toISOString(), // ✅ Serializar
          },
          message: 'Cliente reactivado correctamente',
        },
        200
      );
    }

    if (existing) {
      return response({ error: 'Documento ya registrado' }, 409);
    }

    result = await prisma.cliente.create({ data: body });

    await logHistorial({
      tipo: 'CREAR',
      accion: `Cliente ${result.nombre} creado`,
      entidad: 'Cliente',
      entidadId: result.id,
      usuarioId: user.id,
      detalle: result,
      ip: req.headers.get('x-forwarded-for') || undefined,
    });

    return response(
      {
        data: {
          ...result,
          fechaRegistro: result.fechaRegistro.toISOString(), // ✅ Serializar
        },
        message: 'Cliente creado correctamente',
      },
      201
    );
  } catch (e: any) {
    if (e.code === 'VALIDATION') return response({ error: e.error }, 400);
    return response({ error: e.message || 'Error al crear cliente' }, 500);
  }
}
