import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSignInAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import BotaoVoltar from "../componentes/BotaoVoltar";
import "../styles/ponto.css";
import "../styles/global.css";
import { CalendarDays } from "lucide-react";

function Ponto() {
  const navigate = useNavigate();
  const [pontoSelecionado, setPontoSelecionado] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelecionar = async (tipo) => {
    if (pontoSelecionado || loading) return;
    
    setPontoSelecionado(tipo);
    setLoading(true);
    
    console.log("Ponto selecionado:", tipo);

    // Pequeno delay para feedback visual
    await new Promise(resolve => setTimeout(resolve, 300));
    
    navigate("/selfie", { state: { tipo } });
  };

  const tiposPonto = [
    {
      tipo: "entrada",
      numero: "Entrada",
      texto: "Início do expediente",
      icone: <FaSignInAlt />,
      cor: "#27ae60"
    },
    {
      tipo: "saida", 
      numero: "Saída",
      texto: "Fim do expediente",
      icone: <FaSignOutAlt />,
      cor: "#e74c3c"
    }
  ];

  return (
    <div className="page-container ponto-container">
      {/* Botão voltar */}
      <BotaoVoltar />

      <h2 className="ponto-title">Escolha o tipo de ponto</h2>

      <div className="ponto-grid">
        {tiposPonto.map((ponto) => (
          <div
            key={ponto.tipo}
            className={`card ${ponto.tipo} ${
              pontoSelecionado ? "desabilitado" : ""
            } ${loading && pontoSelecionado === ponto.tipo ? "loading" : ""}`}
            onClick={() => handleSelecionar(ponto.tipo)}
            style={{ '--card-color': ponto.cor }}
            aria-label={`Registrar ${ponto.texto}`}
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleSelecionar(ponto.tipo);
              }
            }}
          >
            <span className="numero">{ponto.numero}</span>
            <span className="texto">{ponto.texto}</span>
            <span className="icone">{ponto.icone}</span>
          </div>
        ))}
      </div>

      {/* Rodapé fixo igual à home */}
      <footer className="ponto-footer">
        <button 
          className="status btn-link" 
          onClick={() => navigate("/pontos")}
          aria-label="Ver pontos batidos"
        >
          <CalendarDays size={20} /> 
          <span>Pontos batidos</span>
        </button>
      </footer>
    </div>
  );
}

export default Ponto;