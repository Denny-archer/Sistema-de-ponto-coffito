import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import BotaoVoltar from "../componentes/BotaoVoltar";
import { Download } from "lucide-react";
import "react-calendar/dist/Calendar.css";
import "../styles/pontoBatidos.css";
import "../styles/global.css";

function PontosBatidos() {
  const navigate = useNavigate();

  /** =====================
   * STATES
   ===================== */
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date()); // ✅ MOVIDO PARA O TOPO
  const [baixando, setBaixando] = useState(false);

  /** =====================
   * MOCK DATA (substituir por API futuramente)
   ===================== */
  const registros = [
    {
      data: "23/09/2025",
      batidas: ["08:00", "12:00", "13:02", "17:00"],
      horasTrabalhadas: "07:58",
      horasPrevistas: "08:00",
      bancoHoras: "-00:02",
    },
    {
      data: "24/09/2025",
      batidas: ["08:00", "12:00", null, null],
      horasTrabalhadas: "04:00",
      horasPrevistas: "08:00",
      bancoHoras: "-04:00",
    },
  ];

  const resumoMes = {
    horasTrabalhadas: "139:27",
    horasPrevistas: "176:00",
    bancoHoras: "-00:10",
    horasPositivas: "00:44",
    horasNegativas: "-00:54",
    bancoAcumuladoAnterior: "-00:05",
    bancoMes: "-00:10",
  };

  /** =====================
   * HELPERS
   ===================== */
  const formatDate = (date) => date.toLocaleDateString("pt-BR");

  const detalheDia = useMemo(() => {
    const dataStr = formatDate(selectedDate);
    return registros.find((r) => r.data === dataStr) || null;
  }, [selectedDate, registros]);

  /** =====================
   * HANDLERS
   ===================== */
  const handleDownload = async () => {
    setBaixando(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("✅ Comprovante baixado com sucesso!");
    } catch {
      alert("❌ Erro ao baixar comprovante");
    } finally {
      setBaixando(false);
    }
  };

  /** =====================
   * RENDER
   ===================== */
  return (
    <div className="pontos-container">
      {/* Header */}
      <div className="pontos-header">
        <BotaoVoltar />
        <h2>Pontos Batidos</h2>
      </div>

      {/* Calendário */}
      <div className="calendar-wrapper">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          locale="pt-BR"
          defaultView="month"
          showNavigation={true}
          activeStartDate={activeStartDate}
          onActiveStartDateChange={({ activeStartDate }) =>
            setActiveStartDate(activeStartDate)
          }
        />
      </div>

      {/* Detalhe do Dia */}
      <section className="detalhe-dia">
        <h3>{formatDate(selectedDate)}</h3>
        {detalheDia ? (
          <>
            <div className="batidas-dia">
              {detalheDia.batidas.map((hora, index) => (
                <button
                  key={index}
                  className={`batida-btn ${hora ? "preenchido" : "vazio"}`}
                >
                  {hora || "-"}
                </button>
              ))}
            </div>

            <div className="info-dia">
              <p>
                <strong>Horas Trabalhadas:</strong>{" "}
                {detalheDia.horasTrabalhadas}
              </p>
              <p>
                <strong>Horas Previstas:</strong> {detalheDia.horasPrevistas}
              </p>
              <p>
                <strong>Banco de Horas:</strong> {detalheDia.bancoHoras}
              </p>
            </div>

            <button className="btn-solicitacao">Incluir Solicitação</button>
          </>
        ) : (
          <p className="text-muted">Nenhum registro para este dia.</p>
        )}
      </section>

      {/* Resumo do Mês */}
      <section className="resumo-mes">
        <h3>Resumo do Mês</h3>
        <ul>
          <li>
            <strong>Horas Trabalhadas:</strong> {resumoMes.horasTrabalhadas}
          </li>
          <li>
            <strong>Horas Previstas:</strong> {resumoMes.horasPrevistas}
          </li>
          <li>
            <strong>Banco de Horas:</strong> {resumoMes.bancoHoras}
          </li>
          <li>
            <strong>Horas Mensais Positivas:</strong> {resumoMes.horasPositivas}
          </li>
          <li>
            <strong>Horas Mensais Negativas:</strong> {resumoMes.horasNegativas}
          </li>
          <li>
            <strong>Banco acumulado anterior:</strong>{" "}
            {resumoMes.bancoAcumuladoAnterior}
          </li>
          <li>
            <strong>Banco do mês:</strong> {resumoMes.bancoMes}
          </li>
        </ul>
      </section>

      {/* Rodapé */}
      <footer className="footer-fixo">
        <button
          className={`btn-download ${baixando ? "loading" : ""}`}
          onClick={handleDownload}
          disabled={baixando}
        >
          <Download size={18} />
          {baixando ? "Baixando..." : "Baixar Comprovante"}
        </button>
      </footer>
    </div>
  );
}

export default PontosBatidos;
