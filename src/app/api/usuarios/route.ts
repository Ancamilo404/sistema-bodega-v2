import { prisma } from '@/lib/prisma';
import { response } from '@/lib/response';
import { getAuthUser } from '@/lib/getAuthUser';
import { logHistorial } from '@/lib/logHistorial';
import { validateBody } from '@/lib/validateBody';
import { usuarioSchema } from '@/schemas/usuario';
import bcrypt from 'bcrypt';
import DOMPurify from 'isomorphic-dompurify';

// GET /api/usuarios?search=...&estado=...&correo=...&documento=...&fechaInicio=...&fechaFin=...&limit=50&offset=0
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || '';
    const estado = searchParams.get('estado')?.toUpperCase();
    const correo = searchParams.get('correo') || '';
    const documento = searchParams.get('documento') || '';
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));

    // ✅ Usar findMany en lugar de raw queries
    const where: any = {
      deletedAt: null,
      OR: [
        { nombre: { contains: search, mode: 'insensitive' } },
        { correo: { contains: search, mode: 'insensitive' } },
        { documento: { contains: search, mode: 'insensitive' } },
        { telefono: { contains: search, mode: 'insensitive' } },
      ],
    };

    if (estado && ['ACTIVO', 'BLOQUEADO'].includes(estado)) {
      where.estado = estado;
    }

    if (correo) {
      where.correo = correo.toLowerCase();
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
    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { fechaRegistro: 'desc' },
        select: {
          id: true,
          nombre: true,
          correo: true,
          documento: true,
          telefono: true,
          tipoId: true,
          rol: true,
          estado: true,
          fechaRegistro: true,
        },
      }),
      prisma.usuario.count({ where }),
    ]);

    // ✅ Serializar fechas
    const usuariosSerializados = usuarios.map((u: any) => ({
      ...u,
      fechaRegistro: u.fechaRegistro?.toISOString() || null,
    }));

    return response({
      data: { items: usuariosSerializados, total, limit, offset },
      message: 'Usuarios listados correctamente',
    });
  } catch (e: unknown) {
    const error = e as any;
    console.error('Error en /api/usuarios:', {
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
    });
    return response({ error: e.message || 'Error al listar usuarios' }, 500);
  }
}

// POST /api/usuarios → crea o reactiva usuario

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);   // ✅ ahora sí espera el resultado
    if (!user || user.rol !== 'ADMIN') {
      return response({ error: 'No autorizado' }, 403);
    }

    const body = await validateBody(req, usuarioSchema);
    // Sanitizar campos
    if (body.documento) body.documento = DOMPurify.sanitize(body.documento.trim());
    if (body.telefono) body.telefono = body.telefono.trim();
    if (body.correo) body.correo = DOMPurify.sanitize(body.correo.trim());

    const hashedPassword = body.password ? await bcrypt.hash(body.password, 10) : undefined;

    // Buscar si ya existe usuario con mismo documento
    const existing = await prisma.usuario.findUnique({
      where: { documento: body.documento },
    });

    let result;
    if (existing && existing.deletedAt) {
      // ✅ Reactivar usuario archivado
      result = await prisma.usuario.update({
        where: { id: existing.id },
        data: { ...body, password: hashedPassword, deletedAt: null, estado: 'ACTIVO' },
      });

      await logHistorial({
        tipo: 'ACTUALIZAR',
        accion: `Usuario ${result.nombre} reactivado`,
        entidad: 'Usuario',
        entidadId: result.id,
        usuarioId: user.id,
        detalle: result,
        ip: req.headers.get('x-forwarded-for') || undefined,
      });

      return response(
        {
          data: {
            ...result,
            fechaRegistro: result.fechaRegistro.toISOString(),
          },
          message: 'Usuario reactivado correctamente',
        },
        200
      );
    }

    if (existing) {
      return response({ error: 'Documento ya registrado' }, 409);
    }

    // ✅ Crear usuario nuevo
    result = await prisma.usuario.create({
      data: { ...body, password: hashedPassword },
    });

    await logHistorial({
      tipo: 'CREAR',
      accion: `Usuario ${result.nombre} creado`,
      entidad: 'Usuario',
      entidadId: result.id,
      usuarioId: user.id,
      detalle: result,
      ip: req.headers.get('x-forwarded-for') || undefined,
    });

    return response(
      {
        data: {
          ...result,
          fechaRegistro: result.fechaRegistro.toISOString(),
        },
        message: 'Usuario creado correctamente',
      },
      201
    );
  } catch (e: any) {
    if (e.code === 'P2002') return response({ error: 'Documento o correo ya registrado' }, 409);
    if (e.code === 'VALIDATION') return response({ error: e.error }, 400);
    return response({ error: e.message || 'Error al crear usuario' }, 500);
  }
}