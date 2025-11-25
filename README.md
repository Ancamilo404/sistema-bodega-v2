# Sistema de Inventario - APP-BETA-5

Un sistema completo de gestión de inventario con autenticación por roles, auditoría, reportes y dashboard interactivo.  
Construido con **Next.js, Prisma, Supabase y TailwindCSS**.

---

## 🚀 Demo en Producción

👉 [Ver demo en Vercel](https://sistema-bodega-v1.vercel.app)
Credenciales de prueba:

- **Admin**
  - Correo: `admin@mail.com`
  - Contraseña: `123456`

- **Empleado**
  - Correo: `emple@mail.com`
  - Contraseña: `123456`

---

## 🛠️ Tecnologías usadas

- **Frontend**: Next.js (App Router), React, CSS puro, SWR
- **Backend**: Next.js API Routes, Prisma ORM (singleton pattern)
- **Base de datos**: PostgreSQL en Supabase (con pooler `:6543`)
- **Autenticación**: JWT con `jose`
- **Hosting**: Vercel (Serverless)
- **Testing**: Jest + Testing Library

---

## 📋 Soluciones aplicadas para escalabilidad

### ✅ Paginación en todos los endpoints

- Los GET principales (`/api/usuarios`, `/api/clientes`, `/api/aliados`, `/api/productos`, `/api/ventas`) ahora soportan:
  - `limit` (máximo 100 registros por página)
  - `offset` (para pagination)
  - Total count para el frontend

### ✅ Sin polling automático

- Dashboard con **SWR** (`refreshInterval: 0`)
- Refresco manual mediante botones
- Solo actualizaciones cuando el usuario las solicita

### ✅ Prisma Singleton Pattern

- Una única instancia de PrismaClient en `src/lib/prisma.ts`
- Evita saturación de conexiones
- Mejor manejo de memoria en Vercel serverless

### ✅ Pooler de Supabase

- `DATABASE_URL` configurado con puerto `:6543`
- Reutiliza conexiones en lugar de crear nuevas
- Soporta múltiples usuarios simultáneos

### ✅ Logs mejorados en backend

- Todos los endpoints capturan y loguean errores específicos
- Mensajes en formato JSON para debugging en Vercel
- Error codes de Prisma para mejor diagnóstico

---

## 📦 Instalación local

1. Clona el repositorio:

   ```bash
   git clone https://github.com/Ancamilo404/sistema-bodega-v2
   cd app-beta-5
   ```

2. Instala dependencias:

   ```bash
   npm install
   ```

3. Configura variables de entorno (`.env`):

   ```env
   DATABASE_URL="postgresql://user:password@host.supabase.com:6543/database?sslmode=require&statement_cache_size=0"
   JWT_SECRET="tu-secreto-seguro-aqui"
   ```

   **⚠️ IMPORTANTE**: Agregar `&statement_cache_size=0` al DATABASE_URL para evitar conflictos de prepared statements con el pooler de Supabase en conexiones simultáneas.

4. Sincroniza la base de datos:

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Inicia el servidor:
   ```bash
   npm run dev
   ```

---

## 🔧 Cómo escalar a múltiples usuarios

### Para 3-10 usuarios simultáneos:

- ✅ Paginación (ya implementada)
- ✅ Sin polling automático
- ✅ Pooler de Supabase (ya configurado)
- ✅ Singleton Prisma (ya implementado)

### Para +50 usuarios:

- Considera upgrading del plan de Supabase (más conexiones)
- Implementar Redis cache para datos frecuentes
- Agregar CDN para assets estáticos
- Monitorear DB en el Dashboard de Supabase

---

## 📊 Monitoreo

Para ver errores en producción:

1. Vercel Dashboard → Logs
2. Supabase → Logs de la base de datos
3. Frontend → Consola del navegador (error en rojo)

📊 Funcionalidades principales
Autenticación y roles (Admin, Trabajador, Usuario)

CRUD completo de clientes, productos, usuarios y ventas

Auditoría y registro en historial

Dashboard con KPIs y gráficas

Exportación de reportes

Middleware de seguridad con JWT
