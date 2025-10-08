import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import { getBatidas } from "../../services/batidas"; // 👈 backend
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
import { http } from "../../services/http";
import "react-calendar/dist/Calendar.css";

function PontosBatidos() {
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [baixando, setBaixando] = useState(false);
  const [viewMode, setViewMode] = useState("dia");
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal de justificativa
  const [showJustModal, setShowJustModal] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [tipo, setTipo] = useState("esquecimento");
  const [anexo, setAnexo] = useState(null);

  // Carrega batidas do backend
  useEffect(() => {
    carregarBatidas();
  }, []);

  const carregarBatidas = async () => {
    setLoading(true);
    try {
      const batidas = await getBatidas();
      const agrupadas = agruparPorDia(batidas);
      setRegistros(agrupadas);
    } catch (e) {
      console.error("Erro ao carregar batidas:", e);
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para organizar por dia
  const agruparPorDia = (batidas) => {
    const registrosMap = {};

    batidas.forEach((b) => {
      const data = new Date(b.data_batida);
      const dataStr = data.toLocaleDateString("pt-BR");

      if (!registrosMap[dataStr]) {
        registrosMap[dataStr] = {
          data: dataStr,
          batidas: [],
          horasTrabalhadas: "00:00",
          horasPrevistas: "08:00",
          bancoHoras: "00:00",
          status: "incompleto",
          observacao: "",
        };
      }

      registrosMap[dataStr].batidas.push(
        data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      );
    });

    // Ordena e calcula horas
    Object.values(registrosMap).forEach((r) => {
      r.batidas.sort();
      const total = calcularHoras(r.batidas);
      r.horasTrabalhadas = total;
      r.bancoHoras = calcularBanco(total, r.horasPrevistas);
      r.status = definirStatus(r);
    });

    return Object.values(registrosMap);
  };

  const calcularHoras = (batidas) => {
    if (batidas.length < 2) return "00:00";
    let totalMinutos = 0;

    for (let i = 0; i < batidas.length; i += 2) {
      if (batidas[i + 1]) {
        const entrada = parseHora(batidas[i]);
        const saida = parseHora(batidas[i + 1]);
        totalMinutos += saida - entrada;
      }
    }
    return formatarMinutos(totalMinutos);
  };

  const calcularBanco = (trabalhadas, previstas) => {
    const t = toMin(trabalhadas);
    const p = toMin(previstas);
    const saldo = t - p;
    return (saldo >= 0 ? "+" : "") + formatarMinutos(saldo);
  };

  const definirStatus = (r) => {
    if (r.batidas.length === 0) return "sem-registro";
    if (r.batidas.length < 4) return "incompleto";
    if (r.bancoHoras.startsWith("+")) return "positivo";
    if (r.bancoHoras.startsWith("-")) return "negativo";
    return "completo";
  };

  // Helpers
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

  const formatDate = (date) => date.toLocaleDateString("pt-BR");
  const detalheDia = useMemo(() => {
    const dataStr = formatDate(selectedDate);
    return registros.find((r) => r.data === dataStr) || null;
  }, [selectedDate, registros]);

  const getDayStatus = (date) => {
    const dataStr = formatDate(date);
    const registro = registros.find((r) => r.data === dataStr);
    return registro ? registro.status : "sem-registro";
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const status = getDayStatus(date);
    const isToday = formatDate(date) === formatDate(new Date());

    return (
      <div className="d-flex justify-content-center mt-1">
        {isToday && (
          <div
            className="dot-indicator bg-primary"
            style={{ width: "4px", height: "4px", borderRadius: "50%" }}
          ></div>
        )}
        {status !== "sem-registro" && (
          <div
            className={`dot-indicator ${
              status === "completo"
                ? "bg-success"
                : status === "positivo"
                ? "bg-info"
                : status === "negativo"
                ? "bg-warning"
                : "bg-danger"
            }`}
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              marginLeft: "2px",
            }}
          ></div>
        )}
      </div>
    );
  };

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return "";
    const isToday = formatDate(date) === formatDate(new Date());
    const status = getDayStatus(date);

    let classes = [];
    if (isToday) classes.push("border border-primary border-2");
    if (status !== "sem-registro") classes.push("has-registry");
    return classes.join(" ");
  };

  const handleDownload = async () => {
    setBaixando(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Swal.fire({
        icon: "success",
        title: "Relatório baixado com sucesso!",
        confirmButtonColor: "#00c9a7",
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Erro ao baixar relatório!",
        confirmButtonColor: "#f44336",
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

  const enviarJustificativa = async () => {
    try {
      const formData = new FormData();
      formData.append(
        "data",
        detalheDia ? detalheDia.data : formatDate(selectedDate)
      );
      formData.append("tipo", tipo);
      formData.append("motivo", motivo);
      if (anexo) formData.append("anexo", anexo);

      await http.post("/justificativas", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowJustModal(false);
      Swal.fire({
        icon: "success",
        title: "Justificativa enviada!",
        text: "Sua justificativa foi registrada e aguarda aprovação do gestor.",
        confirmButtonColor: "#00c9a7",
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Erro ao enviar justificativa.",
        confirmButtonColor: "#f44336",
      });
    }
  };

  // --- JSX ---
  return (
    <div className="container-fluid d-flex flex-column min-vh-100 py-3 px-3 bg-light">
      {/* Header */}
      <div className="w-100 mb-3">
        <div className="d-flex align-items-center">
          <button
            className="btn btn-outline-secondary btn-sm me-3"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} className="me-2" />
            <span className="d-none d-sm-inline">Voltar</span>
          </button>
          <div>
            <h2 className="fw-bold mb-0 d-flex align-items-center">
              <CalendarDays size={24} className="text-primary me-2" />
              Pontos Batidos
            </h2>
            <small className="text-muted">
              Controle e acompanhamento de registros
            </small>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="row justify-content-center flex-grow-1">
        <div className="col-12 col-xl-10">
          <div className="row g-3 g-md-4">
            {/* Calendário */}
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0 d-flex align-items-center">
                      <CalendarDays size={18} className="me-2" />
                      Calendário
                    </h5>
                  </div>
                </div>
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
                      showNavigation={true}
                      activeStartDate={activeStartDate}
                      onActiveStartDateChange={({ activeStartDate }) =>
                        setActiveStartDate(activeStartDate)
                      }
                      tileContent={tileContent}
                      tileClassName={tileClassName}
                      className="w-100 border-0"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Detalhes do Dia */}
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-0">
                  <h5 className="fw-bold mb-0 d-flex align-items-center">
                    <Clock size={18} className="me-2" />
                    Detalhes do Dia - {formatDate(selectedDate)}
                  </h5>
                </div>
                <div className="card-body">
                  {detalheDia ? (
                    <>
                      <div className="d-flex align-items-center mb-3 p-3 rounded bg-light">
                        {getStatusIcon(detalheDia.status)}
                        <span className="ms-2 fw-medium text-capitalize">
                          {detalheDia.status.replace("-", " ")}
                        </span>
                      </div>

                      {/* Batidas */}
                      <div className="mb-4">
                        <h6 className="fw-bold mb-3">Batidas de Ponto</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {detalheDia.batidas.map((hora, index) => (
                            <div key={index} className="d-flex align-items-center">
                              <span className="badge bg-secondary me-1">
                                {index + 1}
                              </span>
                              <span className="badge bg-primary p-2">{hora}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Resumo */}
                      <div className="row g-3 mb-3">
                        <div className="col-6">
                          <div className="text-center p-2 bg-light rounded">
                            <small className="text-muted d-block">Trabalhadas</small>
                            <strong className="text-primary">
                              {detalheDia.horasTrabalhadas}
                            </strong>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="text-center p-2 bg-light rounded">
                            <small className="text-muted d-block">Previstas</small>
                            <strong>{detalheDia.horasPrevistas}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Banco de Horas */}
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

                      {/* Botão Justificar */}
                      {["incompleto", "sem-registro"].includes(
                        detalheDia.status
                      ) && (
                        <div className="text-center mt-4">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => setShowJustModal(true)}
                          >
                            <AlertCircle size={18} className="me-2" />
                            Justificar Ponto
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

          {/* Botões de Ação */}
          <div className="text-center mt-4 d-flex flex-column gap-2 align-items-center">
            <button
              className="btn btn-primary btn-lg px-4"
              onClick={handleDownload}
              disabled={baixando}
            >
              {baixando ? (
                <>
                  <div
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></div>
                  Gerando Relatório...
                </>
              ) : (
                <>
                  <Download size={20} className="me-2" />
                  Baixar Relatório Completo
                </>
              )}
            </button>

            {/* Botão Global */}
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setShowJustModal(true)}
            >
              Nova Justificativa
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
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
