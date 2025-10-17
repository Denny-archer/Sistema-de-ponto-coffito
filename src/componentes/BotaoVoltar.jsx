import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/**
 * Fluxo esperado:
 * login → /home → (/ponto OU /pontosBatidos) → /selfie → /confirmacao
 * Em QUALQUER etapa, o botão volta uma etapa "segura" e, no fim, cai em /home.
 */
function BotaoVoltar({
  fallback = "/home",
  label = "Voltar",
  // opcional: se seu "ponto" for /pontosBatidos, troque aqui sem mexer no componente
  pontoRoute = "/ponto",
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const resolveBackTarget = () => {
    // normaliza para evitar trailing slashes
    const path = pathname.replace(/\/+$/, "");

    if (path.startsWith("/confirmacao"))  return "/selfie";
    if (path.startsWith("/selfie"))       return pontoRoute;
    if (path.startsWith("/pontosBatidos"))return "/home";
    if (path.startsWith("/ponto"))        return "/home";
    // qualquer outra rota cai no fallback seguro
    return fallback;
  };

  const handleVoltar = () => {
    const target = resolveBackTarget();
    // replace evita empilhar navegações e previne loops com -1
    navigate(target, { replace: true });
  };

  return (
    <button
      type="button"
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
