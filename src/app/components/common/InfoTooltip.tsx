'use client';
import React from 'react';

export default function InfoTooltip() {
  return (
    <div className="info-tooltip">
      <strong>Información de la Página</strong>
      <ul>
        <li>
          <strong>Creadores:</strong>
        </li>
        <ul>
          <li>Andres Camilo Ramirez Orrego</li>
          <li>Simon Frenco Gisado</li>
        </ul>
      </ul>
      <strong>Ubicación:</strong> Medellín, Colombia
      <br />
      <strong>Redes:</strong>
      <ul>
        <li>Correo:</li>
        <ul>
          <li>
            <em>Ancamilo404@gmail.com / simonfrancoguisado@gmail.com</em>
          </li>
        </ul>
        <li>LinkedIn:</li>
        <ul>
          <li>
            <em>
              {' '}
              <a
                href="https://www.linkedin.com/in/simonfrancoguisado/?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                target="_blank"
              >
                simon franco guisado
              </a>
            </em>
          </li>
        </ul>
        <li>GitHub:</li>
        <ul>
          <li>
            <em>
              <a href="https://github.com/Ancamilo404" target="_blank">
                Ancamilo404
              </a>
            </em>
          </li>
        </ul>
      </ul>
      <strong>Filosofía:</strong>
      <br /> Nos esforzamos por hacer las cosas bien y más de lo que nos piden.
      <br /> No hacemos cosas ordinarias.
      <br /> Usamos conocimientos, IA y sudor.
    </div>
  );
}
