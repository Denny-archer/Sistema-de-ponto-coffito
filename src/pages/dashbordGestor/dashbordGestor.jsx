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

  const [usuarios, setUsuarios] = useState([]);
  const [batidas, setBatidas] = useState([]);
  const [justificativasPendentes, setJustificativasPendentes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const { data: dataUsuarios } = await http.get("/usuarios/?skip=0&sort=false");
        setUsuarios(dataUsuarios.usuarios || []);

        const { data: dataBatidas } = await http.get("/batidas/?skip=0");
        setBatidas(dataBatidas.batidas || []);

        const { data: dataJust } = await http.get("/justificativas?status=pendente");
        setJustificativasPendentes(dataJust?.total || dataJust?.length || 0);

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
    const entrada = formatarHora(
      bUser.find((b) => b.descricao?.toLowerCase().includes("entrada"))?.data_batida
    );
    const almoco = formatarHora(
      bUser.find((b) => b.descricao?.toLowerCase().includes("almoco"))?.data_batida
    );
    const saida = formatarHora(
      bUser.find((b) => b.descricao?.toLowerCase().includes("saida"))?.data_batida
    );

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

  // 🔹 Spinner de carregamento
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <main className="main-content">
        {/* KPIs */}
        <section className="mb-4">
  <h2 className="h5 mb-3">Visão Geral - Hoje</h2>
  <div className="row g-3">
    
    {/* Colaboradores ativos */}
    <div className="col-6 col-md-3">
      <div className="card border-success shadow-sm h-100">
        <div className="card-body text-center">
          <CheckCircle size={28} className="text-success mb-2" />
          <h3 className="fw-bold mb-0">{ativosHoje}/{totalUsuarios}</h3>
          <small className="text-muted">Colaboradores ativos</small>
        </div>
      </div>
    </div>

    {/* Não registraram ponto */}
    <div className="col-6 col-md-3">
      <div className="card border-danger shadow-sm h-100">
        <div className="card-body text-center">
          <XCircle size={28} className="text-danger mb-2" />
          <h3 className="fw-bold mb-0">{naoRegistraram}/{totalUsuarios}</h3>
          <small className="text-muted">Não registraram ponto</small>
        </div>
      </div>
    </div>

    {/* Com horas extras */}
    <div className="col-6 col-md-3">
      <div className="card border-warning shadow-sm h-100">
        <div className="card-body text-center">
          <Clock size={28} className="text-warning mb-2" />
          <h3 className="fw-bold mb-0">{horasExtrasHoje}</h3>
          <small className="text-muted">Com horas extras</small>
        </div>
      </div>
    </div>

   {/* Justificativas pendentes */}
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
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={110}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>

            {/* Tooltip mais amigável */}
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

            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: "10px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
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
                        <td>
                          <button className="btn btn-outline-dark btn-sm">Histórico</button>
                        </td>
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
