import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { http } from "../../services/http";
import useUser from "../../hooks/useUser";
import Swal from "sweetalert2";
import {
  Camera,
  RefreshCcw,
  Check,
  ArrowLeft,
  VideoOff,
  Loader,
} from "lucide-react";
import "./selfie.css";

function CameraView({ videoRef, canvasRef, cameraLoading, tirarFoto, cameraError, isLoading }) {
  return (
    <div className="position-relative text-center">
      {cameraLoading && (
        <div className="position-absolute top-50 start-50 translate-middle">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando câmera...</span>
          </div>
        </div>
      )}

      <div className={`camera-container ${cameraLoading ? "opacity-0" : "opacity-100"}`}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="rounded-3 shadow-lg w-100"
          style={{ maxWidth: "400px", minHeight: "300px", objectFit: "cover" }}
        />
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center pointer-events-none">
          <div
            className="border border-2 border-white border-dashed rounded-3"
            style={{ width: "80%", height: "70%", opacity: 0.7 }}
          ></div>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div className="mt-4">
        <button
          className="btn btn-danger btn-capture shadow-lg"
          onClick={tirarFoto}
          disabled={isLoading || cameraLoading || cameraError}
          style={{ width: "80px", height: "80px", borderRadius: "50%", border: "4px solid white" }}
        >
          <Camera size={32} />
        </button>
      </div>
    </div>
  );
}

function SelfiePreview({ foto, refazerFoto, confirmar, isLoading }) {
  return (
    <div className="text-center">
      <img
        src={foto}
        alt="Selfie capturada"
        className="img-fluid rounded-3 shadow-lg"
        style={{ maxWidth: "400px", width: "100%" }}
      />
      <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 mt-4">
        <button className="btn btn-outline-secondary btn-lg flex-fill" onClick={refazerFoto} disabled={isLoading}>
          <RefreshCcw size={18} className="me-2" />
          Refazer
        </button>
        <button className="btn btn-success btn-lg flex-fill" onClick={confirmar} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader size={18} className="me-2 spin" /> Processando...
            </>
          ) : (
            <>
              <Check size={18} className="me-2" /> Confirmar Selfie
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function Selfie() {
  const { user, fetchUser, loadingUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { tipo } = location.state || {}; // entrada / saída

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [foto, setFoto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState(false);

  // 🔹 Garante autenticação
  useEffect(() => {
    if (!user && !loadingUser) {
      fetchUser().catch(() => {
        Swal.fire({
          icon: "error",
          title: "Sessão expirada",
          text: "Faça login novamente para registrar seu ponto.",
        }).then(() => navigate("/login"));
      });
    }
  }, [user, loadingUser, fetchUser, navigate]);

  // 🔹 Ativa a câmera
  useEffect(() => {
    let stream;
    async function iniciarCamera() {
      try {
        setCameraError(false);
        setCameraLoading(true);
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => setCameraLoading(false);
        }
      } catch (err) {
        console.error("Erro ao acessar a câmera:", err);
        setCameraError(true);
        setCameraLoading(false);
      }
    }

    iniciarCamera();
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // 🔹 Captura a foto
  const tirarFoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || video.readyState !== 4) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    // Espelha imagem
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setFoto(dataUrl);
  };

  const refazerFoto = () => {
    setFoto(null);
    setCameraError(false);
  };

  // 🔹 Envia selfie + tipo de ponto
  const confirmar = async () => {
    if (!foto || !tipo) {
      Swal.fire({
        icon: "warning",
        title: "Ação inválida",
        text: "Não foi possível identificar o tipo de ponto.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(foto);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append("imagem", blob, "selfie.jpg");

      // ✅ Envia id_usuario e descricao na query string, conforme backend exige
      const url = `/batidas/?id_usuario=${user.id}&descricao=${tipo}`;

      const response = await http.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Ponto registrado com sucesso!",
        confirmButtonColor: "#00c9a7",
      });

      navigate("/confirmacao", { state: { selfie: foto, tipo, result: response.data } });
    } catch (error) {
      console.error("Erro ao registrar ponto:", error);
      Swal.fire({
        icon: "error",
        title: "Erro ao registrar ponto",
        text: error.response?.data?.detail || "Falha na comunicação com o servidor.",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const voltar = () => navigate("/ponto");

  if (loadingUser || !user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid d-flex flex-column min-vh-100 py-3 px-3">
      {/* Header */}
      <div className="mb-3">
        <button className="btn btn-outline-secondary btn-sm" onClick={voltar} disabled={isLoading}>
          <ArrowLeft size={18} className="me-1" /> Voltar
        </button>
      </div>

      {/* Conteúdo */}
      <div className="row justify-content-center align-items-center flex-grow-1">
        <div className="col-12 col-md-8 col-lg-6 col-xl-5 text-center">
          <h2 className="fw-bold mb-3">Sorria! Tire sua selfie</h2>

          <div className="alert alert-info border-0 text-center mb-4 shadow-sm">
            <span className="fs-5 me-2">📸</span>
            Posicione seu rosto no centro e garanta boa iluminação
          </div>

          {cameraError ? (
            <div className="p-4 border rounded bg-light shadow-sm">
              <VideoOff size={64} className="text-muted mb-3" />
              <h5 className="mb-2">Câmera não disponível</h5>
              <p className="text-muted mb-4">Verifique as permissões e tente novamente.</p>
              <button className="btn btn-primary" onClick={() => window.location.reload()} disabled={isLoading}>
                <RefreshCcw size={16} className="me-2" /> Tentar novamente
              </button>
            </div>
          ) : !foto ? (
            <CameraView
              videoRef={videoRef}
              canvasRef={canvasRef}
              cameraLoading={cameraLoading}
              tirarFoto={tirarFoto}
              isLoading={isLoading}
              cameraError={cameraError}
            />
          ) : (
            <SelfiePreview foto={foto} refazerFoto={refazerFoto} confirmar={confirmar} isLoading={isLoading} />
          )}
        </div>
      </div>

      <div className="mt-4 text-center">
        <small className="text-muted">
          💡 {foto ? "Confirme se a selfie está nítida" : "Toque no botão vermelho para capturar"}
        </small>
      </div>
    </div>
  );
}