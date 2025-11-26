/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import "../register/register.css";
import "../register/register2.css";

export default function LoginPage() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fade, setFade] = useState(false); // 👈 estado para animación
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
        credentials: "include", // guarda la cookie
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Error en login");
        return;
      }

      // 👇 reload completo para que el middleware lea la cookie
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 👇 animación antes de navegar a registro
  const handleRegisterClick = () => {
    setFade(true);
    setTimeout(() => {
      router.push("/register");
    }, 100); // mismo tiempo que la transición
  };

  return (
    <div className="larger-container">
      <div className="letf-conteiner">
        <div className="tabs">
          <button className="tab active" aria-selected="true">
            Iniciar Sesión
          </button>
          <button
            className="tab desactivado"
            onClick={handleRegisterClick}
            aria-selected="false"
          >
            Registro
          </button>
          <div className="tab-indicator"></div>
        </div>
      </div>

      {/* Lado derecho con formulario */}
      <div className="right-conteiner login">
        <div className={`register-card ${fade ? "fade-out" : ""}`}>
          <div className="logo-container logo-login">
            <img src="/logo.png" alt="Logo Grupo Monterrey" />
          </div>
          <h3 className="titulo-login">Iniciar Sesión</h3>
          <form onSubmit={handleSubmit}>
            {/* Correo */}
            <div className="input-line">
              <Mail className="icon" size={20} />
              <input
                type="email"
                placeholder="Correo"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            {/* Contraseña */}
            <div className="input-line">
              <Lock className="icon" size={20} />
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="icon-btn"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            {error && <div className="error-text">{error}</div>}

            {/* Recuperar contraseña */}
            <div className="terms terms-login">
              <label>
                Se te ha olvidado la{" "}
                <a href="./noContruido">
                  Contraseña??
                </a>
              </label>
            </div>

            {/* Botón */}
            <div className="botonn">
              <button type="submit" className="btn-primary">
                Entrar
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
