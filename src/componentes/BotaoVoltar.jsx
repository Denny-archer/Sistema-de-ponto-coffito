import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa"; // ou outro ícone que preferir

function BotaoVoltar() {
  const navigate = useNavigate();

  return (
    <button className="btn-back" onClick={() => navigate(-1)}>
      <FaArrowLeft /> Voltar
    </button>
  );
}

export default BotaoVoltar;
