'use client';
import '@/app/style/style.css';
import '@/app/style/global-responsive.css';
import '@/app/style/components-responsive.css';
import '@/app/style/crud-responsive-pages.css';
import React, { useState, useRef, useCallback } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/layout/MainLayout';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import SearchBar from '../../components/common/SearchBar';
import ScrollableTable from '../../components/common/ScrollableTable';
import formatDateTime from '../../../lib/formatDate';
import { HiUserGroup } from 'react-icons/hi';
import AddEditModal from '../../components/modal/AddEditModal';
import DeleteConfirmModal from '../../components/modal/DeleteConfirmModal';
import ModalBase from '../../components/modal/ModalBase';
import { useVentas } from '@/hooks/useVentas';
import toast from 'react-hot-toast';

// fetcher global
const fetcher = (url) => fetch(url).then(r => r.json());

export default function ClientesPage() {
  const router = useRouter();
  const tableRef = useRef(null);

  // Estado
  const [selectedData, setSelectedData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // SWR principal
  const { data, error, mutate } = useSWR('/api/clientes', fetcher, {
    refreshInterval: 0, // sin polling
    revalidateOnFocus: true,
  });
  if (error) {
  return <div style={{color:'red',padding:'1rem'}}>Error: {error.message || JSON.stringify(error)}</div>;
}

  const clientesRaw = !data || !data.data ? [] : data.data;

  const clientes = clientesRaw.map(row => ({
    ...row,
    ventas: typeof row.ventas === 'number' ? row.ventas : Number(row.ventas ?? 0),
    fechaRegistro: row.fechaRegistro ? formatDateTime(row.fechaRegistro) : '',
  }));

  const lista = isSearching ? searchResults : clientes;

  const { items: ventas, fetchNext, total, loading } = useVentas(selectedData?.id ?? null);

  const abrirModalVentas = useCallback((cliente) => {
    setSelectedData(cliente);
    setModalType('ventas');
    setShowModal(true);
  }, []);

  const columnas = clientes.length
    ? Object.keys(clientes[0])
        .filter(k => [
          'id','nombre','tipoId','documento','direccion','telefono','ventas','fechaRegistro','estado'
        ].includes(k))
        .map(k => ({ key: k, label: k.toUpperCase(), width: '150px' }))
    : [];

  const clientInfo = selectedData && (
    <div className="sidebar-info">
      <hr className="HrImf" />
      <p><strong>Ventas: </strong>
        <button className="botton-cell" onClick={() => abrirModalVentas(selectedData)}>
          # {selectedData.ventas ?? 0}
        </button>
      </p>
      <p><strong>Tipo Doc:</strong> {selectedData.tipoId}</p>
      <p><strong>Num Doc:</strong> {selectedData.documento}</p>
      <p><strong>Nombre:</strong> {selectedData.nombre}</p>
      {selectedData.telefono && <p><strong>Teléfono:</strong> {selectedData.telefono}</p>}
      {selectedData.direccion && <p><strong>Dirección:</strong> {selectedData.direccion}</p>}
      <p><strong>Estado:</strong> {selectedData.estado}</p>
      <p><strong>Ingreso:</strong> {selectedData.fechaRegistro}</p>
    </div>
  );

  const sidebarButtons = [
    { label: 'Volver', onClick: () => router.push('/dashboard'), className: 'btn-activo' },
    { label: 'Registrar', onClick: () => { setModalType('add'); setShowModal(true); } },
    { label: 'Editar', onClick: () => { setModalType('edit'); setShowModal(true); }, disabled: !selectedData },
    { label: 'Eliminar', onClick: () => { setModalType('delete'); setShowModal(true); }, disabled: !selectedData },
  ];

  return (
    <MainLayout
      showSidebar={true}
      sidebar={
        <>
          <Sidebar
            buttons={sidebarButtons}
            showInfo={true}
            infoContent={clientInfo}
            selected={!!selectedData}
          />

          {showModal && modalType === 'ventas' && selectedData && (
            <ModalBase title={`Ventas de ${selectedData.nombre}`} onClose={() => setShowModal(false)}>
              {ventas.length === 0 ? (
                <p className="modal-empty">No hay ventas registradas</p>
              ) : (
                <>
                  <ul className="modal-list">
                    {ventas.map(v => (
                      <li key={v.id}>#{v.id} – {formatDateTime(v.fecha)} – Total: ${v.total}</li>
                    ))}
                  </ul>
                  {ventas.length < total && (
                    <button onClick={fetchNext} disabled={loading} className="modal-load-more">
                      {loading ? 'Cargando...' : 'Ver más'}
                    </button>
                  )}
                </>
              )}
            </ModalBase>
          )}
        </>
      }
      header={<Header title="Clientes" icon={<HiUserGroup size={32} />} onBack={() => router.back()} />}
    >
      <SearchBar
        module="clientes"
        placeholder="Buscar cliente..."
        onResults={(items) => {
          setIsSearching(true);
          setSearchResults(items.map(r => ({
            ...r,
            ventas: typeof r.ventas === 'number' ? r.ventas : Number(r.ventas ?? 0),
            fechaRegistro: r.fechaRegistro ? formatDateTime(r.fechaRegistro) : ''
          })));
        }}
        onClear={() => setIsSearching(false)}
      />

      <ScrollableTable
        ref={tableRef}
        columns={columnas}
        data={lista.map(row => ({
          ...row,
          ventas: <span onClick={() => abrirModalVentas(row)}>{row.ventas}</span>,
        }))}
        selectedId={selectedId}
        onRowClick={(row) => {
          if (selectedId === row.id) {
            setSelectedId(null);
            setSelectedData(null);
          } else {
            setSelectedId(row.id);
            setSelectedData(row);
          }
        }}
      />

      {/* MODAL AGREGAR */}
      {showModal && modalType==='add' && (
        <AddEditModal
          entity="cliente"
          onClose={() => setShowModal(false)}
          onSuccess={async nuevo => {
            await mutate(); // refresca sin polling
            setShowModal(false);
            toast.success('Cliente registrado');
          }}
        />
      )}

      {/* MODAL EDITAR */}
      {showModal && modalType==='edit' && selectedData && (
        <AddEditModal
          entity="cliente"
          initialData={selectedData}
          onClose={() => setShowModal(false)}
          onSuccess={async actualizado => {
            await mutate();
            setShowModal(false);
            toast.success('Cliente actualizado');
          }}
        />
      )}

      {/* MODAL ELIMINAR */}
      {showModal && modalType==='delete' && selectedData && (
        <DeleteConfirmModal
          entity="cliente"
          id={selectedData.id}
          onClose={() => setShowModal(false)}
          onSuccess={async () => {
            await mutate();
            setShowModal(false);
            toast.success('Cliente eliminado');
          }}
        />
      )}
    </MainLayout>
  );
}