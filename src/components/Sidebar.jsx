import React from "react";
import { NavLink } from "react-router-dom";
import { Users, FileText, BarChart3, LogOut, User } from "lucide-react";
import useUser from "../hooks/useUser";
import { clearToken } from "../services/http";

function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { user, clearUser } = useUser();

  const handleLogout = () => {
    clearToken();
    clearUser();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Overlay para mobile */}
      <div
        className={`sidebar-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header d-flex align-items-center justify-content-between px-3 py-2">
          <div className="logo d-flex align-items-center gap-2">
            <BarChart3 size={24} className="text-primary" />
            <span className="logo-text fw-bold">PontoPro</span>
          </div>
        </div>

        {/* Usuário logado */}
        <div className="sidebar-user px-3 py-3 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <div
              className="user-avatar bg-light rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 32, height: 32 }}
            >
              <User size={18} />
            </div>
            <div>
              <div className="fw-semibold small">{user?.nome || "Usuário"}</div>
              <div className="text-muted small">
                {user?.cargo || user?.tipo_usuario || user?.email || ""}
              </div>
            </div>
          </div>
        </div>

        {/* Navegação */}
        <nav className="sidebar-nav mt-3">
          <NavLink
            to="/gestor"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <BarChart3 size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/colaboradores"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <Users size={20} />
            <span>Cadastros</span>
          </NavLink>
          {/* <NavLink
            to="/folha"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <FileText size={20} />
            <span>Folha</span>
          </NavLink> */}
        </nav>

        {/* Logout */}
        <div className="mt-auto px-3 py-3 border-top">
          <button
            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2 w-100"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
