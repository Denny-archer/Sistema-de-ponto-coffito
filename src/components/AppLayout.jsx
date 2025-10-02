import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

/**
 * Shell de layout: Sidebar fixa + Topbar + área de conteúdo.
 * Mantém seus componentes existentes e não interfere no visual.
 */
export default function AppLayout() {
  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar à esquerda */}
      <aside className="border-end" style={{ width: 260 }}>
        <Sidebar />
      </aside>

      {/* Conteúdo à direita */}
      <main className="flex-grow-1 d-flex flex-column">
        <Topbar />
        <div className="p-3">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
