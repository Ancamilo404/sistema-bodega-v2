import { prisma } from '@/lib/prisma';
import { response } from '@/lib/response';
import { validateBody } from '@/lib/validateBody';
import { usuarioPublicSchema } from '@/schemas/usuarioPublic';
import bcrypt from 'bcrypt';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await validateBody(req, usuarioPublicSchema);
    const correoNormalizado = body.correo.toLowerCase();
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const created = await prisma.usuario.create({
      data: {
        nombre: body.nombre,
        documento: body.documento,
        tipoId: body.tipoId,
        correo: correoNormalizado,
        password: hashedPassword,
        rol: 'USUARIO', // 👈 siempre usuario al registrarse
        estado: 'ACTIVO',
      },
    });

    // 🚩 Firmar token con id y rol
    const token = signToken({ id: created.id, rol: 'USUARIO' });

    return new Response(
      JSON.stringify({
        data: { id: created.id, correo: created.correo },
        message: 'Usuario registrado correctamente',
        error: null,
      }),
      {
        status: 201,
        headers: {
          'Set-Cookie': `auth=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (e: any) {
    if (e.code === 'P2002') return response({ error: 'Correo ya registrado' }, 409);
    if (e.code === 'VALIDATION') return response({ error: e.error }, 400);
    return response({ error: e.message || 'Error en registro' }, 500);
  }
}
