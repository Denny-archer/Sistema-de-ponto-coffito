import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import BotaoVoltar from "../../componentes/BotaoVoltar";
import useUser from "../../hooks/useUser";

function Ponto() {
  const navigate = useNavigate();
  const { user, fetchUser, loadingUser } = useUser();
  const [pontoSelecionado, setPontoSelecionado] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Garante autenticação
  useEffect(() => {
    if (!user && !loadingUser) {
      fetchUser().catch(() => {
        Swal.fire({
          icon: "error",
          title: "Sessão expirada",
          text: "Faça login novamente para registrar seu ponto.",
          confirmButtonColor: "#0d6efd",
        }).then(() => navigate("/login"));
      });
    }
  }, [user, loadingUser, fetchUser, navigate]);

  // 🔹 Seleciona o tipo e vai para a tela da selfie
  const handleSelecionar = async (tipo) => {
    if (pontoSelecionado || loading) return;

    setPontoSelecionado(tipo);
    setLoading(true);

    try {
      // Delay para UX
      await new Promise((r) => setTimeout(r, 200));

      // Envia para a tela da selfie, passando o tipo e o usuário
      navigate("/selfie", { state: { tipo, user } });
    } catch (err) {
      console.error("Erro ao iniciar batida:", err);
      Swal.fire({
        icon: "error",
        title: "Erro ao iniciar registro",
        text: "Não foi possível continuar. Tente novamente.",
        confirmButtonColor: "#0d6efd",
      });
      setPontoSelecionado(null);
    } finally {
      setLoading(false);
    }
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

  if (loadingUser || !user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-3 px-md-4 min-vh-100 d-flex flex-column">
      <div className="mb-4 text-center">
        <BotaoVoltar />
        <h2 className="fw-bold mb-1 mt-2">{`Olá, ${user.nome.split(" ")[0]} 👋`}</h2>
        <p className="text-muted mb-0">Escolha o tipo de ponto para registrar</p>
      </div>

      <div className="row g-3 g-md-4 justify-content-center align-items-center flex-grow-1">
        {tiposPonto.map((ponto) => (
          <div key={ponto.tipo} className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4">
            <div
              className={`card shadow-lg p-4 p-md-5 text-center h-100 transition-all position-relative
                ${pontoSelecionado && pontoSelecionado !== ponto.tipo ? "opacity-25" : "hover-lift"}
                ${pontoSelecionado === ponto.tipo ? `border-3 ${ponto.corBorda}` : "border-2"}
                ${loading ? "pe-none" : "cursor-pointer"}`}
              onClick={() => handleSelecionar(ponto.tipo)}
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") handleSelecionar(ponto.tipo);
              }}
              tabIndex={0}
              role="button"
              aria-label={`Registrar ${ponto.titulo.toLowerCase()} - ${ponto.texto}`}
              aria-disabled={loading || pontoSelecionado}
            >
              <div className="card-body d-flex flex-column justify-content-between">
                <div>
                  <h4 className={`${ponto.cor} fw-bold mb-3`}>{ponto.titulo}</h4>
                  <p className="text-muted mb-4 fs-5">{ponto.texto}</p>
                </div>
                <div className={`${ponto.cor} fs-1 mb-2`}>{ponto.icone}</div>
              </div>

              {pontoSelecionado === ponto.tipo && loading && (
                <div className="position-absolute top-0 start-50 translate-middle mt-2">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-3 d-block d-sm-none">
        <small className="text-muted text-center d-block">
          Toque no card para selecionar
        </small>
      </div>
    </div>
  );
}

export default Ponto;
