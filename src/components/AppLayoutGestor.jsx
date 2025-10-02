import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayoutGestor() {
  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside className="border-end" style={{ width: 260 }}>
        <Sidebar />
      </aside>

      {/* Conteúdo */}
      <main className="flex-grow-1 d-flex flex-column">
        <Topbar />
        <div className="p-3">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
