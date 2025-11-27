import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// 🚩 El secreto DEBE estar en variables de entorno
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('❌ JWT_SECRET no está configurado en variables de entorno');
}

const SECRET = new TextEncoder().encode(JWT_SECRET);

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { id: number; rol: string };
  } catch {
    return null;
  }
}

const PUBLIC_EXACT = ['/', '/login', '/register', '/api/auth/login', '/api/auth/register'];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isExactPublic = PUBLIC_EXACT.includes(path);
  const isReportes = path.startsWith('/api/reportes/');
  const isPublic = isExactPublic || isReportes;

  const token = req.cookies.get('auth')?.value;
  const user = token ? await verifyToken(token) : null;

  // 👇 Debug
  console.log('TOKEN:', token?.slice(0, 30), '...');
  console.log('USER:', user);

  // 🚩 Caso 1: no autenticado → siempre a /login
  if (!isPublic && !user) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 🚩 Caso 2: autenticado pero rol = USUARIO → no puede entrar a la bodega
  if (
    user &&
    (path.startsWith('/dashboard') || path.startsWith('/auditoria')) &&
    user.rol === 'USUARIO'
  ) {
    const url = req.nextUrl.clone();
    url.pathname = '/noAutorizado';
    return NextResponse.redirect(url);
  }

  // 🚩 Caso 3: ADMIN o TRABAJADOR → dejar pasar
  const res = NextResponse.next();
  if (user) {
    res.headers.set('x-auth-user', JSON.stringify({ id: user.id, rol: user.rol }));
  }
  return res;
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/auditoria/:path*'],
  runtime: 'experimental-edge', // ✅ ahora sí funciona con jose
};
