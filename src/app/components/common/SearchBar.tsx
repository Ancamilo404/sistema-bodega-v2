"use client";

import React, { useState, useRef } from "react";
import toast from "react-hot-toast";

interface SearchBarProps {
  module: "clientes" | "productos" | "aliados" | "usuarios" | "ventas" | "historial";
  placeholder?: string;
  buttonText?: string;
  onResults: (data: any[]) => void;
  onClear?: () => void; // ✅ callback para reactivar polling
  debounceMs?: number; // ✅ NUEVO: Debounce en milisegundos (default: 500ms)
}

export default function SearchBar({
  module,
  placeholder = "Buscar",
  buttonText = "Buscar",
  onResults,
  onClear,
  debounceMs = 500, // ✅ NUEVO: 500ms debounce por defecto
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();

  const endpoints: Record<SearchBarProps["module"], string> = {
    clientes: "/api/clientes",
    productos: "/api/productos",
    aliados: "/api/aliados",
    usuarios: "/api/usuarios",
    ventas: "/api/ventas",
    historial: "/api/historial",
  };

  const handleSearch = async (searchQuery: string = query) => {
    // ⛔ Si está vacío o solo espacios, no hacer nada
    if (!searchQuery.trim()) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${endpoints[module]}?search=${encodeURIComponent(searchQuery.trim())}`);
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Error en búsqueda");
        return;
      }

      // ✅ Manejar estructura: json.data.items (o json.data si es array directo)
      const items = Array.isArray(json.data) ? json.data : (json.data?.items || []);
      onResults(items);
    } catch (err) {
      console.error("Error en búsqueda:", err);
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // ✅ Cancelar debounce anterior y hacer búsqueda inmediata
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      handleSearch();
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          const value = e.target.value;
          setQuery(value);

          // ✅ NUEVO: Cancelar debounce anterior si existe
          if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
          }

          // 🔹 Si el input queda vacío, limpia resultados y reactiva polling INMEDIATAMENTE
          if (value.trim() === "") {
            onResults([]);
            if (onClear) onClear();
            return;
          }

          // ✅ NUEVO: Configurar nuevo debounce para evitar searches frecuentes
          debounceTimer.current = setTimeout(() => {
            handleSearch(value);
          }, debounceMs);
        }}
        onKeyPress={handleKeyPress}
        placeholder={placeholder || `Buscar ${module}...`}
        className="input-search"
        disabled={loading}
      />
      <button onClick={() => handleSearch()} className="btn-search" disabled={loading}>
        {loading ? <span className="spinner-inline">⏳ Buscando...</span> : buttonText}
      </button>
    </div>
  );
}
