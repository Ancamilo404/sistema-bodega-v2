import { PrismaClient } from '@prisma/client'
import bcrypt from "bcrypt";

const prisma = new PrismaClient()

async function main() {
  // =======================
  // CLIENTES
  // =======================
  await prisma.cliente.createMany({
    data: [
      { nombre: "Juan Pérez", tipoId: "CC", documento: "123456", telefono: "3001112222", estado: "ACTIVO" },
      { nombre: "Comidas Rápidas Oliva", tipoId: "NIT", documento: "900123456", direccion: "Calle 10 #20-30", estado: "ACTIVO" },
      { nombre: "Ana Torres", tipoId: "CC", documento: "654321", estado: "BLOQUEADO" },
      { nombre: "Distribuidora La 14", tipoId: "NIT", documento: "901234567", estado: "ACTIVO" }
    ]
})

  // =======================
  // ALIADOS
  // =======================
  await prisma.aliado.createMany({
    data: [
      { nombre: "Proveedor A", tipoId: "NIT", documento: "800111222", telefono: "3102223333", estado: "ACTIVO" },
      { nombre: "Proveedor B", tipoId: "NIT", documento: "800333444", correo: "proveedorb@mail.com", estado: "ACTIVO" },
      { nombre: "Proveedor C", tipoId: "NIT", documento: "800555666", estado: "BLOQUEADO" },
      { nombre: "Proveedor D", tipoId: "NIT", documento: "800777888", estado: "ACTIVO" }
    ]
  })

  // =======================
  // USUARIOS
  // =======================
  const hashedPassword = await bcrypt.hash("123456", 10);
await prisma.usuario.createMany({
  data: [
    { nombre: "Camila Admin", tipoId: "CC", documento: "1001", password: hashedPassword, correo: "admin@gmail.com", rol: "ADMIN", estado: "ACTIVO" },
    { nombre: "Pedro Trabajador", tipoId: "CC", documento: "1002", correo: "pedro@mail.com", rol: "TRABAJADOR", estado: "ACTIVO" },
    { nombre: "Laura Vendedora", tipoId: "CC", documento: "1003", correo: "laura@mail.com", rol: "TRABAJADOR", estado: "BLOQUEADO" },
    { nombre: "Cliente Usuario", tipoId: "CC", documento: "1004", correo: "cliente@mail.com", rol: "USUARIO", estado: "ACTIVO" }
  ]
})

  // =======================
  // PRODUCTOS
  // =======================
  await prisma.producto.createMany({
    data: [
      { nombre: "Arroz 500g", precio: 2500, stock: 100, categoria: "Granos", aliadoId: 1, estado: "ACTIVO" },
      { nombre: "Aceite 1L", precio: 8000, stock: 50, categoria: "Aceites", aliadoId: 2, estado: "ACTIVO" },
      { nombre: "Azúcar 1kg", precio: 3000, stock: 70, categoria: "Endulzantes", aliadoId: 1, estado: "ACTIVO" },
      { nombre: "Sal 500g", precio: 1500, stock: 200, categoria: "Condimentos", aliadoId: 3, estado: "ACTIVO" }
    ]
  })

  // =======================
  // VENTAS
  // =======================
  await prisma.venta.createMany({
    data: [
      { referencia: "FAC-001", total: 10500, estado: "CONFIRMADA", metodoPago: "EFECTIVO", clienteId: 1, usuarioId: 1 },
      { referencia: "FAC-002", total: 8000, estado: "CONFIRMADA", metodoPago: "TARJETA", clienteId: 2, usuarioId: 2 },
      { referencia: "FAC-003", total: 3000, estado: "ANULADA", metodoPago: "EFECTIVO", clienteId: 3, usuarioId: 2 },
      { referencia: "FAC-004", total: 1500, estado: "EN_PROCESO", metodoPago: "TRANSFERENCIA", clienteId: 4, usuarioId: 1 }
    ]
  })

  // =======================
  // VENTA PRODUCTO
  // =======================
  await prisma.ventaProducto.createMany({
    data: [
      { ventaId: 1, productoId: 1, cantidad: 2, precioUnitario: 2500, subtotal: 5000 },
      { ventaId: 1, productoId: 2, cantidad: 1, precioUnitario: 8000, subtotal: 8000 },
      { ventaId: 2, productoId: 3, cantidad: 1, precioUnitario: 3000, subtotal: 3000 },
      { ventaId: 3, productoId: 4, cantidad: 1, precioUnitario: 1500, subtotal: 1500 }
    ]
  })

  // =======================
  // HISTORIAL
  // =======================
  await prisma.historial.createMany({
    data: [
      { tipo: "CREAR", accion: "Producto creado", entidad: "Producto", entidadId: 1, usuarioId: 1 },
      { tipo: "CREAR", accion: "Cliente creado", entidad: "Cliente", entidadId: 2, usuarioId: 2 },
      { tipo: "ACTUALIZAR", accion: "Venta confirmada", entidad: "Venta", entidadId: 1, usuarioId: 1 },
      { tipo: "LOGIN", accion: "Usuario inició sesión", entidad: "Usuario", entidadId: 1, usuarioId: 1 }
    ]
  })
}

main()
  .then(() => {
    console.log("✅ Seed completado con éxito")
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
