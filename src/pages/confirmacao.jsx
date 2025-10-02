import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { CheckCircle, ArrowLeft, CalendarDays, Download, Home, Clock, UserCheck, Hash } from "lucide-react";

function Confirmacao() {
  const location = useLocation();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  // Agora pega também o result
  const { tipo, selfie, result } = location.state || {};

  // Data/hora reais vindos do backend
  const dataBatida = result?.data_batida ? new Date(result.data_batida) : new Date();

  const dataAtual = dataBatida.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const horaAtual = dataBatida.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleFinalizar = async () => {
    setFinalizing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    navigate("/home");
  };

  const handleBaixarPDF = async () => {
    setDownloading(true);

    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      // Header
      doc.setFillColor(25, 135, 84);
      doc.rect(0, 0, 210, 35, "F");
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text("COMPROVANTE DE PONTO", 105, 22, { align: "center" });

      // Informações
      doc.setFontSize(12);
      doc.setTextColor(33, 37, 41);
      doc.text(`ID Registro: ${result?.id || "-"}`, 20, 50);
      doc.text(`Tipo: ${tipo}`, 20, 60);
      doc.text(`Data: ${dataAtual}`, 20, 70);
      doc.text(`Hora: ${horaAtual}`, 20, 80);
      doc.text(`Imagem salva em: ${result?.caminho_imagem || "-"}`, 20, 90);

      // Selfie
      if (selfie) {
        try {
          doc.addImage(selfie, "JPEG", 20, 100, 50, 50);
        } catch (e) {
          console.warn("Erro ao adicionar selfie no PDF:", e);
        }
      }

      doc.save(`comprovante_${tipo}_${result?.id || Date.now()}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  const tipoInfo = {
    entrada: { label: "Entrada", cor: "success", icone: "🟢", descricao: "Início do expediente" },
    saida: { label: "Saída", cor: "danger", icone: "🔴", descricao: "Fim do expediente" }
  }[tipo] || { label: tipo, cor: "secondary", icone: "⚫", descricao: "" };

  return (
    <div className="container-fluid d-flex flex-column min-vh-100 py-3 px-3 bg-light">
      {/* Header */}
      <div className="w-100 mb-3">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate("/ponto")}
          disabled={downloading || finalizing}
        >
          <ArrowLeft size={18} className="me-2" /> Voltar
        </button>
      </div>

      <div className="row justify-content-center align-items-center flex-grow-1">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card border-0 shadow-lg rounded-3">
            <div className="card-body p-4 text-center">
              <div className="mb-4">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3">
                  <CheckCircle size={48} className="text-success" />
                </div>
                <h2 className="fw-bold text-success mb-2">Ponto Registrado!</h2>
                <p className="text-muted">Registro realizado com sucesso</p>
              </div>

              {/* Selfie preview */}
              {selfie && (
                <div className="mb-4">
                  <img
                    src={selfie}
                    alt="Selfie"
                    className="img-fluid rounded-3 shadow-sm"
                    style={{ maxWidth: "280px" }}
                  />
                  <span className="badge bg-info position-absolute top-0 end-0 m-2">
                    <UserCheck size={12} className="me-1" /> Confirmado
                  </span>
                </div>
              )}

              {/* Detalhes reais */}
              <div className="card border-0 bg-light mb-4 text-start">
                <div className="card-body p-3">
                  <p><Hash size={16} className="me-2 text-muted" /> <strong>ID:</strong> {result?.id}</p>
                  <p><strong>Tipo:</strong> {tipoInfo.label}</p>
                  <p><CalendarDays size={16} className="me-2 text-muted" /> <strong>Data:</strong> {dataAtual}</p>
                  <p><Clock size={16} className="me-2 text-muted" /> <strong>Hora:</strong> {horaAtual}</p>
                  <p><strong>Imagem salva em:</strong> {result?.caminho_imagem}</p>
                </div>
              </div>

              <div className="d-flex flex-column flex-sm-row gap-3">
                <button className="btn btn-primary flex-fill" onClick={handleBaixarPDF} disabled={downloading}>
                  <Download size={20} className="me-2" /> Baixar Comprovante
                </button>
                <button className="btn btn-success flex-fill" onClick={handleFinalizar} disabled={finalizing}>
                  <Home size={20} className="me-2" /> Voltar ao Início
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-3">
            <small className="text-muted">💡 Agora os dados exibidos vêm direto do backend</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Confirmacao;
