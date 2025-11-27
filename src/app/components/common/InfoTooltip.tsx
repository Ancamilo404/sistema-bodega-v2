'use client';
import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { MdEmail, MdLocationOn } from 'react-icons/md';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import styles from './InfoTooltip.module.css';

interface InfoTooltipProps {
  onClose?: () => void;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

export default function InfoTooltip({
  onClose,
  isOpen: externalIsOpen,
  onToggle,
}: InfoTooltipProps) {
  const [internalShowModal, setInternalShowModal] = useState(false);
  const showModal = externalIsOpen !== undefined ? externalIsOpen : internalShowModal;

  const handleClose = () => {
    if (onToggle) {
      onToggle(false);
    } else {
      setInternalShowModal(false);
    }
    onClose?.();
  };

  const openModal = () => {
    if (onToggle) {
      onToggle(true);
    } else {
      setInternalShowModal(true);
    }
  };

  return (
    <>
      {/* MODAL ELEGANTE */}
      {showModal && (
        <div className={styles.modalBackdrop} onClick={handleClose}>
          <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.modalHeader}>
              <h2>Acerca de Nosotros</h2>
              <button className={styles.closeButton} onClick={handleClose}>
                <IoClose />
              </button>
            </div>

            {/* Content */}
            <div className={styles.modalContent}>
              {/* Creadores */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>👨‍💻 Creadores</h3>
                <div className={styles.creatorsGrid}>
                  <div className={styles.creatorCard}>
                    <p>Andres Camilo</p>
                    <p>Ramirez Orrego</p>
                  </div>
                  <div className={styles.creatorCard}>
                    <p>Simon Franco</p>
                    <p>Gisado</p>
                  </div>
                </div>
              </section>

              {/* Ubicación */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>📍 Ubicación</h3>
                <div className={styles.locationBox}>
                  <MdLocationOn size={20} color="#333333" />
                  <span>Medellín, Colombia</span>
                </div>
              </section>

              {/* Redes Sociales */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>🌐 Redes Sociales</h3>

                {/* Email */}
                <p style={{ color: '#666', fontSize: '12px', margin: '0 0 8px 0' }}>
                  Correo Electrónico
                </p>
                <div className={styles.emailGrid}>
                  <a href="mailto:Ancamilo404@gmail.com" className={styles.emailLink}>
                    <MdEmail size={16} />
                    <span>Ancamilo404</span>
                  </a>
                  <a href="mailto:simonfrancoguisado@gmail.com" className={styles.emailLink}>
                    <MdEmail size={16} />
                    <span>Simon Franco</span>
                  </a>
                </div>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/simonfrancoguisado/?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkedinLink}
                >
                  <FaLinkedin size={18} />
                  <span>Simon Franco Guisado</span>
                </a>

                {/* GitHub */}
                <a
                  href="https://github.com/Ancamilo404"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.githubLink}
                >
                  <FaGithub size={18} />
                  <span>Ancamilo404</span>
                </a>
              </section>

              {/* Filosofía */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>💡 Nuestra Filosofía</h3>
                <div className={styles.philosophyBox}>
                  <p>
                    &quot;Nos esforzamos por hacer las cosas bien y más de lo que nos piden.&quot;
                  </p>
                  <p>No hacemos cosas ordinarias.</p>
                  <p>Usamos conocimientos, IA y sudor.</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
