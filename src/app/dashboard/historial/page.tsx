
// Código corregido con SWR (estructura base). Necesito tu API exacta para ajustar mejor.
// IMPORTANTE: Esto solo es una base estructurada. Ajustaremos cada detalle después.

// Debido al tamaño del archivo original y que debo mantenerlo limpio,
// aquí va la estructura corregida con SWR para reemplazar polling manual.

// Próximo paso: Pégame aquí mismo tus endpoints EXACTOS y tus filtros para integrarlos.
'use client';

import '@/app/style/style.css';
import '@/app/style/global-responsive.css';
import '@/app/style/components-responsive.css';
import '@/app/style/crud-responsive-pages.css';
import React, { useState, useRef, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/layout/MainLayout';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import ScrollableTable from '../../components/common/ScrollableTable';
import formatDateTime from '../../../lib/formatDate';
import { FaFilter, FaSearch, FaCalendarDay, FaFolder, FaUser } from 'react-icons/fa';
import { IoTimeSharp } from 'react-icons/io5';
import { IoIosPricetags } from 'react-icons/io';
import { PiNewspaperClippingFill } from 'react-icons/pi';
import toast from 'react-hot-toast';
import ModalBase from '../../components/modal/ModalBase';

// ✅ Fetcher optimizado con manejo de errores
const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar historial');
  return res.json();
};

type HistorialItem = {
  id: number;
  fecha: string | Date;
  tipo: 'CREAR' | 'ACTUALIZAR' | 'ELIMINAR' | 'LOGIN' | 'LOGOUT';
  accion: string;
  entidad?: string;
  entidadId?: number;
  detalle?: string;
  ip?: string;
  usuario?: {
    id: number;
    nombre: string;
    rol: string;
  };
};

type Filtros = {
  busqueda: string;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string;
  horaFin: string;
  tipo: string;
  entidad: string;
  usuarioId: string;
};

export default function HistorialPage() {
  const router = useRouter();
  const tableRef = useRef<HTMLDivElement>(null);

  const [selectedData, setSelectedData] = useState<HistorialItem | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  const [filtros, setFiltros] = useState<Filtros>({
    busqueda: '',
    fechaInicio: '',
    fechaFin: '',
    horaInicio: '',
    horaFin: '',
    tipo: '',
    entidad: '',
    usuarioId: '',
  });

  // ✅ Construir URL con useMemo (solo cambia cuando cambian filtros/página)
  const apiURL = useMemo(() => {
    let url = `/api/historial?page=${page}&limit=${limit}`;

    if (filtros.busqueda) url += `&q=${encodeURIComponent(filtros.busqueda)}`;
    if (filtros.tipo) url += `&tipo=${filtros.tipo}`;
    if (filtros.entidad) url += `&entidad=${filtros.entidad}`;
    if (filtros.usuarioId) url += `&usuarioId=${filtros.usuarioId}`;

    if (filtros.fechaInicio) {
      const inicio = new Date(filtros.fechaInicio);
      if (filtros.horaInicio) {
        const [h, m] = filtros.horaInicio.split(':');
        inicio.setHours(+h, +m, 0);
      }
      url += `&desde=${inicio.toISOString()}`;
    }

    if (filtros.fechaFin) {
      const fin = new Date(filtros.fechaFin);
      if (filtros.horaFin) {
        const [h, m] = filtros.horaFin.split(':');
        fin.setHours(+h, +m, 59);
      } else {
        fin.setHours(23, 59, 59);
      }
      url += `&hasta=${fin.toISOString()}`;
    }

    return url;
  }, [page, limit, filtros]);

  // ✅ SWR optimizado para Vercel
  const { data, error, isValidating, mutate } = useSWR(apiURL, fetcher, {
    refreshInterval: 180000, // Solo refresca cada 3 minutos
    revalidateOnFocus: false, // ❌ No refrescar al cambiar de pestaña
    revalidateOnReconnect: true, // ✅ Solo al reconectar internet
    dedupingInterval: 10000, // ✅ Evita requests duplicados en 10s
  });

  // ✅ Cargar usuarios para filtros
  const { data: usuariosData } = useSWR('/api/usuarios', fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false, // ✅ No revalidar si ya tiene datos
  });

  // ✅ Manejar estructura: usuariosData.data.items (no usuariosData.data)
  const usuarios = (usuariosData?.data?.items && Array.isArray(usuariosData.data.items)) ? usuariosData.data.items : [];
  const historial: HistorialItem[] = data?.data?.items || [];
  const total = data?.data?.total || 0;

  // ✅ Formatear datos (memoizado)
  const rows = useMemo(
    () =>
      historial.map((row: any) => ({
        ...row,
        fecha: row.fecha ? formatDateTime(row.fecha) : '',
      })),
    [historial]
  );

  // ✅ Calcular KPIs (memoizado)
  const kpis = useMemo(() => {
    const hoy = new Date().toISOString().split('T')[0];
    return {
      totalHoy: historial.filter(h => h.fecha.toString().includes(hoy)).length,
      ventas: historial.filter(h => h.entidad === 'Venta').length,
      cambios: historial.filter(h => h.tipo === 'ACTUALIZAR').length,
      logins: historial.filter(h => h.tipo === 'LOGIN').length,
    };
  }, [historial]);

  // ✅ Columnas de tabla
  const columns = useMemo(
    () => [
      { key: 'id', label: 'ID', width: '70px' },
      { key: 'fecha', label: 'Fecha y Hora', width: '180px' },
      { key: 'tipo', label: 'Tipo', width: '120px' },
      { key: 'usuario', label: 'Usuario', width: '150px' },
      { key: 'entidad', label: 'Entidad', width: '120px' },
      { key: 'accion', label: 'Acción', width: '300px' },
    ],
    []
  );

  // ✅ Aplicar filtros (refresca datos)
  const aplicarFiltros = useCallback(() => {
    setPage(1); // Reiniciar paginación
    mutate(); // Forzar refetch
  }, [mutate]);

  // ✅ Limpiar filtros
  const limpiarFiltros = useCallback(() => {
    setFiltros({
      busqueda: '',
      fechaInicio: '',
      fechaFin: '',
      horaInicio: '',
      horaFin: '',
      tipo: '',
      entidad: '',
      usuarioId: '',
    });
    setPage(1);
  }, []);

  // ✅ Exportar CSV
  const exportarCSV = useCallback(() => {
    const headers = ['ID', 'Fecha', 'Tipo', 'Usuario', 'Entidad', 'Acción'];
    const csvRows = rows.map(item => [
      item.id,
      item.fecha,
      item.tipo,
      item.usuario?.nombre || 'N/A',
      item.entidad || 'N/A',
      item.accion,
    ]);

    const csv = [
      headers.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historial_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('Historial exportado correctamente');
  }, [rows]);

  // ✅ Mostrar errores en useEffect (NO en el render)
  React.useEffect(() => {
    if (error) {
      toast.error('Error al cargar historial');
    }
  }, [error]);

  const historialInfo = selectedData && (
    <div className="sidebar-info">
      <hr className="HrImf" />
      <p>
        <strong>ID:</strong> {selectedData.id}
      </p>
      <p>
        <strong>Fecha:</strong> {selectedData.fecha}
      </p>
      <p>
        <strong>Tipo:</strong>{' '}
        <span
          style={{
            color:
              selectedData.tipo === 'CREAR'
                ? 'green'
                : selectedData.tipo === 'ELIMINAR'
                  ? 'red'
                  : selectedData.tipo === 'ACTUALIZAR'
                    ? 'orange'
                    : 'blue',
            fontWeight: 'bold',
          }}
        >
          {selectedData.tipo}
        </span>
      </p>
      {selectedData.usuario && (
        <p>
          <strong>Usuario:</strong> {selectedData.usuario.nombre}
        </p>
      )}
      {selectedData.entidad && (
        <p>
          <strong>Entidad:</strong> {selectedData.entidad}
        </p>
      )}
      {selectedData.entidadId && (
        <p>
          <strong>ID Empleado:</strong> {selectedData.entidadId}
        </p>
      )}
      <p>
        <strong>Acción:</strong> {selectedData.accion}
      </p>
      {selectedData.ip && (
        <p>
          <strong>IP:</strong> {selectedData.ip}
        </p>
      )}
      {selectedData.detalle && (
        <button className="botton-cell" onClick={() => setShowModal(true)}>
          Ver JSON completo
        </button>
      )}
    </div>
  );

  const sidebarButtons = [
    {
      label: 'Volver',
      onClick: () => router.push('/dashboard'),
      disabled: false,
    },
    {
      label: mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros',
      onClick: () => setMostrarFiltros(!mostrarFiltros),
      disabled: false,
    },
    {
      label: 'Exportar CSV',
      onClick: exportarCSV,
      disabled: rows.length === 0,
    },
  ];

  return (
    <MainLayout
      showSidebar={true}
      contentClassName="contenedor-ventas"
      sidebar={
        <Sidebar
          buttons={sidebarButtons}
          showInfo={true}
          infoContent={historialInfo}
          selected={!!selectedData}
        />
      }
      header={<Header title="Historial General" icon={<PiNewspaperClippingFill size={32} />} />}
    >
      {/* Modal Detalle */}
      {showModal && selectedData && (
        <ModalBase title={`Detalle acción #${selectedData.id}`} onClose={() => setShowModal(false)}>
          <pre className="modal-json">
            {(() => {
              try {
                return JSON.stringify(JSON.parse(selectedData.detalle ?? '{}'), null, 2);
              } catch {
                return selectedData.detalle;
              }
            })()}
          </pre>
        </ModalBase>
      )}

      {/* Panel de Filtros */}
      {mostrarFiltros && (
        <div className="filtros-panel">
          <div className="filtros-grid">
            <div>
              <label>
                <FaSearch /> Búscar
              </label>
              <input
                type="text"
                value={filtros.busqueda}
                onChange={e => setFiltros({ ...filtros, busqueda: e.target.value })}
                placeholder="Buscar en acciones..."
              />
            </div>

            <div>
              <label>
                <FaCalendarDay /> Fecha Inicio
              </label>
              <input
                type="date"
                value={filtros.fechaInicio}
                onChange={e => setFiltros({ ...filtros, fechaInicio: e.target.value })}
              />
            </div>

            <div>
              <label>
                <FaCalendarDay /> Fecha Fin
              </label>
              <input
                type="date"
                value={filtros.fechaFin}
                onChange={e => setFiltros({ ...filtros, fechaFin: e.target.value })}
              />
            </div>

            <div>
              <label>
                <IoTimeSharp /> Hora Inicio
              </label>
              <input
                type="time"
                value={filtros.horaInicio}
                onChange={e => setFiltros({ ...filtros, horaInicio: e.target.value })}
              />
            </div>

            <div>
              <label>
                <IoTimeSharp /> Hora Fin
              </label>
              <input
                type="time"
                value={filtros.horaFin}
                onChange={e => setFiltros({ ...filtros, horaFin: e.target.value })}
              />
            </div>

            <div>
              <label>
                <FaUser /> Usuario
              </label>
              <select
                value={filtros.usuarioId}
                onChange={e => setFiltros({ ...filtros, usuarioId: e.target.value })}
              >
                <option value="">Todos</option>
                {usuarios.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} ({u.rol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>
                <IoIosPricetags /> Tipo
              </label>
              <select
                value={filtros.tipo}
                onChange={e => setFiltros({ ...filtros, tipo: e.target.value })}
              >
                <option value="">Todos</option>
                <option value="CREAR">CREAR</option>
                <option value="ACTUALIZAR">ACTUALIZAR</option>
                <option value="ELIMINAR">ELIMINAR</option>
                <option value="LOGIN">LOGIN</option>
              </select>
            </div>

            <div>
              <label>
                <FaFolder /> Entidad
              </label>
              <select
                value={filtros.entidad}
                onChange={e => setFiltros({ ...filtros, entidad: e.target.value })}
              >
                <option value="">Todas</option>
                <option value="Venta">Venta</option>
                <option value="Cliente">Cliente</option>
                <option value="Producto">Producto</option>
                <option value="Aliado">Aliado</option>
                <option value="Usuario">Usuario</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button onClick={aplicarFiltros} className="btn-primary">
              <FaFilter /> Aplicar Filtros
            </button>
            <button onClick={limpiarFiltros} className="btn-secondaryy">
              Cancelar Filtros
            </button>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="kpi-container" style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <div className="kpi-card">
          <h3>Acciones Hoy</h3>
          <p className="kpi-value">{kpis.totalHoy}</p>
        </div>
        <div className="kpi-card">
          <h3>Ventas Creadas y Confrimadas</h3>
          <p className="kpi-value">{kpis.ventas}</p>
        </div>
        <div className="kpi-card">
          <h3>Actulizaciones Hechas</h3>
          <p className="kpi-value">{kpis.cambios}</p>
        </div>
        <div className="kpi-card">
          <h3>Ingresos y Salida del sistema</h3>
          <p className="kpi-value">{kpis.logins}</p>
        </div>
      </div>

      {/* Tabla */}
      <ScrollableTable
        ref={tableRef}
        columns={columns}
        data={rows.map(row => ({
          ...row,
          usuario: row.usuario?.nombre || 'Sistema',
          entidad: row.entidad || 'N/A',
        }))}
        selectedId={selectedId}
        onRowClick={(row: any) => {
          if (selectedId === row.id) {
            setSelectedId(null);
            setSelectedData(null);
          } else {
            setSelectedId(row.id);
            setSelectedData(row as HistorialItem);
          }
        }}
      />

      {/* Paginación */}
      <div className="pagination">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          ← Anterior
        </button>
        <span>
          Página {page} de {Math.ceil(total / limit)} ({total} registros)
        </span>
        <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / limit)}>
          Siguiente →
        </button>
      </div>
    </MainLayout>
  );
}
