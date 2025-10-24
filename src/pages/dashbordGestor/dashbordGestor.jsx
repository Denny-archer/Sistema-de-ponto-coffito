import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  User, 
  MoreVertical 
} from "lucide-react";
import { http } from "../../services/http";
import { getSaldoDiario } from "../../services/batidas";
import useUser from "../../hooks/useUser";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

// 🔹 Helper para formatar data/hora
const formatarHora = (data) => {
  if (!data || data === "--:--") return "--:--";
  return new Date(data).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

function DashboardGestor() {
  const navigate = useNavigate();
  const { loadingUser } = useUser(); // apenas para manter consistência
  const [usuarios, setUsuarios] = useState([]);
  const [batidas, setBatidas] = useState([]);
  const [justificativasPendentes, setJustificativasPendentes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModalHistorico, setShowModalHistorico] = useState(false);
  const [batidasColab, setBatidasColab] = useState([]);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState(null);
  const [loadingHistorico, setLoadingHistorico] = useState(false);


  // 🔹 Carregar dados gerais do painel
 // 🔹 Carregar dados gerais do painel
useEffect(() => {
  async function carregarDados() {
    try {
      // Usuários
      const { data: dataUsuarios } = await http.get("/usuarios/?skip=0&sort=false");
      setUsuarios(dataUsuarios.usuarios || []);

      // Batidas
      const { data: dataBatidas } = await http.get("/batidas/?skip=0");
      setBatidas(dataBatidas.batidas || []);

      // Justificativas pendentes
      const { data: dataJust } = await http.get("/justificativas/?skip=0&sort=false");
      const pendentes = (dataJust.justificativas || []).filter(
        (j) => j.status === "Aguardando Validação"
      ).length;
      setJustificativasPendentes(pendentes);
      
       // 🔹 Buscar saldo diário de cada colaborador
        const hoje = new Date().toISOString().split("T")[0];

        const usuariosComSaldo = await Promise.all(
          (dataUsuarios.usuarios || []).map(async (u) => {
            try {
              const saldo = await getSaldoDiario(u.id, hoje);
              return {
                ...u,
                saldo_diario: saldo?.saldo_diario || "00:00",
                entrada: saldo?.entrada || null,
                saida: saldo?.saida || null,
                total_trabalhado: saldo?.total_trabalhado || "00:00",
              };
            } catch {
              return { ...u, saldo_diario: "00:00" };
            }
          })
        );

        setUsuarios(usuariosComSaldo);


      setLoading(false);
    } catch (err) {
      console.error("Erro ao carregar dados do dashboard:", err);
      setUsuarios([]);
      setBatidas([]);
      setJustificativasPendentes(0);
      setLoading(false);
    }
  }

  carregarDados();

  // 🔁 Atualiza automaticamente a cada 30 segundos
  const interval = setInterval(carregarDados, 30000);
  return () => clearInterval(interval);
}, []);


  // 🔹 Determinar status
  const getStatus = (batidasUsuario) => {
  if (!batidasUsuario.length) return "ausente";

  // Normaliza as descrições
  const descricoes = batidasUsuario.map((b) => b.descricao?.toLowerCase());

  // Contagem de eventos
  const qtd = descricoes.length;
  const ultima = descricoes[qtd - 1];

  // 1️⃣ Só tem ENTRADA → ainda está TRABALHANDO
  if (qtd === 1 && ultima.includes("entrada")) return "trabalhando";

  // 2️⃣ Saiu para ALMOÇO (tem entrada e almoço, mas não voltou ainda)
  if (descricoes.includes("entrada") && ultima.includes("almoco")) return "almoco";

  // 3️⃣ Voltou do almoço → Trabalhando novamente
  if (
    descricoes.filter((d) => d.includes("entrada")).length >= 2 &&
    !ultima.includes("saida")
  )
    return "trabalhando";

  // 4️⃣ Finalizou o expediente (tem uma saída final registrada)
  if (ultima.includes("saida") && qtd >= 3) return "finalizado";

  // fallback
  return "trabalhando";
};

// 🔹 Carregar histórico de batidas de um colaborador
const abrirHistorico = async (colaborador) => {
  setShowModalHistorico(true);
  setColaboradorSelecionado(colaborador);
  setLoadingHistorico(true);

  try {
    const { data } = await http.get(`/batidas/?id_usuario=${colaborador.id}`);
    // Ordena mais recentes primeiro
    const batidasOrdenadas = (data.batidas || []).sort(
      (a, b) => new Date(b.data_batida) - new Date(a.data_batida)
    );
    setBatidasColab(batidasOrdenadas);
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
    setBatidasColab([]);
  } finally {
    setLoadingHistorico(false);
  }
};


  // 🔹 Montar colaboradores
  const colaboradoresHoje = usuarios.map((u) => {
  const bUser = batidas.filter((b) => b.id_usuario === u.id);

  return {
    id: u.id,
    nome: u.nome,
    departamento: u.departamento || "Não informado",
    entrada: formatarHora(u.entrada),
    saidaAlmoco: formatarHora(
      bUser.find((b) => b.descricao?.toLowerCase().includes("almoco"))?.data_batida
    ),
    saida: formatarHora(u.saida),
    horasExtras: u.saldo_diario || "00:00",
    status: getStatus(bUser),
  };
});


  // 🔹 KPIs
  const totalUsuarios = usuarios.length;
  const ativosHoje = colaboradoresHoje.filter((c) => c.status !== "ausente").length;
  const naoRegistraram = totalUsuarios - ativosHoje;
  const horasExtrasHoje = colaboradoresHoje.filter((c) => c.horasExtras !== "00:00").length;

  const COLORS = ["#4caf50", "#ff9800", "#2196f3", "#f44336"];
  const chartData = [
    { name: "Trabalhando", value: colaboradoresHoje.filter(c => c.status === "trabalhando").length },
    { name: "Almoço", value: colaboradoresHoje.filter(c => c.status === "almoco").length },
    { name: "Finalizado", value: colaboradoresHoje.filter(c => c.status === "finalizado").length },
    { name: "Ausente", value: colaboradoresHoje.filter(c => c.status === "ausente").length },
  ];

  if (loading || loadingUser) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container p-3">
      <main className="main-content">
        {/* KPIs */}
        <section className="mb-4">
          <h2 className="h5 mb-3">Visão Geral - Hoje</h2>
          <div className="row g-3">
            <div className="col-6 col-md-3">
              <div className="card border-success shadow-sm h-100">
                <div className="card-body text-center">
                  <CheckCircle size={28} className="text-success mb-2" />
                  <h3 className="fw-bold mb-0">{ativosHoje}/{totalUsuarios}</h3>
                  <small className="text-muted">Colaboradores ativos</small>
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="card border-danger shadow-sm h-100">
                <div className="card-body text-center">
                  <XCircle size={28} className="text-danger mb-2" />
                  <h3 className="fw-bold mb-0">{naoRegistraram}/{totalUsuarios}</h3>
                  <small className="text-muted">Não registraram ponto</small>
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="card border-warning shadow-sm h-100">
                <div className="card-body text-center">
                  <Clock size={28} className="text-warning mb-2" />
                  <h3 className="fw-bold mb-0">{horasExtrasHoje}</h3>
                  <small className="text-muted">Com horas extras</small>
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div 
                className="card border-info shadow-sm h-100 card-hover" 
                role="button"
                onClick={() => navigate("/gestor/justificativas")}
              >
                <div className="card-body text-center">
                  <FileText size={28} className="text-info mb-2" />
                  <h3 className="fw-bold mb-0">{justificativasPendentes}</h3>
                  <small className="text-muted">Justificativas pendentes</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gráfico de Presença */}
        <section className="content-grid">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Distribuição de Presença</h5>
              <button className="btn btn-sm btn-light">
                <MoreVertical size={16} />
              </button>
            </div>
            <div className="card-body">
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" outerRadius={110} dataKey="value">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ payload }) => {
                        if (!payload || !payload.length) return null;
                        const { name, value } = payload[0];
                        const perc = ((value / totalUsuarios) * 100).toFixed(0);
                        return (
                          <div className="card shadow-sm p-2 bg-white border-0">
                            <strong>{name}</strong>
                            <div>{value} colaboradores</div>
                            <small className="text-muted">{perc}% do total</small>
                          </div>
                        );
                      }}
                    />
                    <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: "10px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* Tabela */}
        <section className="table-section mt-4">
          <div className="card">
            <div className="card-header">
              <h3>Colaboradores - Hoje</h3>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Departamento</th>
                      <th>Entrada</th>
                      
                      <th>Saída</th>
                      <th>Horas Extras</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colaboradoresHoje.map((colab) => (
                      <tr key={colab.id}>
                        <td>
                          <div className="user-cell d-flex align-items-center gap-2">
                            <User size={14} />
                            {colab.nome}
                          </div>
                        </td>

                        <td>{colab.departamento}</td>

                        {/* ENTRADA */}
                        <td>
                          {colab.entrada && colab.entrada !== "--:--" ? (
                            colab.entrada
                          ) : (
                            <span className="text-muted d-flex align-items-center gap-1">
                              <Clock size={14} /> ⏳
                            </span>
                          )}
                        </td>

                        

                        {/* SAÍDA */}
                        <td>
                          {colab.saida && colab.saida !== "--:--" ? (
                            colab.saida
                          ) : (
                            <span className="text-muted d-flex align-items-center gap-1">
                              <Clock size={14} /> ⏳
                            </span>
                          )}
                        </td>

                        {/* HORAS EXTRAS */}
                        <td
                          className={`fw-semibold ${
                            colab.horasExtras.startsWith("-")
                              ? "text-danger"
                              : colab.horasExtras !== "00:00"
                              ? "text-success"
                              : "text-muted"
                          }`}
                        >
                          {colab.horasExtras}
                        </td>

                        {/* STATUS */}
                        <td>
                          <span
                            className={`badge ${
                              colab.status === "trabalhando"
                                ? "bg-success"
                                : colab.status === "finalizado"
                                ? "bg-info"
                                : "bg-danger"
                            }`}
                          >
                            {colab.status.charAt(0).toUpperCase() + colab.status.slice(1)}
                          </span>
                        </td>

                        {/* AÇÕES */}
                        <td>
                          <button
                            className="btn btn-outline-dark btn-sm"
                            onClick={() => abrirHistorico(colab)}
                          >
                            Histórico
                          </button>

                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>
          </div>
        </section>
         {/* 🔹 Modal de Histórico de Batidas */}
          {showModalHistorico && (
            <div
              className="modal fade show d-block"
              tabIndex="-1"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content shadow border-0">
                  {/* HEADER */}
                  <div className="modal-header bg-light border-bottom">
                    <div>
                      <h5 className="modal-title fw-bold mb-1">
                        Histórico de Batidas
                      </h5>
                      <small className="text-muted">
                        {colaboradorSelecionado?.nome} —{" "}
                        <span className="text-primary">{colaboradorSelecionado?.departamento}</span>
                      </small>
                    </div>
                    <button
                      className="btn-close"
                      onClick={() => setShowModalHistorico(false)}
                    />
                  </div>

                  {/* FILTRO DE DATA */}
                  <div className="px-4 pt-3 pb-0">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <label className="form-label small text-muted mb-1">
                          Filtrar por data
                        </label>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          max={new Date().toISOString().split("T")[0]}
                          onChange={async (e) => {
                            const data = e.target.value;
                            if (!data) return;
                            setLoadingHistorico(true);
                            try {
                              const { data: resp } = await http.get(
                                `/batidas/?id_usuario=${colaboradorSelecionado.id}&data=${data}`
                              );
                              setBatidasColab(resp.batidas || []);
                            } finally {
                              setLoadingHistorico(false);
                            }
                          }}
                        />
                      </div>
                      <small className="text-muted">
                        Total de registros:{" "}
                        <strong>{batidasColab.length}</strong>
                      </small>
                    </div>
                  </div>

                  {/* BODY */}
                  <div className="modal-body pt-0">
                    {loadingHistorico ? (
                      <div className="text-center py-4">
                        <div className="spinner-border text-primary" />
                        <p className="text-muted mt-2 mb-0">Carregando histórico...</p>
                      </div>
                    ) : batidasColab.length === 0 ? (
                      <div className="text-center py-4 text-muted">
                        Nenhuma batida registrada nesta data.
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm align-middle mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Data</th>
                              <th>Hora</th>
                              <th>Tipo</th>
                              <th className="text-end">Origem</th>
                            </tr>
                          </thead>
                          <tbody>
                            {batidasColab.map((b) => {
                              const dataObj = new Date(b.data_batida);
                              const data = dataObj.toLocaleDateString("pt-BR");
                              const hora = dataObj.toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              });
                              const desc = b.descricao?.toLowerCase();

                              return (
                                <tr key={b.id}>
                                  <td>{data}</td>
                                  <td className="fw-semibold">{hora}</td>
                                  <td>
                                    <span
                                      className={`badge px-3 py-2 rounded-pill text-capitalize ${
                                        desc.includes("entrada")
                                          ? "bg-success bg-opacity-10 text-success"
                                          : desc.includes("almoco")
                                          ? "bg-warning bg-opacity-25 text-warning"
                                          : desc.includes("saida")
                                          ? "bg-info bg-opacity-25 text-info"
                                          : "bg-secondary bg-opacity-25 text-muted"
                                      }`}
                                    >
                                      {b.descricao}
                                    </span>
                                  </td>
                                  <td className="text-end text-muted small">
                                    {b.origem || "Terminal Local"}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* FOOTER */}
                  <div className="modal-footer bg-light border-top">
                    <div className="me-auto text-muted small">
                      Última atualização:{" "}
                      {new Date().toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setShowModalHistorico(false)}
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

      </main>
    </div>
  );
}

export default DashboardGestor;
