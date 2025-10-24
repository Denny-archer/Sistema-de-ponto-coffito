// src/pages/gestor/Empregados.jsx
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Search,
  Edit,
  CheckCircle2,
  AlertTriangle,
  Clock, // 👈 adicionar
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
  const [linhas, setLinhas] = useState([]); // 👈 adaptado
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [batidaSelecionada, setBatidaSelecionada] = useState(null);
  const [novoHorario, setNovoHorario] = useState("");
  const [motivo, setMotivo] = useState("");
  const [infoAuditoria, setInfoAuditoria] = useState("");
  const [tipoBatida, setTipoBatida] = useState("");



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

      // 🔸 Aqui transformamos as batidas antes de exibir
      const batidasTratadas = agruparBatidasPorDia(res.data.batidas || []);
      setLinhas(batidasTratadas);
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

  
  // 🔹 Agrupa e formata batidas por dia (nova lógica sequencial)
 // 🔹 Agrupa e formata batidas por dia (sequência fixa)
function agruparBatidasPorDia(batidas) {
  const agrupadas = {};

  batidas.forEach((b) => {
    const data = new Date(b.data_batida).toLocaleDateString("pt-BR");
    if (!agrupadas[data]) agrupadas[data] = [];
    agrupadas[data].push(b);
  });

  return Object.entries(agrupadas).map(([data, registros]) => {
    // Ordena por hora
    registros.sort((a, b) => new Date(a.data_batida) - new Date(b.data_batida));

    // Mapeia pela ordem
    const entrada1 = registros[0]
      ? formatarHora(registros[0].data_batida)
      : "--:--";
    const saida1 = registros[1]
      ? formatarHora(registros[1].data_batida)
      : "--:--";
    const entrada2 = registros[2]
      ? formatarHora(registros[2].data_batida)
      : "--:--";
    const saida2 = registros[3]
      ? formatarHora(registros[3].data_batida)
      : "--:--";

    // Demais batidas que excedem 4 são tratadas como eventos extras
    const eventosExtras =
      registros.length > 4
        ? registros.slice(4).map((r) => r.descricao)
        : registros
            .filter(
              (r) =>
                r.descricao &&
                !["entrada", "saida"].some((kw) =>
                  r.descricao.toLowerCase().includes(kw)
                )
            )
            .map((r) => r.descricao);

    // Cálculo opcional de jornada (diferença entre primeira e última)
    const jornada =
      registros.length >= 2
        ? calcularJornada(
            registros[0].data_batida,
            registros[registros.length - 1].data_batida
          )
        : "08:00";

    return {
      id: registros[0].id,
      data,
      entrada: entrada1,
      pausa: saida1,
      retorno: entrada2,
      saida: saida2,
      jornada,
      apontamento: "H. Trabalhadas",
      eventos: eventosExtras,
    };
  });
}

// 🔹 Formata hora
function formatarHora(data) {
  return new Date(data).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 🔹 Calcula jornada
function calcularJornada(inicio, fim) {
  const diff = Math.abs(new Date(fim) - new Date(inicio));
  const horas = Math.floor(diff / (1000 * 60 * 60));
  const minutos = Math.floor((diff / (1000 * 60)) % 60);
  return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
}


// 🔹 Formatar hora
function formatarHora(data) {
  return new Date(data).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}


  function formatarHora(data) {
    return new Date(data).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // 🔹 Abrir modal de correção
  const abrirModal = (batida, tipoBatida) => {
  setBatidaSelecionada(batida);
  setTipoBatida(tipoBatida);

  // Hora atual ou vazia
  const horaAtual = batida[tipoBatida] && batida[tipoBatida] !== "--:--"
  ? batida[tipoBatida]
  : "";

  setNovoHorario(horaAtual);
  setMotivo("");
  setShowModal(true);
};



function BatidaCell({ tipo, hora, onCorrigir }) {
  const isVazia = hora === "--:--";
  return (
    <div
      className={`d-flex align-items-center justify-content-between px-2 py-1 rounded ${
        isVazia ? "bg-light text-muted" : "bg-white"
      }`}
      style={{
        border: "1px solid #eee",
        cursor: "pointer",
        transition: "0.2s",
      }}
      onClick={onCorrigir}
    >
      <span>{hora}</span>
      <Edit size={14} className="text-primary" />
    </div>
  );
}


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
    // Monta a data completa usando o dia selecionado
    const [dia, mes, ano] = batidaSelecionada.data.split("/");
    const dataOriginal = new Date(`${ano}-${mes}-${dia}T00:00:00`);
    const [hora, minuto] = novoHorario.split(":");
    dataOriginal.setHours(Number(hora));
    dataOriginal.setMinutes(Number(minuto));

    const dataFormatada = `${dataOriginal.getFullYear()}-${String(
      dataOriginal.getMonth() + 1
    ).padStart(2, "0")}-${String(dataOriginal.getDate()).padStart(
      2,
      "0"
    )} ${String(dataOriginal.getHours()).padStart(2, "0")}:${String(
      dataOriginal.getMinutes()
    ).padStart(2, "0")}:00`;

    const descricaoFinal = `${motivo} (${tipoBatida})`;

    const { data: resposta } = await http.put(`/batidas/${batidaSelecionada.id}`, {
      id: batidaSelecionada.id,
      data_batida: dataFormatada,
      descricao: descricaoFinal,
    });

    setInfoAuditoria(resposta.descricao);

    Swal.fire({
      icon: "success",
      title: "Batida atualizada com sucesso!",
      confirmButtonColor: "#00c9a7",
    });

    setShowModal(false);
    buscarBatidas();
  } catch (err) {
    console.error("Erro ao atualizar batida:", err);
    Swal.fire({
      icon: "error",
      title: "Erro ao atualizar batida",
      text: "Verifique a conexão e tente novamente.",
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
            const c = colaboradores.find(
              (x) => x.id === Number(colaboradorSelecionado)
            );
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
          ) : linhas.length === 0 ? (
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
                {linhas.map((linha, i) => (
                  <tr key={i}>
                    <td>
                      <CheckCircle2 className="text-success" />
                    </td>
                    <td>{linha.data}</td>

                    <td>
                      <BatidaCell
                        tipo="entrada"
                        hora={linha.entrada}
                        onCorrigir={() => abrirModal(linha, "entrada")}
                      />
                    </td>
                    <td>
                      <BatidaCell
                        tipo="pausa"
                        hora={linha.pausa}
                        onCorrigir={() => abrirModal(linha, "pausa")}
                      />
                    </td>
                    <td>
                      <BatidaCell
                        tipo="retorno"
                        hora={linha.retorno}
                        onCorrigir={() => abrirModal(linha, "retorno")}
                      />
                    </td>
                    <td>
                      <BatidaCell
                        tipo="saida"
                        hora={linha.saida}
                        onCorrigir={() => abrirModal(linha, "saida")}
                      />
                    </td>




                    <td>{linha.jornada}</td>
                    <td>{linha.apontamento}</td>
                    <td>
                      {linha.eventos.length > 0
                        ? linha.eventos.map((e, idx) => (
                            <span
                              key={idx}
                              className="badge bg-info bg-opacity-25 text-info me-1"
                            >
                              {e}
                            </span>
                          ))
                        : "-"}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => abrirModal(linha, "entrada")}
                      >
                        <Edit size={14} className="me-1" /> Corrigir dia
                      </Button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </div>

      {/* 🔹 Modal de correção */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Corrigir {tipoBatida ? tipoBatida.charAt(0).toUpperCase() + tipoBatida.slice(1) : "Batida"}
          </Modal.Title>

        </Modal.Header>
        <Modal.Body>
          <Form>
             <Form.Group className="mb-3">
              <Form.Label>Novo horário</Form.Label>
              <Form.Control
                type="time"
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
                <option value="Excesso de marcação">Excesso de marcação</option>
                <option value="Esqueceu de bater ponto">
                  Esqueceu de bater ponto
                </option>
                <option value="Bateu ponto errado">Bateu ponto errado</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
         {infoAuditoria && (
            <div className="mt-3 p-2 bg-light rounded border small text-muted">
              <Clock size={14} className="me-1 text-primary" />
              <span>{infoAuditoria}</span>
            </div>
          )}

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
