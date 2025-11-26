/* eslint-disable @next/next/no-img-element */
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import './register.css';
import './register2.css';

export default function RegisterPage() {
  const [usuario, setUsuario] = useState('');
  const [correo, setCorreo] = useState('');
  const [documento, setDocumento] = useState('');
  const [tipoId, setTipoId] = useState('CC');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fade, setFade] = useState(false); // 👈 estado para animación
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: usuario,
          documento,
          tipoId,
          correo: correo.toLowerCase(),
          password,
        }),
        credentials: 'include',
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Error en registro');
        return;
      }

      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 👇 función para animar y luego navegar
  const handleLoginClick = () => {
    setFade(true);
    setTimeout(() => {
      router.push('/login');
    }, 100); // mismo tiempo que la transición
  };

  return (
    <div className="larger-container">
      <div className="letf-conteiner">
        <div className="tabs">
          <button className="tab desactivado" onClick={handleLoginClick} aria-selected="false">
            Iniciar Sesión
          </button>
          <button className="tab active" aria-selected="true">
            Registro
          </button>
          <div className="tab-indicator register"></div>
        </div>
      </div>

      {/* Lado derecho con formulario */}
      <div className="right-conteiner">
        <div className={`register-card ${fade ? 'fade-out' : ''}`}>
          <div className="logo-container">
            <img src="/logo.png" alt="Logo Grupo Monterrey" />
          </div>
          <h3>Registrate</h3>
          <form onSubmit={handleSubmit}>
            {/* Usuario */}
            <div className="input-line">
              <User className="icon" size={20} />
              <input
                type="text"
                placeholder="Crear Usuario"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                required
              />
            </div>

            {/* Contraseña */}
            <div className="input-line">
              <Lock className="icon" size={20} />
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Crear Contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="icon-btn"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div className="input-line">
              <Lock className="icon" size={20} />
              <div className="input-wrapper">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirmar Contraseña"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="icon-btn"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Correo */}
            <div className="input-line">
              <Mail className="icon" size={20} />
              <input
                type="email"
                placeholder="Correo"
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                required
              />
            </div>

            {/* Tipo de documento */}
            <div className="input-line">
              <select className="select-line input-line" value={tipoId} onChange={e => setTipoId(e.target.value)} required>
                <option value="CC">CC</option>
                <option value="TI">TI</option>
                <option value="CE">CE</option>
                <option value="PASAPORTE">PASAPORTE</option>
                <option value="NIT">NIT</option>
              </select>
            </div>

            {/* Documento (número) */}
            <div className="input-line">
              <User className="icon" size={20} />
              <input
                type="text"
                placeholder="Documento (número)"
                value={documento}
                onChange={e => setDocumento(e.target.value)}
                required
              />
            </div>

            {/* Error de contraseñas */}
            {password && confirmPassword && password !== confirmPassword && (
              <div className="error-text">Las contraseñas no coinciden</div>
            )}
            {error && <div className="error-text">{error}</div>}

            {/* Términos */}
            <div className="terms">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                Acepto los{' '}
                <a href="./noContruido">
                  Términos y condiciones
                </a>
              </label>
            </div>

            {/* Botón */}
            <div className="botonn">
              <button type="submit" className="btn-primary">
                Siguiente
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
