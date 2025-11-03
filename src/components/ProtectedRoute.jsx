import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { user, booting } = useAuth();

  // 🔹 Enquanto ainda está carregando o AuthProvider, exibe loading
  if (booting) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  // 🔹 Se terminou o boot e não há usuário, redireciona
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔹 Tudo ok, usuário autenticado
  return <Outlet />;
}
