// 📂 src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/home";
import Ponto from "./pages/ponto";
import Selfie from "./pages/selfie";
import Confirmacao from "./pages/confirmacao";
import PontosBatidos from "./pages/pontosBatidos";
import DashboardGestor from "./pages/dashbordGestor";
import Colaboradores from "./pages/colaboradores";
import Folha from "./pages/folha"; // ✅ import da nova tela

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/ponto" element={<Ponto />} />
        <Route path="/selfie" element={<Selfie />} />
        <Route path="/confirmacao" element={<Confirmacao />} />
        <Route path="/pontos" element={<PontosBatidos />} />
        <Route path="/gestor" element={<DashboardGestor />} />
        <Route path="/colaboradores" element={<Colaboradores />} />
        <Route path="/folha" element={<Folha />} /> {/* ✅ nova rota adicionada */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
