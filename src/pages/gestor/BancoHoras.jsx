import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Row,
  Col,
  Badge,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import {
  Clock,
  TrendingDown,
  TrendingUp,
  Calendar,
  Eye,
  Info,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { getSaldoMensal, criarCompensacao } from "../../services/bancoHoras";
import { http } from "../../services/http";
import {
  HHmmToMin,
  mmToHHmm,
  businessDaysInMonth,
} from "../../utils/time";
import useUser from "../../hooks/useUser";
import { useBankHealth } from "../../context/BankHealthContext";

/* ----------------------------------------------------------------
 * Helpers locais (mantêm o componente coeso e manutenível)
 * ---------------------------------------------------------------- */
const monthLabelFromYYYYMMDD = (yyyyMMdd) => {
  if (!yyyyMMdd) return "—";
  const [y, m] = yyyyMMdd.split("-").map((x) => parseInt(x, 10));
  const d = new Date(y, m - 1, 1);
  const mes = d.toLocaleString("pt-BR", { month: "long" });
  return `${mes} / ${y}`;
};

const StatusBadge = ({ saldoHHmm }) => {
  const min = HHmmToMin(saldoHHmm || "00:00");
  if (min > 0) return <Badge bg="success">Crédito</Badge>;
  if (min < 0) return <Badge bg="danger">Débito</Badge>;
  return <Badge bg="secondary">Zerado</Badge>;
};

const StatCard = ({ title, value, variant = "muted", danger = false }) => (
  <div className="card border-0 shadow-sm h-100">
    <div className="card-body d-flex flex-column justify-content-center text-center">
      <div className="text-muted small mb-1">{title}</div>
      <div
        className={`fw-bold fs-5 ${
          danger ? "text-danger" : variant === "success" ? "text-success" : variant === "primary" ? "text-primary" : "text-dark"
        }`}
      >
        {value ?? "—"}
      </div>
    </div>
  </div>
);

/* ----------------------------------------------------------------
 * Página
 * ---------------------------------------------------------------- */
export default function BancoHoras() {
  const { user } = useUser();
  const { setStatus } = useBankHealth();

  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [colaboradores, setColaboradores] = useState([]);
  const [idUsuario, setIdUsuario] = useState("");
  const [loading, setLoading] = useState(false);

  // dado principal (mês corrente) + tendências (3 meses anteriores)
  const [linha, setLinha] = useState(null);
  const [tendencias, setTendencias] = useState([]);

  // modais
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [showComp, setShowComp] = useState(false);

  // compensação
  const [minutosACompensar, setMinutosACompensar] = useState(0);
  const [minPorDia, setMinPorDia] = useState(30);
  const [plano, setPlano] = useState([]); // [{dataISO, minutos}]

  /* -------------------- carregar colaboradores -------------------- */
  useEffect(() => {
    (async () => {
      const { data } = await http.get("/usuarios/?skip=0&sort=false");
      setColaboradores(data.usuarios || []);
      if (data.usuarios?.length) setIdUsuario(String(data.usuarios[0].id));
    })();
  }, []);

  /* ------------------------ carregar dados ------------------------ */
  const carregar = useCallback(async () => {
    if (!idUsuario) return;
    setLoading(true);
    try {
      const saldo = await getSaldoMensal(Number(idUsuario), ano, mes);
      setLinha(saldo);

      // últimos 3 meses
      const prev = [];
      for (let i = 1; i <= 3; i++) {
        let m = mes - i;
        let y = ano;
        if (m < 1) {
          m += 12;
          y -= 1;
        }
        try {
          const d = await getSaldoMensal(Number(idUsuario), y, m);
          prev.push(d);
        } catch {
          // ignora lacunas
        }
      }
      setTendencias(prev);
    } finally {
      setLoading(false);
    }
  }, [idUsuario, ano, mes]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  /* ---------------------- projeção do mês ------------------------- */
  const projecao = useMemo(() => {
    if (!linha) return null;

    const minutosTrabalhados = HHmmToMin(linha.total_trabalhado_mes);
    const cargaMes = HHmmToMin(linha.carga_horaria_mes);

    const diasUteis = businessDaysInMonth(ano, mes);
    const hoje = new Date();
    const isSameMonth =
      hoje.getFullYear() === ano && hoje.getMonth() + 1 === mes;
    const diasPassados = isSameMonth ? Math.max(1, hoje.getDate()) : 1;

    const mediaDia = Math.floor(minutosTrabalhados / diasPassados);
    const trabalhadoProjetado = mediaDia * diasUteis;
    const saldoProj = trabalhadoProjetado - cargaMes;

    return {
      mediaDia: mmToHHmm(mediaDia),
      trabalhadoProjetado: mmToHHmm(trabalhadoProjetado),
      saldoProjetado: mmToHHmm(saldoProj),
      saldoProjetadoMin: saldoProj,
    };
  }, [linha, ano, mes]);

  /* --------------------- status -> sidebar badge ------------------ */
  useEffect(() => {
    if (!linha) return;
    const saldoMin = HHmmToMin(linha.saldo_mensal);
    setStatus(saldoMin > 0 ? "credito" : saldoMin < 0 ? "debito" : null);
  }, [linha, setStatus]);

  /* ---------------------------- ações ----------------------------- */
  const abrirDetalhes = () => setShowDetalhes(true);
  const fecharDetalhes = () => setShowDetalhes(false);

  const abrirCompensacao = () => {
    if (!linha) return;
    const saldoMin = HHmmToMin(linha.saldo_mensal);
    const falta = saldoMin < 0 ? Math.abs(saldoMin) : 0;
    setMinutosACompensar(falta);
    setMinPorDia(30);
    setPlano([]);
    setShowComp(true);
  };

  const gerarPlano = () => {
    const minutos = Math.max(0, minutosACompensar);
    const porDia = Math.max(1, minPorDia);
    const diasNec = Math.ceil(minutos / porDia);

    const items = [];
    const start = new Date(); // a partir de amanhã (projeção realista)
    let rest = minutos;
    let d = new Date(start);

    while (items.length < diasNec) {
      d.setDate(d.getDate() + 1);
      const day = d.getDay();
      if (day === 0 || day === 6) continue; // pula fins de semana
      const lote = Math.min(porDia, rest);

      // define 18:00 como horário amigável
      const dateISO = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        18,
        0,
        0
      )
        .toISOString()
        .slice(0, 19); // yyyy-mm-ddThh:mm:ss

      items.push({ dataISO: dateISO, minutos: lote });
      rest -= lote;
      if (rest <= 0) break;
    }
    setPlano(items);
  };

  const confirmarPlano = async () => {
    try {
      for (const p of plano) {
        await criarCompensacao({
          id_usuario: Number(idUsuario),
          dataISO: p.dataISO,
          minutos: p.minutos,
        });
      }
      setShowComp(false);
      await carregar();
    } catch (e) {
      console.error(e);
      alert("Falha ao criar compensações.");
    }
  };

  /* ------------------------ dados de tendência -------------------- */
  const trendData = useMemo(() => {
    // ordem temporal reversa (mais antigo -> mais novo)
    const arr = [...tendencias].reverse();
    return arr.map((t, idx) => ({
      idx,
      mes: monthLabelFromYYYYMMDD(t?.mes),
      saldoMin: HHmmToMin(t?.saldo_mensal || "00:00"),
      saldoHH: t?.saldo_mensal || "00:00",
    }));
  }, [tendencias]);

  /* ----------------------------------------------------------------
   * UI
   * ---------------------------------------------------------------- */
  return (
    <div className="container-fluid py-3">
      {/* header */}
      <div className="d-flex align-items-center gap-2 mb-1">
        <div className="p-2 rounded-circle bg-primary bg-opacity-10">
          <Clock className="text-primary" size={20} />
        </div>
        <h4 className="mb-0 fw-bold text-dark">Controle de Banco de Horas</h4>
      </div>
      <p className="text-muted small mb-3">
        Visualize, projete e planeje compensações de horas trabalhadas.
      </p>

      {/* filtros */}
      <div className="card mb-3">
        <div className="card-body">
          <Row className="g-3">
            <Col md={3}>
              <Form.Label>Mês</Form.Label>
              <Form.Select
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option value={i + 1} key={i}>
                    {new Date(0, i).toLocaleString("pt-BR", {
                      month: "long",
                    })}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label>Ano</Form.Label>
              <Form.Control
                type="number"
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
              />
            </Col>
            <Col md={4}>
              <Form.Label>Colaborador</Form.Label>
              <Form.Select
                value={idUsuario}
                onChange={(e) => setIdUsuario(e.target.value)}
              >
                {colaboradores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} ({c.matricula || c.id})
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button onClick={carregar} className="w-100">
                Buscar
              </Button>
            </Col>
          </Row>
        </div>
      </div>

      {/* cards resumo */}
      {linha && (
        <Row className="g-3 mb-3">
          <Col md={4}>
            <StatCard
              title="Saldo Atual"
              value={linha.saldo_mensal}
              danger={HHmmToMin(linha.saldo_mensal) < 0}
              variant={HHmmToMin(linha.saldo_mensal) > 0 ? "success" : ""}
            />
          </Col>
          <Col md={4}>
            <StatCard
              title="Projeção do Mês"
              value={projecao?.saldoProjetado ?? "—"}
              danger={(projecao?.saldoProjetadoMin ?? 0) < 0}
              variant={(projecao?.saldoProjetadoMin ?? 0) > 0 ? "success" : ""}
            />
          </Col>
          <Col md={4}>
            <StatCard
              title="Média por Dia Útil"
              value={projecao?.mediaDia ?? "—"}
              variant="primary"
            />
          </Col>
        </Row>
      )}

      {/* tabela */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="py-5 text-center">
              <Spinner />
            </div>
          ) : !linha ? (
            <div className="p-4 text-center text-muted">
              Selecione um colaborador e clique em <strong>Buscar</strong>.
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Colaborador</th>
                  <th>Mês</th>
                  <th title="Horas trabalhadas acumuladas no mês">
                    Horas Trabalhadas{" "}
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip>
                          Total registrado até o momento no mês.
                        </Tooltip>
                      }
                    >
                      <Info size={14} className="text-muted" />
                    </OverlayTrigger>
                  </th>
                  <th title="Carga horária prevista para o mês">
                    Carga Horária{" "}
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip>
                          Horas esperadas conforme jornada contratual.
                        </Tooltip>
                      }
                    >
                      <Info size={14} className="text-muted" />
                    </OverlayTrigger>
                  </th>
                  <th title="Saldo = Trabalhadas - Carga prevista">
                    Saldo Mensal{" "}
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip>
                          Saldo positivo = crédito. Saldo negativo = débito.
                        </Tooltip>
                      }
                    >
                      <Info size={14} className="text-muted" />
                    </OverlayTrigger>
                  </th>
                  <th>Status</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{linha.nome}</td>
                  <td>{monthLabelFromYYYYMMDD(linha.mes)}</td>
                  <td>{linha.total_trabalhado_mes}</td>
                  <td>{linha.carga_horaria_mes}</td>
                  <td
                    className={
                      HHmmToMin(linha.saldo_mensal) < 0
                        ? "text-danger"
                        : "text-success"
                    }
                  >
                    {linha.saldo_mensal}
                  </td>
                  <td>
                    <StatusBadge saldoHHmm={linha.saldo_mensal} />
                  </td>
                  <td className="text-end">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      className="me-2"
                      onClick={abrirDetalhes}
                    >
                      <Eye size={14} className="me-1" /> Detalhes
                    </Button>
                    {HHmmToMin(linha.saldo_mensal) < 0 && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={abrirCompensacao}
                      >
                        Planejar compensação
                      </Button>
                    )}
                  </td>
                </tr>
              </tbody>
            </Table>
          )}
        </div>
      </div>

      {/* modal detalhes */}
      <Modal show={showDetalhes} onHide={fecharDetalhes} centered>
        {linha && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Detalhes do Saldo — {linha.nome}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="mb-3">
                <div>
                  <strong>Mês:</strong> {monthLabelFromYYYYMMDD(linha.mes)}
                </div>
                <div>
                  <strong>Total trabalhado:</strong> {linha.total_trabalhado_mes}
                </div>
                <div>
                  <strong>Carga horária prevista:</strong>{" "}
                  {linha.carga_horaria_mes}
                </div>
                <div>
                  <strong>Saldo atual:</strong>{" "}
                  <span
                    className={
                      HHmmToMin(linha.saldo_mensal) < 0
                        ? "text-danger"
                        : "text-success"
                    }
                  >
                    {linha.saldo_mensal}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded border bg-light bg-opacity-50 mb-3">
                <h6 className="mb-2">Projeção do mês</h6>
                {projecao ? (
                  <ul className="list-unstyled mb-0">
                    <li>
                      <Clock size={14} className="me-1 text-muted" />
                      Média/dia: <strong>{projecao.mediaDia}</strong>
                    </li>
                    <li>
                      <Calendar size={14} className="me-1 text-muted" />
                      Trabalhado projetado:{" "}
                      <strong>{projecao.trabalhadoProjetado}</strong>
                    </li>
                    <li>
                      {projecao.saldoProjetadoMin < 0 ? (
                        <TrendingDown
                          size={14}
                          className="me-1 text-danger"
                        />
                      ) : (
                        <TrendingUp size={14} className="me-1 text-success" />
                      )}
                      Saldo projetado:{" "}
                      <strong
                        className={
                          projecao.saldoProjetadoMin < 0
                            ? "text-danger"
                            : "text-success"
                        }
                      >
                        {projecao.saldoProjetado}
                      </strong>
                    </li>
                  </ul>
                ) : (
                  <div className="text-muted">Sem dados de projeção.</div>
                )}
              </div>

              <h6 className="mb-2">Tendência (3 meses anteriores)</h6>
              {trendData.length === 0 ? (
                <div className="text-muted">Sem histórico suficiente.</div>
              ) : (
                <div style={{ width: "100%", height: 180 }}>
                  <ResponsiveContainer>
                    <LineChart data={trendData}>
                      <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(v) => mmToHHmm(v)}
                      />
                      <RTooltip
                        formatter={(v) => [mmToHHmm(v), "Saldo"]}
                        labelFormatter={(l) => `Mês: ${l}`}
                      />
                      <ReferenceLine y={0} stroke="#adb5bd" />
                      <Line
                        type="monotone"
                        dataKey="saldoMin"
                        stroke="#0d6efd"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={fecharDetalhes}>
                Fechar
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      {/* modal compensação */}
      <Modal show={showComp} onHide={() => setShowComp(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Planejar Compensação</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <strong>Débito atual:</strong>{" "}
            <span className="text-danger">{linha?.saldo_mensal}</span>
          </div>
          <Row className="g-3 align-items-end">
            <Col md={6}>
              <Form.Label>Minutos a compensar</Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={minutosACompensar}
                onChange={(e) => setMinutosACompensar(Number(e.target.value))}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Minutos por dia útil</Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={minPorDia}
                onChange={(e) => setMinPorDia(Number(e.target.value))}
              />
            </Col>
          </Row>

          <div className="mt-3">
            <Button size="sm" variant="outline-primary" onClick={gerarPlano}>
              Gerar plano
            </Button>
          </div>

          {plano.length > 0 && (
            <div className="mt-3">
              <h6>Plano sugerido</h6>
              <Table size="sm" className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Data</th>
                    <th>Horário</th>
                    <th>Minutos</th>
                  </tr>
                </thead>
                <tbody>
                  {plano.map((p, i) => {
                    const d = new Date(p.dataISO);
                    return (
                      <tr key={i}>
                        <td>{d.toLocaleDateString("pt-BR")}</td>
                        <td>
                          {d.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td>{p.minutos}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowComp(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            disabled={plano.length === 0}
            onClick={confirmarPlano}
          >
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
