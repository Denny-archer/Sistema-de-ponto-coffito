import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Camera, RefreshCcw, Check, ArrowLeft, Video, VideoOff } from "lucide-react";
import "../styles/selfie.css";
import "../styles/global.css";

function Selfie() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [foto, setFoto] = useState(null);
  const [isCapturing, setIsCapturing] = useState(true);
  const [cameraError, setCameraError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { tipo } = location.state || {};

  // Ativar câmera
  useEffect(() => {
    let stream = null;

    const activateCamera = async () => {
      try {
        setIsLoading(true);
        setCameraError(false);
        
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Erro ao acessar a câmera:", err);
        setCameraError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (isCapturing && !foto) {
      activateCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
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
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Aplicar pequeno enhancement na imagem
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    context.putImageData(imageData, 0, 0);

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
    setIsLoading(true);
    // Pequeno delay para feedback visual
    await new Promise(resolve => setTimeout(resolve, 500));
    navigate("/confirmacao", { state: { selfie: foto, tipo } });
  };

  const tentarNovamenteCamera = () => {
    setCameraError(false);
    setIsCapturing(true);
  };

  return (
    <div className="page-container selfie-container">
      {/* Botão de voltar */}
      <button 
        className="btn-voltar" 
        onClick={() => navigate(-1)}
        aria-label="Voltar para seleção de ponto"
      >
        <ArrowLeft size={18} /> Voltar
      </button>

      <h2 className="titulo" data-tipo={tipo}>
        Sorria! Tire sua selfie
      </h2>

      {/* Mensagem de orientação */}
      <div className="orientacao">
        <p>📸 Posicione seu rosto no centro da imagem e certifique-se de que está bem iluminado</p>
      </div>

      {cameraError ? (
        <div className="camera-error">
          <VideoOff size={48} color="#95a5a6" />
          <h3>Câmera não disponível</h3>
          <p>Verifique as permissões da câmera e tente novamente</p>
          <button className="btn btn-refazer" onClick={tentarNovamenteCamera}>
            <RefreshCcw size={16} /> Tentar Novamente
          </button>
        </div>
      ) : !foto ? (
        <div className="camera-box">
          {/* Indicador de status da câmera */}
          {isCapturing && (
            <div className="camera-status">
              <Video size={12} /> Câmera ativa
            </div>
          )}
          
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`video ${isLoading ? 'disabled' : ''}`}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          
          <button 
            className="btn-captura"
            onClick={tirarFoto}
            disabled={isLoading || cameraError}
            aria-label="Tirar foto"
          >
            <Camera size={24} />
          </button>
        </div>
      ) : (
        <div className="preview-box">
          <img 
            src={foto} 
            alt="Selfie capturada" 
            className="foto-preview"
          />
          
          <div className="botoes">
            <button 
              className="btn btn-refazer"
              onClick={refazerFoto}
              aria-label="Tirar outra foto"
            >
              <RefreshCcw size={16} /> Refazer
            </button>
            
            <button 
              className={`btn btn-confirmar ${isLoading ? 'loading' : ''}`}
              onClick={confirmar}
              disabled={isLoading}
              aria-label="Confirmar selfie"
            >
              <Check size={16} /> 
              {isLoading ? 'Confirmando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Selfie;