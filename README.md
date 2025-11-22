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

- **Frontend**: Next.js (App Router), React, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de datos**: PostgreSQL en Supabase
- **Autenticación**: JWT con `jose`
- **Hosting**: Vercel
- **Testing**: Jest + Testing Library

---

## 📦 Instalación local

1. Clona el repositorio:
   ```bash
   git  https://github.com/Ancamilo404/sistema-bodega-v1
   cd app-beta-5
   ```

comando para intalar dependencias
npm install @dependencia

bases de datos
npx prisma migrate dev
npx prisma db seed

corre
npm run dev

📊 Funcionalidades principales
Autenticación y roles (Admin, Trabajador, Usuario)

CRUD completo de clientes, productos, usuarios y ventas

Auditoría y registro en historial

Dashboard con KPIs y gráficas

Exportación de reportes

Middleware de seguridad con JWT
