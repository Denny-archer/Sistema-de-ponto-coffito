import React, { useEffect } from "react";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";

function DashboardGestor() {
  // adiciona classe ao body apenas nesta página
  useEffect(() => {
    document.body.classList.add("dashboard-page");
    return () => document.body.classList.remove("dashboard-page");
  }, []);

  // Mock de dados
  const kpis = [
    { label: "Ativos", value: 12, variant: "success", icon: <CheckCircle size={20} /> },
    { label: "Ausentes", value: 3, variant: "danger", icon: <XCircle size={20} /> },
    { label: "Extras", value: 5, variant: "warning", icon: <Clock size={20} /> },
    { label: "Justificativas", value: 2, variant: "info", icon: <FileText size={20} /> },
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
    <div className="container my-4">
      {/* Cabeçalho */}
      <header className="d-flex justify-content-between align-items-center p-3 bg-dark text-white rounded shadow-sm">
        <div className="fw-bold">LOGO</div>
        <nav className="d-flex gap-3">
          <a href="#" className="text-white text-decoration-none">Cadastros</a>
          <a href="#" className="text-white text-decoration-none">Folha</a>
          <a href="#" className="text-white text-decoration-none">Planejamento</a>
          <a href="#" className="text-white text-decoration-none">Gestão</a>
          <a href="#" className="text-white text-decoration-none">Admin</a>
          <a href="#" className="text-white text-decoration-none">Sair</a>
        </nav>
      </header>

      {/* KPIs */}
      <section className="row g-3 mt-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-md-3">
            <div className={`card text-white bg-${kpi.variant} shadow-sm`}>
              <div className="card-body d-flex flex-column align-items-center">
                <div className="mb-2">{kpi.icon}</div>
                <h6 className="card-title">{kpi.label}</h6>
                <p className="card-text fs-5 fw-bold">{kpi.value}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Gráfico + Justificativas */}
      <section className="row g-3 mt-4">
        {/* Gráfico */}
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm text-center p-5">
            [ Gráfico Circular ]
          </div>
        </div>

        {/* Justificativas */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Justificativas Pendentes</h5>
              <ul className="list-group list-group-flush">
                {justificativas.map((j, idx) => (
                  <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{j.nome} - {j.motivo}</span>
                    <div>
                      <button className="btn btn-success btn-sm me-2">Aprovar</button>
                      <button className="btn btn-danger btn-sm">Rejeitar</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tabela */}
      <section className="mt-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">Colaboradores Hoje</h5>
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead className="table-light">
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
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardGestor;
