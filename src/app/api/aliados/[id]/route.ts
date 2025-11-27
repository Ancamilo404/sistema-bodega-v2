import { prisma } from '@/lib/prisma';
import { response } from '@/lib/response';
import { getAuthUser } from '@/lib/getAuthUser';
import { logHistorial } from '@/lib/logHistorial';
import { validateBody } from '@/lib/validateBody';
import { aliadoUpdateSchema } from '@/schemas/aliadoUpdate';

// GET /api/aliados/:id
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const aliado = await prisma.aliado.findUnique({
      where: { id: Number(params.id) },
      include: { productos: true },
    });
    if (!aliado) return response({ error: 'Aliado no encontrado' }, 404);
    if (aliado.deletedAt) return response({ error: 'Aliado archivado' }, 404);
    return response({ data: aliado, message: 'Aliado obtenido correctamente' });
  } catch (e: any) {
    return response({ error: e.message || 'Error al obtener aliado' }, 500);
  }
}

// PUT /api/aliados/:id → actualizar o intercambiar
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user || !['ADMIN', 'TRABAJADOR'].includes(user.rol)) {
      return response({ error: 'No autorizado' }, 403);
    }

    const body = await validateBody(req, aliadoUpdateSchema);
    if (body.documento) {
      body.documento = body.documento.trim();
    }
    if (body.telefono) body.telefono = body.telefono.trim();
    if (body.correo) body.correo = body.correo.trim();

    if (body.documento) {
      const existing = await prisma.aliado.findUnique({
        where: { documento: body.documento },
      });

      if (existing && existing.id !== Number(params.id)) {
        if (existing.deletedAt) {
          // ✅ Reactivar aliado archivado con nuevos datos
          const reactivated = await prisma.aliado.update({
            where: { id: existing.id },
            data: { ...body, deletedAt: null, estado: 'ACTIVO' },
          });

          // ✅ Archivar el aliado actual
          const old = await prisma.aliado.update({
            where: { id: Number(params.id) },
            data: { deletedAt: new Date() },
          });

          await logHistorial({
            tipo: 'ACTUALIZAR',
            accion: `Aliado ${reactivated.nombre} reactivado con documento ${reactivated.documento}`,
            entidad: 'Aliado',
            entidadId: reactivated.id,
            usuarioId: user.id,
            detalle: reactivated,
            ip: req.headers.get('x-forwarded-for') || undefined,
          });

          await logHistorial({
            tipo: 'ELIMINAR',
            accion: `Aliado ${old.nombre} archivado con documento ${old.documento}`,
            entidad: 'Aliado',
            entidadId: old.id,
            usuarioId: user.id,
            detalle: old,
            ip: req.headers.get('x-forwarded-for') || undefined,
          });

          return response({
            data: reactivated,
            message: `Aliado intercambiado: se reactivó el documento ${reactivated.documento} y se archivó el documento ${old.documento}`,
          });
        }

        return response({ error: 'Documento ya registrado' }, 409);
      }
    }

    // ✅ Actualizar normalmente
    const updated = await prisma.aliado.update({
      where: { id: Number(params.id) },
      data: body,
    });

    await logHistorial({
      tipo: 'ACTUALIZAR',
      accion: `Aliado ${updated.nombre} actualizado`,
      entidad: 'Aliado',
      entidadId: updated.id,
      usuarioId: user.id,
      detalle: updated,
      ip: req.headers.get('x-forwarded-for') || undefined,
    });

    return response({ data: updated, message: 'Aliado actualizado correctamente' });
  } catch (e: any) {
    if (e.code === 'P2025') return response({ error: 'Aliado no encontrado' }, 404);
    if (e.code === 'VALIDATION') return response({ error: e.error }, 400);
    return response({ error: e.message || 'Error al actualizar aliado' }, 500);
  }
}

// DELETE /api/aliados/:id
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user || !['ADMIN', 'TRABAJADOR'].includes(user.rol)) {
      return response({ error: 'No autorizado' }, 403);
    }

    const archived = await prisma.aliado.update({
      where: { id: Number(params.id) },
      data: { deletedAt: new Date() },
    });

    await logHistorial({
      tipo: 'ELIMINAR',
      accion: `Aliado ${archived.nombre} archivado`,
      entidad: 'Aliado',
      entidadId: archived.id,
      usuarioId: user.id,
      detalle: archived,
      ip: req.headers.get('x-forwarded-for') || undefined,
    });

    return response({ data: { id: archived.id }, message: 'Aliado archivado correctamente' });
  } catch (e: any) {
    if (e.code === 'P2025') return response({ error: 'Aliado no encontrado' }, 404);
    return response({ error: e.message || 'Error al archivar aliado' }, 500);
  }
}
