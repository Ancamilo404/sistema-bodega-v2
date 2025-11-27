import { prisma } from '@/lib/prisma';
import { response } from '@/lib/response';
import { getAuthUser } from '@/lib/getAuthUser';
import { logHistorial } from '@/lib/logHistorial';
import { validateBody } from '@/lib/validateBody';
import { aliadoSchema } from '@/schemas/aliado';

// GET /api/aliados?search=...&estado=...&documento=...&fechaInicio=...&fechaFin=...&limit=50&offset=0
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
    };

    // Búsqueda en múltiples campos
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { documento: { contains: search, mode: 'insensitive' } },
        { telefono: { contains: search, mode: 'insensitive' } },
        { correo: { contains: search, mode: 'insensitive' } },
        { direccion: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (estado && ['ACTIVO', 'BLOQUEADO'].includes(estado)) {
      where.estado = estado;
    }

    if (documento && documento.trim()) {
      // ← Validar que NO esté vacío
      where.documento = documento;
    }

    if (fechaInicio && fechaFin) {
      where.fechaRegistro = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
      };
    }

    // ✅ Obtener total y lista con paginación (evita prepared statement conflicts)
    // ⚠️ OPTIMIZACIÓN: Si search está presente, NO hacer count (reduce conexiones en búsquedas)
    let total = 0;
    const aliados = await prisma.aliado.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { fechaRegistro: 'desc' },
    });

    // Count solo si NO hay búsqueda
    if (!search) {
      total = await prisma.aliado.count({ where });
    } else {
      total = offset + aliados.length;
    }

    // ✅ Serializar fechas
    const aliadosSerializados = aliados.map((a: any) => ({
      ...a,
      fechaRegistro: a.fechaRegistro?.toISOString() || null,
    }));

    return response({
      data: { items: aliadosSerializados, total, limit, offset },
      message: 'Aliados listados correctamente',
    });
  } catch (e: unknown) {
    const error = e as any;
    console.error('Error crítico en /api/aliados GET:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return response({ error: error.message || 'Error al listar aliados' }, 500);
  }
}

// POST /api/aliados → crea o reactiva aliado
export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || !['ADMIN', 'TRABAJADOR'].includes(user.rol)) {
      return response({ error: 'No autorizado' }, 403);
    }

    const body = await validateBody(req, aliadoSchema);
    if (body.documento) {
      body.documento = body.documento.trim();
    }
    if (body.telefono) body.telefono = body.telefono.trim();
    if (body.correo) body.correo = body.correo.trim();

    const existing = await prisma.aliado.findUnique({
      where: { documento: body.documento },
    });

    let result;
    if (existing && existing.deletedAt) {
      result = await prisma.aliado.update({
        where: { id: existing.id },
        data: { ...body, deletedAt: null, estado: 'ACTIVO' },
      });

      await logHistorial({
        tipo: 'ACTUALIZAR',
        accion: `Aliado ${result.nombre} reactivado`,
        entidad: 'Aliado',
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
          message: 'Aliado reactivado correctamente',
        },
        200
      );
    }

    if (existing) {
      return response({ error: 'Documento ya registrado' }, 409);
    }

    result = await prisma.aliado.create({ data: body });

    await logHistorial({
      tipo: 'CREAR',
      accion: `Aliado ${result.nombre} creado`,
      entidad: 'Aliado',
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
        message: 'Aliado creado correctamente',
      },
      201
    );
  } catch (e: any) {
    if (e.code === 'VALIDATION') return response({ error: e.error }, 400);
    return response({ error: e.message || 'Error al crear aliado' }, 500);
  }
}
