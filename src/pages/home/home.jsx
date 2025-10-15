import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CalendarDays } from "lucide-react";
import { FaUserCircle } from "react-icons/fa";
import "../../styles/custom.css";
import useUser from "../../hooks/useUser";
import { clearToken } from "../../services/http";

function Home() {
  const navigate = useNavigate();
  const [horaAtual, setHoraAtual] = useState(new Date());
  const { user, fetchUser, loadingUser, clearUser } = useUser();

  // Atualiza o relógio em tempo real
  useEffect(() => {
    const timer = setInterval(() => setHoraAtual(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Garante que o usuário está autenticado
  useEffect(() => {
    if (!user && !loadingUser) {
      fetchUser().catch(() => {
        clearToken();
        clearUser();
        navigate("/login");
      });
    }
  }, [user, loadingUser, fetchUser, clearUser, navigate]);

  // Formata hora atual
  const formatarHora = useCallback(
    (d) => d.toLocaleTimeString("pt-BR", { hour12: false }),
    []
  );
  const horaFormatada = useMemo(
    () => formatarHora(horaAtual),
    [horaAtual, formatarHora]
  );

  const getTipoUsuarioLabel = (tipo) => {
    switch (tipo) {
      case 1:
        return "Administrador";
      case 2:
        return "Gestor";
      case 3:
        return "Colaborador";
      default:
        return "Usuário";
    }
  };

  // Enquanto carrega o usuário
  if (loadingUser || !user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* HEADER */}
      <header className="container py-3">
        <div className="card shadow-sm mx-auto" style={{ maxWidth: 460 }}>
          <div className="card-body d-flex align-items-center gap-3">
            {/* Ícone do usuário (sem foto) */}
            <FaUserCircle
              size={64}
              className="text-secondary flex-shrink-0"
              aria-label="Usuário sem foto"
            />

            <div className="flex-grow-1">
              <h6 className="fw-semibold mb-1 text-break">
                Conselho Federal de Fisioterapia e Terapia Ocupacional
              </h6>
              <p className="mb-0 fw-semibold">{user?.nome}</p>
              <p className="mb-0 text-muted">
                {user?.cargo
                  ? user.cargo
                  : getTipoUsuarioLabel(user?.tipo_usuario)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="container flex-grow-1 d-flex justify-content-center align-items-center py-4">
        <button
          type="button"
          onClick={() => navigate("/ponto")}
          className="btn p-0 rounded-circle text-white shadow"
          aria-label="Registrar ponto eletrônico"
          style={{
            width: 240,
            height: 240,
            backgroundColor: "#e74c3c",
            border: "none",
          }}
        >
          <div className="h-100 d-flex flex-column align-items-center justify-content-center">
            <Clock size={56} className="mb-2" />
            <div className="fw-bold">Registrar Ponto</div>
            <div className="fs-5">{horaFormatada}</div>
          </div>
        </button>
      </main>

      {/* FOOTER */}
      <footer className="container pb-4">
        <div className="text-center">
          <button
            type="button"
            className="btn btn-link fw-semibold text-decoration-none"
            onClick={() => navigate("/pontos")}
          >
            <CalendarDays size={18} className="me-2" />
            PONTOS BATIDOS
          </button>
        </div>
      </footer>
    </div>
  );
}

export default React.memo(Home);
