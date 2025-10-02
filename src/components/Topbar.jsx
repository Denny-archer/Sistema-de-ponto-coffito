// 📂 src/components/Topbar.jsx
import React from "react";
import { Search, Bell, User, ChevronDown, LogOut, Menu } from "lucide-react";
import useAuth from "../hooks/useAuth";

function Topbar({ setSidebarOpen }) {
  const { user, signOut } = useAuth();

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <button className="menu-btn" onClick={() => setSidebarOpen?.(true)}>
          <Menu size={20} />
        </button>
        <div className="breadcrumb">
          <span className="fw-bold">Dashboard</span>
          <span className="text-muted"> • Painel de controle</span>
        </div>
      </div>

      <div className="top-bar-right">
        {/* Search */}
        <div className="search-bar">
          <Search size={18} />
          <input type="text" placeholder="Pesquisar..." />
        </div>

        {/* Notificações */}
        <button className="icon-btn">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>

        {/* Usuário */}
        <div className="user-menu">
          <div className="user-avatar">
            <User size={20} />
          </div>
          <span className="user-name">{user?.name || "Usuário"}</span>
          <ChevronDown size={16} />
        </div>

        {/* Logout */}
        <button
          className="icon-btn logout-btn"
          onClick={signOut}
          title="Sair"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}

export default Topbar;
