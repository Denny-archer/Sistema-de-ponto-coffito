import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Modal, Button, Form, Row, Col, Badge, InputGroup, Spinner } from "react-bootstrap";
import { Search, Eye, CheckCircle2, XCircle, Download, Filter } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

/**
 * ===== Integração com API =====
 * Ajuste os imports conforme seu projeto. O arquivo http.js deve exportar { http } (axios instance)
 */
let http = null;
try {
  // tente buscar como named export
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  http = require("../services/http").http;
} catch (e) {
  try {
    // fallback: default export "api"
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    http = require("../services/http").default || require("../services/http").api;
  } catch (_) {
    console.warn("Não foi possível importar http do seu projeto. Substitua pelas suas chamadas axios.");
  }
}

const api = {
  async listJustificativas({ status = "pendente", q = "", tipo = "", dataIni = "", dataFim = "" }) {
    if (!http) throw new Error("Instância HTTP ausente");
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (q) params.append("q", q);
    if (tipo) params.append("tipo", tipo);
    if (dataIni) params.append("data_ini", dataIni);
    if (dataFim) params.append("data_fim", dataFim);
    const { data } = await http.get(`/justificativas?${params.toString()}`);
    return data?.items || data || [];
  },
  async patchJustificativa(id, body) {
    if (!http) throw new Error("Instância HTTP ausente");
    const { data } = await http.patch(`/justificativas/${id}`, body);
    return data;
  },
  async patchPonto(pontoId, body) {
    if (!http) throw new Error("Instância HTTP ausente");
    const { data } = await http.patch(`/pontos/${pontoId}`, body);
    return data;
  },
};

/**
 * Utilitários simples de UI
 */
const StatusPill = ({ value }) => {
  const map = {
    pendente: "warning",
    aprovada: "success",
    reprovada: "danger",
  };
  return <Badge bg={map[value] || "secondary"} className="text-capitalize">{value}</Badge>;
};

const TipoPill = ({ value }) => {
  const map = {
    esquecimento: "info",
    atraso: "secondary",
    ausencia: "dark",
    outro: "primary",
  };
  return <Badge bg={map[value] || "primary"} className="text-capitalize">{value || "-"}</Badge>;
};

/**
 * ===== Página: Lista de Justificativas =====
 */
export default function GestorJustificativas() {
  const navigate = useNavigate();

  // Filtros
  const [status, setStatus] = useState("pendente");
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("");
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");

  // Dados
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal
  const [show, setShow] = useState(false);
  const [current, setCurrent] = useState(null);

  const filtros = useMemo(() => ({ status, q, tipo, dataIni, dataFim }), [status, q, tipo, dataIni, dataFim]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.listJustificativas(filtros);
        if (!ignore) setItens(data);
      } catch (e) {
        console.error(e);
        if (!ignore) setError("Falha ao carregar justificativas");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => (ignore = true);
  }, [filtros]);

  const openModal = (item) => {
    setCurrent(item);
    setShow(true);
  };
  const closeModal = () => {
    setShow(false);
    setCurrent(null);
  };

  const handleAprovar = async (ajuste) => {
    if (!current) return;

    const confirm = await Swal.fire({
      icon: "question",
      title: "Aprovar justificativa?",
      text: "Isso atualizará o status e (opcionalmente) ajustará o ponto.",
      showCancelButton: true,
      confirmButtonText: "Sim, aprovar",
      cancelButtonText: "Cancelar",
      customClass: { confirmButton: "btn btn-success", cancelButton: "btn btn-outline-secondary ms-2" },
      buttonsStyling: false,
    });
    if (!confirm.isConfirmed) return;

    try {
      // 1) Atualiza justificativa
      await api.patchJustificativa(current.id, { status: "aprovada" });

      // 2) Se houver campos de ajuste, envia PATCH de ponto
      if (ajuste && (ajuste.entrada || ajuste.almoco || ajuste.retorno || ajuste.saida)) {
        await api.patchPonto(current.pontoId, {
          entrada: ajuste.entrada || null,
          almoco: ajuste.almoco || null,
          retorno: ajuste.retorno || null,
          saida: ajuste.saida || null,
          observacao: `Ajustado via aprovação de justificativa #${current.id}`,
        });
      }

      // 3) Feedback & refresh
      await Swal.fire({ icon: "success", title: "Aprovada!", timer: 1400, showConfirmButton: false });
      closeModal();
      // força recarga da lista mantendo filtros
      const data = await api.listJustificativas(filtros);
      setItens(data);
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "Erro ao aprovar", text: e?.message || "" });
    }
  };

  const handleReprovar = async () => {
    if (!current) return;
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Reprovar justificativa?",
      input: "textarea",
      inputLabel: "Motivo (opcional)",
      showCancelButton: true,
      confirmButtonText: "Sim, reprovar",
      cancelButtonText: "Cancelar",
      customClass: { confirmButton: "btn btn-danger", cancelButton: "btn btn-outline-secondary ms-2" },
      buttonsStyling: false,
    });
    if (!confirm.isConfirmed) return;

    try {
      await api.patchJustificativa(current.id, { status: "reprovada", motivo_reprovacao: confirm.value || null });
      await Swal.fire({ icon: "success", title: "Reprovada", timer: 1200, showConfirmButton: false });
      closeModal();
      const data = await api.listJustificativas(filtros);
      setItens(data);
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "Erro ao reprovar", text: e?.message || "" });
    }
  };

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">Justificativas</h2>
          <small className="text-muted">Gerencie solicitações de ajuste/ausência dos colaboradores</small>
        </div>
        <Button variant="outline-secondary" onClick={() => navigate(-1)}>Voltar</Button>
      </div>

      {/* Filtros */}
      <div className="p-3 border rounded-3 bg-white mb-3">
        <Row className="g-2 align-items-end">
          <Col md={4}>
            <Form.Label>Buscar</Form.Label>
            <InputGroup>
              <InputGroup.Text><Search size={16} /></InputGroup.Text>
              <Form.Control value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nome, motivo..." />
            </InputGroup>
          </Col>
          <Col md={3}>
            <Form.Label>Status</Form.Label>
            <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="aprovada">Aprovada</option>
              <option value="reprovada">Reprovada</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Label>Tipo</Form.Label>
            <Form.Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Todos</option>
              <option value="esquecimento">Esquecimento</option>
              <option value="atraso">Atraso</option>
              <option value="ausencia">Ausência</option>
              <option value="outro">Outro</option>
            </Form.Select>
          </Col>
          <Col md={2} className="d-flex align-items-center gap-2 text-muted">
            <Filter size={18} />
            <span className="small">Filtro por período</span>
          </Col>
          <Col md={2}>
            <Form.Label>De</Form.Label>
            <Form.Control type="date" value={dataIni} onChange={(e) => setDataIni(e.target.value)} />
          </Col>
          <Col md={2}>
            <Form.Label>Até</Form.Label>
            <Form.Control type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
          </Col>
        </Row>
      </div>

      {/* Tabela */}
      <div className="p-0 border rounded-3 bg-white">
        {loading ? (
          <div className="d-flex align-items-center justify-content-center py-5">
            <Spinner animation="border" />
            <span className="ms-2">Carregando...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-danger">{error}</div>
        ) : (
          <Table hover responsive className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Colaborador</th>
                <th>Data</th>
                <th>Tipo</th>
                <th>Motivo</th>
                <th>Anexo</th>
                <th>Status</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {itens.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">Nenhuma justificativa encontrada</td>
                </tr>
              )}
              {itens.map((j) => (
                <tr key={j.id}>
                  <td>
                    <div className="fw-semibold">{j.colaborador?.nome || j.colaborador_nome}</div>
                    <small className="text-muted">{j.colaborador?.departamento || j.departamento}</small>
                  </td>
                  <td>{j.data || j.data_referencia}</td>
                  <td><TipoPill value={j.tipo} /></td>
                  <td className="text-truncate" style={{maxWidth: 360}} title={j.motivo}>{j.motivo}</td>
                  <td>
                    {j.anexo_url ? (
                      <a href={j.anexo_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary"><Download size={14} className="me-1"/>Arquivo</a>
                    ) : <span className="text-muted">—</span>}
                  </td>
                  <td><StatusPill value={j.status} /></td>
                  <td className="text-end">
                    <Button size="sm" variant="outline-primary" onClick={() => openModal(j)}>
                      <Eye size={16} className="me-1"/> Visualizar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {/* Modal Detalhes */}
      <DetalheModal show={show} onHide={closeModal} item={current} onAprovar={handleAprovar} onReprovar={handleReprovar} />
    </div>
  );
}

function DetalheModal({ show, onHide, item, onAprovar, onReprovar }) {
  const [entrada, setEntrada] = useState("");
  const [almoco, setAlmoco] = useState("");
  const [retorno, setRetorno] = useState("");
  const [saida, setSaida] = useState("");

  useEffect(() => {
    if (!show) {
      setEntrada("");
      setAlmoco("");
      setRetorno("");
      setSaida("");
    }
  }, [show]);

  if (!item) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Detalhes da Justificativa #{item.id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
          <Col md={8}>
            <div className="mb-2"><strong>Colaborador:</strong> {item.colaborador?.nome || item.colaborador_nome}</div>
            <div className="mb-2"><strong>Data:</strong> {item.data || item.data_referencia}</div>
            <div className="mb-2"><strong>Tipo:</strong> <TipoPill value={item.tipo} /></div>
            <div className="mb-2"><strong>Motivo:</strong><br/> {item.motivo || "—"}</div>
            {item.anexo_url && (
              <div className="mb-2">
                <strong>Anexo:</strong> <a href={item.anexo_url} target="_blank" rel="noreferrer" className="ms-1">baixar</a>
              </div>
            )}
          </Col>
          <Col md={4}>
            <div className="p-3 border rounded-3 bg-light">
              <div className="fw-semibold mb-2">Ajustar ponto (opcional)</div>
              <Form.Group className="mb-2">
                <Form.Label>Entrada</Form.Label>
                <Form.Control type="time" value={entrada} onChange={(e) => setEntrada(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Saída p/ almoço</Form.Label>
                <Form.Control type="time" value={almoco} onChange={(e) => setAlmoco(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Retorno do almoço</Form.Label>
                <Form.Control type="time" value={retorno} onChange={(e) => setRetorno(e.target.value)} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Saída</Form.Label>
                <Form.Control type="time" value={saida} onChange={(e) => setSaida(e.target.value)} />
              </Form.Group>
              <small className="text-muted d-block mt-2">Se não preencher, nenhum horário será alterado.</small>
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>Fechar</Button>
        <Button variant="danger" onClick={onReprovar} className="ms-2">
          <XCircle size={16} className="me-1"/> Reprovar
        </Button>
        <Button variant="success" onClick={() => onAprovar({ entrada, almoco, retorno, saida })} className="ms-2">
          <CheckCircle2 size={16} className="me-1"/> Aprovar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

