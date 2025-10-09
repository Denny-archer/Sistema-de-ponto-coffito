import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Modal, Button, Form, Row, Col, Badge, InputGroup, Spinner } from "react-bootstrap";
import { Search, Eye, CheckCircle2, XCircle, Download, Filter } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { http } from "../../services/http";

const api = {
  // 🔹 Lista justificativas com filtros corrigidos para o backend real
  async listJustificativas(filtros = {}) {
    if (!http) throw new Error("Instância HTTP ausente");

    const params = new URLSearchParams();

    // 🔸 Filtros que o backend suporta
    if (filtros.requerente?.trim())
      params.append("requerente", filtros.requerente.trim());
    
    // 🔸 O backend parece usar status como string, então ajustamos
    if (filtros.status) {
      // Converte valores numéricos do frontend para strings do backend
      const statusMap = {
        "1": "Aguardando Validação",
        "2": "Aprovada", 
        "3": "Reprovada"
      };
      params.append("status", statusMap[filtros.status] || filtros.status);
    }
    
    // 🔸 Filtro por data - ajustando para o formato do backend
    if (filtros.dataIni) params.append("data_ini", filtros.dataIni);
    if (filtros.dataFim) params.append("data_fim", filtros.dataFim);

    params.append("skip", filtros.skip || 0);
    params.append("sort", filtros.sort || false);

    const queryString = params.toString();
    console.log("🔍 Chamando API com filtros:", queryString);

    try {
      const { data } = await http.get(
        `/justificativas/${queryString ? "?" + queryString : ""}`
      );

      const rawList = data?.justificativas || [];

      // 🔸 Mapeamento CORRETO para o formato do frontend
      return rawList.map((j) => ({
        id: j.id,
        colaborador_nome: j.requerente,
        data_referencia: j.data_requerida
          ? new Date(j.data_requerida).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "-",
        // 🔹 Como o backend não envia 'tipo', usamos um padrão ou inferimos do texto
        tipo: this.inferirTipo(j.texto) || "outro",
        motivo: j.texto,
        anexo_url: j.nome_anexo ? `/uploads/${j.nome_anexo}` : null,
        // 🔹 Convertendo status string para o formato do frontend
        status: j.status?.toLowerCase() || "Aguardando Validação",
        validador: j.validador,
        criado_em: j.criado_em,
        atualizado_em: j.atualizado_em
      }));
    } catch (error) {
      console.error("❌ Erro na API:", error);
      throw error;
    }
  },

  // 🔹 Função para inferir tipo baseado no texto (fallback)
  inferirTipo(texto) {
    if (!texto) return "outro";
    
    const text = texto.toLowerCase();
    if (text.includes("esquec") || text.includes("esqueci")) return "esquecimento";
    if (text.includes("atras") || text.includes("atrasei")) return "atraso";
    if (text.includes("ausên") || text.includes("falta")) return "ausencia";
    return "outro";
  },

  // 🔹 PATCH para aprovar/reprovar - ajustado para o backend real
 // 🔹 PATCH para aprovar/reprovar - ajustado exatamente ao backend real
async patchJustificativa(id, resposta) {
  const payload = { resposta }; // 👈 backend quer esse formato puro

  console.log("📤 Enviando PATCH:", { id, payload });

  const { data } = await http.patch(`/justificativas/${id}`, payload, {
    headers: { "Content-Type": "application/json" },
  });

  return data;
},

  async patchPonto(pontoId, body) {
    const { data } = await http.patch(`/pontos/${pontoId}`, body);
    return data;
  },
};

// 🔹 Componente StatusPill atualizado para trabalhar com strings
const StatusPill = ({ value }) => {
  const map = {
    aguardando_validacao: { variant: "warning", label: "Aguardando Validação" },
    aprovada: { variant: "success", label: "Aprovada" },
    reprovada: { variant: "danger", label: "Reprovada" },
  };

  const normalizedValue =
    typeof value === "number"
      ? value === 1
        ? "aguardando_validacao"
        : value === 2
        ? "aprovada"
        : "reprovada"
      : value?.toLowerCase?.() || "aguardando_validacao";

  const { variant, label } = map[normalizedValue] || map.aguardando_validacao;

  return (
    <Badge bg={variant} className="px-3 py-2 text-capitalize">
      {label}
    </Badge>
  );
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

export default function GestorJustificativas() {
  const navigate = useNavigate();

  // Estados dos filtros
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("");
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");

  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [show, setShow] = useState(false);
  const [current, setCurrent] = useState(null);
  const [showHistorico, setShowHistorico] = useState(false);
  const [historico, setHistorico] = useState(null);

  // Filtros otimizados
  const filtros = useMemo(() => ({ 
    requerente: q, 
    status: status,
    tipo: tipo,
    dataIni: dataIni,
    dataFim: dataFim
  }), [q, status, tipo, dataIni, dataFim]);

  // Carregar justificativas
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      carregar();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [filtros]);

  const carregar = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("🔄 Carregando com filtros:", filtros);
      const data = await api.listJustificativas(filtros);
      setItens(data);
    } catch (err) {
      console.error("❌ Erro ao carregar:", err);
      setError("Falha ao carregar justificativas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Limpar filtros
  const limparFiltros = () => {
    setStatus("");
    setQ("");
    setTipo("");
    setDataIni("");
    setDataFim("");
  };

  // Ações rápidas
  const handleAprovarRapido = async (item) => {
    const confirm = await Swal.fire({
      icon: "question",
      title: `Aprovar justificativa #${item.id}?`,
      text: `Colaborador: ${item.colaborador_nome}`,
      showCancelButton: true,
      confirmButtonText: "Sim, aprovar",
      cancelButtonText: "Cancelar",
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-outline-secondary ms-2",
      },
      buttonsStyling: false,
    });
    if (!confirm.isConfirmed) return;

    try {
      await api.patchJustificativa(item.id, 2);
      setItens((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "Aprovada" } : i))
      );
      await carregar();
      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "success",
        title: "Justificativa aprovada!",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (e) {
      console.error(e);
      Swal.fire({ 
        icon: "error", 
        title: "Erro ao aprovar", 
        text: e?.response?.data?.detail || e?.message || "Erro desconhecido" 
      });
    }
  };

  const handleReprovarRapido = async (item) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: `Reprovar justificativa #${item.id}?`,
      input: "textarea",
      inputLabel: "Motivo (opcional)",
      showCancelButton: true,
      confirmButtonText: "Sim, reprovar",
      cancelButtonText: "Cancelar",
      customClass: {
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-outline-secondary ms-2",
      },
      buttonsStyling: false,
    });
    if (!confirm.isConfirmed) return;

    try {
      await api.patchJustificativa(item.id, 3);
      await carregar();
      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "info",
        title: "Justificativa reprovada",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (e) {
      console.error(e);
      Swal.fire({ 
        icon: "error", 
        title: "Erro ao reprovar", 
        text: e?.response?.data?.detail || e?.message || "Erro desconhecido" 
      });
    }
  };

  // Modal de detalhes
  const openModal = (item) => {
    setCurrent(item);
    setShow(true);
  };

  const closeModal = () => {
    setShow(false);
    setCurrent(null);
  };

  // Histórico
  const openHistorico = async (item) => {
    try {
      const logsSimulados = [
        { 
          acao: "Criada", 
          usuario: item.colaborador_nome, 
          data: item.criado_em || new Date().toISOString() 
        },
        ...(item.status !== "Aguardando Validação" && item.atualizado_em
          ? [
              {
                acao: item.status === "aprovada" ? "Aprovada" : "Reprovada",
                usuario: item.validador || "Gestor",
                data: item.atualizado_em,
              },
            ]
          : []),
      ];

      setHistorico({ id: item.id, logs: logsSimulados });
      setShowHistorico(true);
    } catch (e) {
      console.error("Erro ao carregar histórico:", e);
      Swal.fire({ icon: "error", title: "Erro ao carregar histórico" });
    }
  };

  const closeHistorico = () => {
    setShowHistorico(false);
    setHistorico(null);
  };

  // Contador de filtros ativos
  const filtrosAtivos = Object.values(filtros).filter(val => 
    val !== undefined && val !== null && val !== ''
  ).length;

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">Justificativas</h2>
          <small className="text-muted">Gerencie solicitações de ajuste/ausência dos colaboradores</small>
        </div>
        <div>
          <Button 
            variant="outline-danger" 
            size="sm" 
            onClick={limparFiltros} 
            className="me-2"
            disabled={filtrosAtivos === 0}
          >
            Limpar Filtros ({filtrosAtivos})
          </Button>
          <Button variant="outline-secondary" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="p-3 border rounded-3 bg-white mb-3">
        <Row className="g-2 align-items-end">
          <Col md={3}>
            <Form.Label>Buscar Colaborador</Form.Label>
            <InputGroup>
              <InputGroup.Text><Search size={16} /></InputGroup.Text>
              <Form.Control 
                value={q} 
                onChange={(e) => setQ(e.target.value)} 
                placeholder="Nome do colaborador..." 
              />
            </InputGroup>
          </Col>
          
          <Col md={2}>
            <Form.Label>Status</Form.Label>
            <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos</option>
              <option value="1">Aguardando Validação</option>
              <option value="2">Aprovada</option>
              <option value="3">Reprovada</option>
            </Form.Select>
          </Col>
          
          <Col md={2}>
            <Form.Label>Tipo</Form.Label>
            <Form.Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Todos</option>
              <option value="esquecimento">Esquecimento</option>
              <option value="atraso">Atraso</option>
              <option value="ausencia">Ausência</option>
              <option value="outro">Outro</option>
            </Form.Select>
          </Col>
          
          <Col md={2}>
            <Form.Label>Data Início</Form.Label>
            <Form.Control 
              type="date" 
              value={dataIni} 
              onChange={(e) => setDataIni(e.target.value)} 
            />
          </Col>
          
          <Col md={2}>
            <Form.Label>Data Fim</Form.Label>
            <Form.Control 
              type="date" 
              value={dataFim} 
              onChange={(e) => setDataFim(e.target.value)} 
            />
          </Col>
          
          <Col md={1} className="d-flex align-items-center justify-content-center">
            <Filter size={18} className="text-muted" />
          </Col>
        </Row>
      </div>

      {/* Tabela */}
      <div className="p-0 border rounded-3 bg-white">
        {loading ? (
          <div className="d-flex align-items-center justify-content-center py-5">
            <Spinner animation="border" />
            <span className="ms-2">Carregando justificativas...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-danger">
            <p>{error}</p>
            <Button variant="outline-primary" onClick={carregar}>
              Tentar Novamente
            </Button>
          </div>
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
              {itens.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    {filtrosAtivos > 0 
                      ? "Nenhuma justificativa encontrada com os filtros aplicados" 
                      : "Nenhuma justificativa cadastrada"
                    }
                  </td>
                </tr>
              ) : (
                itens.map((j) => (
                  <tr key={j.id}>
                    <td>
                      <div className="fw-semibold">{j.colaborador_nome}</div>
                      <small className="text-muted">{j.departamento || "—"}</small>
                    </td>
                    <td>{j.data_referencia}</td>
                    <td><TipoPill value={j.tipo} /></td>
                    <td className="text-truncate" style={{ maxWidth: 360 }} title={j.motivo}>
                      {j.motivo}
                    </td>
                    <td>
                      {j.anexo_url ? (
                        <a
                          href={j.anexo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-outline-secondary"
                        >
                          <Download size={14} className="me-1" /> Ver arquivo
                        </a>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td><StatusPill value={j.status} /></td>
                    <td className="text-end">
                      {String(j.status).toLowerCase().includes("aguard") || j.status === 1 ? (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            className="me-2"
                            onClick={() => handleAprovarRapido(j)}
                          >
                            <CheckCircle2 size={16} className="me-1" /> Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            className="me-2"
                            onClick={() => handleReprovarRapido(j)}
                          >
                            <XCircle size={16} className="me-1" /> Reprovar
                          </Button>
                        </>
                      ) : null}

                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="ms-2"
                        onClick={() => openModal(j)}
                      >
                        <Eye size={16} className="me-1" /> Detalhes
                      </Button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </div>

      {/* Modal de Detalhes */}
      <Modal show={show} onHide={closeModal} size="lg" centered>
        {current && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Justificativa #{current.id}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Colaborador:</strong> {current.colaborador_nome}</p>
                  <p><strong>Data Referência:</strong> {current.data_referencia}</p>
                  <p><strong>Tipo:</strong> <TipoPill value={current.tipo} /></p>
                </Col>
                <Col md={6}>
                  <p><strong>Status:</strong> <StatusPill value={current.status} /></p>
                  <p><strong>Validador:</strong> {current.validador || "—"}</p>
                  <p><strong>Última atualização:</strong> {current.atualizado_em ? new Date(current.atualizado_em).toLocaleString("pt-BR") : "—"}</p>
                </Col>
              </Row>
              <hr />
              <p><strong>Motivo:</strong></p>
              <div className="border rounded p-3 bg-light">
                {current.motivo}
              </div>
              {current.anexo_url && (
                <div className="mt-3">
                  <strong>Anexo:</strong>{" "}
                  <a href={current.anexo_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary ms-2">
                    <Download size={14} className="me-1" /> Baixar arquivo
                  </a>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={closeModal}>
                Fechar
              </Button>
              {current.status === "Aguardando Validação" && (
                <>
                  <Button variant="danger" onClick={() => handleReprovarRapido(current)}>
                    <XCircle size={16} className="me-1" /> Reprovar
                  </Button>
                  <Button variant="success" onClick={() => handleAprovarRapido(current)}>
                    <CheckCircle2 size={16} className="me-1" /> Aprovar
                  </Button>
                </>
              )}
            </Modal.Footer>
          </>
        )}
      </Modal>

      {/* Modal de Histórico */}
      <Modal show={showHistorico} onHide={closeHistorico} size="md" centered>
        {historico && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Histórico - Justificativa #{historico.id}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {historico.logs && historico.logs.length > 0 ? (
                <ul className="list-group">
                  {historico.logs.map((log, i) => (
                    <li key={i} className="list-group-item d-flex justify-content-between">
                      <div>
                        <strong>{log.acao}</strong><br />
                        <small className="text-muted">{log.usuario}</small>
                      </div>
                      <span className="text-muted">
                        {new Date(log.data).toLocaleString("pt-BR")}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted mb-0">Sem histórico registrado.</p>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={closeHistorico}>
                Fechar
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
}