import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { http, getToken } from "../services/http";
import { Camera, RefreshCcw, Check, ArrowLeft, Video, VideoOff, Loader } from "lucide-react";
console.log("Token atual:", getToken());
function Selfie() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [foto, setFoto] = useState(null);
  const [isCapturing, setIsCapturing] = useState(true);
  const [cameraError, setCameraError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const { tipo } = location.state || {};

  // Ativar câmera
  useEffect(() => {
    let stream = null;

    const activateCamera = async () => {
      try {
        setCameraLoading(true);
        setCameraError(false);

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Aguardar o vídeo carregar completamente
          videoRef.current.onloadeddata = () => {
            setCameraLoading(false);
          };
        }
      } catch (err) {
        console.error("Erro ao acessar a câmera:", err);
        setCameraError(true);
        setCameraLoading(false);
      }
    };

    if (isCapturing && !foto) {
      activateCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCapturing, foto]);

  const tirarFoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!video || video.readyState !== 4) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    
    // Aplicar espelhamento para selfie
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setFoto(dataUrl);
    setIsCapturing(false);
  };

  const refazerFoto = () => {
    setFoto(null);
    setCameraError(false);
    setIsCapturing(true);
  };

  

const confirmar = async () => {
  if (!foto) return;

  setIsLoading(true);
  try {
    // Converter base64 para blob
    const res = await fetch(foto);
    const blob = await res.blob();

    const formData = new FormData();
    formData.append("imagem", blob, "selfie.jpg");

    // descricao precisa ir na query string
    const response = await http.post(`/batidas/?descricao=${tipo}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ Ponto registrado:", response.data);

    navigate("/confirmacao", {
      state: { selfie: foto, tipo, result: response.data },
    });
  } catch (error) {
    console.error("❌ Erro ao registrar ponto:", error);
    alert("Erro ao registrar ponto: " + (error.response?.data?.detail || error.message));
  } finally {
    setIsLoading(false);
  }
};



  const tentarNovamenteCamera = () => {
    setCameraError(false);
    setIsCapturing(true);
  };

  const voltar = () => {
    navigate("/ponto");
  };

  return (
    <div className="container-fluid d-flex flex-column min-vh-100 py-3 py-md-4 px-3 px-md-4">
      {/* Header fixo */}
      <div className="w-100 mb-3 mb-md-4">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={voltar}
          disabled={isLoading}
        >
          <ArrowLeft size={18} className="me-1" /> Voltar
        </button>
      </div>

      <div className="row justify-content-center align-items-center flex-grow-1">
        <div className="col-12 col-md-8 col-lg-6 col-xl-5">
          {/* Título */}
          <h2 className="fw-bold text-center mb-3 mb-md-4">Sorria! Tire sua selfie</h2>

          {/* Mensagem de orientação */}
          <div className="alert alert-info border-0 text-center mb-4 mb-md-5 shadow-sm">
            <div className="d-flex align-items-center justify-content-center">
              <span className="fs-5 me-2">📸</span>
              <span>
                <strong>Dica:</strong> Posicione seu rosto no centro e certifique-se da boa iluminação
              </span>
            </div>
          </div>

          {/* Área da câmera/foto */}
          <div className="text-center">
            {cameraError ? (
              <div className="p-4 p-md-5 border rounded bg-light text-center shadow-sm">
                <VideoOff size={64} className="text-muted mb-3" />
                <h5 className="mb-2">Câmera não disponível</h5>
                <p className="text-muted mb-4">
                  Verifique as permissões da câmera e tente novamente
                </p>
                <button
                  className="btn btn-primary"
                  onClick={tentarNovamenteCamera}
                  disabled={isLoading}
                >
                  <RefreshCcw size={16} className="me-2" /> 
                  Tentar Novamente
                </button>
              </div>
            ) : !foto ? (
              <div className="position-relative">
                {/* Indicador de câmera ativa */}
                {isCapturing && (
                  <div className="position-absolute top-0 start-0 end-0 d-flex justify-content-center">
                    <span className="badge bg-success bg-opacity-90 px-3 py-2 m-2 m-md-3">
                      <Video size={14} className="me-2" />
                      Câmera ativa
                    </span>
                  </div>
                )}

                {/* Loading da câmera */}
                {cameraLoading && (
                  <div className="position-absolute top-50 start-50 translate-middle">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Carregando câmera...</span>
                    </div>
                  </div>
                )}

                {/* Vídeo da câmera */}
                <div className={`camera-container ${cameraLoading ? 'opacity-0' : 'opacity-100'}`}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="rounded-3 shadow-lg w-100"
                    style={{ maxWidth: "400px", minHeight: "300px", objectFit: "cover" }}
                  />
                  
                  {/* Overlay de guia para selfie */}
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center pointer-events-none">
                    <div className="border border-2 border-white border-dashed rounded-3" 
                         style={{ width: "80%", height: "70%", opacity: 0.7 }}></div>
                  </div>
                </div>

                <canvas ref={canvasRef} style={{ display: "none" }} />

                {/* Botão de captura */}
                <div className="mt-4 mt-md-5">
                  <button
                    className="btn btn-danger btn-capture shadow-lg"
                    onClick={tirarFoto}
                    disabled={isLoading || cameraLoading || cameraError}
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      border: "4px solid white"
                    }}
                  >
                    <Camera size={32} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                {/* Preview da foto */}
                <div className="position-relative d-inline-block">
                  <img
                    src={foto}
                    alt="Selfie capturada"
                    className="img-fluid rounded-3 shadow-lg"
                    style={{ maxWidth: "400px", width: "100%" }}
                  />
                  
                  {/* Badge de preview */}
                  <span className="badge bg-info position-absolute top-0 end-0 m-2 m-md-3">
                    Preview
                  </span>
                </div>

                {/* Botões de ação */}
                <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 mt-4 mt-md-5">
                  <button
                    className="btn btn-outline-secondary btn-lg flex-fill"
                    onClick={refazerFoto}
                    disabled={isLoading}
                  >
                    <RefreshCcw size={18} className="me-2" /> 
                    Refazer Foto
                  </button>

                  <button
                    className="btn btn-success btn-lg flex-fill"
                    onClick={confirmar}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader size={18} className="me-2 spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Check size={18} className="me-2" />
                        Confirmar Selfie
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Informação adicional para mobile */}
          <div className="mt-4 mt-md-5 text-center">
            <small className="text-muted">
              💡 {foto ? "Confirme se a selfie está nítida" : "Toque no botão vermelho para capturar"}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Selfie;