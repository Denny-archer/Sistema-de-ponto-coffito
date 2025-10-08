import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import {
  Download,
  ArrowLeft,
  Clock,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Modal, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "react-calendar/dist/Calendar.css";
import "../../styles/custom.css";

import { http } from "../../services/http";
import useUser from "../../hooks/useUser";

function PontosBatidos() {
  const navigate = useNavigate();
  const { user, fetchUser, loadingUser, clearUser } = useUser();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [baixando, setBaixando] = useState(false);
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

  // Justificativa modal
  const [showJustModal, setShowJustModal] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [tipo, setTipo] = useState("esquecimento");
  const [anexo, setAnexo] = useState(null);

  // 🧠 Garantir sessão válida
  useEffect(() => {
    const validarUsuario = async () => {
      if (!user && !loadingUser) {
        try {
          await fetchUser();
        } catch (error) {
          console.error("Sessão expirada:", error);
          clearUser();
          Swal.fire({
            icon: "error",
            title: "Sessão expirada",
            text: "Faça login novamente.",
            confirmButtonColor: "#0d6efd",
          }).then(() => navigate("/login"));
        }
      }
    };
    validarUsuario();
  }, [user, loadingUser, fetchUser, clearUser, navigate]);

  // 🔹 Carregar batidas do usuário autenticado
 // 🔹 Carregar batidas do usuário autenticado
const carregarBatidas = useCallback(async () => {
  if (!user?.id) return;
  setLoading(true);
  try {
    // ✅ Busca todas as batidas existentes
    const { data } = await http.get("/batidas/", { params: { skip: 0 } });

    // ✅ Filtra apenas as batidas do usuário logado
    const minhasBatidas = (data.batidas || []).filter(
      (b) => b.id_usuario === user.id
    );

    // ✅ Agrupa para exibição no calendário
    const agrupadas = agruparPorDia(minhasBatidas);
    setRegistros(agrupadas);
  } catch (error) {
    console.error("Erro ao carregar batidas:", error);
    Swal.fire({
      icon: "error",
      title: "Erro ao buscar registros",
      text: "Não foi possível carregar suas batidas.",
    });
  } finally {
    setLoading(false);
  }
}, [user]);


  useEffect(() => {
    carregarBatidas();
  }, [carregarBatidas]);

  // 🔧 Funções auxiliares de processamento
  const agruparPorDia = (batidas) => {
    const map = {};
    batidas.forEach((b) => {
      const data = new Date(b.data_batida);
      const dataStr = data.toLocaleDateString("pt-BR");

      if (!map[dataStr]) {
        map[dataStr] = {
          data: dataStr,
          batidas: [],
          horasTrabalhadas: "00:00",
          horasPrevistas: "08:00",
          bancoHoras: "00:00",
          status: "incompleto",
        };
      }
      map[dataStr].batidas.push(
        data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      );
    });

    Object.values(map).forEach((r) => {
      r.batidas.sort();
      const total = calcularHoras(r.batidas);
      r.horasTrabalhadas = total;
      r.bancoHoras = calcularBanco(total, r.horasPrevistas);
      r.status = definirStatus(r);
    });

    return Object.values(map);
  };

  const parseHora = (str) => {
    const [h, m] = str.split(":").map(Number);
    return h * 60 + m;
  };
  const toMin = (str) => parseHora(str);
  const formatarMinutos = (min) => {
    const h = Math.floor(Math.abs(min) / 60);
    const m = Math.abs(min) % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };
  const calcularHoras = (batidas) => {
    if (batidas.length < 2) return "00:00";
    let totalMin = 0;
    for (let i = 0; i < batidas.length; i += 2) {
      if (batidas[i + 1]) {
        totalMin += parseHora(batidas[i + 1]) - parseHora(batidas[i]);
      }
    }
    return formatarMinutos(totalMin);
  };
  const calcularBanco = (trabalhadas, previstas) => {
    const saldo = toMin(trabalhadas) - toMin(previstas);
    return (saldo >= 0 ? "+" : "") + formatarMinutos(saldo);
  };
  const definirStatus = (r) => {
    if (r.batidas.length === 0) return "sem-registro";
    if (r.batidas.length < 4) return "incompleto";
    if (r.bancoHoras.startsWith("+")) return "positivo";
    if (r.bancoHoras.startsWith("-")) return "negativo";
    return "completo";
  };

  const formatDate = (date) => date.toLocaleDateString("pt-BR");

  const detalheDia = useMemo(() => {
    const dataStr = formatDate(selectedDate);
    return registros.find((r) => r.data === dataStr) || null;
  }, [selectedDate, registros]);

  const getDayStatus = (date) => {
    const r = registros.find((r) => r.data === formatDate(date));
    return r ? r.status : "sem-registro";
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const status = getDayStatus(date);
    const isToday = formatDate(date) === formatDate(new Date());
    return (
      <div className="d-flex justify-content-center mt-1">
        {isToday && (
          <div
            className="bg-primary rounded-circle"
            style={{ width: 4, height: 4 }}
          ></div>
        )}
        {status !== "sem-registro" && (
          <div
            className={`rounded-circle ${
              status === "completo"
                ? "bg-success"
                : status === "positivo"
                ? "bg-info"
                : status === "negativo"
                ? "bg-warning"
                : "bg-danger"
            }`}
            style={{ width: 6, height: 6, marginLeft: 2 }}
          ></div>
        )}
      </div>
    );
  };

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return "";
    const status = getDayStatus(date);
    const isToday = formatDate(date) === formatDate(new Date());
    return [
      isToday ? "border border-primary border-2" : "",
      status !== "sem-registro" ? "has-registry" : "",
    ].join(" ");
  };

  // 🔽 Justificativa
const enviarJustificativa = async () => {
  try {
    const dataFormatada = detalheDia
      ? detalheDia.data.split("/").reverse().join("-") + " 13:00"
      : formatDate(selectedDate).split("/").reverse().join("-") + " 13:00";

    // Monta os parâmetros conforme o backend espera
    const params = new URLSearchParams({
      data_requerida: dataFormatada,
      texto: motivo || "Sem descrição",
    });

    const formData = new FormData();
    if (anexo) formData.append("file", anexo);

    await http.post(`/justificativas/?${params.toString()}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    Swal.fire({
      icon: "success",
      title: "Justificativa enviada!",
      text: "Sua justificativa foi registrada e aguarda aprovação do gestor.",
      confirmButtonColor: "#00c9a7",
    });

    setShowJustModal(false);
    setMotivo("");
    setAnexo(null);
  } catch (error) {
    console.error("Erro ao enviar justificativa:", error.response?.data || error);
    Swal.fire({
      icon: "error",
      title: "Erro ao enviar justificativa",
      text: error.response?.data?.detail || "Falha ao enviar justificativa.",
      confirmButtonColor: "#f44336",
    });
  }
};

  const handleDownload = async () => {
    setBaixando(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      Swal.fire({
        icon: "success",
        title: "Relatório baixado com sucesso!",
        confirmButtonColor: "#00c9a7",
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Erro ao baixar relatório!",
      });
    } finally {
      setBaixando(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completo":
        return <CheckCircle2 size={16} className="text-success" />;
      case "incompleto":
        return <XCircle size={16} className="text-danger" />;
      case "positivo":
        return <AlertCircle size={16} className="text-info" />;
      case "negativo":
        return <AlertCircle size={16} className="text-warning" />;
      default:
        return <Clock size={16} className="text-muted" />;
    }
  };

  // 🔄 Loading de usuário
  if (loadingUser || !user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p className="text-muted">Carregando informações do usuário...</p>
        </div>
      </div>
    );
  }

  // --- JSX ---
  return (
    <div className="container-fluid d-flex flex-column min-vh-100 py-3 px-3 bg-light">
      {/* Header */}
      <div className="w-100 mb-3 d-flex align-items-center">
        <button className="btn btn-outline-secondary btn-sm me-3" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} className="me-2" />
          <span className="d-none d-sm-inline">Voltar</span>
        </button>
        <div>
          <h2 className="fw-bold mb-0 d-flex align-items-center">
            <CalendarDays size={24} className="text-primary me-2" /> Pontos Batidos
          </h2>
          <small className="text-muted">Controle e acompanhamento de registros</small>
        </div>
      </div>

      <div className="row justify-content-center flex-grow-1">
        <div className="col-12 col-xl-10">
          <div className="row g-3 g-md-4">
            {/* Calendário */}
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status"></div>
                      <p className="mt-2 text-muted">Carregando registros...</p>
                    </div>
                  ) : (
                    <Calendar
                      onChange={setSelectedDate}
                      value={selectedDate}
                      locale="pt-BR"
                      defaultView="month"
                      showNavigation
                      activeStartDate={activeStartDate}
                      onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
                      tileContent={tileContent}
                      tileClassName={tileClassName}
                      className="w-100 border-0"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Detalhes */}
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  {detalheDia ? (
                    <>
                      <div className="d-flex align-items-center mb-3 p-3 rounded bg-light">
                        {getStatusIcon(detalheDia.status)}
                        <span className="ms-2 fw-medium text-capitalize">
                          {detalheDia.status.replace("-", " ")}
                        </span>
                      </div>

                      <h6 className="fw-bold mb-3">Batidas de Ponto</h6>
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        {detalheDia.batidas.map((hora, i) => (
                          <span key={i} className="badge bg-primary p-2">{hora}</span>
                        ))}
                      </div>

                      <div className="row g-3 mb-3 text-center">
                        <div className="col-6">
                          <div className="p-2 bg-light rounded">
                            <small className="text-muted d-block">Trabalhadas</small>
                            <strong className="text-primary">{detalheDia.horasTrabalhadas}</strong>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="p-2 bg-light rounded">
                            <small className="text-muted d-block">Previstas</small>
                            <strong>{detalheDia.horasPrevistas}</strong>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`text-center p-2 rounded ${
                          detalheDia.bancoHoras.startsWith("+")
                            ? "bg-success bg-opacity-10 text-success"
                            : detalheDia.bancoHoras.startsWith("-")
                            ? "bg-warning bg-opacity-10 text-warning"
                            : "bg-light"
                        }`}
                      >
                        <small className="text-muted d-block">Banco de Horas</small>
                        <strong>{detalheDia.bancoHoras}</strong>
                      </div>

                      {["incompleto", "sem-registro"].includes(detalheDia.status) && (
                        <div className="text-center mt-4">
                          <button className="btn btn-outline-primary" onClick={() => setShowJustModal(true)}>
                            <AlertCircle size={18} className="me-2" /> Justificar Ponto
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-5">
                      <Clock size={48} className="text-muted mb-3" />
                      <p className="text-muted">Nenhum registro para este dia.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-4 d-flex flex-column gap-2 align-items-center">
            <button
              className="btn btn-primary btn-lg px-4"
              onClick={handleDownload}
              disabled={baixando}
            >
              {baixando ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status" />
                  Gerando Relatório...
                </>
              ) : (
                <>
                  <Download size={20} className="me-2" /> Baixar Relatório Completo
                </>
              )}
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setShowJustModal(true)}
            >
              Nova Justificativa
            </button>
          </div>
        </div>
      </div>

      {/* Modal Justificativa */}
      <Modal show={showJustModal} onHide={() => setShowJustModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Justificar Ponto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Data</Form.Label>
              <Form.Control
                type="text"
                value={detalheDia ? detalheDia.data : formatDate(selectedDate)}
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tipo</Form.Label>
              <Form.Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="esquecimento">Esquecimento</option>
                <option value="atraso">Atraso</option>
                <option value="ausencia">Ausência</option>
                <option value="outro">Outro</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Motivo</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Descreva o motivo..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Anexo (opcional)</Form.Label>
              <Form.Control
                type="file"
                accept=".jpg,.png,.pdf"
                onChange={(e) => setAnexo(e.target.files[0])}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowJustModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            style={{ backgroundColor: "#00c9a7", border: "none" }}
            onClick={enviarJustificativa}
          >
            Enviar Justificativa
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default PontosBatidos;