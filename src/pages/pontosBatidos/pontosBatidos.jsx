import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import { getBatidas } from "../../services/batidas";
import DetalhesPontoDiario from "../../components/DetalhesPontoDiario/DetalhesPontoDiario";

import {
  Download,
  ArrowLeft,
  Clock,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { http } from "../../services/http";
import useAuth from "../../hooks/useAuth";
import "react-calendar/dist/Calendar.css";
import {
  calcularHoras,
  calcularBanco,
  definirStatus,
} from "../../utils/timeUtils";

function PontosBatidos() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());

  const [loadingBatidas, setLoadingBatidas] = useState(true);
  const [enviandoJustificativa, setEnviandoJustificativa] = useState(false);
  const [baixando, setBaixando] = useState(false);
  const [registros, setRegistros] = useState([]);

  const [showJustModal, setShowJustModal] = useState(false);
  const [dataHora, setDataHora] = useState("");
  const [motivo, setMotivo] = useState("");
  const [anexo, setAnexo] = useState(null);

 useEffect(() => {
  if (user?.id) {
    carregarBatidas();
  }
}, [user]);


  useEffect(() => {
    if (showJustModal) {
      const agora = new Date();
      const tz = agora.getTimezoneOffset() * 60000;
      const localISO = new Date(agora.getTime() - tz).toISOString().slice(0, 16);
      setDataHora(localISO);
    }
  }, [showJustModal]);

  async function carregarBatidas() {
    if (!user?.id) return;
    setLoadingBatidas(true);

    try {
      // 🔹 Usa o filtro nativo da API
      const response = await http.get(`/batidas/?id_usuario=${user.id}&skip=0&limit=9999`);
      const batidasUsuario = response.data?.batidas || [];

      // 🔹 Mantém o agrupamento e cálculo das horas
      const agrupadas = agruparPorDia(batidasUsuario);
      setRegistros(agrupadas);
    } catch (err) {
      console.error("Erro ao carregar batidas:", err);
      Swal.fire({
        icon: "error",
        title: "Erro ao carregar registros",
        text: "Tente novamente mais tarde.",
        confirmButtonColor: "#f44336",
      });
    } finally {
      setLoadingBatidas(false);
    }
  }



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
        };
      }

      registrosMap[dataStr].batidas.push(
        data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      );
    });

    Object.values(registrosMap).forEach((r) => {
      r.batidas.sort();
      r.horasTrabalhadas = calcularHoras(r.batidas);
      r.bancoHoras = calcularBanco(r.horasTrabalhadas, r.horasPrevistas);
      r.status = definirStatus(r);
    });

    return Object.values(registrosMap).sort((a, b) => new Date(b.data) - new Date(a.data));
  };

  const formatDate = (date) => date.toLocaleDateString("pt-BR");

  const registrosMap = useMemo(() => {
    const map = {};
    registros.forEach((r) => (map[r.data] = r));
    return map;
  }, [registros]);

  const detalheDia = registrosMap[formatDate(selectedDate)] || null;

  const getDayStatus = (date) => registrosMap[formatDate(date)]?.status || "sem-registro";

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const status = getDayStatus(date);
    const isToday = formatDate(date) === formatDate(new Date());

    return (
      <div className="d-flex justify-content-center mt-1" title={`Status: ${status}`}>
        {isToday && (
          <div
            className="dot-indicator bg-primary"
            style={{ width: 4, height: 4, borderRadius: "50%" }}
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
            style={{ width: 6, height: 6, borderRadius: "50%", marginLeft: 2 }}
          ></div>
        )}
      </div>
    );
  };

  const handleDownload = async () => {
    setBaixando(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      Swal.fire({ icon: "success", title: "Relatório baixado!", confirmButtonColor: "#00c9a7" });
    } catch {
      Swal.fire({ icon: "error", title: "Erro ao baixar relatório!", confirmButtonColor: "#f44336" });
    } finally {
      setBaixando(false);
    }
  };

  async function enviarJustificativa() {
    if (!dataHora || !motivo.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campos obrigatórios!",
        text: "Preencha a data e o motivo antes de enviar.",
        confirmButtonColor: "#0d6efd",
      });
      return;
    }

    try {
      setEnviandoJustificativa(true);

      const dataObj = new Date(dataHora);
      const ano = dataObj.getFullYear();
      const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
      const dia = String(dataObj.getDate()).padStart(2, "0");
      const hora = String(dataObj.getHours()).padStart(2, "0");
      const minuto = String(dataObj.getMinutes()).padStart(2, "0");
      const dataFormatada = `${ano}-${mes}-${dia} ${hora}:${minuto}`;

      const formData = new FormData();
      if (anexo) formData.append("anexo", anexo);

      const url = `/justificativas/?data_requerida=${encodeURIComponent(
        dataFormatada
      )}&texto=${encodeURIComponent(motivo)}`;

      const response = await http.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Justificativa enviada!",
        text: "Sua justificativa foi registrada com sucesso.",
        confirmButtonColor: "#00c9a7",
      });

      setShowJustModal(false);
      setMotivo("");
      setAnexo(null);
      console.log("✅ Justificativa enviada:", response.data);
    } catch (err) {
      console.error("❌ Erro ao enviar justificativa:", err);
      const msg =
        err.response?.data?.detail ||
        "Erro inesperado ao enviar justificativa. Verifique os campos e tente novamente.";

      Swal.fire({
        icon: "error",
        title: "Erro ao enviar justificativa",
        text: msg,
        confirmButtonColor: "#f44336",
      });
    } finally {
      setEnviandoJustificativa(false);
    }
  }

  return (
    <div className="container-fluid d-flex flex-column min-vh-100 py-3 px-3 bg-light">
      <div className="d-flex align-items-center mb-3">
        <button className="btn btn-outline-secondary btn-sm me-3" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} className="me-2" /> Voltar
        </button>
        <h2 className="fw-bold mb-0 d-flex align-items-center">
          <CalendarDays size={24} className="text-primary me-2" /> Pontos Batidos
        </h2>
      </div>

      <div className="row justify-content-center flex-grow-1">
        <div className="col-12 col-xl-10">
          <div className="row g-3 g-md-4">
            {/* Calendário */}
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-0">
                  <h5 className="fw-bold mb-0 d-flex align-items-center">
                    <CalendarDays size={18} className="me-2" /> Calendário
                  </h5>
                </div>
                <div className="card-body">
                  {loadingBatidas ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status"></div>
                      <p className="mt-2 text-muted">Carregando registros...</p>
                    </div>
                  ) : (
                    <Calendar
                      onChange={setSelectedDate}
                      value={selectedDate}
                      locale="pt-BR"
                      activeStartDate={activeStartDate}
                      onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
                      tileContent={tileContent}
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
                    <Clock size={18} className="me-2" /> Detalhes - {formatDate(selectedDate)}
                  </h5>
                </div>

                <div className="card-body">
                  {detalheDia ? (
                    <>
                      <div className="d-flex align-items-center mb-3 p-3 rounded bg-light">
                        <span className="me-2">{detalheDia.status}</span>
                      </div>

                      <h6 className="fw-bold mb-2">Batidas</h6>
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        {detalheDia.batidas.map((hora, i) => (
                          <div key={i} className="d-flex align-items-center gap-1">
                            <span className="fw-bold">{i + 1}.</span>
                            <span className="badge bg-primary p-2">{hora}</span>
                          </div>
                        ))}
                      </div>

                      {/* 🟢 Componente de resumo diário */}
                      <DetalhesPontoDiario
                        colaboradorId={user?.id}
                        dataSelecionada={selectedDate}
                      />

                      <div className="text-center mt-3">
                        {(["incompleto", "sem-registro"].includes(detalheDia.status)) && (
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => setShowJustModal(true)}
                          >
                            <AlertCircle size={18} className="me-2" /> Justificar Ponto
                          </button>
                        )}
                      </div>
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

          {/* Botões inferiores */}
          <div className="text-center mt-4 d-flex flex-column flex-sm-row justify-content-center align-items-center gap-3">
            <button
              className="btn btn-primary btn-lg w-100 w-sm-auto"
              onClick={handleDownload}
              disabled={baixando}
            >
              {baixando ? <Spinner size="sm" className="me-2" /> : <Download size={20} className="me-2" />} 
              Baixar Relatório
            </button>
            <button
              className="btn btn-primary btn-lg w-100 w-sm-auto"
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
          <Modal.Title>Nova Justificativa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Data e Hora</Form.Label>
              <Form.Control
                type="datetime-local"
                value={dataHora}
                onChange={(e) => setDataHora(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Motivo</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
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
            onClick={enviarJustificativa}
            disabled={enviandoJustificativa}
          >
            {enviandoJustificativa && <Spinner size="sm" className="me-2" />} Enviar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default PontosBatidos;
