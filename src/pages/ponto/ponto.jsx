import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import BotaoVoltar from "../../componentes/BotaoVoltar";

function Ponto() {
  const navigate = useNavigate();
  const [pontoSelecionado, setPontoSelecionado] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelecionar = async (tipo) => {
    if (pontoSelecionado || loading) return;

    setPontoSelecionado(tipo);
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 300));
    navigate("/selfie", { state: { tipo } });
  };

  const tiposPonto = [
    {
      tipo: "entrada",
      titulo: "Entrada",
      texto: "Início do expediente",
      icone: <FaSignInAlt size={32} />,
      cor: "text-success",
      corBorda: "border-success",
    },
    {
      tipo: "saida",
      titulo: "Saída",
      texto: "Fim do expediente",
      icone: <FaSignOutAlt size={32} />,
      cor: "text-danger",
      corBorda: "border-danger",
    },
  ];

  return (
    <div className="container-fluid py-4 px-3 px-md-4 min-vh-100 d-flex flex-column">
      {/* Header fixo */}
      <div className="mb-4">
        <BotaoVoltar />
        <h2 className="fw-bold text-center mb-0 mt-2">Escolha o tipo de ponto</h2>
      </div>

      {/* Cards responsivos - ocupa altura restante */}
      <div className="row g-3 g-md-4 justify-content-center align-items-center flex-grow-1">
        {tiposPonto.map((ponto) => (
          <div key={ponto.tipo} className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4">
            <div
              className={`card shadow-lg p-4 p-md-5 text-center h-100 transition-all ${
                pontoSelecionado && pontoSelecionado !== ponto.tipo
                  ? "opacity-25"
                  : "hover-lift"
              } ${pontoSelecionado === ponto.tipo ? `border-3 ${ponto.corBorda}` : "border-2"} ${
                loading ? "pe-none" : "cursor-pointer"
              }`}
              role="button"
              tabIndex={0}
              onClick={() => handleSelecionar(ponto.tipo)}
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") handleSelecionar(ponto.tipo);
              }}
              aria-label={`Registrar ${ponto.titulo.toLowerCase()} - ${ponto.texto}`}
              aria-disabled={loading || pontoSelecionado}
            >
              <div className="card-body d-flex flex-column justify-content-between">
                <div>
                  <h4 className={`${ponto.cor} fw-bold mb-3`}>{ponto.titulo}</h4>
                  <p className="text-muted mb-4 fs-5">{ponto.texto}</p>
                </div>
                <div className={`${ponto.cor} fs-1 mb-2`}>
                  {ponto.icone}
                </div>
              </div>
              
              {/* Loading indicator */}
              {pontoSelecionado === ponto.tipo && loading && (
                <div className="position-absolute top-0 start-50 translate-middle mt-2">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer para dispositivos muito pequenos */}
      <div className="mt-auto pt-3 d-block d-sm-none">
        <small className="text-muted text-center d-block">
          Toque no card para selecionar
        </small>
      </div>
    </div>
  );
}

export default Ponto;