import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CalendarDays } from "lucide-react";
import userPhoto from "../assets/user-photo.jpg.jpg";

function Home() {
  const navigate = useNavigate();
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [userData] = useState({
    nome: "ALLAN MERIGHI MOTTO",
    cargo: "Assistente Administrativo",
    ultimoRegistro: "08:00",
  });

  useEffect(() => {
    const t = setInterval(() => setHoraAtual(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formatarHora = useCallback(
    (d) => d.toLocaleTimeString("pt-BR", { hour12: false }),
    []
  );

  const horaFormatada = useMemo(
    () => formatarHora(horaAtual),
    [horaAtual, formatarHora]
  );

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* HEADER */}
      <header className="container py-3">
        <div className="card shadow-sm mx-auto" style={{ maxWidth: 460 }}>
          <div className="card-body d-flex align-items-center gap-3">
            <div className="flex-grow-1">
              <h6 className="fw-semibold mb-1 text-break">
                Conselho Federal de Fisioterapia e Terapia Ocupacional
              </h6>
              <p className="mb-0 fw-semibold">{userData.nome}</p>
              <p className="mb-0 text-muted">{userData.cargo}</p>
              <p className="mb-0">
                <strong>Último registro:</strong> {userData.ultimoRegistro}
              </p>
            </div>

            <img
              src={userPhoto}
              alt={`Foto de ${userData.nome}`}
              className="rounded-circle border shadow-sm flex-shrink-0"
              style={{ width: 64, height: 64, objectFit: "cover" }}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>
        </div>
      </header>

      {/* MAIN (CENTRALIZA O BOTÃO) */}
      <main className="container flex-grow-1 d-flex justify-content-center align-items-center py-4">
        <button
          type="button"
          onClick={() => navigate("/ponto")}
          className="btn p-0 rounded-circle text-white shadow"
          aria-label="Registrar ponto eletrônico"
          style={{
            width: 240,
            height: 240,
            backgroundColor: "#e74c3c",
            border: "none",
          }}
        >
          <div className="h-100 d-flex flex-column align-items-center justify-content-center">
            <Clock size={56} className="mb-2" />
            <div className="fw-bold">Registrar Ponto</div>
            <div className="fs-5">{horaFormatada}</div>
          </div>
        </button>
      </main>

      {/* FOOTER (FICA NO RODAPÉ) */}
      <footer className="container pb-4">
        <div className="text-center">
          <button
            type="button"
            className="btn btn-link fw-semibold text-decoration-none"
            onClick={() => navigate("/pontos")}
          >
            <CalendarDays size={18} className="me-2" />
            PONTOS BATIDOS
          </button>
        </div>
      </footer>
    </div>
  );
}

export default React.memo(Home);
