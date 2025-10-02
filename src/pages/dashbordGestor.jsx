import React, { useEffect, useState } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  User, 
  MoreVertical 
} from "lucide-react";
import { http } from "../services/http";

// 🔹 Importando Recharts
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

function DashboardGestor() {
  const [usuarios, setUsuarios] = useState([]);
  const [batidas, setBatidas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const { data: dataUsuarios } = await http.get("/usuarios/?skip=0&sort=false");
        setUsuarios(dataUsuarios.usuarios || []);

        const { data: dataBatidas } = await http.get("/batidas/?skip=0");
        setBatidas(dataBatidas.batidas || []);

        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
        setUsuarios([]);
        setBatidas([]);
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  // 🔹 Determinar status
  const getStatus = (batidasUsuario) => {
    if (!batidasUsuario.length) return "ausente";
    const ultima = batidasUsuario[batidasUsuario.length - 1];
    if (ultima.descricao?.toLowerCase().includes("entrada")) return "trabalhando";
    if (ultima.descricao?.toLowerCase().includes("almoco")) return "almoco";
    if (ultima.descricao?.toLowerCase().includes("saida")) return "finalizado";
    return "trabalhando";
  };

  // 🔹 Montar colaboradores
  const colaboradoresHoje = usuarios.map((u) => {
    const bUser = batidas.filter((b) => b.id_usuario === u.id);
    const entrada = bUser.find((b) => b.descricao?.toLowerCase().includes("entrada"))?.data_batida || "--:--";
    const almoco = bUser.find((b) => b.descricao?.toLowerCase().includes("almoco"))?.data_batida || "--:--";
    const saida = bUser.find((b) => b.descricao?.toLowerCase().includes("saida"))?.data_batida || "--:--";

    return {
      id: u.id,
      nome: u.nome,
      departamento: u.departamento || "Não informado",
      entrada,
      saidaAlmoco: almoco,
      saida,
      horasExtras: "00:00",
      status: getStatus(bUser),
    };
  });

  // 🔹 KPIs
  const totalUsuarios = usuarios.length;
  const ativosHoje = colaboradoresHoje.filter((c) => c.status !== "ausente").length;
  const naoRegistraram = totalUsuarios - ativosHoje;
  const horasExtrasHoje = colaboradoresHoje.filter((c) => c.horasExtras !== "00:00").length;

  const kpis = [
    { value: ativosHoje, total: totalUsuarios, variant: "success", icon: <CheckCircle size={24} />, description: "Colaboradores ativos hoje" },
    { value: naoRegistraram, total: totalUsuarios, variant: "danger", icon: <XCircle size={24} />, description: "Não registraram ponto" },
    { value: horasExtrasHoje, variant: "warning", icon: <Clock size={24} />, description: "Com horas extras hoje" },
    { value: 0, variant: "info", icon: <FileText size={24} />, description: "Justificativas pendentes" },
  ];

  // 🔹 Badge
  const getStatusBadge = (status) => {
    const config = {
      trabalhando: { class: "bg-success", text: "Trabalhando" },
      ausente: { class: "bg-danger", text: "Ausente" },
      finalizado: { class: "bg-info", text: "Finalizado" },
      almoco: { class: "bg-warning", text: "Almoço" },
    };
    const cfg = config[status] || config.ausente;
    return <span className={`badge ${cfg.class}`}>{cfg.text}</span>;
  };

  // 🔹 Dados para o gráfico
  const chartData = [
    { name: "Trabalhando", value: colaboradoresHoje.filter(c => c.status === "trabalhando").length },
    { name: "Almoço", value: colaboradoresHoje.filter(c => c.status === "almoco").length },
    { name: "Finalizado", value: colaboradoresHoje.filter(c => c.status === "finalizado").length },
    { name: "Ausente", value: colaboradoresHoje.filter(c => c.status === "ausente").length },
  ];
  const COLORS = ["#4caf50", "#ff9800", "#2196f3", "#f44336"];

  if (loading) return <div className="p-4">Carregando dados...</div>;

  return (
    <div className="dashboard-container">
      <main className="main-content">
        {/* KPIs */}
        <section className="kpis-section">
          <div className="section-header">
            <h2>Visão Geral - Hoje</h2>
          </div>
          <div className="kpis-grid">
            {kpis.map((kpi, idx) => (
              <div key={idx} className={`kpi-card kpi-${kpi.variant}`}>
                <div className="kpi-icon">{kpi.icon}</div>
                <div className="kpi-content">
                  <div className="kpi-value">
                    {kpi.value}{kpi.total && <span>/{kpi.total}</span>}
                  </div>
                  <div className="kpi-description">{kpi.description}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Gráfico de Presença */}
        <section className="content-grid">
          <div className="chart-card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3>Distribuição de Presença</h3>
              <button className="icon-btn"><MoreVertical size={16} /></button>
            </div>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Tabela */}
        <section className="table-section">
          <div className="card">
            <div className="card-header ">
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
                      <th>Almoço</th>
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
                        <td>{colab.entrada}</td>
                        <td>{colab.saidaAlmoco}</td>
                        <td>{colab.saida}</td>
                        <td className={colab.horasExtras !== "00:00" ? "text-warning fw-bold" : "text-muted"}>
                          {colab.horasExtras}
                        </td>
                        <td>{getStatusBadge(colab.status)}</td>
                        <td><button className="btn btn-outline-dark btn-sm">Histórico</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DashboardGestor;
