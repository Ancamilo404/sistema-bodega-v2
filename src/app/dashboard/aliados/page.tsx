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
// import { useProductos } from '@/hooks/useProductos';
// import toast from 'react-hot-toast';

// type Aliado = {
//   id: number;
//   nombre: string;
//   tipoId: string;
//   documento: string;
//   telefono?: string;
//   correo?: string;
//   direccion?: string;
//   imagen?: string | null;
//   fechaRegistro: string | Date;
//   estado: 'ACTIVO' | 'BLOQUEADO';
//   productos?: number; // conteo del backend
//   pending?: boolean; // alta optimista
//   edited?: boolean; // edición local
//   deleted?: boolean; // borrado optimista
// };

// export default function AliadosPage() {
//   const router = useRouter();
//   const tableRef = useRef<HTMLDivElement>(null);

//   const [data, setData] = useState<Aliado[]>([]);
//   const [columns, setColumns] = useState<any[]>([]);
//   const [selectedData, setSelectedData] = useState<Aliado | null>(null);
//   const [selectedId, setSelectedId] = useState<number | null>(null);
//   const [showModal, setShowModal] = useState(false);
//   const [modalType, setModalType] = useState<'add' | 'edit' | 'delete' | 'productos' | null>(null);

//   // Pausas para el polling cuando hay búsqueda o mutación local
//   const [isSearching, setIsSearching] = useState(false);
//   const [isMutating, setIsMutating] = useState(false);

//   // Hook de productos asociado al aliado seleccionado (seguro con null)
//   const {
//     items: productos,
//     fetchNext,
//     total,
//     page,
//     loading,
//   } = useProductos(selectedData?.id ?? null);

//   const abrirModalProductos = useCallback((aliado: Aliado) => {
//     setSelectedData(aliado);
//     setModalType('productos');
//     setShowModal(true);
//   }, []);

//   // Polling con merge inteligente y mantenimiento de scroll
//   useEffect(() => {
//     const fetchAliados = async () => {
//       if (isSearching || isMutating) return;

//       const currentScroll = tableRef.current?.scrollTop || 0;

//       try {
//         const res = await fetch('/api/aliados', { cache: 'no-store' });
//         if (!res.ok) {
//           toast.error('Error al cargar aliados');
//           return;
//         }

//         const json = await res.json();
//         const aliados: Aliado[] = Array.isArray(json.data) ? json.data : [];

//         // map: usa conteo de productos (número) y formatea fecha
//         const backendRows: Aliado[] = aliados.map((row: any) => ({
//           ...row,
//           fechaRegistro: row.fechaRegistro ? formatDateTime(row.fechaRegistro) : '',
//           productos: typeof row.productos === 'number' ? row.productos : Number(row.productos ?? 0),
//           pending: false,
//         }));

//         // MERGE inteligente: respeta 'pending' y 'edited', filtra 'deleted'
//         startTransition(() => {
//           setData(prev => {
//             const prevActive = prev.filter(a => !a.deleted);
//             const byId = new Map<number, Aliado>();
//             backendRows.forEach(a => byId.set(a.id, a));

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
//         if (aliados.length > 0) {
//           const labels: Record<string, string> = {
//             id: 'ID',
//             nombre: 'Nombre',
//             tipoId: 'Tipo Documento',
//             documento: 'Número de Documento',
//             productos: 'Productos',
//             telefono: 'Teléfono',
//             correo: 'Correo',
//             direccion: 'Dirección',
//             fechaRegistro: 'Fecha Registro',
//             estado: 'Estado',
//           };

//           setColumns(
//             Object.keys(aliados[0])
//               .filter(key =>
//                 [
//                   'id',
//                   'nombre',
//                   'tipoId',
//                   'documento',
//                   'telefono',
//                   'correo',
//                   'direccion',
//                   'productos',
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
//         console.error('Error al traer aliados:', error);
//         toast.error('Error de conexión');
//         setData([]);
//       }
//     };

//     fetchAliados();
//   const interval = setInterval(fetchAliados, 180000); // cada 2 minutos
//     return () => clearInterval(interval);
//   }, [abrirModalProductos, isSearching, isMutating]);

//   const aliadoInfo = selectedData && (
//     <div className="sidebar-info">
//       <hr className="HrImf" />

//       {/* Imagen del aliado */}
//       <div className="sidebar-image">
//         {selectedData.imagen ? (
//           <img
//             src={selectedData.imagen}
//             alt="Imagen aliado"
//             // style={{ maxWidth: "100%", borderRadius: "8px" }}
//           />
//         ) : (
//           <span className="icon">
//             <FaImage />
//           </span>
//         )}
//       </div>

//       <div>
//         <p>
//           <strong>Productos asociados: </strong>
//           <button className="botton-cell" onClick={() => abrirModalProductos(selectedData)}>
//             # {selectedData.productos ?? 0}
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
//       {selectedData.correo && (
//         <p>
//           <strong>Correo:</strong> {selectedData.correo}
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
//             infoContent={aliadoInfo}
//             onImageUpload={() => console.log('Upload image')}
//             selected={!!selectedData}
//           />

//           {showModal && modalType === 'productos' && selectedData && (
//             <ModalBase
//               title={`Productos de ${selectedData.nombre}`}
//               onClose={() => setShowModal(false)}
//             >
//               {productos.length === 0 ? (
//                 <p className="modal-empty">No hay productos registrados</p>
//               ) : (
//                 <>
//                   <ul className="modal-list">
//                     {productos.map(p => (
//                       <li key={p.id}>
//                         {p.nombre} — Stock: {p.stock} — Precio: ${p.precio}
//                       </li>
//                     ))}
//                   </ul>
//                   {productos.length < total && (
//                     <button onClick={fetchNext} disabled={loading}>
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
//         <Header title="Aliados" icon={<HiUserGroup size={32} />} onBack={() => router.back()} />
//       }
//     >
//       <SearchBar
//         module="aliados"
//         placeholder="Buscar aliado..."
//         onResults={items => {
//           setIsSearching(true);
//           const mapeados = (items || []).map((row: any) => ({
//             ...row,
//             productos:
//               typeof row.productos === 'number' ? row.productos : Number(row.productos ?? 0),
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
//           productos: (
//             <span onClick={() => abrirModalProductos(row as Aliado)}>
//               {typeof (row as any).productos === 'number' ? (row as any).productos : 0}
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
//             setSelectedData(row as Aliado);
//           }
//         }}
//       />

//       {showModal && modalType === 'add' && (
//         <AddEditModal
//           entity="aliado"
//           onClose={() => setShowModal(false)}
//           onSuccess={nuevo => {
//             setIsMutating(true);
//             const aliadoPendiente: Aliado = { ...nuevo, pending: true };
//             setData(prev => [
//               ...prev,
//               {
//                 ...aliadoPendiente,
//                 productos:
//                   typeof (aliadoPendiente as any).productos === 'number'
//                     ? (aliadoPendiente as any).productos
//                     : Number((aliadoPendiente as any).productos ?? 0),
//                 fechaRegistro: formatDateTime(nuevo.fechaRegistro),
//               },
//             ]);
//             // Re-fetch inmediato para confirmar y limpiar pending
//             fetch('/api/aliados', { cache: 'no-store' })
//               .then(r => r.json())
//               .then(json => {
//                 const aliados: Aliado[] = Array.isArray(json.data) ? json.data : [];
//                 startTransition(() => {
//                   setData(prev => {
//                     const byId = new Set(aliados.map(a => a.id));
//                     return prev.map(a =>
//                       a.pending && byId.has(a.id) ? { ...a, pending: false } : a
//                     );
//                   });
//                 });
//               })
//               .finally(() => setIsMutating(false));

//             setShowModal(false);
//           }}
//         />
//       )}

//       {showModal && modalType === 'edit' && selectedData && (
//         <AddEditModal
//           entity="aliado"
//           initialData={selectedData}
//           onClose={() => setShowModal(false)}
//           onSuccess={actualizado => {
//             setIsMutating(true);
//             setData(prev =>
//               prev.map(a =>
//                 a.id === actualizado.id
//                   ? {
//                       ...a,
//                       ...actualizado,
//                       edited: true, // marca edición local
//                       fechaRegistro: formatDateTime(actualizado.fechaRegistro),
//                     }
//                   : a
//               )
//             );
//             // Re-fetch para confirmar y limpiar edited
//             fetch('/api/aliados', { cache: 'no-store' })
//               .then(r => r.json())
//               .then(json => {
//                 const aliados: Aliado[] = Array.isArray(json.data) ? json.data : [];
//                 startTransition(() => {
//                   setData(prev =>
//                     prev.map(a => {
//                       const backend = aliados.find(b => b.id === a.id);
//                       if (!backend) return a;
//                       if (a.edited) {
//                         return {
//                           ...a,
//                           ...backend,
//                           edited: false,
//                           fechaRegistro: formatDateTime(backend.fechaRegistro),
//                           productos:
//                             typeof (backend as any).productos === 'number'
//                               ? (backend as any).productos
//                               : Number((backend as any).productos ?? 0),
//                         };
//                       }
//                       return a;
//                     })
//                   );
//                 });
//               })
//               .finally(() => setIsMutating(false));

//             setShowModal(false);
//           }}
//         />
//       )}

//       {showModal && modalType === 'delete' && selectedData && (
//         <DeleteConfirmModal
//           entity="aliado"
//           id={selectedData.id}
//           onClose={() => setShowModal(false)}
//           onSuccess={() => {
//             setIsMutating(true);
//             // borrado optimista
//             setData(prev =>
//               prev.map(a => (a.id === selectedData.id ? { ...a, deleted: true } : a))
//             );
//             // confirmación contra backend y limpieza
//             fetch('/api/aliados', { cache: 'no-store' })
//               .then(r => r.json())
//               .then(json => {
//                 const aliados: Aliado[] = Array.isArray(json.data) ? json.data : [];
//                 const byId = new Set(aliados.map(a => a.id));
//                 startTransition(() => {
//                   setData(prev => prev.filter(a => !(a.deleted && !byId.has(a.id))));
//                 });
//               })
//               .finally(() => setIsMutating(false));

//             setShowModal(false);
//           }}
//         />
//       )}
//     </MainLayout>
//   );
// }


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

  const aliadosRaw: any[] = data && Array.isArray(data.data) ? data.data : [];

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

