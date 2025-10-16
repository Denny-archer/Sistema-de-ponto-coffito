import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  User,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import useUser from "../hooks/useUser";
import { clearToken } from "../services/http";
import "../styles/topbar.css"; // se quiser separar os estilos customizados

function Topbar({ setSidebarOpen }) {
  const { user, clearUser } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const dropdownRef = useRef(null);

  // 🌓 Detecta e aplica o tema inicial sem flicker
  useEffect(() => {
    const savedTheme =
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  // 🌗 Alterna tema e persiste no localStorage
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // 🔒 Logout
  const handleLogout = () => {
    clearToken();
    clearUser();
    window.location.href = "/login";
  };

  // 👇 Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="top-bar d-flex align-items-center justify-content-between px-3 py-2 shadow-sm bg-white">
      {/* ====== ESQUERDA ====== */}
      <div className="d-flex align-items-center gap-2">
        {/* ☰ Botão de menu mobile */}
        <button
          className="icon-btn d-md-none"
          onClick={() => setSidebarOpen?.(true)}
          title="Abrir menu lateral"
        >
          <Menu size={22} />
        </button>

        {/* Breadcrumb */}
        <div className="breadcrumb d-none d-md-block">
          <span className="fw-bold">Dashboard</span>
          <span className="text-muted"> • Painel de controle</span>
        </div>
      </div>

      {/* ====== DIREITA ====== */}
      <div className="d-flex align-items-center gap-3">
        {/* 🔍 Pesquisa */}
        <div className="search-bar d-none d-md-flex align-items-center px-2 rounded bg-light">
          <Search size={18} className="text-muted me-1" />
          <input
            type="text"
            placeholder="Pesquisar..."
            className="form-control border-0 bg-transparent p-0 shadow-none"
          />
        </div>

        {/* 🔔 Pendências */}
        <button
          className="icon-btn position-relative"
          title="Justificativas pendentes"
          onClick={() => navigate("/gestor/justificativas")}
        >
          <Bell size={20} />
          {user?.pendencias > 0 && (
            <span className="notification-badge position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {user.pendencias}
            </span>
          )}
        </button>


        {/* 🌙 / ☀️ Tema */}
        <button
          className="icon-btn"
          title="Ativar modo foco"
          onClick={() => document.body.classList.toggle("focus-mode")}
        >
          <Sun size={20} />
        </button>


        {/* 👤 Menu do usuário */}
        <div ref={dropdownRef} className="user-menu position-relative">
          <button
            className="btn btn-light d-flex align-items-center rounded-pill px-2 py-1"
            onClick={() => setDropdownOpen((p) => !p)}
            title="Abrir menu do usuário"
          >
            <div className="user-avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center">
              <User size={16} />
            </div>
            <div className="ms-2 text-start d-none d-md-block">
              <div className="fw-semibold small">
                {user?.nome || "Usuário"}
              </div>
              <div className="text-muted small">
                {user?.cargo || user?.tipo_usuario || ""}
              </div>
            </div>
            <ChevronDown size={14} className="ms-1 d-none d-md-inline" />
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu show mt-2 end-0 shadow border-0 rounded-3">
              <button
                className="dropdown-item d-flex align-items-center"
                onClick={() => {
                  setDropdownOpen(false);
                  window.location.href = "/home"; // 🔹 rota da tela de colaborador
                }}
              >
                <Settings size={16} className="me-2" /> Tela Colaborador
              </button>

              <hr className="my-1" />

              <button
                className="dropdown-item d-flex align-items-center text-danger"
                onClick={handleLogout}
              >
                <LogOut size={16} className="me-2" /> Sair
              </button>
            </div>

          )}
        </div>
      </div>
    </header>
  );
}

export default React.memo(Topbar);
