// import React from "react";
// import { Navigate, Outlet } from "react-router-dom";
// import { getToken } from "../services/http";
// import useUser from "../hooks/useUser";

// export default function ProtectedRoute() {
//   const token = getToken();
//   const { user, loadingUser } = useUser();

//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

  // Exibe loading até confirmar o usuário autenticado
  // if (loadingUser) {
  //   return (
  //     <div className="d-flex justify-content-center align-items-center vh-100">
  //       <div className="spinner-border text-primary" role="status">
  //         <span className="visually-hidden">Carregando...</span>
  //       </div>
  //     </div>
  //   );
  // }

  // Se o usuário não foi encontrado (token inválido)
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   return <Outlet />;
// }
