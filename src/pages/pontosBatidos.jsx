import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import BotaoVoltar from "../componentes/BotaoVoltar"; 
import { Download, FileText, Send, Paperclip, CalendarDays } from "lucide-react";
import "react-calendar/dist/Calendar.css";
import "../styles/pontoBatidos.css";
import "../styles/global.css";

function PontosBatidos() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [justificativa, setJustificativa] = useState("");
  const [anexo, setAnexo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [baixando, setBaixando] = useState(false);
  const navigate = useNavigate();

  // Dados mockados - em produção viria de uma API
  const registros = [
    { 
      id: 1, 
      data: new Date().toLocaleDateString("pt-BR"), 
      tipo: "Entrada", 
      hora: "08:00", 
      status: "OK",
      timestamp: new Date().setHours(8, 0, 0, 0)
    },
    { 
      id: 2, 
      data: new Date().toLocaleDateString("pt-BR"), 
      tipo: "Saída", 
      hora: "12:00", 
      status: "Atraso",
      timestamp: new Date().setHours(12, 15, 0, 0)
    },
    { 
      id: 3, 
      data: new Date().toLocaleDateString("pt-BR"), 
      tipo: "Saída", 
      hora: "--", 
      status: "Falta",
      timestamp: null
    },
  ];

  const formatDate = (date) => date.toLocaleDateString("pt-BR");
  const pontosFiltrados = registros.filter(
    (p) => p.data === formatDate(selectedDate)
  );

  const handleDownload = async () => {
    setBaixando(true);
    try {
      // Simular download
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("✅ Comprovante baixado com sucesso!");
    } catch (error) {
      alert("❌ Erro ao baixar comprovante. Tente novamente.");
    } finally {
      setBaixando(false);
    }
  };

  const handleJustificar = (ponto) => {
    setJustificativa(`Justificativa para ${ponto.tipo} do dia ${ponto.data}`);
  };

  const handleEnviarJustificativa = async () => {
    if (!justificativa.trim()) {
      alert("Por favor, descreva o motivo da justificativa.");
      return;
    }

    setEnviando(true);
    try {
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert("✅ Justificativa enviada com sucesso!");
      setJustificativa("");
      setAnexo(null);
    } catch (error) {
      alert("❌ Erro ao enviar justificativa. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  const handleAnexarArquivo = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setAnexo(file);
        alert(`📎 Anexo "${file.name}" selecionado`);
      }
    };
    input.click();
  };

  const getDiaTrabalhoStatus = (pontos) => {
    if (pontos.length === 0) return "sem-registros";
    const temFalta = pontos.some(p => p.status === "Falta");
    const temAtraso = pontos.some(p => p.status === "Atraso");
    
    if (temFalta) return "falta";
    if (temAtraso) return "atraso";
    return "completo";
  };

  const diaStatus = getDiaTrabalhoStatus(pontosFiltrados);

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
          tileClassName={({ date }) => {
            const dateStr = formatDate(date);
            const pontosDia = registros.filter(p => p.data === dateStr);
            const status = getDiaTrabalhoStatus(pontosDia);
            
            return `dia-${status}`;
          }}
        />
      </div>

      {/* Status do dia selecionado */}
      <div className={`dia-status ${diaStatus}`}>
        {diaStatus === "completo" && "✅ Dia completo"}
        {diaStatus === "atraso" && "⚠️ Dia com atrasos"}
        {diaStatus === "falta" && "❌ Dia com faltas"}
        {diaStatus === "sem-registros" && "📅 Nenhum registro"}
      </div>

      {/* Registros */}
      <div className="pontos-lista">
        {pontosFiltrados.length > 0 ? (
          pontosFiltrados.map((ponto) => (
            <div key={ponto.id} className="ponto-card">
              <span>
                <strong>{ponto.tipo}</strong> às {ponto.hora}
              </span>
              <span className={`status ${ponto.status.toLowerCase()}`}>
                {ponto.status}
              </span>
              {ponto.status !== "OK" && (
                <button
                  className="btn-justificar"
                  onClick={() => handleJustificar(ponto)}
                  aria-label={`Justificar ${ponto.tipo} do dia ${ponto.data}`}
                >
                  Justificar
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-muted">Nenhum registro para este dia.</p>
        )}
      </div>

      {/* Área de justificativa */}
      {(pontosFiltrados.some(p => p.status !== "OK")) && (
        <div className="justificativa-box">
          <h3>📝 Justificar Ausência/Atraso</h3>
          <textarea
            placeholder="Descreva detalhadamente o motivo do atraso ou falta..."
            rows="4"
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
          ></textarea>
          
          <div className="justificativa-actions">
            <button 
              className="btn-anexar" 
              onClick={handleAnexarArquivo}
              type="button"
            >
              <Paperclip size={16} />
              {anexo ? "Anexo Selecionado" : "Anexar Justificativa"}
            </button>
            
            <button 
              className={`btn-enviar ${enviando ? 'loading' : ''}`}
              onClick={handleEnviarJustificativa}
              disabled={enviando}
            >
              <Send size={16} />
              {enviando ? 'Enviando...' : 'Enviar Justificativa'}
            </button>
          </div>
        </div>
      )}

      {/* Rodapé Fixo */}
      <footer className="footer-fixo">
        <button 
          className={`btn-download ${baixando ? 'loading' : ''}`}
          onClick={handleDownload}
          disabled={baixando}
          aria-label="Baixar comprovante do mês"
        >
          <Download size={18} />
          {baixando ? 'Baixando...' : 'Baixar Comprovante'}
        </button>
      </footer>
    </div>
  );
}

export default PontosBatidos;