// 📂 src/pages/Folha.jsx
import React, { useState, useMemo } from "react";
import { 
  FileText, 
  Download, 
  CheckCircle, 
  XCircle, 
  Filter, 
  Search,
  DollarSign,
  Clock,
  AlertCircle,
  Eye,
  Calculator,
  User,
  TrendingUp,
  CheckSquare
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

function Folha() {
  const [folha, setFolha] = useState([
    { id: 1, nome: "João Silva", matricula: "001", departamento: "TI", cargo: "Desenvolvedor", salario: 4500, horasExtras: 10, valorHoraExtra: 75.00, descontos: 320.50, beneficios: 180.00, liquido: 4334.50, status: "Pendente", periodo: "09/2025", dataAdmissao: "15/03/2023" },
    { id: 2, nome: "Maria Santos", matricula: "002", departamento: "RH", cargo: "Analista", salario: 4000, horasExtras: 5, valorHoraExtra: 62.50, descontos: 280.00, beneficios: 150.00, liquido: 3932.50, status: "Pendente", periodo: "09/2025", dataAdmissao: "20/01/2022" },
    { id: 3, nome: "Pedro Costa", matricula: "003", departamento: "Vendas", cargo: "Consultor", salario: 3800, horasExtras: 12, valorHoraExtra: 63.33, descontos: 295.75, beneficios: 220.00, liquido: 4387.58, status: "Aprovado", periodo: "09/2025", dataAdmissao: "10/08/2024" },
    { id: 4, nome: "Ana Oliveira", matricula: "004", departamento: "Marketing", cargo: "Designer", salario: 4200, horasExtras: 8, valorHoraExtra: 70.00, descontos: 310.25, beneficios: 190.00, liquido: 4159.75, status: "Revisão", periodo: "09/2025", dataAdmissao: "05/12/2023" }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterDepartamento, setFilterDepartamento] = useState("Todos");
  const [selectedPeriod, setSelectedPeriod] = useState("2025-09");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Filtros e busca
  const filteredFolha = useMemo(() => {
    return folha.filter(item => {
      const matchesSearch = 
        item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.matricula.includes(searchTerm) ||
        item.departamento.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === "Todos" || item.status === filterStatus;
      const matchesDepto = filterDepartamento === "Todos" || item.departamento === filterDepartamento;
      const matchesPeriod = item.periodo === selectedPeriod.split('-').reverse().join('/');

      return matchesSearch && matchesStatus && matchesDepto && matchesPeriod;
    });
  }, [folha, searchTerm, filterStatus, filterDepartamento, selectedPeriod]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = filteredFolha.length;
    const pendentes = filteredFolha.filter(f => f.status === "Pendente").length;
    const aprovados = filteredFolha.filter(f => f.status === "Aprovado").length;
    const revisao = filteredFolha.filter(f => f.status === "Revisão").length;
    const totalLiquido = filteredFolha.reduce((sum, f) => sum + f.liquido, 0);
    const totalHorasExtras = filteredFolha.reduce((sum, f) => sum + f.horasExtras, 0);

    return { total, pendentes, aprovados, revisao, totalLiquido, totalHorasExtras };
  }, [filteredFolha]);

  // Departamentos únicos
  const departamentos = [...new Set(folha.map(f => f.departamento))];

  // 📌 Exporta para Excel
  const exportExcel = () => {
    const data = filteredFolha.map(f => ({
      Matrícula: f.matricula,
      Nome: f.nome,
      Departamento: f.departamento,
      Cargo: f.cargo,
      Salário: f.salario,
      'Horas Extras': f.horasExtras,
      'Valor H.E.': f.valorHoraExtra,
      Descontos: f.descontos,
      Benefícios: f.beneficios,
      Líquido: f.liquido,
      Status: f.status,
      Período: f.periodo
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Folha de Pagamento");
    XLSX.writeFile(wb, `folha_pagamento_${selectedPeriod}.xlsx`);
  };

  // 📌 Exporta para PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185);
    doc.text("Relatório de Folha de Pagamento", 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Período: ${selectedPeriod.split('-').reverse().join('/')}`, 14, 22);

    const tableData = filteredFolha.map(f => [
      f.matricula,
      f.nome,
      f.departamento,
      `R$ ${f.salario.toFixed(2)}`,
      f.horasExtras,
      `R$ ${f.liquido.toFixed(2)}`,
      f.status,
    ]);

    doc.autoTable({
      head: [["Matrícula", "Nome", "Departamento", "Salário", "H. Extras", "Líquido", "Status"]],
      body: tableData,
      startY: 35
    });

    doc.save(`folha_pagamento_${selectedPeriod}.pdf`);
  };

  const handleApprove = (id) => setFolha(folha.map(f => (f.id === id ? { ...f, status: "Aprovado" } : f)));
  const handleReject = (id) => setFolha(folha.map(f => (f.id === id ? { ...f, status: "Revisão" } : f)));
  const handleApproveAll = () => {
    if (window.confirm("Deseja aprovar TODOS os pagamentos pendentes?")) {
      setFolha(folha.map(f => f.status === "Pendente" ? { ...f, status: "Aprovado" } : f));
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      Pendente: { class: "bg-warning", icon: <AlertCircle size={12} /> },
      Aprovado: { class: "bg-success", icon: <CheckCircle size={12} /> },
      Revisão: { class: "bg-danger", icon: <XCircle size={12} /> }
    };
    const cfg = config[status] || config.Pendente;
    return <span className={`badge ${cfg.class} d-inline-flex align-items-center gap-1`}>{cfg.icon}{status}</span>;
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="dashboard-container">
      {/* ❌ Sidebar e Topbar já vêm do AppLayoutGestor */}
      <main className="main-content">
        <div className="container-fluid py-3 px-3">
          {/* Header Section */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
            <div>
              <h2 className="fw-bold mb-1 d-flex align-items-center">
                <DollarSign size={24} className="text-success me-2" />
                Folha de Pagamento
              </h2>
              <p className="text-muted mb-0">Gestão e aprovação de pagamentos</p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button className="btn btn-outline-primary" onClick={exportExcel}><Download size={16} className="me-2" />Excel</button>
              <button className="btn btn-outline-primary" onClick={exportPDF}><FileText size={16} className="me-2" />PDF</button>
              <button className="btn btn-success" onClick={handleApproveAll} disabled={stats.pendentes === 0}><CheckSquare size={16} className="me-2" />Aprovar Todos</button>
            </div>
          </div>

          {/* Table Section */}
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Colaborador</th>
                      <th>Departamento/Cargo</th>
                      <th>Salário Base</th>
                      <th>H. Extras</th>
                      <th>Descontos</th>
                      <th>Benefícios</th>
                      <th>Líquido</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFolha.map((item) => (
                      <tr key={item.id}>
                        <td>{item.nome}</td>
                        <td>{item.departamento} / {item.cargo}</td>
                        <td>{formatCurrency(item.salario)}</td>
                        <td>{item.horasExtras}h ({formatCurrency(item.valorHoraExtra)})</td>
                        <td>-{formatCurrency(item.descontos)}</td>
                        <td>+{formatCurrency(item.beneficios)}</td>
                        <td className="fw-bold">{formatCurrency(item.liquido)}</td>
                        <td>{getStatusBadge(item.status)}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <button className="btn btn-outline-primary btn-sm" onClick={() => setSelectedEmployee(item)}><Eye size={14} /></button>
                            <button className="btn btn-outline-success btn-sm" onClick={() => handleApprove(item.id)} disabled={item.status !== "Pendente"}><CheckCircle size={14} /></button>
                            <button className="btn btn-outline-danger btn-sm" onClick={() => handleReject(item.id)} disabled={item.status !== "Pendente"}><XCircle size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Folha;
