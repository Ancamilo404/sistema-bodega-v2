# 🚨 FIX PARA PREPARED STATEMENT ERROR

## El Problema
Cuando usas Supabase con el puerto `:6543` (pooler) en un entorno serverless como Next.js, Prisma crea prepared statements que pueden conflictuar si múltiples conexiones intentan reutilizarlas simultáneamente.

**Error visto:**
```
PostgresError { code: "42P05", message: "prepared statement \"s0\" already exists" }
```

## La Solución
Agregar `&statement_cache_size=0` al final de tu `DATABASE_URL` para que Prisma no cache los prepared statements.

## Pasos a Seguir

### 1. Actualiza tu archivo `.env` local
Tu `DATABASE_URL` debe verse así:

```env
DATABASE_URL="postgresql://user:password@host.supabase.com:6543/database?sslmode=require&statement_cache_size=0"
JWT_SECRET="tu-secreto-seguro"
```

**Importante:** El parámetro es `&statement_cache_size=0` al final, después de `sslmode=require`.

### 2. Cambios ya Aplicados ✅
- ✅ `src/app/api/aliados/route.ts` - Convertido a `findMany()` (evita raw queries)
- ✅ `src/app/api/productos/route.ts` - Convertido a `findMany()` (evita raw queries)
- ✅ `src/app/api/clientes/route.ts` - Convertido a `findMany()` (ya estaba)
- ✅ `src/app/api/usuarios/route.ts` - Convertido a `findMany()` (ya estaba)
- ✅ `.env.example` - Actualizado con el parámetro
- ✅ `README.md` - Documentado el parámetro
- ✅ `prisma/schema.prisma` - Comentario añadido

### 3. Prueba Local
```bash
npm run dev
```

### 4. Si Aún Falla
1. Verifica que tu `DATABASE_URL` incluya `&statement_cache_size=0`
2. Reinicia el servidor (`npm run dev`)
3. Intenta login nuevamente

### 5. Deploy a Vercel
Una vez que funcione localmente:
1. Actualiza la variable de entorno `DATABASE_URL` en Vercel con el mismo parámetro
2. Deploy: `git push origin main`

## Resumen Técnico
- **Root Cause**: Pooler + Prepared Statements + Serverless = conflictos de nombres ("s0", "s1")
- **Fix**: `statement_cache_size=0` deshabilita el cache de prepared statements
- **Trade-off**: Ligera penalización de performance (negligible en la mayoría de casos)
- **Alternativa**: Usar connection mode "Session" en Supabase (más lento pero sin conflictos)
