'use client';
import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { MdEmail, MdLocationOn } from 'react-icons/md';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

interface InfoTooltipProps {
  onClose?: () => void;
}

export default function InfoTooltip({ onClose }: InfoTooltipProps) {
  const [showModal, setShowModal] = useState(false);

  const handleClose = () => {
    setShowModal(false);
    onClose?.();
  };

  const openModal = () => setShowModal(true);

  return (
    <>
      {/* Botón para abrir modal */}
      <button
        onClick={openModal}
        style={{
          background: 'none',
          border: 'none',
          color: '#ddd',
          cursor: 'pointer',
          fontSize: '14px',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={e => {
          (e.target as HTMLElement).style.color = '#4CAF50';
          (e.target as HTMLElement).style.transform = 'scale(1.05)';
        }}
        onMouseLeave={e => {
          (e.target as HTMLElement).style.color = '#ddd';
          (e.target as HTMLElement).style.transform = 'scale(1)';
        }}
      >
        Información
      </button>

      {/* MODAL ELEGANTE */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.3s ease',
          }}
          onClick={handleClose}
        >
          <div
            style={{
              backgroundColor: '#f5f5f5',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              maxWidth: '700px',
              width: '95%',
              maxHeight: '85vh',
              overflowY: 'auto',
              animation: 'slideUp 0.3s ease',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #333333 0%, #1a1a1a 100%)',
                padding: '30px 30px 20px',
                borderRadius: '16px 16px 0 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 style={{ margin: 0, color: '#fff', fontSize: '24px', fontWeight: '600' }}>
                Acerca de Nosotros
              </h2>
              <button
                onClick={handleClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontSize: '24px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.transform = 'rotate(90deg)';
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.transform = 'rotate(0deg)';
                }}
              >
                <IoClose />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '30px' }}>
              {/* Creadores */}
              <section style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#333333', marginBottom: '15px', fontSize: '18px' }}>
                  👨‍💻 Creadores
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div
                    style={{
                      backgroundColor: '#e8e8e8',
                      padding: '15px',
                      borderRadius: '8px',
                      borderLeft: '4px solid #333333',
                    }}
                  >
                    <p style={{ margin: 0, color: '#1a1a1a', fontWeight: '600' }}>Andres Camilo</p>
                    <p style={{ margin: '5px 0 0 0', color: '#555', fontSize: '12px' }}>
                      Ramirez Orrego
                    </p>
                  </div>
                  <div
                    style={{
                      backgroundColor: '#e8e8e8',
                      padding: '15px',
                      borderRadius: '8px',
                      borderLeft: '4px solid #333333',
                    }}
                  >
                    <p style={{ margin: 0, color: '#1a1a1a', fontWeight: '600' }}>Simon Franco</p>
                    <p style={{ margin: '5px 0 0 0', color: '#555', fontSize: '12px' }}>Gisado</p>
                  </div>
                </div>
              </section>

              {/* Ubicación */}
              <section style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#333333', marginBottom: '15px', fontSize: '18px' }}>
                  📍 Ubicación
                </h3>
                <div
                  style={{
                    backgroundColor: '#e8e8e8',
                    padding: '15px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <MdLocationOn size={20} color="#333333" />
                  <span style={{ color: '#1a1a1a' }}>Medellín, Colombia</span>
                </div>
              </section>

              {/* Redes Sociales */}
              <section style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#333333', marginBottom: '15px', fontSize: '18px' }}>
                  🌐 Redes Sociales
                </h3>

                {/* Email */}
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ color: '#666', fontSize: '12px', margin: '0 0 8px 0' }}>
                    Correo Electrónico
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <a
                      href="mailto:Ancamilo404@gmail.com"
                      style={{
                        backgroundColor: '#e8e8e8',
                        padding: '12px',
                        borderRadius: '8px',
                        color: '#333333',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                        border: '1px solid #333333',
                      }}
                      onMouseEnter={e => {
                        (e.target as HTMLElement).style.backgroundColor = '#333333';
                        (e.target as HTMLElement).style.color = '#f5f5f5';
                      }}
                      onMouseLeave={e => {
                        (e.target as HTMLElement).style.backgroundColor = '#e8e8e8';
                        (e.target as HTMLElement).style.color = '#333333';
                      }}
                    >
                      <MdEmail size={16} />
                      <span style={{ fontSize: '12px' }}>Ancamilo404</span>
                    </a>
                    <a
                      href="mailto:simonfrancoguisado@gmail.com"
                      style={{
                        backgroundColor: '#e8e8e8',
                        padding: '12px',
                        borderRadius: '8px',
                        color: '#333333',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                        border: '1px solid #333333',
                      }}
                      onMouseEnter={e => {
                        (e.target as HTMLElement).style.backgroundColor = '#333333';
                        (e.target as HTMLElement).style.color = '#f5f5f5';
                      }}
                      onMouseLeave={e => {
                        (e.target as HTMLElement).style.backgroundColor = '#e8e8e8';
                        (e.target as HTMLElement).style.color = '#333333';
                      }}
                    >
                      <MdEmail size={16} />
                      <span style={{ fontSize: '12px' }}>Simon Franco</span>
                    </a>
                  </div>
                </div>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/simonfrancoguisado/?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#e8e8e8',
                    padding: '12px 15px',
                    borderRadius: '8px',
                    color: '#0A66C2',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s ease',
                    border: '1px solid #0A66C2',
                    marginBottom: '10px',
                  }}
                  onMouseEnter={e => {
                    (e.target as HTMLElement).style.backgroundColor = '#0A66C2';
                    (e.target as HTMLElement).style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    (e.target as HTMLElement).style.backgroundColor = '#e8e8e8';
                    (e.target as HTMLElement).style.color = '#0A66C2';
                  }}
                >
                  <FaLinkedin size={18} />
                  <span>Simon Franco Guisado</span>
                </a>

                {/* GitHub */}
                <a
                  href="https://github.com/Ancamilo404"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#e8e8e8',
                    padding: '12px 15px',
                    borderRadius: '8px',
                    color: '#333333',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s ease',
                    border: '1px solid #ddd',
                  }}
                  onMouseEnter={e => {
                    (e.target as HTMLElement).style.backgroundColor = '#333333';
                    (e.target as HTMLElement).style.color = '#f5f5f5';
                  }}
                  onMouseLeave={e => {
                    (e.target as HTMLElement).style.backgroundColor = '#e8e8e8';
                    (e.target as HTMLElement).style.color = '#333333';
                  }}
                >
                  <FaGithub size={18} />
                  <span>Ancamilo404</span>
                </a>
              </section>

              {/* Filosofía */}
              <section>
                <h3 style={{ color: '#333333', marginBottom: '15px', fontSize: '18px' }}>
                  💡 Nuestra Filosofía
                </h3>
                <div
                  style={{
                    backgroundColor: '#e8e8e8',
                    padding: '20px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #333333',
                    lineHeight: '1.6',
                  }}
                >
                  <p style={{ margin: 0, color: '#1a1a1a', fontStyle: 'italic' }}>
                    &quot;Nos esforzamos por hacer las cosas bien y más de lo que nos piden.&quot;
                  </p>
                  <p style={{ margin: '10px 0 0 0', color: '#1a1a1a', fontStyle: 'italic' }}>
                    No hacemos cosas ordinarias.
                  </p>
                  <p style={{ margin: '10px 0 0 0', color: '#1a1a1a', fontStyle: 'italic' }}>
                    Usamos conocimientos, IA y sudor.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
