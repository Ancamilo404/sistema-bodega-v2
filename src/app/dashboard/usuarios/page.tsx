

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
    // ✅ Manejar estructura: fetched.data.items (no fetched.data)
    if (!fetched || !fetched.data || !Array.isArray(fetched.data.items)) return;

    const backendRows: Usuario[] = fetched.data.items.map((row: any) => ({
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

