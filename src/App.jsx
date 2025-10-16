import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./context/AuthProvider";
import UserProvider from "./context/UserProvider";
// import ProtectedRoute from "./components/ProtectedRoute";

// Layouts
import AppLayoutGestor from "./components/AppLayoutGestor";

// Páginas
import Login from "./pages/login/login";
import Home from "./pages/home/home";
import Ponto from "./pages/ponto/ponto";
import Selfie from "./pages/selfie/selfie";
import Confirmacao from "./pages/confirmacao/confirmacao";
import PontosBatidos from "./pages/pontosBatidos/pontosBatidos";
import DashboardGestor from "./pages/dashbordGestor/dashbordGestor";
import Colaboradores from "./pages/colaboradores/colaboradores";
import Folha from "./pages/folha/folha";
import GestorJustificativas from "./pages/justificativas/gestorJustificativas";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <UserProvider>
          <Routes>
            {/* públicas */}
            <Route path="/login" element={<Login />} />

            {/* privadas */}
            {/* <Route element={<ProtectedRoute />}> */}
              {/* fluxo colaborador */}
              <Route path="/home" element={<Home />} />
              <Route path="/ponto" element={<Ponto />} />
              <Route path="/selfie" element={<Selfie />} />
              <Route path="/confirmacao" element={<Confirmacao />} />
              <Route path="/pontos" element={<PontosBatidos />} />

              {/* fluxo gestor */}
              <Route element={<AppLayoutGestor />}>
                <Route path="/gestor" element={<DashboardGestor />} />
                <Route path="/gestor/justificativas" element={<GestorJustificativas />} />
                <Route path="/colaboradores" element={<Colaboradores />} />
                <Route path="/folha" element={<Folha />} />
              </Route>

              {/* atalho raiz */}
              {/* <Route path="/" element={<Navigate to="/home" replace />} />
            </Route> */}

            {/* fallback */}
            {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
          </Routes>
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}
