import { prisma } from '@/lib/prisma';
import { response } from '@/lib/response';
import { getAuthUser } from '@/lib/getAuthUser';
import { logHistorial } from '@/lib/logHistorial';
import { validateBody } from '@/lib/validateBody';
import { usuarioUpdateSchema } from '@/schemas/usuarioUpdate';
import bcrypt from 'bcrypt';

// GET /api/usuarios/:id
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(params.id) },
      include: { ventas: true, historial: true },
    });

    if (!usuario) return response({ error: 'Usuario no encontrado' }, 404);
    if (usuario.deletedAt) return response({ error: 'Usuario archivado' }, 404);

    return response({
      data: {
        ...usuario,
        fechaRegistro: usuario.fechaRegistro.toISOString(), // ✅ Serializar fecha
      },
      message: 'Usuario obtenido correctamente',
    });
  } catch (e: any) {
    return response({ error: e.message || 'Error al obtener usuario' }, 500);
  }
}

// PUT /api/usuarios/:id → actualizar o intercambiar
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.rol !== 'ADMIN') {
      return response({ error: 'No autorizado' }, 403);
    }

    const body = await validateBody(req, usuarioUpdateSchema);

    // Sanitizar campos
    if (body.documento) body.documento = body.documento.trim();
    if (body.telefono) body.telefono = body.telefono.trim();
    if (body.correo) body.correo = body.correo.trim();

    const hashedPassword = body.password ? await bcrypt.hash(body.password, 10) : undefined;

    // Buscar si ya existe otro usuario con el mismo documento
    if (body.documento) {
      const existing = await prisma.usuario.findUnique({
        where: { documento: body.documento },
      });

      if (existing && existing.id !== Number(params.id)) {
        if (existing.deletedAt) {
          // ✅ Reactivar usuario archivado con nuevos datos
          const reactivated = await prisma.usuario.update({
            where: { id: existing.id },
            data: { ...body, password: hashedPassword, deletedAt: null, estado: 'ACTIVO' },
          });

          // ✅ Archivar el usuario actual
          const old = await prisma.usuario.update({
            where: { id: Number(params.id) },
            data: { deletedAt: new Date() },
          });

          await logHistorial({
            tipo: 'ACTUALIZAR',
            accion: `Usuario ${reactivated.nombre} reactivado con documento ${reactivated.documento}`,
            entidad: 'Usuario',
            entidadId: reactivated.id,
            usuarioId: user.id,
            detalle: reactivated,
            ip: req.headers.get('x-forwarded-for') || undefined,
          });

          await logHistorial({
            tipo: 'ELIMINAR',
            accion: `Usuario ${old.nombre} archivado con documento ${old.documento}`,
            entidad: 'Usuario',
            entidadId: old.id,
            usuarioId: user.id,
            detalle: old,
            ip: req.headers.get('x-forwarded-for') || undefined,
          });

          return response({
            data: reactivated,
            message: `Usuario intercambiado: se reactivó el documento ${reactivated.documento} y se archivó el documento ${old.documento}`,
          });
        }

        return response({ error: 'Documento ya registrado' }, 409);
      }
    }

    // ✅ Actualizar normalmente
    const updated = await prisma.usuario.update({
      where: { id: Number(params.id) },
      data: { ...body, password: hashedPassword },
    });

    await logHistorial({
      tipo: 'ACTUALIZAR',
      accion: `Usuario ${updated.nombre} actualizado`,
      entidad: 'Usuario',
      entidadId: updated.id,
      usuarioId: user.id,
      detalle: updated,
      ip: req.headers.get('x-forwarded-for') || undefined,
    });

    return response({ data: updated, message: 'Usuario actualizado correctamente' });
  } catch (e: any) {
    if (e.code === 'P2025') return response({ error: 'Usuario no encontrado' }, 404);
    if (e.code === 'P2002') return response({ error: 'Documento o correo ya registrado' }, 409);
    if (e.code === 'VALIDATION') return response({ error: e.error }, 400);
    return response({ error: e.message || 'Error al actualizar usuario' }, 500);
  }
}

// DELETE /api/usuarios/:id
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.rol !== 'ADMIN') {
      return response({ error: 'No autorizado' }, 403);
    }

    const archived = await prisma.usuario.update({
      where: { id: Number(params.id) },
      data: { deletedAt: new Date() },
    });

    await logHistorial({
      tipo: 'ELIMINAR',
      accion: `Usuario ${archived.nombre} archivado con documento ${archived.documento}`,
      entidad: 'Usuario',
      entidadId: archived.id,
      usuarioId: user.id,
      detalle: archived,
      ip: req.headers.get('x-forwarded-for') || undefined,
    });

    return response({
      data: { id: archived.id },
      message: 'Usuario archivado correctamente',
    });
  } catch (e: any) {
    if (e.code === 'P2025') return response({ error: 'Usuario no encontrado' }, 404);
    return response({ error: e.message || 'Error al archivar usuario' }, 500);
  }
}
