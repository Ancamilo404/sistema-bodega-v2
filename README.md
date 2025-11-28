# 📦 Sistema de Bodega - APP-BETA-5 

Un sistema profesional de gestión de inventario, ventas y clientes con autenticación por roles, auditoría, reportes analíticos interactivo.

**Construido con:** Next.js 15 • React 19 • Prisma • Neon PostgreSQL • TypeScript • TailwindCSS

---

## 🚀 Características Principales

✅ **Autenticación segura** con JWT y autenticación por roles (Admin, Empleado, Usuario)  
✅ **CRUD completo** de Usuarios, Clientes, Productos, Aliados y Ventas  
✅ **Búsqueda avanzada** con paginación y filtros en tiempo real  
✅ **Sistema de auditoría** que registra todas las acciones en historial  
✅ **Dashboard interactivo** con KPIs, gráficas y estadísticas  
✅ **Modal de información** con animaciones suaves y paleta gris profesional  
✅ **Notificaciones toast** para feedback inmediato del usuario  
✅ **Interfaz responsive** optimizada para móviles y desktop  
✅ **Middleware de seguridad** para proteger rutas

---

## 🛠️ Stack Tecnológico

### Frontend

- **Next.js 15.5.6** - App Router, API Routes serverless
- **React 19** - Componentes funcionales con hooks
- **TypeScript** - Type-safe development
- **CSS Modules** - Estilos componentizados con animaciones
- **react-icons** - Iconos profesionales
- **react-hot-toast** - Notificaciones no intrusivas
- **Lucide React** - Iconos adicionales

### Backend

- **Next.js API Routes** - Endpoints RESTful
- **Prisma ORM 6.17.1** - Gestión de BD con migrations
- **Middleware personalizado** - Validación JWT y roles

### Base de Datos

- **Neon PostgreSQL** - PostgreSQL serverless con pooling ilimitado
- **Prisma Migrations** - Control de versión del schema

### DevOps & Testing

- **Jest** - Unit testing
- **ESLint + Prettier** - Code quality
- **Vercel** - Deployment automático

---

## 📋 Instalación y Configuración

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/Ancamilo404/sistema-bodega-v2  mian portegida
cd app-beta-5
```

### 2️⃣ Instalar dependencias

```bash
npm install
```

### 3️⃣ Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Base de datos Neon
DATABASE_URL="postgresql://user:password@host.neon.tech/database?sslmode=require"

# Autenticación
JWT_SECRET="tu-secreto-super-seguro-min-32-caracteres"

# API URLs (para desarrollo local)
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 4️⃣ Sincronizar base de datos

```bash
# Crear/actualizar schema
npx prisma migrate dev

# Llenar datos iniciales (seed)
npx prisma db seed
```

### 5️⃣ Iniciar el servidor

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm run start
```

Abre [http://localhost:3001](http://localhost:3001) en tu navegador.

---

## 🔐 Credenciales de Prueba

| Rol          | Email            | Contraseña |
| ------------ | ---------------- | ---------- |
| **Admin**    | `admin@mail.com` | `123456`   |
| **Empleado** | `emple@mail.com` | `123456`   |
| **Usuario**  | `user@mail.com`  | `123456`   |

⚠️ **Cambiar contraseñas en producción**

---

## 📁 Estructura del Proyecto

```
app-beta-5/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Layout raíz (html, body, metadata)
│   │   ├── page.tsx                # Página principal
│   │   ├── globals.css             # Estilos globales
│   │   │
│   │   ├── api/                    # API Routes
│   │   │   ├── auth/               # Autenticación (login, register, me, logout)
│   │   │   ├── usuarios/           # CRUD de usuarios
│   │   │   ├── clientes/           # CRUD de clientes
│   │   │   ├── productos/          # CRUD de productos
│   │   │   ├── aliados/            # CRUD de aliados
│   │   │   ├── ventas/             # CRUD de ventas
│   │   │   ├── historial/          # Auditoría
│   │   │   └── reportes/           # Reportes analíticos
│   │   │
│   │   ├── dashboard/              # Dashboard principal
│   │   │   ├── layout.tsx          # Layout del dashboard
│   │   │   ├── page.tsx            # Menú principal
│   │   │   ├── dashboard.css       # Estilos del dashboard
│   │   │   ├── usuarios/           # Gestión de usuarios
│   │   │   ├── clientes/           # Gestión de clientes
│   │   │   ├── productos/          # Gestión de productos
│   │   │   ├── aliados/            # Gestión de aliados
│   │   │   ├── ventas/             # Sistema de ventas
│   │   │   └── historial/          # Auditoría
│   │   │
│   │   ├── login/                  # Página de login
│   │   ├── register/               # Página de registro
│   │   ├── noAutorizado/           # Página 403
│   │   └── noContruido/            # Página 404
│   │
│   ├── components/
│   │   ├── common/                 # Componentes reutilizables
│   │   │   ├── InfoTooltip.tsx     # Modal de información (con animación)
│   │   │   └── InfoTooltip.module.css
│   │   ├── modal/                  # Modales de CRUD
│   │   │   └── AddEditModal.tsx
│   │   ├── layout/                 # Componentes de layout
│   │   └── KPICard.tsx             # Tarjetas de KPI
│   │
│   ├── hooks/                      # Custom hooks
│   │   ├── useHistorial.ts
│   │   ├── useProductos.ts
│   │   └── useVentas.ts
│   │
│   ├── lib/                        # Utilidades y helpers
│   │   ├── prisma.ts              # Singleton de Prisma
│   │   ├── auth.ts                # Funciones de autenticación
│   │   ├── getAuthUser.ts         # Obtener usuario autenticado
│   │   ├── logHistorial.ts        # Registrar acciones
│   │   ├── validateBody.ts        # Validar request bodies
│   │   └── response.ts            # Formato estándar de respuestas
│   │
│   ├── schemas/                    # Zod schemas de validación
│   │   ├── usuario.ts
│   │   ├── cliente.ts
│   │   ├── producto.ts
│   │   ├── venta.ts
│   │   └── ...
│   │
│   └── middleware.ts               # Middleware JWT
│
├── prisma/
│   ├── schema.prisma               # Definición de BD
│   ├── migrations/                 # Historial de migrations
│   └── seed.ts                     # Datos iniciales
│
├── tests/
│   ├── unit/                       # Tests unitarios
│   └── integration/                # Tests de integración
│
└── public/                         # Assets estáticos
    └── logo.png                    # Favicon
```

---

## 🔄 Flujo de Autenticación

```
1. Usuario ingresa credenciales en /login
   ↓
2. POST /api/auth/login valida contra BD
   ↓
3. Server genera JWT con rol del usuario
   ↓
4. JWT se almacena en httpOnly cookie
   ↓
5. Middleware verifica JWT en cada request
   ↓
6. Router.push(/dashboard) si autenticación exitosa
```

---

## 📊 Endpoints Principales

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Crear cuenta
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/logout` - Cerrar sesión

### Usuarios

- `GET /api/usuarios?limit=10&offset=0` - Listar (paginado)
- `POST /api/usuarios` - Crear
- `PUT /api/usuarios/[id]` - Actualizar
- `DELETE /api/usuarios/[id]` - Eliminar

### Clientes

- `GET /api/clientes` - Listar
- `GET /api/clientes/[id]/ventas` - Ventas por cliente
- `POST /api/clientes` - Crear
- `PUT /api/clientes/[id]` - Actualizar
- `DELETE /api/clientes/[id]` - Eliminar

### Productos

- `GET /api/productos` - Listar
- `POST /api/productos` - Crear
- `PUT /api/productos/[id]` - Actualizar
- `DELETE /api/productos/[id]` - Eliminar

### Ventas

- `GET /api/ventas` - Listar
- `POST /api/ventas` - Crear venta
- `POST /api/ventas/[ventaId]/confirmar` - Confirmar venta
- `POST /api/ventas/[ventaId]/anular` - Anular venta

### Reportes

- `GET /api/reportes/dashboard` - KPIs generales
- `GET /api/reportes/ventas` - Reporte de ventas
- `GET /api/reportes/clientes` - Reporte de clientes
- `GET /api/reportes/productos` - Reporte de productos

---

## 🎨 Diseño y Estilos

### Paleta de Colores (InfoTooltip Modal)

- **Textos primarios**: `#333`
- **Fondos**: `#e5e7eb`, `#ddd`
- **Acentos grises**: `#555`, `#666`, `#999`
- **Tema**: Profesional industrial (bodega)

### Animaciones

- **Modal al abrir**: Fade-in del overlay + Slide-in del contenedor
- **Duración**: 0.3s - 0.35s con easing suave
- **Hover effects**: Transiciones suaves en botones y tarjetas

---

## 🐛 Bugs Conocidos y Soluciones

### ✅ SOLUCIONADO: Error 500 en /api/productos

**Problema**: Timeout en conexión a BD  
**Causa**: Supabase solo soportaba 9 conexiones simultáneas  
**Solución**: Migración a Neon PostgreSQL con pooling ilimitado

### ✅ SOLUCIONADO: Hydration error en dashboard

**Problema**: Etiquetas HTML duplicadas (nested html/body)  
**Solución**: Removidas etiquetas duplicadas en `dashboard/layout.tsx`

### ✅ SOLUCIONADO: asyncOptions.map error

**Problema**: undefined.map() en modal de CRUD  
**Solución**: Validar que asyncOptions[field.name] sea array antes de map()

### ✅ SOLUCIONADO: precioUnitario string

**Problema**: Precios llegaban como string desde form  
**Solución**: Convertir con `Number()` antes de enviar a API

---

## 📈 Optimizaciones de Performance

✅ **Paginación**: Limit 100 registros máximo por página  
✅ **Sin polling automático**: Refresco manual únicamente  
✅ **Singleton Prisma**: Una sola instancia de BD  
✅ **CSS Modules**: Estilos scoped, sin conflictos  
✅ **Next.js optimizations**: Image optimization, code splitting  
✅ **Middleware eficiente**: JWT validation sin DB hits

---

## 🚀 Deployment en Vercel

### 1. Push a GitHub

```bash
git add .
git commit -m "feat: Sistema de bodega completo"
git push origin main
```

### 2. Conectar a Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Importa repo de GitHub
3. Configura variables de entorno:
   - `DATABASE_URL` (desde Neon)
   - `JWT_SECRET`
4. Deploy automático ✨

### 3. Monitorear

- Vercel Dashboard → Logs
- Vercel Analytics → Performance
- Neon Console → Database health

---

## 📝 Variables de Entorno

| Variable              | Descripción                | Ejemplo                 |
| --------------------- | -------------------------- | ----------------------- |
| `DATABASE_URL`        | URL de conexión a Neon     | `postgresql://...`      |
| `JWT_SECRET`          | Secreto para firmar tokens | `min-32-caracteres`     |
| `NEXT_PUBLIC_API_URL` | URL de la API (frontend)   | `http://localhost:3001` |

---

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📞 Soporte

- 📧 Email: andres@mail.com
- 🐛 Issues: [GitHub Issues](https://github.com/Ancamilo404/sistema-bodega-v2/issues)
- 📚 Wiki: [Documentación completa](https://github.com/Ancamilo404/sistema-bodega-v2/wiki)

---


## 👏 Créditos

Desarrollado por **Andres Camilo** como sistema profesional de gestión de bodega.

Gracias a las comunidades de Next.js, Prisma y Neon por sus excelentes herramientas.

---

**Versión**: 1.0.0 (Producción)
#   T e s t   p r o t e c c i � n   r e a l  
 