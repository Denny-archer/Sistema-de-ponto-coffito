import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function BotaoVoltar({ destinoPadrao = "/home", label = "Voltar" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleVoltar = () => {
    // Se o histórico não tiver página anterior, volta para destino padrão
    if (window.history.length > 2) navigate(-1);
    else navigate(destinoPadrao);
  };

  return (
    <button
      onClick={handleVoltar}
      className="btn fw-semibold d-inline-flex align-items-center gap-2 px-3 py-2 shadow-sm"
      style={{
        backgroundColor: "#e6f0ff",
        color: "#0056b3",
        border: "1.8px solid #0056b3",
        borderRadius: "8px",
        transition: "all 0.2s ease-in-out",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#0056b3";
        e.currentTarget.style.color = "white";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#e6f0ff";
        e.currentTarget.style.color = "#0056b3";
      }}
      aria-label={`Botão para ${label.toLowerCase()}`}
    >
      <ArrowLeft size={18} />
      {label}
    </button>
  );
}

export default BotaoVoltar;
