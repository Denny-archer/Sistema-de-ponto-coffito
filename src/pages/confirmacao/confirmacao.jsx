import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import {
  CheckCircle,
  ArrowLeft,
  CalendarDays,
  Download,
  Home,
  Clock,
  UserCheck,
  Hash,
  Loader,
  User,
  Mail,
} from "lucide-react";
import Swal from "sweetalert2";
import useUser from "../../hooks/useUser";
import "../../styles/custom.css";

// --- Cabeçalho de sucesso ---
function SuccessHeader() {
  return (
    <div className="mb-4 text-center">
      <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3">
        <CheckCircle size={48} className="text-success" />
      </div>
      <h2 className="fw-bold text-success mb-2">Ponto Registrado!</h2>
      <p className="text-muted">Registro realizado com sucesso</p>
    </div>
  );
}

// --- Preview da selfie ---
function SelfiePreview({ selfie }) {
  if (!selfie) return null;
  return (
    <div className="mb-4 position-relative d-inline-block text-center">
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
  );
}

// --- Detalhes do ponto ---
function RegistroDetalhes({ result, tipoInfo, dataAtual, horaAtual, user }) {
  return (
    <div className="card border-0 bg-light mb-4 text-start shadow-sm">
      <div className="card-body p-3">
        <p>
          <User size={16} className="me-2 text-muted" />{" "}
          <strong>Usuário:</strong> {user?.nome || "-"}
        </p>
        <p>
          <Mail size={16} className="me-2 text-muted" />{" "}
          <strong>Email:</strong> {user?.email || "-"}
        </p>
        <p>
          <Clock size={16} className="me-2 text-muted" />{" "}
          <strong>Hora:</strong> {horaAtual}
        </p>
        <p>
          <CalendarDays size={16} className="me-2 text-muted" />{" "}
          <strong>Data:</strong> {dataAtual}
        </p>
        <p>
          <strong>Tipo:</strong> {tipoInfo.label}
        </p>
      </div>
    </div>
  );
}


export default function Confirmacao() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, fetchUser, loadingUser } = useUser();
  const [downloading, setDownloading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const { tipo, selfie, result } = location.state || {};

  // 🔹 Proteção de rota
  useEffect(() => {
    if (!user && !loadingUser) {
      fetchUser().catch(() => {
        Swal.fire({
          icon: "error",
          title: "Sessão expirada",
          text: "Faça login novamente para ver o comprovante.",
          confirmButtonColor: "#0d6efd",
        }).then(() => navigate("/login"));
      });
    }
  }, [user, loadingUser, fetchUser, navigate]);

  const dataBatida = result?.data_batida
    ? new Date(result.data_batida)
    : new Date();

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

  const tipoInfo =
    {
      entrada: {
        label: "Entrada",
        cor: "success",
        icone: "🟢",
        descricao: "Início do expediente",
      },
      saida: {
        label: "Saída",
        cor: "danger",
        icone: "🔴",
        descricao: "Fim do expediente",
      },
    }[tipo] || { label: tipo || "-", cor: "secondary", icone: "⚫", descricao: "" };

  const handleBaixarPDF = async () => {
    setDownloading(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      // Cabeçalho
      doc.setFillColor(25, 135, 84);
      doc.rect(0, 0, 210, 35, "F");
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text("COMPROVANTE DE PONTO", 105, 22, { align: "center" });

      // Corpo
      doc.setFontSize(12);
      doc.setTextColor(33, 37, 41);
      doc.text(`ID Registro: ${result?.id || "-"}`, 20, 50);
      doc.text(`Usuário: ${user?.nome || "-"}`, 20, 60);
      doc.text(`Email: ${user?.email || "-"}`, 20, 70);
      doc.text(`Tipo: ${tipoInfo.label}`, 20, 80);
      doc.text(`Data: ${dataAtual}`, 20, 90);
      doc.text(`Hora: ${horaAtual}`, 20, 100);
      doc.text(`Local do arquivo: ${result?.caminho_imagem || "-"}`, 20, 110);

      if (selfie) {
        try {
          doc.addImage(selfie, "JPEG", 20, 125, 60, 60);
        } catch (e) {
          console.warn("Erro ao adicionar imagem:", e);
        }
      }

      doc.save(`comprovante_${tipo}_${result?.id || Date.now()}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  const handleFinalizar = async () => {
    setFinalizing(true);
    await new Promise((r) => setTimeout(r, 800));
    navigate("/home");
  };

  if (loadingUser || !user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="container-fluid d-flex flex-column min-vh-100 py-3 px-3 bg-light">
      {/* Botão Voltar */}
      <div className="w-100 mb-3">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate("/ponto")}
          disabled={downloading || finalizing}
        >
          <ArrowLeft size={18} className="me-2" /> Voltar
        </button>
      </div>

      {/* Conteúdo principal */}
      <div className="row justify-content-center align-items-center flex-grow-1">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card border-0 shadow-lg rounded-3">
            <div className="card-body p-4 text-center">
              <SuccessHeader />
              <SelfiePreview selfie={selfie} />
              <RegistroDetalhes
                result={result}
                tipoInfo={tipoInfo}
                dataAtual={dataAtual}
                horaAtual={horaAtual}
                user={user}
              />

              {/* Botões de ação */}
              <div className="d-flex flex-column flex-sm-row gap-3">
                <button
                  className="btn btn-primary flex-fill"
                  onClick={handleBaixarPDF}
                  disabled={downloading}
                >
                  {downloading ? (
                    <>
                      <Loader size={18} className="me-2 spin" />
                      Gerando PDF...
                    </>
                  ) : (
                    <>
                      <Download size={20} className="me-2" /> Baixar Comprovante
                    </>
                  )}
                </button>

                <button
                  className="btn btn-success flex-fill"
                  onClick={handleFinalizar}
                  disabled={finalizing}
                >
                  {finalizing ? (
                    <>
                      <Loader size={18} className="me-2 spin" />
                      Redirecionando...
                    </>
                  ) : (
                    <>
                      <Home size={20} className="me-2" /> Voltar ao Início
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-3">
            <small className="text-muted">
              💡 O comprovante inclui seus dados oficiais de autenticação
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
