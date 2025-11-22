// 'use client';
// import '@/app/style/style.css';
// import '@/app/style/global-responsive.css';
// import '@/app/style/components-responsive.css';
// import '@/app/style/crud-responsive-pages.css';

// import React, { useState, useEffect, useRef, startTransition } from 'react';
// import { useRouter } from 'next/navigation';
// import MainLayout from '../../components/layout/MainLayout';
// import Header from '../../components/layout/Header';
// import Sidebar from '../../components/layout/Sidebar';
// import SearchBar from '../../components/common/SearchBar';
// import ScrollableTable from '../../components/common/ScrollableTable';
// import formatDateTime from '../../../lib/formatDate';
// import { HiUserGroup } from 'react-icons/hi';
// import AddEditModal from '../../components/modal/AddEditModal';
// import DeleteConfirmModal from '../../components/modal/DeleteConfirmModal';
// import toast from 'react-hot-toast';

// type Usuario = {
//   id: number;
//   nombre: string;
//   tipoId: string; // ✅ nuevo
//   documento: string; // ✅ reemplaza cedula
//   correo: string;
//   telefono?: string;
//   rol: 'ADMIN' | 'TRABAJADOR' | 'USUARIO';
//   estado: 'ACTIVO' | 'BLOQUEADO';
//   fechaRegistro: string | Date;
//   pending?: boolean;
//   edited?: boolean;
//   deleted?: boolean;
// };

// export default function UsuariosPage() {
//   const router = useRouter();
//   const tableRef = useRef<HTMLDivElement>(null);

//   const [data, setData] = useState<Usuario[]>([]);
//   const [columns, setColumns] = useState<any[]>([]);
//   const [selectedData, setSelectedData] = useState<Usuario | null>(null);
//   const [selectedId, setSelectedId] = useState<number | null>(null);
//   const [showModal, setShowModal] = useState(false);
//   const [modalType, setModalType] = useState<'add' | 'edit' | 'delete' | null>(null);

//   const [isSearching, setIsSearching] = useState(false);
//   const [isMutating, setIsMutating] = useState(false);

//   // Polling con merge inteligente
//   useEffect(() => {
//     const fetchUsuarios = async () => {
//       if (isSearching || isMutating) return;

//       const currentScroll = tableRef.current?.scrollTop || 0;

//       try {
//         const res = await fetch('/api/usuarios', { cache: 'no-store' });
//         if (!res.ok) {
//           toast.error('Error al cargar usuarios');
//           return;
//         }

//         const json = await res.json();
//         const usuarios: Usuario[] = Array.isArray(json.data) ? json.data : [];

//         const backendRows: Usuario[] = usuarios.map((row: any) => ({
//           ...row,
//           fechaRegistro: row.fechaRegistro ? formatDateTime(row.fechaRegistro) : '',
//           pending: false,
//         }));

//         startTransition(() => {
//           setData(prev => {
//             const prevActive = prev.filter(u => !u.deleted);
//             const byId = new Map<number, Usuario>();
//             backendRows.forEach(u => byId.set(u.id, u));

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

//         if (usuarios.length > 0) {
//           const labels: Record<string, string> = {
//             id: 'ID',
//             nombre: 'Nombre',
//             tipoId: 'Tipo Documento', // ✅ nuevo
//             documento: 'Número de Documento', // ✅ reemplaza cedula
//             correo: 'Correo',
//             telefono: 'Teléfono',
//             rol: 'Rol',
//             estado: 'Estado',
//             fechaRegistro: 'Fecha Registro',
//           };

//           setColumns(
//             Object.keys(usuarios[0])
//               .filter(key =>
//                 [
//                   'id',
//                   'nombre',
//                   'tipoId',
//                   'documento',
//                   'correo',
//                   'telefono',
//                   'rol',
//                   'estado',
//                   'fechaRegistro',
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
//         console.error('Error al traer usuarios:', error);
//         toast.error('Error de conexión');
//         setData([]);
//       }
//     };

//     fetchUsuarios();
//   const interval = setInterval(fetchUsuarios, 180000); // cada 2 minutos
//     return () => clearInterval(interval);
//   }, [isSearching, isMutating]);

//   const usuarioInfo = selectedData && (
//     <div className="sidebar-info">
//       <hr className="HrImf" />
//       <p>
//         <strong>Tipo Doc:</strong> {selectedData.tipoId}
//       </p>
//       <p>
//         <strong>Num Doc:</strong> {selectedData.documento}
//       </p>
//       <p>
//         <strong>Nombre:</strong> {selectedData.nombre}
//       </p>
//       <p>
//         <strong>Correo:</strong> {selectedData.correo}
//       </p>
//       {selectedData.telefono && (
//         <p>
//           <strong>Teléfono:</strong> {selectedData.telefono}
//         </p>
//       )}
//       <p>
//         <strong>Rol:</strong> {selectedData.rol}
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
//         <Sidebar
//           buttons={sidebarButtons}
//           showInfo={true}
//           infoContent={usuarioInfo}
//           selected={!!selectedData}
//           // onImageUpload={() => console.log('Upload image')} // opcional
//         />
//       }
//       header={
//         <Header title="Usuarios" icon={<HiUserGroup size={32} />} onBack={() => router.back()} />
//       }
//     >
//       <SearchBar
//         module="usuarios"
//         placeholder="Buscar usuario..."
//         onResults={items => {
//           setIsSearching(true);
//           const mapeados = (items || []).map((row: any) => ({
//             ...row,
//             tipoId: row.tipoId,
//             documento: row.documento,
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
//           tipoId: row.tipoId,
//           documento: row.documento,
//         }))}
//         selectedId={selectedId}
//         onRowClick={(row: any) => {
//           if (selectedId === row.id) {
//             setSelectedId(null);
//             setSelectedData(null);
//           } else {
//             setSelectedId(row.id);
//             setSelectedData(row as Usuario);
//           }
//         }}
//       />

//       {showModal && modalType === 'add' && (
//         <AddEditModal
//           entity="usuario"
//           onClose={() => setShowModal(false)}
//           onSuccess={nuevo => {
//             setIsMutating(true);
//             const usuarioPendiente: Usuario = { ...nuevo, pending: true };
//             setData(prev => [
//               ...prev,
//               {
//                 ...usuarioPendiente,
//                 tipoId: nuevo.tipoId,
//                 documento: nuevo.documento,
//                 fechaRegistro: formatDateTime(nuevo.fechaRegistro),
//               },
//             ]);
//             fetch('/api/usuarios', { cache: 'no-store' })
//               .then(r => r.json())
//               .then(json => {
//                 const usuarios: Usuario[] = Array.isArray(json.data) ? json.data : [];
//                 startTransition(() => {
//                   setData(prev => {
//                     const byId = new Set(usuarios.map(u => u.id));
//                     return prev.map(u =>
//                       u.pending && byId.has(u.id) ? { ...u, pending: false } : u
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
//           entity="usuario"
//           initialData={selectedData}
//           onClose={() => setShowModal(false)}
//           onSuccess={actualizado => {
//             setIsMutating(true);
//             setData(prev =>
//               prev.map(u =>
//                 u.id === actualizado.id
//                   ? {
//                       ...u,
//                       ...actualizado,
//                       edited: true,
//                       tipoId: actualizado.tipoId,
//                       documento: actualizado.documento,
//                       fechaRegistro: formatDateTime(actualizado.fechaRegistro),
//                     }
//                   : u
//               )
//             );
//             fetch('/api/usuarios', { cache: 'no-store' })
//               .then(r => r.json())
//               .then(json => {
//                 const usuarios: Usuario[] = Array.isArray(json.data) ? json.data : [];
//                 startTransition(() => {
//                   setData(prev =>
//                     prev.map(u => {
//                       const backend = usuarios.find(b => b.id === u.id);
//                       if (!backend) return u;
//                       if (u.edited) {
//                         return {
//                           ...u,
//                           ...backend,
//                           edited: false,
//                           tipoId: backend.tipoId,
//                           documento: backend.documento,
//                           fechaRegistro: formatDateTime(backend.fechaRegistro),
//                         };
//                       }
//                       return u;
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
//           entity="usuario"
//           id={selectedData.id}
//           onClose={() => setShowModal(false)}
//           onSuccess={() => {
//             setIsMutating(true);
//             // borrado optimista
//             setData(prev =>
//               prev.map(u => (u.id === selectedData.id ? { ...u, deleted: true } : u))
//             );
//             // confirmación contra backend y limpieza
//             fetch('/api/usuarios', { cache: 'no-store' })
//               .then(r => r.json())
//               .then(json => {
//                 const usuarios: Usuario[] = Array.isArray(json.data) ? json.data : [];
//                 const byId = new Set(usuarios.map(u => u.id));
//                 startTransition(() => {
//                   setData(prev => prev.filter(u => !(u.deleted && !byId.has(u.id))));
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

"use client";
import "@/app/style/style.css";
import "@/app/style/global-responsive.css";
import "@/app/style/components-responsive.css";
import "@/app/style/crud-responsive-pages.css";

import React, { useState, useEffect, useRef, startTransition } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "../../components/layout/MainLayout";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import SearchBar from "../../components/common/SearchBar";
import ScrollableTable from "../../components/common/ScrollableTable";
import formatDateTime from "../../../lib/formatDate";
import { HiUserGroup } from "react-icons/hi";
import AddEditModal from "../../components/modal/AddEditModal";
import DeleteConfirmModal from "../../components/modal/DeleteConfirmModal";
import toast from "react-hot-toast";

// 🟩 SWR
import useSWR from "swr";
const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Usuario = {
  id: number;
  nombre: string;
  tipoId: string;
  documento: string;
  correo: string;
  telefono?: string;
  rol: "ADMIN" | "TRABAJADOR" | "USUARIO";
  estado: "ACTIVO" | "BLOQUEADO";
  fechaRegistro: string | Date;
  pending?: boolean;
  edited?: boolean;
  deleted?: boolean;
};

export default function UsuariosPage() {
  const router = useRouter();
  const tableRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<Usuario[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [selectedData, setSelectedData] = useState<Usuario | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(
    null
  );

  const [isSearching, setIsSearching] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  // 🟩 SWR (elimina intervalos)
  const { data: fetched, error, mutate } = useSWR(
    isSearching || isMutating ? null : "/api/usuarios",
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  // 🟩 Merge inteligente
  useEffect(() => {
    if (!fetched || !Array.isArray(fetched.data)) return;

    const backendRows: Usuario[] = fetched.data.map((row: any) => ({
      ...row,
      fechaRegistro: row.fechaRegistro
        ? formatDateTime(row.fechaRegistro)
        : "",
      pending: false,
    }));

    startTransition(() => {
      setData((prev) => {
        const prevActive = prev.filter((u) => !u.deleted);

        const byId = new Map<number, Usuario>();
        backendRows.forEach((u) => byId.set(u.id, u));

        const mergedFromBackend = backendRows.map((row) => {
          const local = prevActive.find((p) => p.id === row.id);
          if (!local) return row;
          if (local.edited) return { ...local };
          return row;
        });

        const pendientes = prevActive.filter(
          (p) => p.pending && !byId.has(p.id)
        );

        return [...mergedFromBackend, ...pendientes];
      });
    });

    // columnas
    if (backendRows.length > 0) {
      const labels: Record<string, string> = {
        id: "ID",
        nombre: "Nombre",
        tipoId: "Tipo Documento",
        documento: "Número de Documento",
        correo: "Correo",
        telefono: "Teléfono",
        rol: "Rol",
        estado: "Estado",
        fechaRegistro: "Fecha Registro",
      };

      setColumns(
        Object.keys(backendRows[0])
          .filter((key) =>
            [
              "id",
              "nombre",
              "tipoId",
              "documento",
              "correo",
              "telefono",
              "rol",
              "estado",
              "fechaRegistro",
            ].includes(key)
          )
          .map((key) => ({
            key,
            label: labels[key] || key,
            width: "150px",
          }))
      );
    }
  }, [fetched]);

  const usuarioInfo =
    selectedData && (
      <div className="sidebar-info">
        <hr className="HrImf" />
        <p>
          <strong>Tipo Doc:</strong> {selectedData.tipoId}
        </p>
        <p>
          <strong>Num Doc:</strong> {selectedData.documento}
        </p>
        <p>
          <strong>Nombre:</strong> {selectedData.nombre}
        </p>
        <p>
          <strong>Correo:</strong> {selectedData.correo}
        </p>
        {selectedData.telefono && (
          <p>
            <strong>Teléfono:</strong> {selectedData.telefono}
          </p>
        )}
        <p>
          <strong>Rol:</strong> {selectedData.rol}
        </p>
        <p>
          <strong>Estado:</strong>{" "}
          <span
            style={{
              color: selectedData.estado === "ACTIVO" ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            {selectedData.estado}
          </span>
        </p>
        <p>
          <strong>Ingreso:</strong>{" "}
          {formatDateTime(selectedData.fechaRegistro)}
        </p>
      </div>
    );

  const sidebarButtons = [
    {
      label: "Volver",
      onClick: () => router.push("/dashboard"),
      className: "btn-activo",
    },
    {
      label: "Registrar",
      onClick: () => {
        setModalType("add");
        setShowModal(true);
      },
    },
    {
      label: "Editar",
      onClick: () => {
        setModalType("edit");
        setShowModal(true);
      },
      disabled: !selectedData,
    },
    {
      label: "Eliminar",
      onClick: () => {
        setModalType("delete");
        setShowModal(true);
      },
      disabled: !selectedData,
    },
  ];

  return (
    <MainLayout
      showSidebar={true}
      sidebar={
        <Sidebar
          buttons={sidebarButtons}
          showInfo={true}
          infoContent={usuarioInfo}
          selected={!!selectedData}
        />
      }
      header={
        <Header title="Usuarios" icon={<HiUserGroup size={32} />} onBack={() => router.back()} />
      }
    >
      <SearchBar
        module="usuarios"
        placeholder="Buscar usuario..."
        onResults={(items) => {
          setIsSearching(true);
          setData(
            (items || []).map((row: any) => ({
              ...row,
              fechaRegistro: formatDateTime(row.fechaRegistro),
            }))
          );
        }}
        onClear={() => setIsSearching(false)}
      />

      <ScrollableTable
        ref={tableRef}
        columns={columns}
        data={data}
        selectedId={selectedId}
        onRowClick={(row: any) => {
          if (selectedId === row.id) {
            setSelectedId(null);
            setSelectedData(null);
          } else {
            setSelectedId(row.id);
            setSelectedData(row as Usuario);
          }
        }}
      />

      {showModal && modalType === "add" && (
        <AddEditModal
          entity="usuario"
          onClose={() => setShowModal(false)}
          onSuccess={(nuevo) => {
            setIsMutating(true);
            mutate(); // 🟩 ACTUALIZA SIN INTERVALO
            setShowModal(false);
            setIsMutating(false);
          }}
        />
      )}

      {showModal && modalType === "edit" && selectedData && (
        <AddEditModal
          entity="usuario"
          initialData={selectedData}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setIsMutating(true);
            mutate(); // 🟩 refresca
            setShowModal(false);
            setIsMutating(false);
          }}
        />
      )}

      {showModal && modalType === "delete" && selectedData && (
        <DeleteConfirmModal
          entity="usuario"
          id={selectedData.id}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setIsMutating(true);
            mutate();
            setShowModal(false);
            setIsMutating(false);
          }}
        />
      )}
    </MainLayout>
  );
}

