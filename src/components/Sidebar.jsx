// 📂 src/components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom"; // ✅ Import do react-router-dom
import { Users, FileText, BarChart3 } from "lucide-react";

function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            <BarChart3 size={28} className="text-primary" />
            <span className="logo-text">PontoPro</span>
          </div>
        </div>

        <nav className="sidebar-nav">
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

          {/* ✅ Folha leva direto para /folha */}
          <NavLink
            to="/folha"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <FileText size={20} />
            <span>Folha</span>
          </NavLink>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;