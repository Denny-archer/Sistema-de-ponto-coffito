// 📂 src/components/Topbar.jsx
import React, { useState, useEffect } from "react";
import { Search, Bell, User, ChevronDown, LogOut, Menu, Settings, Sun, Moon } from "lucide-react";
import useAuth from "../hooks/useAuth";

function Topbar({ setSidebarOpen }) {
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  // 🔹 Detecta tema salvo ou padrão
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.body.setAttribute("data-theme", savedTheme);
  }, []);

  // 🔹 Alterna tema
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <header className="top-bar d-flex align-items-center justify-content-between px-3 py-2">
      {/* Esquerda */}
      <div className="top-bar-left d-flex align-items-center gap-2">
        {/* ☰ Menu */}
        <button className="menu-btn d-md-none" onClick={() => setSidebarOpen?.(true)}>
          <Menu size={22} />
        </button>

        {/* Breadcrumb - só aparece em telas médias+ */}
        <div className="breadcrumb d-none d-md-block">
          <span className="fw-bold">Dashboard</span>
          <span className="text-muted"> • Painel de controle</span>
        </div>
      </div>

      {/* Direita */}
      <div className="top-bar-right d-flex align-items-center gap-2">
        {/* 🔍 Search (esconde no mobile) */}
        <div className="search-bar d-none d-md-flex align-items-center px-2">
          <Search size={18} className="text-muted" />
          <input type="text" placeholder="Pesquisar..." />
        </div>

        {/* 🔔 Notificações */}
        <button className="icon-btn">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>

        {/* 🌙/☀️ Toggle Tema */}
        <button className="icon-btn" onClick={toggleTheme} title="Alternar tema">
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* 👤 Usuário */}
        <div className="user-menu position-relative">
          <div
            className="user-info d-flex align-items-center"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="user-avatar rounded-circle bg-light d-flex align-items-center justify-content-center">
              <User size={18} />
            </div>
            {/* Nome/cargo só aparecem em md+ */}
            <div className="ms-2 d-none d-md-block">
              <span className="fw-semibold">{user?.nome || "Usuário"}</span>
              <div className="text-muted small">{user?.cargo || user?.tipo_usuario || ""}</div>
            </div>
            <ChevronDown size={16} className="ms-1 d-none d-md-inline" />
          </div>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="dropdown-menu show mt-2 end-0 shadow">
              <button className="dropdown-item d-flex align-items-center">
                <Settings size={16} className="me-2" /> Perfil
              </button>
              <button
                className="dropdown-item d-flex align-items-center text-danger"
                onClick={signOut}
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

export default Topbar;
