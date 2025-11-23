import { prisma } from '@/lib/prisma';
import { response } from '@/lib/response';
import { getAuthUser } from '@/lib/getAuthUser';

export async function GET(req: Request) {
  try {
        const user = await getAuthUser(req);
        if (!user || !["ADMIN", "TRABAJADOR"].includes(user.rol)) {
      return response({ error: 'No autorizado' }, 403);
    }

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 20);
    const entidad = searchParams.get('entidad');
    const usuarioId = searchParams.get('usuarioId');
    const tipo = searchParams.get('tipo');
    const desde = searchParams.get('desde');
    const hasta = searchParams.get('hasta');
    const q = searchParams.get('q');

    const where: any = {};
    if (entidad) where.entidad = entidad;
    if (usuarioId) where.usuarioId = Number(usuarioId);
    if (tipo) where.tipo = tipo;
    if (desde || hasta) {
      where.fecha = {};
      if (desde) where.fecha.gte = new Date(desde);
      if (hasta) where.fecha.lte = new Date(hasta);
    }
    if (q) {
      where.OR = [
        { accion: { contains: q, mode: 'insensitive' } },
        { detalle: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [historial, total] = await Promise.all([
      prisma.historial.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { fecha: 'desc' },
        include: { usuario: { select: { id: true, nombre: true, rol: true } } },
      }),
      prisma.historial.count({ where }),
    ]);

    return response({
      data: {
        page,
        limit,
        total,
        items: historial.map(h => ({
          id: h.id,
          fecha: h.fecha.toISOString(),
          tipo: h.tipo,
          accion: h.accion,
          entidad: h.entidad,
          entidadId: h.entidadId,
          detalle: h.detalle,
          ip: h.ip,
          usuario: h.usuario
            ? { id: h.usuario.id, nombre: h.usuario.nombre, rol: h.usuario.rol }
            : null,
        })),
      },
      message: 'Historial listado correctamente',
    });
  } catch (e: unknown) {
    const error = e as any;
    console.error('Error en /api/historial:', {
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
    });
    return response({ error: error.message || 'Error al listar historial' }, 500);
  }
}
