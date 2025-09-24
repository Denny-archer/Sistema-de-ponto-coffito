import React, { useEffect } from "react";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react"; // ícones
import "../styles/dashboardGestor.css";

function DashboardGestor() {
  // adiciona classe ao body apenas nesta página
  useEffect(() => {
    document.body.classList.add("dashboard-page");
    return () => document.body.classList.remove("dashboard-page");
  }, []);

  // Mock de dados (futuramente virá da API)
  const kpis = [
    { label: "Ativos", value: 12, className: "ativo", icon: <CheckCircle /> },
    { label: "Ausentes", value: 3, className: "ausente", icon: <XCircle /> },
    { label: "Extras", value: 5, className: "extra", icon: <Clock /> },
    { label: "Justificativas", value: 2, className: "pendente", icon: <FileText /> },
  ];

  const justificativas = [
    { nome: "João", motivo: "atraso 15min" },
    { nome: "Maria", motivo: "falta manhã" },
  ];

  const colaboradores = [
    { nome: "João", entrada: "08:05", saida: "12:00", status: "Trabalhando" },
    { nome: "Maria", entrada: "--:--", saida: "--:--", status: "Ausente" },
  ];

  return (
    <div className="dashboard-container container-fluid">
      {/* Cabeçalho */}
      <header className="dashboard-header d-flex justify-content-between align-items-center">
        <div className="logo">LOGO</div>
        <nav className="menu d-flex">
          <a href="#">Cadastros</a>
          <a href="#">Folha</a>
          <a href="#">Planejamento</a>
          <a href="#">Gestão</a>
          <a href="#">Admin</a>
          <a href="#">Sair</a>
        </nav>
      </header>

      {/* KPIs */}
      <section className="cards-kpi row g-3 mt-3">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-md-3">
            <div className={`card p-3 ${kpi.className}`}>
              <div className="d-flex flex-column align-items-center">
                <div className="mb-2">{kpi.icon}</div>
                <div>
                  {kpi.label}: {kpi.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Gráfico + Justificativas */}
      <section className="dashboard-main row g-3 mt-3">
        {/* Gráfico */}
        <div className="col-12 col-md-7">
          <div className="grafico card p-4 text-center">[ Gráfico Circular ]</div>
        </div>

        {/* Justificativas */}
        <div className="col-12 col-md-5">
          <div className="justificativas card p-3">
            <h5 className="mb-3">Justificativas Pendentes</h5>
            <ul className="list-unstyled">
              {justificativas.map((j, idx) => (
                <li
                  key={idx}
                  className="d-flex justify-content-between align-items-center mb-2"
                >
                  <span>
                    {j.nome} - {j.motivo}
                  </span>
                  <div>
                    <button className="btn btn-success btn-sm me-2">Aprovar</button>
                    <button className="btn btn-danger btn-sm">Rejeitar</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Tabela */}
      <section className="tabela mt-3">
        <h3>Colaboradores Hoje</h3>
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Entrada</th>
                <th>Saída</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {colaboradores.map((c, idx) => (
                <tr key={idx}>
                  <td>{c.nome}</td>
                  <td>{c.entrada}</td>
                  <td>{c.saida}</td>
                  <td>{c.status}</td>
                  <td>
                    <button className="btn btn-dark btn-sm">Histórico</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default DashboardGestor;
