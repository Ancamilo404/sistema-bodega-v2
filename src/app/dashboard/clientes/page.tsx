// 'use client';
// import '@/app/style/style.css';
// import '@/app/style/global-responsive.css';
// import '@/app/style/components-responsive.css';
// import '@/app/style/crud-responsive-pages.css';
// import React, { useState, useEffect, useRef, useCallback, startTransition } from 'react';
// import { useRouter } from 'next/navigation';
// import MainLayout from '../../components/layout/MainLayout';
// import Header from '../../components/layout/Header';
// import Sidebar from '../../components/layout/Sidebar';
// import SearchBar from '../../components/common/SearchBar';
// import ScrollableTable from '../../components/common/ScrollableTable';
// import formatDateTime from '../../../lib/formatDate';
// import { HiUserGroup } from 'react-icons/hi';
// import { FaImage } from 'react-icons/fa6';
// import AddEditModal from '../../components/modal/AddEditModal';
// import DeleteConfirmModal from '../../components/modal/DeleteConfirmModal';
// import ModalBase from '../../components/modal/ModalBase';
// import { useVentas } from '@/hooks/useVentas';
// import toast from 'react-hot-toast';

// type Cliente = {
//   id: number;
//   nombre: string;
//   tipoId: string;
//   documento: string;
//   direccion?: string;
//   telefono?: string;
//   fechaRegistro: string | Date;
//   estado: 'ACTIVO' | 'BLOQUEADO';
//   ventas?: number; // conteo del backend
//   pending?: boolean; // alta optimista
//   edited?: boolean; // edición local
//   deleted?: boolean; // borrado optimista
// };

// export default function ClientesPage() {
//   const router = useRouter();
//   const tableRef = useRef<HTMLDivElement>(null);

//   const [data, setData] = useState<Cliente[]>([]);
//   const [columns, setColumns] = useState<any[]>([]);
//   const [selectedData, setSelectedData] = useState<Cliente | null>(null);
//   const [selectedId, setSelectedId] = useState<number | null>(null);
//   const [showModal, setShowModal] = useState(false);
//   const [modalType, setModalType] = useState<'add' | 'edit' | 'delete' | 'ventas' | null>(null);

//   // Pausas para el polling cuando hay búsqueda o mutación local
//   const [isSearching, setIsSearching] = useState(false);
//   const [isMutating, setIsMutating] = useState(false);

//   // Hook de ventas asociado al cliente seleccionado (seguro con null)
//   const { items: ventas, fetchNext, total, page, loading } = useVentas(selectedData?.id ?? null);

//   const abrirModalVentas = useCallback((cliente: Cliente) => {
//     setSelectedData(cliente);
//     setModalType('ventas');
//     setShowModal(true);
//   }, []);

//   // Polling con merge inteligente y mantenimiento de scroll
//   useEffect(() => {
//     const fetchClientes = async () => {
//       if (isSearching || isMutating) return;

//       const currentScroll = tableRef.current?.scrollTop || 0;

//       try {
//         const res = await fetch('/api/clientes', { cache: 'no-store' });
//         if (!res.ok) {
//           toast.error('Error al cargar clientes');
//           return;
//         }

//         const json = await res.json();
//         const clientes: Cliente[] = Array.isArray(json.data) ? json.data : [];

//         // map: usa conteo de ventas (número) y formatea fecha
//         const backendRows: Cliente[] = clientes.map((row: any) => ({
//           ...row,
//           fechaRegistro: row.fechaRegistro ? formatDateTime(row.fechaRegistro) : '',
//           ventas: typeof row.ventas === 'number' ? row.ventas : Number(row.ventas ?? 0),
//           pending: false,
//         }));

//         // MERGE inteligente: respeta 'pending' y 'edited', filtra 'deleted'
//         startTransition(() => {
//           setData(prev => {
//             const prevActive = prev.filter(c => !c.deleted);
//             const byId = new Map<number, Cliente>();
//             backendRows.forEach(c => byId.set(c.id, c));

//             const mergedFromBackend = backendRows.map(row => {
//               const local = prevActive.find(p => p.id === row.id);
//               if (!local) return row;
//               if (local.edited) {
//                 // respeta edición local hasta confirmar contra backend
//                 return { ...local };
//               }
//               return row;
//             });

//             const pendientes = prevActive.filter(p => p.pending && !byId.has(p.id));

//             return [...mergedFromBackend, ...pendientes];
//           });
//         });

//         // restaurar scroll
//         setTimeout(() => {
//           if (tableRef.current) {
//             tableRef.current.scrollTop = currentScroll;
//           }
//         }, 0);

//         // columnas dinámicas
//         if (clientes.length > 0) {
//           const labels: Record<string, string> = {
//             id: 'ID',
//             nombre: 'Nombre',
//             tipoId: 'Tipo Documento',
//             documento: 'Número de Documento',
//             ventas: 'Ventas',
//             direccion: 'Dirección',
//             telefono: 'Teléfono',
//             fechaRegistro: 'Fecha Registro',
//             estado: 'Estado',
//           };

//           setColumns(
//             Object.keys(clientes[0])
//               .filter(key =>
//                 [
//                   'id',
//                   'nombre',
//                   'tipoId',
//                   'documento',
//                   'direccion',
//                   'telefono',
//                   'ventas',
//                   'fechaRegistro',
//                   'estado',
//                 ].includes(key)
//               )
//               .map(key => ({
//                 key,
//                 label: labels[key] || key,
//                 width: '150px',
//               }))
//           );
//         }
//       } catch (error) {
//         console.error('Error al traer clientes:', error);
//         toast.error('Error de conexión');
//         setData([]);
//       }
//     };

//     fetchClientes();
//   const interval = setInterval(fetchClientes, 180000); // cada 2 minutos
//     return () => clearInterval(interval);
//   }, [abrirModalVentas, isSearching, isMutating]);

//   const clientInfo = selectedData && (
//     <div className="sidebar-info">
//       <hr className="HrImf" />
//       <div>
//         <p>
//           <strong>Ventas asociadas: </strong>
//           <button className="botton-cell" onClick={() => abrirModalVentas(selectedData)}>
//             # {selectedData.ventas ?? 0}
//           </button>
//         </p>
//       </div>

//       <p>
//         <strong>Tipo Doc:</strong> {selectedData.tipoId}
//       </p>
//       <p>
//         <strong>Num Doc:</strong> {selectedData.documento}
//       </p>
//       <p>
//         <strong>Nombre:</strong> {selectedData.nombre}
//       </p>
//       {selectedData.telefono && (
//         <p>
//           <strong>Teléfono:</strong> {selectedData.telefono}
//         </p>
//       )}
//       {selectedData.direccion && (
//         <p>
//           <strong>Dirección:</strong> {selectedData.direccion}
//         </p>
//       )}

//       <p>
//         <strong>Estado:</strong>{' '}
//         <span
//           style={{
//             color: selectedData.estado === 'ACTIVO' ? 'green' : 'red',
//             fontWeight: 'bold',
//           }}
//         >
//           {selectedData.estado}
//         </span>
//       </p>

//       <p>
//         <strong>Ingreso:</strong> {formatDateTime(selectedData.fechaRegistro)}
//       </p>
//     </div>
//   );

//   const sidebarButtons = [
//     {
//       label: 'Volver',
//       onClick: () => router.push('/dashboard'),
//       disabled: false,
//       className: 'btn-activo',
//     },
//     {
//       label: 'Registrar',
//       onClick: () => {
//         setModalType('add');
//         setShowModal(true);
//       },
//       disabled: false,
//     },
//     {
//       label: 'Editar',
//       onClick: () => {
//         setModalType('edit');
//         setShowModal(true);
//       },
//       disabled: !selectedData,
//     },
//     {
//       label: 'Eliminar',
//       onClick: () => {
//         setModalType('delete');
//         setShowModal(true);
//       },
//       disabled: !selectedData,
//     },
//   ];

//   return (
//     <MainLayout
//       showSidebar={true}
//       sidebar={
//         <>
//           <Sidebar
//             buttons={sidebarButtons}
//             showInfo={true}
//             infoContent={clientInfo}
//             onImageUpload={() => console.log('Upload image')}
//             selected={!!selectedData}
//           />

//           {showModal && modalType === 'ventas' && selectedData && (
//             <ModalBase
//               title={`Ventas de ${selectedData.nombre}`}
//               onClose={() => setShowModal(false)}
//             >
//               {ventas.length === 0 ? (
//                 <p className="modal-empty">No hay ventas registradas</p>
//               ) : (
//                 <>
//                   <ul className="modal-list">
//                     {ventas.map(v => (
//                       <li key={v.id}>
//                         #{v.id} – {formatDateTime(v.fecha)} – Total: ${v.total}
//                       </li>
//                     ))}
//                   </ul>
//                   {ventas.length < total && (
//                     <button onClick={fetchNext} disabled={loading} className="modal-load-more">
//                       {loading ? 'Cargando...' : 'Ver más'}
//                     </button>
//                   )}
//                 </>
//               )}
//             </ModalBase>
//           )}
//         </>
//       }
//       header={
//         <Header title="Clientes" icon={<HiUserGroup size={32} />} onBack={() => router.back()} />
//       }
//     >
//       <SearchBar
//         module="clientes"
//         placeholder="Buscar cliente..."
//         onResults={items => {
//           setIsSearching(true);
//           const mapeados = (items || []).map((row: any) => ({
//             ...row,
//             ventas: typeof row.ventas === 'number' ? row.ventas : Number(row.ventas ?? 0),
//             fechaRegistro: row.fechaRegistro ? formatDateTime(row.fechaRegistro) : '',
//           }));
//           setData(mapeados);
//         }}
//         onClear={() => setIsSearching(false)}
//       />

//       <ScrollableTable
//         ref={tableRef}
//         columns={columns}
//         data={data.map(row => ({
//           ...row,
//           ventas: (
//             <span onClick={() => abrirModalVentas(row as Cliente)}>
//               {typeof (row as any).ventas === 'number' ? (row as any).ventas : 0}
//             </span>
//           ),
//         }))}
//         selectedId={selectedId}
//         onRowClick={(row: any) => {
//           if (selectedId === row.id) {
//             setSelectedId(null);
//             setSelectedData(null);
//           } else {
//             setSelectedId(row.id);
//             setSelectedData(row as Cliente);
//           }
//         }}
//       />

//         {showModal && modalType === 'add' && (
//           <AddEditModal
//             entity="cliente"
//             onClose={() => setShowModal(false)}
//             onSuccess={nuevo => {
//               setIsMutating(true);
//               const clientePendiente: Cliente = { ...nuevo, pending: true };
//               setData(prev => [
//                 ...prev,
//                 {
//                   ...clientePendiente,
//                   ventas:
//                     typeof (clientePendiente as any).ventas === 'number'
//                       ? (clientePendiente as any).ventas
//                       : Number((clientePendiente as any).ventas ?? 0),
//                   fechaRegistro: formatDateTime(nuevo.fechaRegistro),
//                 },
//               ]);
//               // Re-fetch inmediato para confirmar y limpiar pending
//               fetch('/api/clientes', { cache: 'no-store' })
//                 .then(r => r.json())
//                 .then(json => {
//                   const clientes: Cliente[] = Array.isArray(json.data) ? json.data : [];
//                   startTransition(() => {
//                     setData(prev => {
//                       const byId = new Set(clientes.map(c => c.id));
//                       return prev.map(c =>
//                         c.pending && byId.has(c.id) ? { ...c, pending: false } : c
//                       );
//                     });
//                   });
//                 })
//                 .finally(() => setIsMutating(false));

//               setShowModal(false);
//             }}
//           />
//         )}

//         {showModal && modalType === 'edit' && selectedData && (
//           <AddEditModal
//             entity="cliente"
//             initialData={selectedData}
//             onClose={() => setShowModal(false)}
//             onSuccess={actualizado => {
//               setIsMutating(true);
//               setData(prev =>
//                 prev.map(c =>
//                   c.id === actualizado.id
//                     ? {
//                         ...c,
//                         ...actualizado,
//                         edited: true, // marca edición local
//                         fechaRegistro: formatDateTime(actualizado.fechaRegistro),
//                       }
//                     : c
//                 )
//               );
//               // Re-fetch para confirmar y limpiar edited
//               fetch('/api/clientes', { cache: 'no-store' })
//                 .then(r => r.json())
//                 .then(json => {
//                   const clientes: Cliente[] = Array.isArray(json.data) ? json.data : [];
//                   startTransition(() => {
//                     setData(prev =>
//                       prev.map(c => {
//                         const backend = clientes.find(b => b.id === c.id);
//                         if (!backend) return c;
//                         if (c.edited) {
//                           return {
//                             ...c,
//                             ...backend,
//                             edited: false,
//                             fechaRegistro: formatDateTime(backend.fechaRegistro),
//                             ventas:
//                               typeof (backend as any).ventas === 'number'
//                                 ? (backend as any).ventas
//                                 : Number((backend as any).ventas ?? 0),
//                           };
//                         }
//                         return c;
//                       })
//                     );
//                   });
//                 })
//                 .finally(() => setIsMutating(false));

//               setShowModal(false);
//             }}
//           />
//         )}

//         {showModal && modalType === 'delete' && selectedData && (
//           <DeleteConfirmModal
//             entity="cliente"
//             id={selectedData.id}
//             onClose={() => setShowModal(false)}
//             onSuccess={() => {
//               setIsMutating(true);
//               // borrado optimista
//               setData(prev =>
//                 prev.map(c => (c.id === selectedData.id ? { ...c, deleted: true } : c))
//               );
//               // confirmación contra backend y limpieza
//               fetch('/api/clientes', { cache: 'no-store' })
//                 .then(r => r.json())
//                 .then(json => {
//                   const clientes: Cliente[] = Array.isArray(json.data) ? json.data : [];
//                   const byId = new Set(clientes.map(c => c.id));
//                   startTransition(() => {
//                     setData(prev => prev.filter(c => !(c.deleted && !byId.has(c.id))));
//                   });
//                 })
//                 .finally(() => setIsMutating(false));

//               setShowModal(false);
//             }}
//           />
//         )}
//       </MainLayout>
//     );
//   }


// Archivo convertido completamente a SWR
// Nota: Este es un esqueleto funcional basado en tu archivo original.
// Ajusté: polling eliminado, SWR agregado, mutate en add/edit/delete.
// IMPORTANTE: Debes crear un hook useClientes() para centralizar la lógica.

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