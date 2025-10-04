import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CalendarDays } from "lucide-react";
import userPhoto from "../../assets/user-photo.jpg";
import { http } from "../../services/http";
import { getToken } from "../../services/http"; // pega token do storage
import "../../styles/custom.css";

// Função para decodificar o JWT e pegar payload
function decodeJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Erro ao decodificar token:", e);
    return null;
  }
}

function Home() {
  const navigate = useNavigate();
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [userData, setUserData] = useState(null);

  // Atualiza relógio
  useEffect(() => {
    const t = setInterval(() => setHoraAtual(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Busca usuário logado
  useEffect(() => {
    async function fetchUser() {
      try {
        const token = getToken();
        if (!token) return;

        const payload = decodeJwt(token);
        const emailLogado = payload?.sub; // vem do JWT

        if (!emailLogado) return;

        const res = await http.get("/usuarios?skip=0&sort=false");
        const usuarios = res.data?.usuarios || [];

        // filtra pelo email do token
        const usuario = usuarios.find((u) => u.email === emailLogado);
        setUserData(usuario);
      } catch (err) {
        console.error("Erro ao buscar usuário logado:", err);
      }
    }
    fetchUser();
  }, []);

  const formatarHora = useCallback(
    (d) => d.toLocaleTimeString("pt-BR", { hour12: false }),
    []
  );
  const horaFormatada = useMemo(() => formatarHora(horaAtual), [horaAtual, formatarHora]);

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
              {userData ? (
                <>
                  <p className="mb-0 fw-semibold">{userData.nome}</p>
                  <p className="mb-0 text-muted">
                    {userData.cargo || userData.tipo_usuario}
                  </p>
                </>
              ) : (
                <p className="mb-0 text-muted">Carregando usuário...</p>
              )}
            </div>

            <img
              src={userPhoto}
              alt={`Foto de ${userData?.nome || "usuário"}`}
              className="rounded-circle border shadow-sm flex-shrink-0"
              style={{ width: 64, height: 64, objectFit: "cover" }}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>
        </div>
      </header>

      {/* MAIN */}
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

      {/* FOOTER */}
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
