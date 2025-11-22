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
// import { HiCube } from 'react-icons/hi';
// import { FaImage } from 'react-icons/fa6';
// import AddEditModal from '../../components/modal/AddEditModal';
// import DeleteConfirmModal from '../../components/modal/DeleteConfirmModal';
// import ModalBase from '../../components/modal/ModalBase';
// import toast from 'react-hot-toast';

// type Producto = {
//   id: number;
//   nombre: string;
//   descripcion?: string;
//   precio: number;
//   stock: number;
//   categoria?: string;
//   unidad?: string;
//   imagen?: string | null;
//   estado: 'ACTIVO' | 'BLOQUEADO';
//   aliadoId: number;
//   aliado?: {
//     id: number;
//     nombre: string;
//     documento: string;
//   };
//   creadoEn: string | Date;
//   actualizadoEn: string | Date;
//   pending?: boolean;
//   edited?: boolean;
//   deleted?: boolean;
// };

// export default function ProductosPage() {
//   const router = useRouter();
//   const tableRef = useRef<HTMLDivElement>(null);

//   const [data, setData] = useState<Producto[]>([]);
//   const [columns, setColumns] = useState<any[]>([]);
//   const [selectedData, setSelectedData] = useState<Producto | null>(null);
//   const [selectedId, setSelectedId] = useState<number | null>(null);
//   const [showModal, setShowModal] = useState(false);
//   const [modalType, setModalType] = useState<'add' | 'edit' | 'delete' | 'aliado' | null>(null);

//   const [isSearching, setIsSearching] = useState(false);
//   const [isMutating, setIsMutating] = useState(false);

//   // Modal para ver aliado completo
//   const abrirModalAliado = useCallback((producto: Producto) => {
//     setSelectedData(producto);
//     setModalType('aliado');
//     setShowModal(true);
//   }, []);

//   // Polling con merge inteligente
//   useEffect(() => {
//     const fetchProductos = async () => {
//       if (isSearching || isMutating) return;

//       const currentScroll = tableRef.current?.scrollTop || 0;

//       try {
//         const res = await fetch('/api/productos', { cache: 'no-store' });
//         if (!res.ok) {
//           toast.error('Error al cargar productos');
//           return;
//         }

//         const json = await res.json();
//         const productos: Producto[] = Array.isArray(json.data) ? json.data : [];

//         const backendRows: Producto[] = productos.map((row: any) => ({
//           ...row,
//           creadoEn: row.creadoEn ? formatDateTime(row.creadoEn) : '',
//           actualizadoEn: row.actualizadoEn ? formatDateTime(row.actualizadoEn) : '',
//           precio: Number(row.precio),
//           pending: false,
//         }));

//         startTransition(() => {
//           setData(prev => {
//             const prevActive = prev.filter(p => !p.deleted);
//             const byId = new Map<number, Producto>();
//             backendRows.forEach(p => byId.set(p.id, p));

//             const mergedFromBackend = backendRows.map(row => {
//               const local = prevActive.find(p => p.id === row.id);
//               if (!local) return row;
//               if (local.edited) return { ...local };
//               return row;
//             });

//             const pendientes = prevActive.filter(p => p.pending && !byId.has(p.id));
//             return [...mergedFromBackend, ...pendientes];
//           });
//         });

//         setTimeout(() => {
//           if (tableRef.current) {
//             tableRef.current.scrollTop = currentScroll;
//           }
//         }, 0);

//         if (productos.length > 0) {
//           const labels: Record<string, string> = {
//             id: 'ID',
//             nombre: 'Nombre',
//             descripcion: 'Descripción',
//             precio: 'Precio',
//             stock: 'Stock',
//             categoria: 'Categoría',
//             unidad: 'Unidad',
//             aliado: 'Aliado',
//             creadoEn: 'Creado',
//             estado: 'Estado',
//           };

//           setColumns(
//             Object.keys(productos[0])
//               .filter(key =>
//                 ['id', 'nombre', 'precio', 'stock', 'categoria', 'unidad', 'estado'].includes(key)
//               )
//               .concat(['aliado'])
//               .map(key => ({
//                 key,
//                 label: labels[key] || key,
//                 width: key === 'nombre' ? '200px' : '120px',
//               }))
//           );
//         }
//       } catch (error) {
//         console.error('Error al traer productos:', error);
//         toast.error('Error de conexión');
//         setData([]);
//       }
//     };

//     fetchProductos();
//   const interval = setInterval(fetchProductos, 180000); // cada 2 minutos
//     return () => clearInterval(interval);
//   }, [isSearching, isMutating]);

//   const productoInfo = selectedData && (
//     <div className="sidebar-info">
//       <hr className="HrImf" />

//       <div className="sidebar-image">
//         {selectedData.imagen ? (
//           <img src={selectedData.imagen} alt="Imagen producto" />
//         ) : (
//           <span className="icon">
//             <FaImage />
//           </span>
//         )}
//       </div>

//       <p>
//         <strong>Nombre:</strong> {selectedData.nombre}
//       </p>
//       {selectedData.descripcion && (
//         <p>
//           <strong>Descripción:</strong> {selectedData.descripcion}
//         </p>
//       )}
//       <p>
//         <strong>Precio:</strong>{' '}
//         {selectedData.precio !== undefined && selectedData.precio !== null
//           ? `$${Number(selectedData.precio).toFixed(2)}`
//           : 'N/A'}
//       </p>
//       <p>
//         <strong>Stock:</strong> {selectedData.stock}
//       </p>
//       {selectedData.categoria && (
//         <p>
//           <strong>Categoría:</strong> {selectedData.categoria}
//         </p>
//       )}
//       {selectedData.unidad && (
//         <p>
//           <strong>Unidad:</strong> {selectedData.unidad}
//         </p>
//       )}
//       <p>
//         <strong>Aliado:</strong>{' '}
//         <button className="botton-cell" onClick={() => abrirModalAliado(selectedData)}>
//           {selectedData.aliado?.nombre || 'N/A'}
//         </button>
//       </p>
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
//     </div>
//   );

//   const sidebarButtons = [
//     {
//       label: 'Volver',
//       onClick: () => router.push('/dashboard'),
//       disabled: false,
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
//   const displayRows = data.map(row => ({
//     ...row,
//     precio: `$${Number(row.precio).toFixed(2)}`, // solo para mostrar en la tabla
//     aliado: <span onClick={() => abrirModalAliado(row)}>{row.aliado?.nombre || 'N/A'}</span>,
//   }));
//   return (
//     <MainLayout
//       showSidebar={true}
//       sidebar={
//         <>
//           <Sidebar
//             buttons={sidebarButtons}
//             showInfo={true}
//             infoContent={productoInfo}
//             selected={!!selectedData}
//           />

//           {showModal && modalType === 'aliado' && selectedData?.aliado && (
//             <ModalBase
//               title={`Aliado: ${selectedData.aliado.nombre}`}
//               onClose={() => setShowModal(false)}
//             >
//               <div className="modal-info">
//                 <p>
//                   <strong>ID:</strong> {selectedData.aliado.id}
//                 </p>
//                 <p>
//                   <strong>Nombre:</strong> {selectedData.aliado.nombre}
//                 </p>
//                 <p>
//                   <strong>Documento:</strong> {selectedData.aliado.documento}
//                 </p>
//               </div>
//             </ModalBase>
//           )}
//         </>
//       }
//       header={<Header title="Productos" icon={<HiCube size={32} />} />}
//     >
//       <SearchBar
//         module="productos"
//         placeholder="Buscar producto..."
//         onResults={items => {
//           setIsSearching(true);
//           const mapeados = (items || []).map((row: any) => ({
//             ...row,
//             precio: Number(row.precio),
//             creadoEn: row.creadoEn ? formatDateTime(row.creadoEn) : '',
//             actualizadoEn: row.actualizadoEn ? formatDateTime(row.actualizadoEn) : '',
//           }));
//           setData(mapeados);
//         }}
//         onClear={() => setIsSearching(false)}
//       />

//       <ScrollableTable
//         ref={tableRef}
//         columns={columns}
//         data={displayRows} // 👈 usamos displayRows
//         selectedId={selectedId}
//         onRowClick={(row: any) => {
//           const original = data.find(p => p.id === row.id); // 👈 buscamos el objeto original
//           if (!original) return;

//           if (selectedId === row.id) {
//             setSelectedId(null);
//             setSelectedData(null);
//           } else {
//             setSelectedId(row.id);
//             setSelectedData(original); // 👈 siempre pasamos el original (precio numérico)
//           }
//         }}
//       />

//       {showModal && modalType === 'add' && (
//         <AddEditModal
//           entity="producto"
//           onClose={() => setShowModal(false)}
//           onSuccess={nuevo => {
//             setIsMutating(true);
//             const productoPendiente: Producto = { ...nuevo, pending: true };
//             setData(prev => [
//               ...prev,
//               {
//                 ...productoPendiente,
//                 precio: Number(productoPendiente.precio),
//                 creadoEn: formatDateTime(nuevo.creadoEn),
//                 actualizadoEn: formatDateTime(nuevo.actualizadoEn),
//               },
//             ]);

//             fetch('/api/productos', { cache: 'no-store' })
//               .then(r => r.json())
//               .then(json => {
//                 const productos: Producto[] = Array.isArray(json.data) ? json.data : [];
//                 startTransition(() => {
//                   setData(prev => {
//                     const byId = new Set(productos.map(p => p.id));
//                     return prev.map(p =>
//                       p.pending && byId.has(p.id) ? { ...p, pending: false } : p
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
//           entity="producto"
//           initialData={selectedData}
//           onClose={() => setShowModal(false)}
//           onSuccess={actualizado => {
//             setIsMutating(true);
//             setData(prev =>
//               prev.map(p =>
//                 p.id === actualizado.id
//                   ? {
//                       ...p,
//                       ...actualizado,
//                       edited: true,
//                       creadoEn: formatDateTime(actualizado.creadoEn),
//                       actualizadoEn: formatDateTime(actualizado.actualizadoEn),
//                     }
//                   : p
//               )
//             );

//             fetch('/api/productos', { cache: 'no-store' })
//               .then(r => r.json())
//               .then(json => {
//                 const productos: Producto[] = Array.isArray(json.data) ? json.data : [];
//                 startTransition(() => {
//                   setData(prev =>
//                     prev.map(p => {
//                       const backend = productos.find(b => b.id === p.id);
//                       if (!backend) return p;
//                       if (p.edited) {
//                         return {
//                           ...p,
//                           ...backend,
//                           edited: false,
//                           creadoEn: formatDateTime(backend.creadoEn),
//                           actualizadoEn: formatDateTime(backend.actualizadoEn),
//                           precio: Number(backend.precio),
//                         };
//                       }
//                       return p;
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
//           entity="producto"
//           id={selectedData.id}
//           onClose={() => setShowModal(false)}
//           onSuccess={() => {
//             setIsMutating(true);
//             setData(prev =>
//               prev.map(p => (p.id === selectedData.id ? { ...p, deleted: true } : p))
//             );

//             fetch('/api/productos', { cache: 'no-store' })
//               .then(r => r.json())
//               .then(json => {
//                 const productos: Producto[] = Array.isArray(json.data) ? json.data : [];
//                 const byId = new Set(productos.map(p => p.id));
//                 startTransition(() => {
//                   setData(prev => prev.filter(p => !(p.deleted && !byId.has(p.id))));
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
import React, { useState, useEffect, useRef, useCallback, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/layout/MainLayout';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import SearchBar from '../../components/common/SearchBar';
import ScrollableTable from '../../components/common/ScrollableTable';
import formatDateTime from '../../../lib/formatDate';
import { HiCube } from 'react-icons/hi';
import { FaImage } from 'react-icons/fa6';
import AddEditModal from '../../components/modal/AddEditModal';
import DeleteConfirmModal from '../../components/modal/DeleteConfirmModal';
import ModalBase from '../../components/modal/ModalBase';
import toast from 'react-hot-toast';

type Producto = {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria?: string;
  unidad?: string;
  imagen?: string | null;
  estado: 'ACTIVO' | 'BLOQUEADO';
  aliadoId: number;
  aliado?: {
    id: number;
    nombre: string;
    documento: string;
  };
  creadoEn: string | Date;
  actualizadoEn: string | Date;
  pending?: boolean;
  edited?: boolean;
  deleted?: boolean;
};

export default function ProductosPage() {
  const router = useRouter();
  const tableRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<Producto[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [selectedData, setSelectedData] = useState<Producto | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'delete' | 'aliado' | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  // Modal para ver aliado completo
  const abrirModalAliado = useCallback((producto: Producto) => {
    setSelectedData(producto);
    setModalType('aliado');
    setShowModal(true);
  }, []);

  // Polling con merge inteligente
  useEffect(() => {
    const fetchProductos = async () => {
      if (isSearching || isMutating) return;

      const currentScroll = tableRef.current?.scrollTop || 0;

      try {
        const res = await fetch('/api/productos', { cache: 'no-store' });
        if (!res.ok) {
          toast.error('Error al cargar productos');
          return;
        }

        const json = await res.json();
        const productos: Producto[] = Array.isArray(json.data) ? json.data : [];

        const backendRows: Producto[] = productos.map((row: any) => ({
          ...row,
          creadoEn: row.creadoEn ? formatDateTime(row.creadoEn) : '',
          actualizadoEn: row.actualizadoEn ? formatDateTime(row.actualizadoEn) : '',
          precio: Number(row.precio),
          pending: false,
        }));

        startTransition(() => {
          setData(prev => {
            const prevActive = prev.filter(p => !p.deleted);
            const byId = new Map<number, Producto>();
            backendRows.forEach(p => byId.set(p.id, p));

            const mergedFromBackend = backendRows.map(row => {
              const local = prevActive.find(p => p.id === row.id);
              if (!local) return row;
              if (local.edited) return { ...local };
              return row;
            });

            const pendientes = prevActive.filter(p => p.pending && !byId.has(p.id));
            return [...mergedFromBackend, ...pendientes];
          });
        });

        setTimeout(() => {
          if (tableRef.current) {
            tableRef.current.scrollTop = currentScroll;
          }
        }, 0);

        if (productos.length > 0) {
          const labels: Record<string, string> = {
            id: 'ID',
            nombre: 'Nombre',
            descripcion: 'Descripción',
            precio: 'Precio',
            stock: 'Stock',
            categoria: 'Categoría',
            unidad: 'Unidad',
            aliado: 'Aliado',
            creadoEn: 'Creado',
            estado: 'Estado',
          };

          setColumns(
            Object.keys(productos[0])
              .filter(key =>
                ['id', 'nombre', 'precio', 'stock', 'categoria', 'unidad', 'estado'].includes(key)
              )
              .concat(['aliado'])
              .map(key => ({
                key,
                label: labels[key] || key,
                width: key === 'nombre' ? '200px' : '120px',
              }))
          );
        }
      } catch (error) {
        console.error('Error al traer productos:', error);
        toast.error('Error de conexión');
        setData([]);
      }
    };

    fetchProductos();

    // ❌ Desactivamos interval para evitar saturación en Vercel y Supabase
    // const interval = setInterval(fetchProductos, 180000); // cada 2 minutos
    // return () => clearInterval(interval);

    return () => {};
  }, [isSearching, isMutating]);

  const productoInfo = selectedData && (
    <div className="sidebar-info">
      <hr className="HrImf" />

      <div className="sidebar-image">
        {selectedData.imagen ? (
          <img src={selectedData.imagen} alt="Imagen producto" />
        ) : (
          <span className="icon">
            <FaImage />
          </span>
        )}
      </div>

      <p>
        <strong>Nombre:</strong> {selectedData.nombre}
      </p>
      {selectedData.descripcion && (
        <p>
          <strong>Descripción:</strong> {selectedData.descripcion}
        </p>
      )}
      <p>
        <strong>Precio:</strong>{' '}
        {selectedData.precio !== undefined && selectedData.precio !== null
          ? `$${Number(selectedData.precio).toFixed(2)}`
          : 'N/A'}
      </p>
      <p>
        <strong>Stock:</strong> {selectedData.stock}
      </p>
      {selectedData.categoria && (
        <p>
          <strong>Categoría:</strong> {selectedData.categoria}
        </p>
      )}
      {selectedData.unidad && (
        <p>
          <strong>Unidad:</strong> {selectedData.unidad}
        </p>
      )}
      <p>
        <strong>Aliado:</strong>{' '}
        <button className="botton-cell" onClick={() => abrirModalAliado(selectedData)}>
          {selectedData.aliado?.nombre || 'N/A'}
        </button>
      </p>
      <p>
        <strong>Estado:</strong>{' '}
        <span
          style={{
            color: selectedData.estado === 'ACTIVO' ? 'green' : 'red',
            fontWeight: 'bold',
          }}
        >
          {selectedData.estado}
        </span>
      </p>
    </div>
  );

  const sidebarButtons = [
    {
      label: 'Volver',
      onClick: () => router.push('/dashboard'),
      disabled: false,
    },
    {
      label: 'Registrar',
      onClick: () => {
        setModalType('add');
        setShowModal(true);
      },
      disabled: false,
    },
    {
      label: 'Editar',
      onClick: () => {
        setModalType('edit');
        setShowModal(true);
      },
      disabled: !selectedData,
    },
    {
      label: 'Eliminar',
      onClick: () => {
        setModalType('delete');
        setShowModal(true);
      },
      disabled: !selectedData,
    },
  ];

  const displayRows = data.map(row => ({
    ...row,
    precio: `$${Number(row.precio).toFixed(2)}`,
    aliado: <span onClick={() => abrirModalAliado(row)}>{row.aliado?.nombre || 'N/A'}</span>,
  }));

  return (
    <MainLayout
      showSidebar={true}
      sidebar={
        <>
          <Sidebar
            buttons={sidebarButtons}
            showInfo={true}
            infoContent={productoInfo}
            selected={!!selectedData}
          />

          {showModal && modalType === 'aliado' && selectedData?.aliado && (
            <ModalBase
              title={`Aliado: ${selectedData.aliado.nombre}`}
              onClose={() => setShowModal(false)}
            >
              <div className="modal-info">
                <p>
                  <strong>ID:</strong> {selectedData.aliado.id}
                </p>
                <p>
                  <strong>Nombre:</strong> {selectedData.aliado.nombre}
                </p>
                <p>
                  <strong>Documento:</strong> {selectedData.aliado.documento}
                </p>
              </div>
            </ModalBase>
          )}
        </>
      }
      header={<Header title="Productos" icon={<HiCube size={32} />} />}
    >
      <SearchBar
        module="productos"
        placeholder="Buscar producto..."
        onResults={items => {
          setIsSearching(true);
          const mapeados = (items || []).map((row: any) => ({
            ...row,
            precio: Number(row.precio),
            creadoEn: row.creadoEn ? formatDateTime(row.creadoEn) : '',
            actualizadoEn: row.actualizadoEn ? formatDateTime(row.actualizadoEn) : '',
          }));
          setData(mapeados);
        }}
        onClear={() => setIsSearching(false)}
      />

      <ScrollableTable
        ref={tableRef}
        columns={columns}
        data={displayRows}
        selectedId={selectedId}
        onRowClick={(row: any) => {
          const original = data.find(p => p.id === row.id);
          if (!original) return;

          if (selectedId === row.id) {
            setSelectedId(null);
            setSelectedData(null);
          } else {
            setSelectedId(row.id);
            setSelectedData(original);
          }
        }}
      />

      {showModal && modalType === 'add' && (
        <AddEditModal
          entity="producto"
          onClose={() => setShowModal(false)}
          onSuccess={nuevo => {
            setIsMutating(true);
            const productoPendiente: Producto = { ...nuevo, pending: true };
            setData(prev => [
              ...prev,
              {
                ...productoPendiente,
                precio: Number(productoPendiente.precio),
                creadoEn: formatDateTime(nuevo.creadoEn),
                actualizadoEn: formatDateTime(nuevo.actualizadoEn),
              },
            ]);

            fetch('/api/productos', { cache: 'no-store' })
              .then(r => r.json())
              .then(json => {
                const productos: Producto[] = Array.isArray(json.data) ? json.data : [];
                startTransition(() => {
                  setData(prev => {
                    const byId = new Set(productos.map(p => p.id));
                    return prev.map(p =>
                      p.pending && byId.has(p.id) ? { ...p, pending: false } : p
                    );
                  });
                });
              })
              .finally(() => setIsMutating(false));

            setShowModal(false);
          }}
        />
      )}

      {showModal && modalType === 'edit' && selectedData && (
        <AddEditModal
          entity="producto"
          initialData={selectedData}
          onClose={() => setShowModal(false)}
          onSuccess={actualizado => {
            setIsMutating(true);
            setData(prev =>
              prev.map(p =>
                p.id === actualizado.id
                  ? {
                      ...p,
                      ...actualizado,
                      edited: true,
                      creadoEn: formatDateTime(actualizado.creadoEn),
                      actualizadoEn: formatDateTime(actualizado.actualizadoEn),
                    }
                  : p
              )
            );

            fetch('/api/productos', { cache: 'no-store' })
              .then(r => r.json())
              .then(json => {
                const productos: Producto[] = Array.isArray(json.data) ? json.data : [];
                startTransition(() => {
                  setData(prev =>
                    prev.map(p => {
                      const backend = productos.find(b => b.id === p.id);
                      if (!backend) return p;
                      if (p.edited) {
                        return {
                          ...p,
                          ...backend,
                          edited: false,
                          creadoEn: formatDateTime(backend.creadoEn),
                          actualizadoEn: formatDateTime(backend.actualizadoEn),
                          precio: Number(backend.precio),
                        };
                      }
                      return p;
                    })
                  );
                });
              })
              .finally(() => setIsMutating(false));

            setShowModal(false);
          }}
        />
      )}

      {showModal && modalType === 'delete' && selectedData && (
        <DeleteConfirmModal
          entity="producto"
          id={selectedData.id}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setIsMutating(true);
            setData(prev =>
              prev.map(p => (p.id === selectedData.id ? { ...p, deleted: true } : p))
            );

            fetch('/api/productos', { cache: 'no-store' })
              .then(r => r.json())
              .then(json => {
                const productos: Producto[] = Array.isArray(json.data) ? json.data : [];
                const byId = new Set(productos.map(p => p.id));
                startTransition(() => {
                  setData(prev => prev.filter(p => !(p.deleted && !byId.has(p.id))));
                });
              })
              .finally(() => setIsMutating(false));

            setShowModal(false);
          }}
        />
      )}
    </MainLayout>
  );
}
