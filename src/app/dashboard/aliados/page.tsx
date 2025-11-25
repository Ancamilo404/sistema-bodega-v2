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
import { FaImage } from 'react-icons/fa6';
import AddEditModal from '../../components/modal/AddEditModal';
import DeleteConfirmModal from '../../components/modal/DeleteConfirmModal';
import ModalBase from '../../components/modal/ModalBase';
import { useProductos } from '@/hooks/useProductos';
import toast from 'react-hot-toast';

// fetcher para SWR
const fetcher = (url: string) => fetch(url).then(r => r.json());

type Aliado = {
  id: number;
  nombre: string;
  tipoId: string;
  documento: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  imagen?: string | null;
  fechaRegistro: string | Date;
  estado: 'ACTIVO' | 'BLOQUEADO';
  productos?: number;
  pending?: boolean;
  edited?: boolean;
  deleted?: boolean;
};

export default function AliadosPage() {
  const router = useRouter();
  const tableRef = useRef<HTMLDivElement>(null);

  const [selectedData, setSelectedData] = useState<Aliado | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'delete' | 'productos' | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Aliado[]>([]);
  const [isMutating, setIsMutating] = useState(false);

  const { items: productos, fetchNext, total, loading } = useProductos(selectedData?.id ?? null);

  // SWR: trae aliados, sin polling automático (revalidateOnFocus true)
  const { data, error, mutate } = useSWR('/api/aliados', fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  // ✅ Manejar estructura: data.data.items (no data.data)
  const aliadosRaw: any[] = data && data.data && Array.isArray(data.data.items) ? data.data.items : [];

  // Mapeo y formateo
  const aliados = aliadosRaw.map(row => ({
    ...row,
    productos: typeof row.productos === 'number' ? row.productos : Number(row.productos ?? 0),
    fechaRegistro: row.fechaRegistro ? formatDateTime(row.fechaRegistro) : '',
  })) as Aliado[];

  const lista = isSearching ? searchResults : aliados;

  const abrirModalProductos = useCallback((aliado: Aliado) => {
    setSelectedData(aliado);
    setModalType('productos');
    setShowModal(true);
  }, []);

  const columns = aliados.length > 0
    ? Object.keys(aliados[0])
        .filter(key => ['id','nombre','tipoId','documento','telefono','correo','direccion','productos','fechaRegistro','estado'].includes(key))
        .map(key => ({ key, label: key === 'productos' ? 'Productos' : key.charAt(0).toUpperCase() + key.slice(1), width: '150px' }))
    : [];

  const aliadoInfo = selectedData && (
    <div className="sidebar-info">
      <hr className="HrImf" />
      <div className="sidebar-image">
        {selectedData.imagen ? (
          <img src={selectedData.imagen} alt="Imagen aliado" />
        ) : (
          <span className="icon"><FaImage /></span>
        )}
      </div>

      <div>
        <p>
          <strong>Productos asociados: </strong>
          <button className="botton-cell" onClick={() => abrirModalProductos(selectedData)}>
            # {selectedData.productos ?? 0}
          </button>
        </p>
      </div>

      <p><strong>Tipo Doc:</strong> {selectedData.tipoId}</p>
      <p><strong>Num Doc:</strong> {selectedData.documento}</p>
      <p><strong>Nombre:</strong> {selectedData.nombre}</p>
      {selectedData.telefono && <p><strong>Teléfono:</strong> {selectedData.telefono}</p>}
      {selectedData.correo && <p><strong>Correo:</strong> {selectedData.correo}</p>}
      {selectedData.direccion && <p><strong>Dirección:</strong> {selectedData.direccion}</p>}

      <p>
        <strong>Estado:</strong>{' '}
        <span style={{ color: selectedData.estado === 'ACTIVO' ? 'green' : 'red', fontWeight: 'bold' }}>
          {selectedData.estado}
        </span>
      </p>

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
            infoContent={aliadoInfo}
            onImageUpload={() => console.log('Upload image')}
            selected={!!selectedData}
          />

          {showModal && modalType === 'productos' && selectedData && (
            <ModalBase title={`Productos de ${selectedData.nombre}`} onClose={() => setShowModal(false)}>
              {productos.length === 0 ? (
                <p className="modal-empty">No hay productos registrados</p>
              ) : (
                <>
                  <ul className="modal-list">
                    {productos.map(p => (
                      <li key={p.id}>{p.nombre} — Stock: {p.stock} — Precio: ${p.precio}</li>
                    ))}
                  </ul>
                  {productos.length < total && (
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
      header={<Header title="Aliados" icon={<HiUserGroup size={32} />} onBack={() => router.back()} />}
    >
      <SearchBar
        module="aliados"
        placeholder="Buscar aliado..."
        onResults={(items: any[]) => {
          setIsMutating(false);
          setIsSearching(true);
          setSearchResults((items || []).map(row => ({
            ...row,
            productos: typeof row.productos === 'number' ? row.productos : Number(row.productos ?? 0),
            fechaRegistro: row.fechaRegistro ? formatDateTime(row.fechaRegistro) : '',
          })));
        }}
        onClear={() => { setIsSearching(false); setSearchResults([]); }}
      />

      <ScrollableTable
        ref={tableRef}
        columns={columns}
        data={lista.map(row => ({
          ...row,
          productos: <span onClick={() => abrirModalProductos(row as Aliado)}>{row.productos}</span>,
        }))}
        selectedId={selectedId}
        onRowClick={(row: any) => {
          if (selectedId === row.id) {
            setSelectedId(null);
            setSelectedData(null);
          } else {
            setSelectedId(row.id);
            setSelectedData(row as Aliado);
          }
        }}
      />

      {/* ADD */}
      {showModal && modalType === 'add' && (
        <AddEditModal
          entity="aliado"
          onClose={() => setShowModal(false)}
          onSuccess={async (nuevo: any) => {
            setIsMutating(true);
            try {
              // si AddEditModal ya hizo el POST, solo revalida
              await mutate();
              toast.success('Aliado creado');
            } catch (e) {
              toast.error('Error al refrescar aliados');
            } finally {
              setIsMutating(false);
              setShowModal(false);
            }
          }}
        />
      )}

      {/* EDIT */}
      {showModal && modalType === 'edit' && selectedData && (
        <AddEditModal
          entity="aliado"
          initialData={selectedData}
          onClose={() => setShowModal(false)}
          onSuccess={async (actualizado: any) => {
            setIsMutating(true);
            try {
              await mutate();
              toast.success('Aliado actualizado');
            } catch (e) {
              toast.error('Error al refrescar aliados');
            } finally {
              setIsMutating(false);
              setShowModal(false);
            }
          }}
        />
      )}

      {/* DELETE */}
      {showModal && modalType === 'delete' && selectedData && (
        <DeleteConfirmModal
          entity="aliado"
          id={selectedData.id}
          onClose={() => setShowModal(false)}
          onSuccess={async () => {
            setIsMutating(true);
            try {
              await mutate();
              toast.success('Aliado eliminado');
            } catch (e) {
              toast.error('Error al refrescar aliados');
            } finally {
              setIsMutating(false);
              setShowModal(false);
            }
          }}
        />
      )}
    </MainLayout>
  );
}

