import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CalendarDays } from "lucide-react";
import "../styles/home.css";
import "../styles/global.css";

// 👉 Imagem com nome mais genérico
import userPhoto from "../assets/user-photo.jpg.jpg";

function Home() {
  const navigate = useNavigate();
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [userData] = useState({
    nome: "ALLAN MERIGHI MOTTO",
    cargo: "Assistente Administrativo",
    ultimoRegistro: "08:00"
  });

  useEffect(() => {
    const timer = setInterval(() => setHoraAtual(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatarHora = useCallback((data) => 
    data.toLocaleTimeString("pt-BR", { hour12: false }), []
  );

  const horaFormatada = useMemo(() => 
    formatarHora(horaAtual), [horaAtual, formatarHora]
  );

  const handleRegistrarPonto = useCallback(() => 
    navigate("/ponto"), [navigate]
  );

  const handleVerPontos = useCallback(() => 
    navigate("/pontos"), [navigate]
  );

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-info">
          <h1>Conselho Federal de Fisioterapia e Terapia Ocupacional</h1>
          <p>{userData.nome}</p>
          <p>{userData.cargo}</p>
          <p>
            <strong>Último registro:</strong> {userData.ultimoRegistro}
          </p>
        </div>
        
        <div className="header-avatar">
          <img 
            src={userPhoto} 
            alt={`Foto de ${userData.nome}`} 
            className="avatar-img"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      </header>

      <button 
        className="card-bater-ponto"
        onClick={handleRegistrarPonto}
        aria-label="Registrar ponto eletrônico"
      >
        <Clock size={48} strokeWidth={2} className="clock-icon" />
        <h2>Registrar Ponto</h2>
        <p>{horaFormatada}</p>
      </button>

      <footer className="home-footer">
        <button 
          className="status btn-link"
          onClick={handleVerPontos}
          aria-label="Ver pontos batidos"
        >
          <CalendarDays size={20} strokeWidth={2} /> 
          <span>PONTOS BATIDOS</span>
        </button>
      </footer>
    </div>
  );
}

export default React.memo(Home);