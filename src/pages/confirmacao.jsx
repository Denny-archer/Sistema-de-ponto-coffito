import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { FileText, CheckCircle, ArrowLeft, CalendarDays } from "lucide-react";
import "../styles/confirmacao.css";
import "../styles/global.css";

function Confirmacao() {
  const location = useLocation();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const { tipo, selfie } = location.state || {};

  const dataAtual = new Date().toLocaleDateString("pt-BR", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const horaAtual = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  const handleFinalizar = async () => {
    setFinalizing(true);
    // Pequeno delay para feedback visual
    await new Promise(resolve => setTimeout(resolve, 500));
    navigate("/home");
  };

  const handleBaixarPDF = async () => {
    setDownloading(true);
    
    try {
      const doc = new jsPDF();
      
      // Header do PDF
      doc.setFillColor(39, 174, 96);
      doc.rect(0, 0, 210, 30, 'F');
      
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.text("✅ Comprovante de Ponto", 105, 18, { align: "center" });

      // Conteúdo
      doc.setFillColor(255, 255, 255);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      
      doc.text("Dados do Registro:", 20, 50);
      doc.setFontSize(12);
      doc.text(`Tipo de Ponto: ${tipo?.toUpperCase() || "Não informado"}`, 20, 65);
      doc.text(`Data: ${dataAtual}`, 20, 80);
      doc.text(`Hora: ${horaAtual}`, 20, 95);

      // Selfie
      if (selfie) {
        doc.text("Selfie do Colaborador:", 20, 115);
        doc.addImage(selfie, "JPEG", 20, 120, 60, 60);
      }

      // Assinatura
      doc.text("________________________", 20, 200);
      doc.text("Assinatura do Colaborador", 20, 208);

      doc.save(`comprovante_${tipo || "ponto"}_${Date.now()}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao baixar comprovante. Tente novamente.");
    } finally {
      setDownloading(false);
    }
  };

  const handleVerPontos = () => {
    navigate("/pontos");
  };

  return (
    <div className="page-container confirmacao-container">
      {/* Botão Voltar */}
      <button 
        className="btn-voltar" 
        onClick={() => navigate(-1)}
        aria-label="Voltar para tela anterior"
      >
        <ArrowLeft size={18} /> Voltar
      </button>

      <h2 className="titulo">Ponto Registrado com Sucesso!</h2>

      {/* Selfie */}
      {selfie && (
        <div className="foto-box">
          <img 
            src={selfie} 
            alt="Selfie do colaborador" 
            className="foto"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Detalhes */}
      <div className="detalhes-card">
        <p>
          <strong>Tipo:</strong> 
          <span style={{ 
            color: tipo === 'entrada' ? '#27ae60' : '#e74c3c',
            fontWeight: 'bold',
            textTransform: 'capitalize'
          }}>
            {tipo || "Não informado"}
          </span>
        </p>
        <p><strong>Data:</strong> {dataAtual}</p>
        <p><strong>Hora:</strong> {horaAtual}</p>
      </div>

      {/* Ações */}
      <div className="acoes">
        <button 
          className={`btn btn-primary ${downloading ? 'loading' : ''}`}
          onClick={handleBaixarPDF}
          disabled={downloading}
          aria-label="Baixar comprovante em PDF"
        >
          <FileText size={18} /> 
          {downloading ? 'Gerando...' : 'Baixar comprovante'}
        </button>
        
        <button 
          className={`btn btn-success ${finalizing ? 'loading' : ''}`}
          onClick={handleFinalizar}
          disabled={finalizing}
          aria-label="Finalizar e voltar para home"
        >
          <CheckCircle size={18} /> 
          {finalizing ? 'Finalizando...' : 'Finalizar'}
        </button>
      </div>

      {/* Rodapé Fixo */}
      <footer className="confirmacao-footer">
        <button 
          className="status btn-link" 
          onClick={handleVerPontos}
          aria-label="Ver pontos batidos"
        >
          <CalendarDays size={20} /> 
          <span>Pontos batidos</span>
        </button>
      </footer>
    </div>
  );
}

export default Confirmacao;