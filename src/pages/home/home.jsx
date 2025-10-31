import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CalendarDays, Settings } from "lucide-react";
import { FaUserCircle } from "react-icons/fa";
import "../../styles/custom.css";
import useUser from "../../hooks/useUser";
import { http, clearToken } from "../../services/http";

function Home() {
  const navigate = useNavigate();
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [menuAberto, setMenuAberto] = useState(false);

  const [mostrarModalSenha, setMostrarModalSenha] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  const { user, fetchUser, loadingUser, clearUser } = useUser();

  // Atualiza hora em tempo real
  useEffect(() => {
    const timer = setInterval(() => setHoraAtual(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Busca usuário se não estiver carregado
  useEffect(() => {
    if (!user && !loadingUser) {
      fetchUser().catch(() => {
        clearToken();
        clearUser();
        navigate("/login");
      });
    }
  }, [user, loadingUser, fetchUser, clearUser, navigate]);

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

  // 🔐 Abre modal
  const abrirModalSenha = () => {
    setMenuAberto(false);
    setNovaSenha("");
    setConfirmarSenha("");
    setMostrarModalSenha(true);
  };

  const fecharModalSenha = () => setMostrarModalSenha(false);

  // 🧩 Salvar nova senha via API
  const salvarNovaSenha = async () => {
    if (!novaSenha || !confirmarSenha) {
      alert("Preencha todos os campos.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      alert("As senhas não coincidem.");
      return;
    }

    try {
      setCarregando(true);
      const payload = { password: novaSenha };

      await http.patch(`/usuarios/${user.id}`, payload);

      alert("Senha alterada com sucesso!");
      setMostrarModalSenha(false);
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      alert("Erro ao alterar senha. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const handleLogout = async () => {
    setMenuAberto(false);
    if (window.confirm("Deseja realmente sair do sistema?")) {
      clearToken();
      clearUser();
      navigate("/login");
    }
  };

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
    <div className="min-vh-100 d-flex flex-column bg-light position-relative">
      {/* HEADER */}
      <header className="container py-3">
        <div className="card shadow-sm mx-auto" style={{ maxWidth: 460 }}>
          <div className="card-body d-flex align-items-center gap-3">
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
      <footer className="container pb-4 position-relative">
        <div className="d-flex justify-content-center align-items-center gap-2">
          <button
            type="button"
            className="btn btn-link fw-semibold text-decoration-none"
            onClick={() => navigate("/pontos")}
          >
            <CalendarDays size={18} className="me-2" />
            PONTOS BATIDOS
          </button>

          <button
            type="button"
            className="btn btn-link text-decoration-none text-dark p-0"
            onClick={() => setMenuAberto((prev) => !prev)}
            aria-label="Configurações"
          >
            <Settings size={22} />
          </button>
        </div>

        {/* Mini Card Flutuante */}
        {menuAberto && (
          <div className="config-card animate-fade-slide position-absolute bottom-100 start-50 translate-middle-x mb-3 bg-white shadow rounded-3 py-2 px-3 text-center">
            <button
              className="btn btn-sm btn-light w-100 mb-2"
              onClick={abrirModalSenha}
            >
              🔑 Alterar Senha
            </button>
            <button
              className="btn btn-sm btn-outline-danger w-100"
              onClick={handleLogout}
            >
              Sair
            </button>
          </div>
        )}
      </footer>

      {/* Modal Alterar Senha */}
      <div
        className={`modal fade ${mostrarModalSenha ? "show d-block" : ""}`}
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          role="document"
          style={{ maxWidth: 400 }}
        >
          <div className="modal-content border-0 shadow rounded-3">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-semibold">Alterar Senha</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={fecharModalSenha}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Nova senha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Confirmar nova senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer border-0 pt-0">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={fecharModalSenha}
                disabled={carregando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={salvarNovaSenha}
                disabled={carregando}
              >
                {carregando ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Home);
