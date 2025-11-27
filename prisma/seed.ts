import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // =======================
  // CLIENTES
  // =======================
  await prisma.cliente.createMany({
    data: [
      {
        nombre: 'Juan Pérez',
        tipoId: 'CC',
        documento: '123456',
        telefono: '3001112222',
        estado: 'ACTIVO',
      },
      {
        nombre: 'Comidas Rápidas Oliva',
        tipoId: 'NIT',
        documento: '900123456',
        direccion: 'Calle 10 #20-30',
        estado: 'ACTIVO',
      },
      { nombre: 'Ana Torres', tipoId: 'CC', documento: '654321', estado: 'BLOQUEADO' },
      { nombre: 'Distribuidora La 14', tipoId: 'NIT', documento: '901234567', estado: 'ACTIVO' },
    ],
  });

  // =======================
  // ALIADOS
  // =======================
  await prisma.aliado.createMany({
    data: [
      {
        nombre: 'Proveedor A',
        tipoId: 'NIT',
        documento: '800111222',
        telefono: '3102223333',
        correo: 'proveedorA@gmail.com',
        imagen:
          'https://thumbs.dreamstime.com/b/alphabet-letter-colorful-autumn-leaves-vector-typography-graphic-alphabet-letters-alphabet-letter-colorful-autumn-318661212.jpg',
        estado: 'ACTIVO',
      },
      {
        nombre: 'Proveedor B',
        tipoId: 'NIT',
        documento: '800333444',
        telefono: '3203334444',
        correo: 'proveedorb@gmail.com',
        imagen:
          'https://img.freepik.com/premium-photo/fashionable-stylish-alphabets-typography-letter-b_706402-459.jpg',
        estado: 'ACTIVO',
      },
      {
        nombre: 'Proveedor C',
        tipoId: 'NIT',
        documento: '800555666',
        telefono: '3304445555',
        correo: 'proveedorC@gmail.com',
        imagen: 'https://img.freepik.com/premium-photo/floral-letter-c_919729-1093.jpg',
        estado: 'BLOQUEADO',
      },
      {
        nombre: 'Proveedor D',
        tipoId: 'NIT',
        documento: '800777888',
        telefono: '3405556666',
        correo: 'proveedorD@gmail.com',
        imagen:
          'https://img.freepik.com/premium-photo/maroon-vector-letter-d-ornamental-red-letter-d-hyperrealistic-style_899449-493751.jpg',
        estado: 'ACTIVO',
      },
    ],
  });

  // =======================
  // USUARIOS
  // =======================
  const hashedPassword = await bcrypt.hash('123456', 10);
  await prisma.usuario.createMany({
    data: [
      {
        nombre: 'Admin',
        tipoId: 'CC',
        documento: '1001',
        password: hashedPassword,
        correo: 'admin@gmail.com',
        rol: 'ADMIN',
        estado: 'ACTIVO',
      },
      {
        nombre: 'Emple',
        tipoId: 'CC',
        documento: '1002',
        correo: 'emple@gmail.com',
        rol: 'TRABAJADOR',
        estado: 'ACTIVO',
      },
      {
        nombre: 'Laura',
        tipoId: 'CC',
        documento: '1003',
        correo: 'laura@gmail.com',
        rol: 'TRABAJADOR',
        estado: 'BLOQUEADO',
      },
      {
        nombre: 'User',
        tipoId: 'CC',
        documento: '1004',
        correo: 'user@gmail.com',
        rol: 'USUARIO',
        estado: 'ACTIVO',
      },
    ],
  });

  // =======================
  // PRODUCTOS
  // =======================
  await prisma.producto.createMany({
    data: [
      {
        nombre: 'Arroz 500g',
        descripcion: 'Arroz de alta calidad',
        precio: '2500.00',
        stock: 98,
        categoria: 'Granos',
        unidad: 'kg',
        imagen: 'https://tse3.mm.bing.net/th/id/OIP.-686xJh_4M5CqHrGRj57LQHaD3?rs=1&pid=ImgDetMain',
        aliadoId: 1,
        estado: 'ACTIVO',
      },
      {
        nombre: 'Aceite 1L',
        descripcion: 'Aceite vegetal premium',
        precio: '8000.00',
        stock: 49,
        categoria: 'Aceites',
        unidad: 'litro',
        imagen: 'https://th.bing.com/th/id/R.babd0fceb6dd25ae31c29511bf4af810',
        aliadoId: 2,
        estado: 'ACTIVO',
      },
      {
        nombre: 'Azúcar 1kg',
        descripcion: 'Azúcar refinada blanca',
        precio: '3000.00',
        stock: 70,
        categoria: 'Endulzantes',
        unidad: 'kg',
        imagen: 'https://tse3.mm.bing.net/th/id/OIP._txjkNp2rDTGkrlq7ykJZgHaEK?rs=1&pid=ImgDetMain',
        aliadoId: 1,
        estado: 'ACTIVO',
      },
      {
        nombre: 'Sal 500g',
        descripcion: 'Sal marina refinada',
        precio: '1500.00',
        stock: 199,
        categoria: 'Condimentos',
        unidad: 'kg',
        imagen: 'https://tse2.mm.bing.net/th/id/OIP.J-vM7zPHY8j5b23Dra5FUgHaEc?rs=1&pid=ImgDetMain',
        aliadoId: 3,
        estado: 'ACTIVO',
      },
      {
        nombre: 'Miel 1L',
        descripcion: 'Miel dulce natural',
        precio: '2000.00',
        stock: 20,
        categoria: 'Endulzantes',
        unidad: 'unidad',
        imagen: 'https://tse3.mm.bing.net/th/id/OIP.8z-rM7GqeEJIIAli-_0PqQHaEo?rs=1&pid=ImgDetMain',
        aliadoId: null,
        estado: 'ACTIVO',
      },
    ],
  });

  // =======================
  // VENTAS
  // =======================
  await prisma.venta.createMany({
    data: [
      {
        referencia: 'FAC-001',
        total: '10500.00',
        estado: 'CONFIRMADA',
        metodoPago: 'EFECTIVO',
        clienteId: 1,
        usuarioId: 1,
      },
      {
        referencia: 'FAC-002',
        total: '8000.00',
        estado: 'CONFIRMADA',
        metodoPago: 'TARJETA',
        clienteId: 2,
        usuarioId: 2,
      },
      {
        referencia: 'FAC-003',
        total: '3000.00',
        estado: 'ANULADA',
        metodoPago: 'EFECTIVO',
        clienteId: 3,
        usuarioId: 2,
      },
      {
        referencia: 'FAC-004',
        total: '1500.00',
        estado: 'EN_PROCESO',
        metodoPago: 'TRANSFERENCIA',
        clienteId: 4,
        usuarioId: 1,
      },
    ],
  });

  // =======================
  // VENTA PRODUCTO
  // =======================
  await prisma.ventaProducto.createMany({
    data: [
      { ventaId: 1, productoId: 1, cantidad: 2, precioUnitario: '2500.00', subtotal: '5000.00' },
      { ventaId: 1, productoId: 2, cantidad: 1, precioUnitario: '8000.00', subtotal: '8000.00' },
      { ventaId: 2, productoId: 3, cantidad: 1, precioUnitario: '3000.00', subtotal: '3000.00' },
      { ventaId: 3, productoId: 4, cantidad: 1, precioUnitario: '1500.00', subtotal: '1500.00' },
    ],
  });

  // =======================
  // HISTORIAL
  // =======================
  await prisma.historial.createMany({
    data: [
      { tipo: 'CREAR', accion: 'Producto creado', entidad: 'Producto', entidadId: 1, usuarioId: 1 },
      { tipo: 'CREAR', accion: 'Cliente creado', entidad: 'Cliente', entidadId: 2, usuarioId: 2 },
      {
        tipo: 'ACTUALIZAR',
        accion: 'Venta confirmada',
        entidad: 'Venta',
        entidadId: 1,
        usuarioId: 1,
      },
      {
        tipo: 'LOGIN',
        accion: 'Usuario inició sesión',
        entidad: 'Usuario',
        entidadId: 1,
        usuarioId: 1,
      },
    ],
  });
}

main()
  .then(() => {
    console.log('✅ Seed completado con éxito');
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
