// 📂 src/components/AppLayoutGestor.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { BankHealthProvider } from "../context/BankHealthContext"; // ✅ importe o contexto

export default function AppLayoutGestor() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BankHealthProvider> {/* ✅ envolve todo o layout */}
      <div className={`app-shell ${sidebarOpen ? "sidebar-open" : ""}`}>
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Conteúdo */}
        <div className="content-area">
          <Topbar setSidebarOpen={setSidebarOpen} />
          <main className="main-content">
            <Outlet />
          </main>
        </div>
      </div>
    </BankHealthProvider>
  );
}
