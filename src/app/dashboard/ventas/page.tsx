'use client';
import '@/app/style/style.css';
import '@/app/style/global-responsive.css';
import '@/app/style/components-responsive.css';
import '@/app/style/crud-responsive-pages.css';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/layout/MainLayout';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import Table from '../../components/common/Table';
import formatDateTime from '../../../lib/formatDate';
import { FaShoppingCart } from 'react-icons/fa';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { FaFileDownload } from 'react-icons/fa';

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
};

type Cliente = {
  id: number;
  nombre: string;
  documento: string;
};

type VentaItem = {
  id: number | string; // string para temporales
  productoId: number;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  empleado: string;
  ingreso: string;
  pending?: boolean; // para mostrar como pendiente
};

export default function VentaPage() {
  const router = useRouter();
  const tableRef = useRef<HTMLDivElement>(null);

  // Estado de la venta
  const [ventaId, setVentaId] = useState<number | null>(null);
  const [ordenActual, setOrdenActual] = useState(1); // ✅ Contador de órdenes
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [metodoPago, setMetodoPago] = useState<'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO'>(
    'EFECTIVO'
  );
  const [observaciones, setObservaciones] = useState('');
  const [descuentoGlobal, setDescuentoGlobal] = useState(0);
  const [impuestoGlobal, setImpuestoGlobal] = useState(0); // ✅ 19% por defecto

  // Estado del formulario de agregar producto
  const [productoId, setProductoId] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState(1);

  // Listas
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [items, setItems] = useState<VentaItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | string | null>(null);

  // Usuario actual
  const [usuario, setUsuario] = useState<any>(null);

  // ✅ Cargar productos, clientes y contador de órdenes
  useEffect(() => {
    fetch('/api/productos')
      .then(res => res.json())
      .then(json => setProductos(json.data?.items || []));

    fetch('/api/clientes')
      .then(res => res.json())
      .then(json => setClientes(json.data?.items || []));

    // ✅ Obtener el número de orden actual
    fetch('/api/ventas')
      .then(res => res.json())
      .then(json => {
        const totalVentas = json.data?.total ?? 0;
        setOrdenActual(totalVentas + 1);
      });

    // ✅ Obtener usuario real desde /api/auth/me
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(json => {
        if (json.data) setUsuario(json.data);
      });
  }, []);

  // ✅ Calcular totales
  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
  const descuento = descuentoGlobal;
  const baseImponible = subtotal - descuento;
  const impuesto = impuestoGlobal > 0 ? (baseImponible * impuestoGlobal) / 100 : 0;
  const totalAPagar = baseImponible + impuesto;

  // ✅ Agregar producto a la venta (solo localmente)
  const agregarProducto = () => {
    if (!clienteId) {
      toast.error('Debes seleccionar un cliente primero');
      return;
    }

    if (!productoId || cantidad <= 0) {
      toast.error('Selecciona un producto y cantidad válida');
      return;
    }

    const producto = productos.find(p => p.id === productoId);
    if (!producto) {
      toast.error('Producto no encontrado');
      return;
    }

    if (cantidad > producto.stock) {
      toast.error(`Stock insuficiente. Disponible: ${producto.stock}`);
      return;
    }

    // ✅ Agregar ítem SOLO localmente (no al backend)
    const nuevoItem: VentaItem = {
      id: `${Date.now()}`, // ID temporal
      productoId,
      producto: producto.nombre,
      cantidad,
      precioUnitario: producto.precio,
      subtotal: producto.precio * cantidad,
      empleado: usuario?.nombre || usuario?.correo || 'N/A',
      ingreso: formatDateTime(new Date()),
    };

    setItems(prev => [...prev, nuevoItem]);
    toast.success(`${producto.nombre} agregado`);
    limpiarFormulario();
  };

  // ✅ Eliminar ítem (solo local)
  const eliminarItem = () => {
    if (!selectedItemId) return;
    setItems(prev => prev.filter(item => item.id !== selectedItemId));
    setSelectedItemId(null);
    toast.success('Producto eliminado');
  };

  // ✅ Eliminar todo (limpiar venta actual)
  const eliminarTodo = () => {
    const confirmacion = window.confirm('¿Eliminar todos los productos?');
    if (!confirmacion) return;

    setItems([]);
    setClienteId(null);
    setDescuentoGlobal(0);
    setObservaciones('');
    toast.success('Venta limpiada');
  };

  // ✅ Terminar venta (crear en backend)
  const terminarVenta = async () => {
    if (items.length === 0) {
      toast.error('Agrega al menos un producto');
      return;
    }

    if (!clienteId) {
      toast.error('Selecciona un cliente');
      return;
    }

    try {
      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId,
          metodoPago,
          observaciones,
          impuesto: impuestoGlobal,
          descuento: descuentoGlobal,
          items: items.map(i => ({
            productoId: i.productoId,
            cantidad: i.cantidad,
            precioUnitario: Number(i.precioUnitario) || 0,
            descuento: 0,
            iva: 0,
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Error al crear venta');
        return;
      }

      // Confirmar la venta explícitamente
      const confirmRes = await fetch(`/api/ventas/${json.data.id}/confirmar`, {
        method: 'PATCH',
      });
      const confirmJson = await confirmRes.json();

      if (!confirmRes.ok) {
        toast.error(confirmJson.error || 'Error al confirmar venta');
        return;
      }

      toast.success(`Venta #${confirmJson.data.id} confirmada exitosamente`);

      // Limpiar estado para la siguiente venta
      setItems([]);
      setClienteId(null);
      setDescuentoGlobal(0);
      setImpuestoGlobal(0);
      setObservaciones('');
      setOrdenActual(prev => prev + 1);

      // Opcional: redirigir al historial
      // router.push('/dashboard/historial');
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  // ✅ Ver factura (preview)
  const verFactura = () => {
    if (items.length === 0) {
      toast.error('No hay productos en la venta');
      return;
    }

    const clienteNombre = clientes.find(c => c.id === clienteId)?.nombre || 'N/A';

    alert(`
========== FACTURA ==========

Orden: ${ordenActual}
Cliente: ${clienteNombre}
Método de pago: ${metodoPago}

Productos:
${items.map(i => `- ${i.producto} x${i.cantidad} = $${i.subtotal.toFixed(2)}`).join('\n')}

Subtotal: $${subtotal.toFixed(2)}
Descuento: -$${descuento.toFixed(2)}
Impuesto (${impuestoGlobal}%): $${impuesto.toFixed(2)}


Observaciones: ${observaciones || 'N/A'}

TOTAL: $${totalAPagar.toFixed(2)}



=============================
    `);
  };
  const descargarFactura = () => {
    if (items.length === 0) {
      toast.error('No hay productos en la venta');
      return;
    }

    const clienteNombre = clientes.find(c => c.id === clienteId)?.nombre || 'N/A';

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('FACTURA', 10, 10);

    doc.setFontSize(12);
    doc.text(`Orden: ${ordenActual}`, 10, 20);
    doc.text(`Cliente: ${clienteNombre}`, 10, 30);
    doc.text(`Método de pago: ${metodoPago}`, 10, 40);

    let y = 50;
    items.forEach(i => {
      doc.text(`- ${i.producto} x${i.cantidad} = $${i.subtotal.toFixed(2)}`, 10, y);
      y += 10;
    });

    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 10, y + 10);
    doc.text(`Descuento: -$${descuento.toFixed(2)}`, 10, y + 20);
    doc.text(`Impuesto (${impuestoGlobal}%): $${impuesto.toFixed(2)}`, 10, y + 30);
    doc.text(`TOTAL: $${totalAPagar.toFixed(2)}`, 10, y + 40);

    doc.text(`Observaciones: ${observaciones || 'N/A'}`, 10, y + 50);

    doc.save(`factura-${ordenActual}.pdf`);
  };

  const limpiarFormulario = () => {
    setProductoId(null);
    setCantidad(1);
  };

  // ✅ Información del sidebar (reutilizando estilos de aliados)
  const ventaInfo = clienteId && (
    <div className="sidebar-info">
      <hr className="HrImf" />
      <p>
        <strong>Orden:</strong> {ordenActual}
      </p>
      <p>
        <strong>Cliente:</strong> {clientes.find(c => c.id === clienteId)?.nombre}
      </p>
      <p>
        <strong>Productos:</strong> {items.length}
      </p>
      <p>
        <strong>Subtotal:</strong> ${subtotal.toFixed(2)}
      </p>
      <p>
        <strong>Descuento:</strong> -${descuento.toFixed(2)}
      </p>
      <p>
        <strong>Impuesto:</strong> +${impuesto.toFixed(2)}
      </p>
      <hr style={{ margin: '10px 0' }} />
      <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#28a745' }}>
        <strong>Total:</strong> ${totalAPagar.toFixed(2)}
      </p>
    </div>
  );

  // ✅ Botones del sidebar (reutilizando estilos)
  const sidebarButtons = [
    {
      label: 'Volver',
      onClick: () => router.push('/dashboard'),
      className: 'btn-volver',
    },
    {
      label: 'Eliminar',
      onClick: eliminarItem,
      disabled: !selectedItemId,
    },
    {
      label: 'Eliminar todo',
      onClick: eliminarTodo,
      disabled: items.length === 0,
    },
  ];

  // ✅ Columnas de la tabla
  const columns = [
    { key: 'id', label: 'Id', width: '50px' },
    { key: 'producto', label: 'Producto', width: '150px' },
    { key: 'cantidad', label: 'Cantidad', width: '80px' },
    { key: 'precioUnitario', label: 'Costo', width: '100px' },
    { key: 'subtotal', label: 'Total', width: '100px' },
    { key: 'empleado', label: 'Empleado', width: '100px' },
    { key: 'ingreso', label: 'Ingreso', width: '150px' },
  ];

  const productoSeleccionado = productos.find(p => p.id === productoId);

  return (
    <MainLayout
      showSidebar={true}
      contentClassName="contenedor-ventas"
      sidebar={
        <Sidebar
          buttons={sidebarButtons}
          showInfo={!!clienteId}
          infoContent={ventaInfo}
          // selected={!!selectedItemId}
          selected={true}
        />
      }
      header={<Header title="Venta" icon={<FaShoppingCart size={32} />} />}
      footer={
        <div className="main-footer">
          <hr className="HrImf" />
          <p>Total a Pagar: ${totalAPagar.toFixed(2)}</p>
          <div className="bt-footer">
            <button onClick={verFactura} className="boton">
              Ver Factura
            </button>
            <button onClick={descargarFactura} className="boton">
              <FaFileDownload />
            </button>

            <button onClick={terminarVenta} className="boton btn-terminar">
              Terminar
            </button>
          </div>
        </div>
      }
    >
      {/* ✅ Formulario de agregar producto (reutilizando estilos de search-bar) */}
      <div className="form-descr-produ">
        <div>
          <label>Producto:</label>
          <select
            value={productoId || ''}
            onChange={e => setProductoId(Number(e.target.value))}
            className="input-search"
          >
            <option value="">Seleccionar...</option>
            {productos.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre} (Stock: {p.stock})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Cantidad: {productoSeleccionado?.stock || 0} /</label>
          <input
            type="number"
            min="1"
            max={productoSeleccionado?.stock || 1}
            value={cantidad === 0 ? '' : cantidad}
            onChange={e => {
              const value = e.target.value;
              setCantidad(value === '' ? 0 : Number(value));
            }}
            className="input-search"
          />
        </div>

        <div>
          <label>Cliente:</label>
          <select
            value={clienteId || ''}
            onChange={e => setClienteId(Number(e.target.value))}
            className="input-search"
          >
            <option value="">Seleccionar...</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Observaciones:</label>
          <input
            type="text"
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            className="input-search"
            placeholder="Opcional..."
          />
        </div>

        <div>
          <label>Descuento ($):</label>
          <input
            type="number"
            min="0"
            value={descuentoGlobal === 0 ? '' : descuentoGlobal}
            onChange={e => {
              const value = e.target.value;
              setDescuentoGlobal(value === '' ? 0 : Number(value));
            }}
            className="input-search"
          />
        </div>

        <div>
          <label>Impuesto (%):</label>
          <input
            type="number"
            min="0"
            max="100"
            value={impuestoGlobal === 0 ? '' : impuestoGlobal}
            onChange={e => {
              const value = e.target.value;
              setImpuestoGlobal(value === '' ? 0 : Number(value));
            }}
            className="input-search"
          />
        </div>
        <div>
          <label>Método Pago:</label>
          <select
            value={metodoPago}
            onChange={e => setMetodoPago(e.target.value as any)}
            className="input-search"
          >
            <option value="EFECTIVO">EFECTIVO</option>
            <option value="TARJETA">TARJETA</option>
            <option value="TRANSFERENCIA">TRANSFERENCIA</option>
            <option value="OTRO">OTRO</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
          <button onClick={agregarProducto} className="boton">
            Guardar
          </button>
          <div>
            <label className="orden">Orden: {ordenActual}</label>
          </div>
        </div>
      </div>
      <hr className="HrImf" />

      {/* ✅ Tabla de ítems (reutilizando componente Table) */}
      <Table
        wrapperRef={tableRef}
        columns={columns}
        data={items.map(item => ({
          ...item,
          precioUnitario: `$${(Number(item.precioUnitario) || 0).toFixed(2)}`,
          subtotal: `$${(Number(item.subtotal) || 0).toFixed(2)}`,
        }))}
        selectedId={selectedItemId}
        onRowClick={row => {
          setSelectedItemId(selectedItemId === row.id ? null : row.id);
        }}
      />
    </MainLayout>
  );
}
