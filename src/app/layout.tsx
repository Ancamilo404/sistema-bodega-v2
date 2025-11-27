import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sistema de Bodega',
  description: 'Gestión de ventas, clientes, empleados y reportes',
  icons: {
    icon: '../../logoBlanco.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
