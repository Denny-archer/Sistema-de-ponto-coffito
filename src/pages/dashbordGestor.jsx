// 📂 src/pages/DashboardGestor.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  User, 
  Download, 
  Filter, 
  MoreVertical, 
  BarChart3 
} from "lucide-react";

function DashboardGestor() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add("dashboard-page");
    return () => document.body.classList.remove("dashboard-page");
  }, []);

  // KPIs mockados
  const kpis = [
    {  value: 12, total: 15, variant: "success", icon: <CheckCircle size={24} />, change: "+2", description: "Colaboradores ativos hoje" },
    {  value: 3, total: 15, variant: "danger", icon: <XCircle size={24} />, change: "+1", description: "Não registraram ponto" },
    { label: "Horas Extras", value: 5, variant: "warning", icon: <Clock size={24} />, change: "-1", description: "Com horas extras hoje" },
    { label: "Justificativas", value: 2, variant: "info", icon: <FileText size={24} />, change: "+0", description: "Pendentes de análise" },
  ];

  const colaboradores = [
    { id: 1, nome: "João Silva", entrada: "08:05", saida: "12:00", saidaAlmoco: "13:00", status: "trabalhando", departamento: "TI", horasExtras: "00:30" },
    { id: 2, nome: "Maria Santos", entrada: "--:--", saida: "--:--", saidaAlmoco: "--:--", status: "ausente", departamento: "RH", horasExtras: "00:00" },
    { id: 3, nome: "Pedro Costa", entrada: "07:45", saida: "17:30", saidaAlmoco: "12:00", status: "finalizado", departamento: "Vendas", horasExtras: "01:15" },
    { id: 4, nome: "Ana Oliveira", entrada: "08:00", saida: "12:00", saidaAlmoco: "13:00", status: "almoco", departamento: "Marketing", horasExtras: "00:00" },
  ];

  const getStatusBadge = (status) => {
    const config = {
      trabalhando: { class: "bg-success", text: "Trabalhando" },
      ausente: { class: "bg-danger", text: "Ausente" },
      finalizado: { class: "bg-info", text: "Finalizado" },
      almoco: { class: "bg-warning", text: "Almoço" }
    };
    const cfg = config[status] || config.ausente;
    return <span className={`badge ${cfg.class}`}>{cfg.text}</span>;
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <Topbar setSidebarOpen={setSidebarOpen} />

        {/* KPIs Section */}
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
                  <div className="kpi-label">{kpi.label}</div>
                  <div className="kpi-description">{kpi.description}</div>
                </div>
                <div className={`kpi-change change-${kpi.change.startsWith('+') ? 'positive' : 'negative'}`}>
                  {kpi.change}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Charts and Justifications Section */}
        <section className="content-grid">
          {/* Gráfico */}
          <div className="chart-card">
            <div className="card-header">
              <h3>Distribuição de Presença</h3>
              <button className="icon-btn">
                <MoreVertical size={16} />
              </button>
            </div>
            <div className="chart-placeholder">
              <div className="chart-content">
                <BarChart3 size={48} className="text-muted" />
                <p>Gráfico de distribuição</p>
                <small className="text-muted">Visualização interativa dos dados</small>
              </div>
            </div>
          </div>

          {/* Justificativas */}
          <div className="justifications-card">
            <div className="card-header">
              <h3>Justificativas Pendentes</h3>
              <span className="badge bg-danger">2</span>
            </div>
            <div className="justifications-list">
              <div className="justification-item">
                <div className="justification-info">
                  <div className="user-name">João Silva</div>
                  <div className="justification-details">
                    <span>Atraso de 15min</span>
                    <span>25/09/2025</span>
                  </div>
                </div>
                <div className="justification-actions">
                  <button className="btn btn-success btn-sm">Aprovar</button>
                  <button className="btn btn-outline-danger btn-sm">Rejeitar</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabela de Colaboradores */}
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
                    {colaboradores.map((colab) => (
                      <tr key={colab.id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar-sm">
                              <User size={14} />
                            </div>
                            {colab.nome}
                          </div>
                        </td>
                        <td>{colab.departamento}</td>
                        <td>
                          <span className={colab.entrada === '--:--' ? 'text-muted' : 'text-success'}>
                            {colab.entrada}
                          </span>
                        </td>
                        <td>
                          <span className={colab.saidaAlmoco === '--:--' ? 'text-muted' : 'text-warning'}>
                            {colab.saidaAlmoco}
                          </span>
                        </td>
                        <td>
                          <span className={colab.saida === '--:--' ? 'text-muted' : 'text-info'}>
                            {colab.saida}
                          </span>
                        </td>
                        <td>
                          <span className={colab.horasExtras !== '00:00' ? 'text-warning fw-bold' : 'text-muted'}>
                            {colab.horasExtras}
                          </span>
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
