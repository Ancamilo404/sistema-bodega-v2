// api/clientes/[id]/route
import { prisma } from '@/lib/prisma';
import { response } from '@/lib/response';
import { getAuthUser } from '@/lib/getAuthUser';
import { logHistorial } from '@/lib/logHistorial';
import { validateBody } from '@/lib/validateBody';
import { clienteUpdateSchema } from '@/schemas/clienteUpdate';

// GET /api/clientes/:id
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(params.id) },
      include: { ventas: true },
    });
    if (!cliente) return response({ error: 'Cliente no encontrado' }, 404);
    if (cliente.deletedAt) return response({ error: 'Cliente archivado' }, 404);
    return response({ data: cliente, message: 'Cliente obtenido correctamente' });
  } catch (e: any) {
    return response({ error: e.message || 'Error al obtener cliente' }, 500);
  }
}

// PUT /api/clientes/:id
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user || !['ADMIN', 'TRABAJADOR'].includes(user.rol)) {
      return response({ error: 'No autorizado' }, 403);
    }

    const body = await validateBody(req, clienteUpdateSchema);
    if (body.documento) {
      body.documento = body.documento.trim();
    }
    if (body.telefono) body.telefono = body.telefono.trim();

    // 🔹 Buscar si ya existe otro cliente con ese documento
    if (body.documento) {
      const existing = await prisma.cliente.findUnique({
        where: { documento: body.documento },
      });

      if (existing && existing.id !== Number(params.id)) {
        if (existing.deletedAt) {
          // ✅ Reactivar cliente archivado con nuevos datos
          const reactivated = await prisma.cliente.update({
            where: { id: existing.id },
            data: {
              ...body,
              deletedAt: null,
              estado: 'ACTIVO',
            },
          });

          // Opcional: archivar el cliente actual
          const old = await prisma.cliente.update({
            where: { id: Number(params.id) },
            data: { deletedAt: new Date() },
          });

          // 🔹 Aquí van los dos logs
          await logHistorial({
            tipo: 'ACTUALIZAR',
            accion: `Cliente ${reactivated.nombre} reactivado con documento ${reactivated.documento}`,
            entidad: 'Cliente',
            entidadId: reactivated.id,
            usuarioId: user.id,
            detalle: reactivated,
            ip: req.headers.get('x-forwarded-for') || undefined,
          });

          await logHistorial({
            tipo: 'ELIMINAR',
            accion: `Cliente ${old.nombre} archivado con documento ${old.documento}`,
            entidad: 'Cliente',
            entidadId: old.id,
            usuarioId: user.id,
            detalle: old,
            ip: req.headers.get('x-forwarded-for') || undefined,
          });
          return response({
            data: reactivated,
            message: `Cliente intercambiado: se reactivó el documento ${reactivated.documento} y se archivó el documento ${old.documento}`,
          });
        }

        // Ya existe activo → error
        return response({ error: 'Documento ya registrado' }, 409);
      }
    }

    // ✅ Actualizar normalmente si no hay conflicto
    const updated = await prisma.cliente.update({
      where: { id: Number(params.id) },
      data: body,
    });

    await logHistorial({
      tipo: 'ACTUALIZAR',
      accion: `Cliente ${updated.nombre} actualizado`,
      entidad: 'Cliente',
      entidadId: updated.id,
      usuarioId: user.id,
      detalle: updated,
      ip: req.headers.get('x-forwarded-for') || undefined,
    });

    return response({ data: updated, message: 'Cliente actualizado correctamente' });
  } catch (e: any) {
    if (e.code === 'P2025') return response({ error: 'Cliente no encontrado' }, 404);
    if (e.code === 'VALIDATION') return response({ error: e.error }, 400);
    return response({ error: e.message || 'Error al actualizar cliente' }, 500);
  }
}

// DELETE /api/clientes/:id
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user || !['ADMIN', 'TRABAJADOR'].includes(user.rol)) {
      return response({ error: 'No autorizado' }, 403);
    }

    const archived = await prisma.cliente.update({
      where: { id: Number(params.id) },
      data: { deletedAt: new Date() },
    });

    await logHistorial({
      tipo: 'ELIMINAR',
      accion: `Cliente ${archived.nombre} archivado`,
      entidad: 'Cliente',
      entidadId: archived.id,
      usuarioId: user.id,
      detalle: archived,
      ip: req.headers.get('x-forwarded-for') || undefined,
    });

    return response({ data: { id: archived.id }, message: 'Cliente archivado correctamente' });
  } catch (e: any) {
    if (e.code === 'P2025') return response({ error: 'Cliente no encontrado' }, 404);
    if (e.code === 'P2003')
      return response({ error: 'No se puede eliminar: cliente con ventas asociadas' }, 409);
    return response({ error: e.message || 'Error al eliminar cliente' }, 500);
  }
}

//app/api/cleintes/[id]/route.ts
