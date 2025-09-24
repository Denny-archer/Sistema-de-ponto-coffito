import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/home";
import Ponto from "./pages/ponto";
import Selfie from "./pages/selfie";
import Confirmacao from "./pages/confirmacao";
import PontosBatidos from "./pages/pontosBatidos";
import DashboardGestor from "./pages/dashbordGestor";

function App() {
  return (
    <Router>
      <Routes>
        {/* Tela de Login */}
        <Route path="/login" element={<Login />} />

        {/* Tela inicial depois do login */}
        <Route path="/home" element={<Home />} />

        {/* Tela de seleção do tipo de ponto */}
        <Route path="/ponto" element={<Ponto />} />

        {/* Captura de selfie */}
        <Route path="/selfie" element={<Selfie />} />

        {/* Tela de confirmação */}
        <Route path="/confirmacao" element={<Confirmacao />} />

        {/* Tela de pontos batidos */}
        <Route path="/pontos" element={<PontosBatidos />} />

        {/* Tela do Dashboard do Gestor */}
        <Route path="/gestor" element={<DashboardGestor />} />

        {/* Redireciona para login por padrão */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
