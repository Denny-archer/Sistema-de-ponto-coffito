// src/pages/gestor/Empregados.jsx
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Search,
  Edit,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button, Table, Form, Modal, Spinner, Row, Col } from "react-bootstrap";
import { http } from "../../services/http";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

function Empregados() {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [colaboradores, setColaboradores] = useState([]);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState("");
  const [batidas, setBatidas] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [batidaSelecionada, setBatidaSelecionada] = useState(null);
  const [novoHorario, setNovoHorario] = useState("");
  const [motivo, setMotivo] = useState("");

  // 🔹 Carrega lista de colaboradores
  useEffect(() => {
    async function carregarColaboradores() {
      try {
        const res = await http.get("/usuarios/?skip=0&sort=false");
        setColaboradores(res.data.usuarios || []);
      } catch (err) {
        console.error("Erro ao carregar colaboradores:", err);
      }
    }
    carregarColaboradores();
  }, []);

  // 🔹 Buscar registros
  async function buscarBatidas() {
    if (!colaboradorSelecionado) {
      Swal.fire({
        icon: "warning",
        title: "Selecione um colaborador",
        confirmButtonColor: "#00c9a7",
      });
      return;
    }

    setLoading(true);
    try {
      const dataInicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
      const dataFim = `${ano}-${String(mes).padStart(2, "0")}-31`;
      const res = await http.get(
        `/batidas/?id_usuario=${colaboradorSelecionado}&data_inicio=${dataInicio}&data_fim=${dataFim}`
      );
      setBatidas(res.data.batidas || []);
    } catch (err) {
      console.error("Erro ao carregar batidas:", err);
      Swal.fire({
        icon: "error",
        title: "Erro ao buscar registros",
        text: "Tente novamente mais tarde.",
        confirmButtonColor: "#f44336",
      });
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Abrir modal de correção
  const abrirModal = (batida) => {
    setBatidaSelecionada(batida);
    setNovoHorario("");
    setMotivo("");
    setShowModal(true);
  };

  // 🔹 Enviar correção
  async function salvarCorrecao() {
    if (!novoHorario || !motivo) {
      Swal.fire({
        icon: "warning",
        title: "Preencha todos os campos",
        confirmButtonColor: "#00c9a7",
      });
      return;
    }

    try {
      await http.patch(`/batidas/${batidaSelecionada.id}`, {
        data_batida: novoHorario,
        descricao: motivo,
      });

      Swal.fire({
        icon: "success",
        title: "Batida corrigida com sucesso!",
        confirmButtonColor: "#00c9a7",
      });

      setShowModal(false);
      buscarBatidas(); // recarrega
    } catch (err) {
      console.error("Erro ao corrigir batida:", err);
      Swal.fire({
        icon: "error",
        title: "Erro ao salvar correção",
        confirmButtonColor: "#f44336",
      });
    }
  }

  return (
    <div className="container-fluid py-3 px-3">
      <h4 className="fw-bold mb-3 d-flex align-items-center">
        <Calendar size={22} className="me-2 text-primary" />
        Verificação de Folhas de Ponto
      </h4>

      {/* 🔹 Filtros */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <Row className="g-3 align-items-end">
            <Col md={2}>
              <Form.Label>Mês</Form.Label>
              <Form.Select
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("pt-BR", { month: "long" })}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label>Ano</Form.Label>
              <Form.Control
                type="number"
                value={ano}
                onChange={(e) => setAno(e.target.value)}
              />
            </Col>
            <Col md={5}>
              <Form.Label>Empregado</Form.Label>
              <Form.Select
                value={colaboradorSelecionado}
                onChange={(e) => setColaboradorSelecionado(e.target.value)}
              >
                <option value="">Selecione...</option>
                {colaboradores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} ({c.matricula})
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3} className="text-end">
              <Button variant="primary" className="px-4" onClick={buscarBatidas}>
                <Search size={18} className="me-2" /> Buscar
              </Button>
            </Col>
          </Row>
        </div>
      </div>

      {/* 🔹 Identificação */}
      {colaboradorSelecionado && (
        <div className="mb-3 fw-semibold text-secondary">
          {(() => {
            const c = colaboradores.find((x) => x.id === Number(colaboradorSelecionado));
            return c ? (
              <>
                <span className="text-dark">{c.nome}</span> • Matrícula{" "}
                <span className="text-primary">{c.matricula}</span>
              </>
            ) : null;
          })()}
        </div>
      )}

      {/* 🔹 Tabela */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Carregando registros...</p>
            </div>
          ) : batidas.length === 0 ? (
            <div className="text-center py-5 text-muted">
              Nenhum registro encontrado.
            </div>
          ) : (
            <Table hover responsive className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Entrada</th>
                  <th>Pausa</th>
                  <th>Retorno</th>
                  <th>Saída</th>
                  <th>Jornada</th>
                  <th>Apontamentos</th>
                  <th>Eventos</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {batidas.map((b) => {
                  const data = new Date(b.data_batida);
                  const dataFmt = data.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    weekday: "short",
                  });

                  return (
                    <tr key={b.id}>
                      <td>
                        {b.status === "erro" ? (
                          <AlertTriangle className="text-warning" />
                        ) : (
                          <CheckCircle2 className="text-success" />
                        )}
                      </td>
                      <td>{dataFmt}</td>
                      <td>{b.entrada || "--:--"}</td>
                      <td>{b.pausa || "--:--"}</td>
                      <td>{b.retorno || "--:--"}</td>
                      <td>{b.saida || "--:--"}</td>
                      <td>{b.jornada || "08:00"}</td>
                      <td>{b.apontamento || "H. Trabalhadas"}</td>
                      <td>
                        {b.evento === "folga" ? (
                          <span className="badge bg-danger">Folga</span>
                        ) : (
                          b.evento || "-"
                        )}
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => abrirModal(b)}
                        >
                          <Edit size={14} className="me-1" /> Corrigir
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </div>
      </div>

      {/* 🔹 Modal de correção */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Corrigir Batida</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Novo horário</Form.Label>
              <Form.Control
                type="datetime-local"
                value={novoHorario}
                onChange={(e) => setNovoHorario(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Motivo da correção</Form.Label>
              <Form.Select
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              >
                <option value="">Selecione...</option>
                <option value="Excesso de marcação">1 - Excesso de marcação</option>
                <option value="Esqueceu de bater ponto">2 - Esqueceu de bater ponto</option>
                <option value="Bateu ponto errado">3 - Bateu ponto errado</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={salvarCorrecao}>
            Salvar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Empregados;
