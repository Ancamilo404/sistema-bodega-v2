'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Calendar, Clock, Terminal } from 'lucide-react';
import { HiMiniUser } from 'react-icons/hi2';
import { FaUserTie } from 'react-icons/fa6';
import { HiUserGroup } from 'react-icons/hi';
import { MdStoreMallDirectory } from 'react-icons/md';
import { IoReceiptSharp } from 'react-icons/io5';
import { BiSolidStoreAlt } from 'react-icons/bi';
import { FaWarehouse } from 'react-icons/fa';
import { FaAddressBook } from 'react-icons/fa';
import InfoTooltip from '../components/common/InfoTooltip';
import PerfilModal from '../components/modal/PerfilModal'; // 👈 nuevo modal de perfil

import './dashboard.css';
import '@/app/style/style.css';
import '@/app/style/global-responsive.css';
import '@/app/style/components-responsive.css';
import '@/app/style/crud-responsive-pages.css';

export default function DashboardMenu() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fechaHora, setFechaHora] = useState(new Date());
  const [showPerfil, setShowPerfil] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // ⚠️ NO llamar /api/meta/dashboard - consume 4 conexiones con COUNT()
        // Simplemente verificar auth con /api/auth/me
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.status === 403) {
          router.push('/noAutorizado');
          return;
        }
      } catch (e) {
        console.error('Error verificando rol:', e);
        router.push('/noAutorizado');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();

    // actualizar fecha/hora cada minuto
    const intervalo = setInterval(() => {
      setFechaHora(new Date());
    }, 600000);
    return () => clearInterval(intervalo);
  }, [router]);

  // cargar datos del usuario autenticado
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(json => setUserData(json.data))
      .catch(() => setUserData(null));
  }, []);

  if (loading) return <div>Cargando...</div>;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
  };

  const fechaFormateada = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(fechaHora);

  const horaFormateada = new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(fechaHora);

  return (
    <div className="main-wrapper">
      {/* Header */}
      <div className="header">
        <div className="header-top header-top-menu">
          <button onClick={handleLogout} className="boton-letra logout">
            <LogOut size={25} strokeWidth={2.5} />
            <span>Salir de la Sesion</span>
          </button>

          <h1 className="title-menu">Sistema de Bodega</h1>

          <button className="boton user" onClick={() => setShowPerfil(true)}>
            <HiMiniUser size={20} />
            <span>{userData?.nombre || 'Usuario'}</span>
          </button>
        </div>

        <div className="header-bottom">
          <div className="date-time">
            <Calendar size={20} />
            <span>{fechaFormateada}</span>
          </div>
          <div className="date-time">
            <Clock size={20} />
            <span>{horaFormateada}</span>
          </div>
        </div>
      </div>
      <hr className="separador" />

      {/* Menú central */}
      <div className="content">
        <div className="menu-container">
          <div className="menu-row">
            <MenuCard
              icon={<FaWarehouse size={48} />}
              title="Bodega"
              onClick={() => router.push('/dashboard/productos')}
            />
            <MenuCard
              icon={<BiSolidStoreAlt size={28} />}
              title="Venta"
              onClick={() => router.push('/dashboard/ventas')}
            />
            <MenuCard
              icon={<HiUserGroup size={48} />}
              title="Usuarios"
              onClick={() => router.push('/dashboard/usuarios')}
            />
            <MenuCard
              icon={<FaUserTie size={48} />}
              title="Aliados"
              onClick={() => router.push('/dashboard/aliados')}
            />
            <MenuCard
              icon={<FaAddressBook size={48} />}
              title="Clientes"
              onClick={() => router.push('/dashboard/clientes')}
            />
            <MenuCard
              icon={<IoReceiptSharp size={28} />}
              title="Historial"
              onClick={() => router.push('/dashboard/historial')}
            />
          </div>
        </div>
      </div>
      <hr className="separador" />

      {/* Footer */}
      <div className="footer">
        <div className="footer-content">
          <div className="footer-left">
            <button className="boton tienda">
              <MdStoreMallDirectory size={24} />
              <span>Tienda</span>
            </button>
          </div>

          <div className="tooltip">
            <div className="footer-center">
              <button className="boton-letra info">
                <Terminal size={24} />
                <span>Informacion</span>
              </button>
              <div className="tooltip-text">
                <InfoTooltip />
              </div>
            </div>
          </div>

          <div className="footer-right">
            <div className="logo-container2">
              <img src="/logoo.png" alt="Logo Grupo Monterrey" className="logo-img" />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de perfil */}
      {showPerfil && (
        <PerfilModal
          user={userData}
          onClose={() => setShowPerfil(false)}
          onSuccess={(updated) => {
            setUserData(updated);
            setShowPerfil(false);
          }}
        />
      )}
    </div>
  );
}

function MenuCard({
  icon,
  title,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  onClick?: () => void;
}) {
  return (
    <button className="menu-card" onClick={onClick}>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <div className="card-icon">{icon}</div>
      </div>
    </button>
  );
}
