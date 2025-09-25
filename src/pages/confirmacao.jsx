import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { FileText, CheckCircle, ArrowLeft, CalendarDays, Download, Home, Clock, UserCheck } from "lucide-react";

function Confirmacao() {
  const location = useLocation();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const { tipo, selfie } = location.state || {};

  const dataAtual = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const horaAtual = new Date().toLocaleTimeString("pt-BR", {
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
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simular processamento
      
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Header com gradiente
      doc.setFillColor(25, 135, 84);
      doc.rect(0, 0, 210, 35, "F");

      // Logo/Ícone
      doc.setFontSize(28);
      doc.setTextColor(255, 255, 255);
      doc.text("✓", 20, 22);

      // Título
      doc.setFontSize(18);
      doc.text("COMPROVANTE DE PONTO", 105, 22, { align: "center" });

      // Corpo do documento
      doc.setFillColor(248, 249, 250);
      doc.rect(0, 35, 210, 235, "F");

      doc.setTextColor(33, 37, 41);
      doc.setFontSize(12);

      // Informações principais
      const infoYStart = 55;
      doc.setFont(undefined, 'bold');
      doc.text("INFORMAÇÕES DO REGISTRO", 20, infoYStart);
      
      doc.setFont(undefined, 'normal');
      doc.text(`Tipo de Ponto:`, 20, infoYStart + 15);
      doc.setTextColor(tipo === "entrada" ? [25, 135, 84] : [220, 53, 69]);
      doc.text(tipo === "entrada" ? "ENTRADA - Início do expediente" : "SAÍDA - Fim do expediente", 60, infoYStart + 15);
      
      doc.setTextColor(33, 37, 41);
      doc.text(`Data:`, 20, infoYStart + 30);
      doc.text(dataAtual, 60, infoYStart + 30);
      
      doc.text(`Hora:`, 20, infoYStart + 45);
      doc.text(horaAtual, 60, infoYStart + 45);

      // Selfie
      if (selfie) {
        doc.setTextColor(33, 37, 41);
        doc.setFont(undefined, 'bold');
        doc.text("SELFIE DO COLABORADOR", 20, infoYStart + 70);
        
        try {
          doc.addImage(selfie, "JPEG", 20, infoYStart + 75, 40, 40);
        } catch (error) {
          console.warn("Erro ao adicionar imagem ao PDF:", error);
        }
      }

      // Rodapé do documento
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 250, 190, 250);
      
      doc.setTextColor(108, 117, 125);
      doc.setFontSize(10);
      doc.text("Documento gerado automaticamente pelo sistema de ponto eletrônico", 105, 260, { align: "center" });
      doc.text(new Date().toLocaleString("pt-BR"), 105, 265, { align: "center" });

      // Assinatura
      doc.setTextColor(33, 37, 41);
      doc.setFontSize(10);
      doc.text("_________________________________________", 20, 240);
      doc.text("Assinatura do Colaborador", 20, 245);

      doc.save(`comprovante_${tipo}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setDownloading(false);
    }
  };

  const handleVerPontos = () => {
    navigate("/pontos");
  };

  const handleVoltar = () => {
    navigate("/ponto");
  };

  const getTipoInfo = () => {
    return {
      entrada: { label: "Entrada", cor: "success", icone: "🟢", descricao: "Início do expediente" },
      saida: { label: "Saída", cor: "danger", icone: "🔴", descricao: "Fim do expediente" }
    }[tipo] || { label: tipo, cor: "secondary", icone: "⚫", descricao: "" };
  };

  const tipoInfo = getTipoInfo();

  return (
    <div className="container-fluid d-flex flex-column min-vh-100 py-3 py-md-4 px-3 px-md-4 bg-light">
      {/* Header */}
      <div className="w-100 mb-3 mb-md-4">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={handleVoltar}
          disabled={downloading || finalizing}
        >
          <ArrowLeft size={18} className="me-2" /> 
          <span className="d-none d-sm-inline">Voltar</span>
        </button>
      </div>

      <div className="row justify-content-center align-items-center flex-grow-1">
        <div className="col-12 col-md-8 col-lg-6 col-xl-5 col-xxl-4">
          {/* Card principal */}
          <div className="card border-0 shadow-lg rounded-3">
            <div className="card-body p-4 p-md-5 text-center">
              
              {/* Ícone de sucesso */}
              <div className="mb-4">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3">
                  <CheckCircle size={48} className="text-success" />
                </div>
                <h2 className="fw-bold text-success mb-2">Ponto Registrado!</h2>
                <p className="text-muted">Seu ponto foi registrado com sucesso</p>
              </div>

              {/* Selfie preview */}
              {selfie && (
                <div className="mb-4">
                  <div className="position-relative d-inline-block">
                    <img
                      src={selfie}
                      alt="Selfie do colaborador"
                      className="img-fluid rounded-3 shadow-sm"
                      style={{ maxWidth: "280px", width: "100%" }}
                    />
                    <span className="badge bg-info position-absolute top-0 end-0 m-2">
                      <UserCheck size={12} className="me-1" />
                      Confirmado
                    </span>
                  </div>
                </div>
              )}

              {/* Detalhes do registro */}
              <div className="card border-0 bg-light mb-4">
                <div className="card-body p-3 p-md-4">
                  <div className="row g-3 text-start">
                    <div className="col-12">
                      <div className="d-flex align-items-center mb-2">
                        <span className="fs-5 me-2">{tipoInfo.icone}</span>
                        <strong className={`text-${tipoInfo.cor}`}>
                          {tipoInfo.label}
                        </strong>
                      </div>
                      <small className="text-muted">{tipoInfo.descricao}</small>
                    </div>
                    
                    <div className="col-12">
                      <hr className="my-2" />
                    </div>
                    
                    <div className="col-6">
                      <div className="d-flex align-items-center">
                        <CalendarDays size={16} className="text-muted me-2" />
                        <div>
                          <small className="text-muted d-block">Data</small>
                          <strong>{dataAtual}</strong>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-6">
                      <div className="d-flex align-items-center">
                        <Clock size={16} className="text-muted me-2" />
                        <div>
                          <small className="text-muted d-block">Hora</small>
                          <strong>{horaAtual}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações principais */}
              <div className="d-flex flex-column flex-sm-row gap-3 mb-4">
                <button
                  className="btn btn-primary btn-lg flex-fill d-flex align-items-center justify-content-center"
                  onClick={handleBaixarPDF}
                  disabled={downloading || finalizing}
                >
                  {downloading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Gerando...</span>
                      </div>
                      Gerando PDF...
                    </>
                  ) : (
                    <>
                      <Download size={20} className="me-2" />
                      Baixar Comprovante
                    </>
                  )}
                </button>

                <button
                  className="btn btn-success btn-lg flex-fill d-flex align-items-center justify-content-center"
                  onClick={handleFinalizar}
                  disabled={finalizing || downloading}
                >
                  {finalizing ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Finalizando...</span>
                      </div>
                      Finalizando...
                    </>
                  ) : (
                    <>
                      <Home size={20} className="me-2" />
                      Voltar ao Início
                    </>
                  )}
                </button>
              </div>

              {/* Ações secundárias */}
              <div className="border-top pt-3">
                <button
                  className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center"
                  onClick={handleVerPontos}
                >
                  <CalendarDays size={16} className="me-2" />
                  Ver Meus Pontos
                </button>
              </div>
            </div>
          </div>

          {/* Informação adicional */}
          <div className="text-center mt-3">
            <small className="text-muted">
              💡 O comprovante em PDF contém todos os detalhes do registro
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Confirmacao;