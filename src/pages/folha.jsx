// 📂 src/pages/Folha.jsx
import React, { useState, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
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
  MoreVertical,
  Eye,
  Calculator,
  Calendar,
  User,
  BarChart3,
  TrendingUp,
  CheckSquare
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

function Folha() {
  const [folha, setFolha] = useState([
    { 
      id: 1, 
      nome: "João Silva", 
      matricula: "001",
      departamento: "TI", 
      cargo: "Desenvolvedor",
      salario: 4500, 
      horasExtras: 10,
      valorHoraExtra: 75.00,
      descontos: 320.50,
      beneficios: 180.00,
      liquido: 4334.50,
      status: "Pendente",
      periodo: "09/2025",
      dataAdmissao: "15/03/2023"
    },
    { 
      id: 2, 
      nome: "Maria Santos", 
      matricula: "002",
      departamento: "RH", 
      cargo: "Analista",
      salario: 4000, 
      horasExtras: 5,
      valorHoraExtra: 62.50,
      descontos: 280.00,
      beneficios: 150.00,
      liquido: 3932.50,
      status: "Pendente",
      periodo: "09/2025",
      dataAdmissao: "20/01/2022"
    },
    { 
      id: 3, 
      nome: "Pedro Costa", 
      matricula: "003",
      departamento: "Vendas", 
      cargo: "Consultor",
      salario: 3800, 
      horasExtras: 12,
      valorHoraExtra: 63.33,
      descontos: 295.75,
      beneficios: 220.00,
      liquido: 4387.58,
      status: "Aprovado",
      periodo: "09/2025",
      dataAdmissao: "10/08/2024"
    },
    { 
      id: 4, 
      nome: "Ana Oliveira", 
      matricula: "004",
      departamento: "Marketing", 
      cargo: "Designer",
      salario: 4200, 
      horasExtras: 8,
      valorHoraExtra: 70.00,
      descontos: 310.25,
      beneficios: 190.00,
      liquido: 4159.75,
      status: "Revisão",
      periodo: "09/2025",
      dataAdmissao: "05/12/2023"
    },
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

    // Ajusta largura das colunas
    const colWidths = [
      { wch: 10 },  // Matrícula
      { wch: 20 },  // Nome
      { wch: 15 },  // Departamento
      { wch: 15 },  // Cargo
      { wch: 12 },  // Salário
      { wch: 12 },  // Horas Extras
      { wch: 12 },  // Valor H.E.
      { wch: 12 },  // Descontos
      { wch: 12 },  // Benefícios
      { wch: 12 },  // Líquido
      { wch: 12 },  // Status
      { wch: 10 },  // Período
    ];
    ws["!cols"] = colWidths;

    XLSX.writeFile(wb, `folha_pagamento_${selectedPeriod}.xlsx`);
  };

  // 📌 Exporta para PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185);
    doc.text("Relatório de Folha de Pagamento", 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Período: ${selectedPeriod.split('-').reverse().join('/')}`, 14, 22);
    doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 27);

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
      startY: 35,
      styles: { 
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: { 
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      margin: { top: 35 }
    });

    // Footer com totais
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(41, 128, 185);
    doc.text(`Total de colaboradores: ${filteredFolha.length}`, 14, finalY);
    doc.text(`Valor total líquido: R$ ${stats.totalLiquido.toFixed(2)}`, 14, finalY + 5);

    doc.save(`folha_pagamento_${selectedPeriod}.pdf`);
  };

  const handleApprove = (id) => {
    setFolha(folha.map(f => (f.id === id ? { ...f, status: "Aprovado" } : f)));
  };

  const handleReject = (id) => {
    setFolha(folha.map(f => (f.id === id ? { ...f, status: "Revisão" } : f)));
  };

  const handleApproveAll = () => {
    if (window.confirm("Deseja aprovar TODOS os pagamentos pendentes?")) {
      setFolha(folha.map(f => 
        f.status === "Pendente" ? { ...f, status: "Aprovado" } : f
      ));
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      Pendente: { class: "bg-warning", icon: <AlertCircle size={12} /> },
      Aprovado: { class: "bg-success", icon: <CheckCircle size={12} /> },
      Revisão: { class: "bg-danger", icon: <XCircle size={12} /> }
    };
    const cfg = config[status] || config.Pendente;
    return (
      <span className={`badge ${cfg.class} d-inline-flex align-items-center gap-1`}>
        {cfg.icon}
        {status}
      </span>
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <Topbar />

        <div className="container-fluid py-3 py-md-4 px-3 px-md-4">
          {/* Header Section */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
            <div className="mb-3 mb-md-0">
              <h2 className="fw-bold mb-1 d-flex align-items-center">
                <DollarSign size={24} className="text-success me-2" />
                Folha de Pagamento
              </h2>
              <p className="text-muted mb-0">Gestão e aprovação de pagamentos</p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button 
                className="btn btn-outline-primary d-flex align-items-center"
                onClick={exportExcel}
              >
                <Download size={16} className="me-2" /> 
                Excel
              </button>
              <button 
                className="btn btn-outline-primary d-flex align-items-center"
                onClick={exportPDF}
              >
                <FileText size={16} className="me-2" /> 
                PDF
              </button>
              <button 
                className="btn btn-success d-flex align-items-center"
                onClick={handleApproveAll}
                disabled={stats.pendentes === 0}
              >
                <CheckSquare size={16} className="me-2" />
                Aprovar Todos
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-4 col-lg-2">
              <div className="card bg-primary bg-opacity-10 border-0">
                <div className="card-body text-center p-3">
                  <User size={20} className="text-primary mb-2" />
                  <div className="fw-bold fs-5">{stats.total}</div>
                  <small className="text-muted">Total</small>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="card bg-warning bg-opacity-10 border-0">
                <div className="card-body text-center p-3">
                  <AlertCircle size={20} className="text-warning mb-2" />
                  <div className="fw-bold fs-5">{stats.pendentes}</div>
                  <small className="text-muted">Pendentes</small>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="card bg-success bg-opacity-10 border-0">
                <div className="card-body text-center p-3">
                  <CheckCircle size={20} className="text-success mb-2" />
                  <div className="fw-bold fs-5">{stats.aprovados}</div>
                  <small className="text-muted">Aprovados</small>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="card bg-danger bg-opacity-10 border-0">
                <div className="card-body text-center p-3">
                  <XCircle size={20} className="text-danger mb-2" />
                  <div className="fw-bold fs-5">{stats.revisao}</div>
                  <small className="text-muted">Revisão</small>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="card bg-info bg-opacity-10 border-0">
                <div className="card-body text-center p-3">
                  <TrendingUp size={20} className="text-info mb-2" />
                  <div className="fw-bold fs-5">{formatCurrency(stats.totalLiquido)}</div>
                  <small className="text-muted">Total Líquido</small>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="card bg-secondary bg-opacity-10 border-0">
                <div className="card-body text-center p-3">
                  <Clock size={20} className="text-secondary mb-2" />
                  <div className="fw-bold fs-5">{stats.totalHorasExtras}h</div>
                  <small className="text-muted">H. Extras</small>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12 col-md-4 col-lg-3">
                  <div className="search-box position-relative">
                    <Search size={18} className="position-absolute top-50 start-3 translate-middle-y text-muted" />
                    <input
                      type="text"
                      className="form-control ps-5"
                      placeholder="Pesquisar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-6 col-md-4 col-lg-2">
                  <select 
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="Todos">Todos status</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Revisão">Revisão</option>
                  </select>
                </div>
                <div className="col-6 col-md-4 col-lg-2">
                  <select 
                    className="form-select"
                    value={filterDepartamento}
                    onChange={(e) => setFilterDepartamento(e.target.value)}
                  >
                    <option value="Todos">Todos deptos.</option>
                    {departamentos.map(depto => (
                      <option key={depto} value={depto}>{depto}</option>
                    ))}
                  </select>
                </div>
                <div className="col-6 col-md-4 col-lg-2">
                  <input 
                    type="month" 
                    className="form-control"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  />
                </div>
                <div className="col-6 col-md-4 col-lg-3">
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-outline-secondary d-flex align-items-center"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter size={16} className="me-2" />
                      {showFilters ? 'Menos' : 'Mais'} Filtros
                    </button>
                    <button 
                      className="btn btn-primary d-flex align-items-center"
                      onClick={() => {
                        setSearchTerm("");
                        setFilterStatus("Todos");
                        setFilterDepartamento("Todos");
                      }}
                    >
                      Limpar
                    </button>
                  </div>
                </div>
              </div>

              {/* Filtros expandidos */}
              {showFilters && (
                <div className="row g-3 mt-3 pt-3 border-top">
                  <div className="col-6 col-md-3">
                    <label className="form-label small">Salário Mínimo</label>
                    <input type="number" className="form-control" placeholder="R$ 0,00" />
                  </div>
                  <div className="col-6 col-md-3">
                    <label className="form-label small">Salário Máximo</label>
                    <input type="number" className="form-control" placeholder="R$ 10.000,00" />
                  </div>
                  <div className="col-6 col-md-3">
                    <label className="form-label small">Horas Extras Mín.</label>
                    <input type="number" className="form-control" placeholder="0" />
                  </div>
                  <div className="col-6 col-md-3">
                    <label className="form-label small">Data Admissão</label>
                    <input type="date" className="form-control" />
                  </div>
                </div>
              )}
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
                      <th className="text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFolha.map((item) => (
                      <tr key={item.id} className={item.status !== "Pendente" ? "opacity-75" : ""}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3">
                              <User size={16} className="text-primary" />
                            </div>
                            <div>
                              <div className="fw-semibold">{item.nome}</div>
                              <div className="text-muted small">#{item.matricula}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">{item.departamento}</div>
                            <div className="text-muted small">{item.cargo}</div>
                          </div>
                        </td>
                        <td>
                          <div className="fw-semibold text-success">{formatCurrency(item.salario)}</div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Clock size={14} className="text-warning me-1" />
                            <span className="fw-medium">{item.horasExtras}h</span>
                            <small className="text-muted ms-1">({formatCurrency(item.valorHoraExtra)})</small>
                          </div>
                        </td>
                        <td>
                          <div className="text-danger fw-medium">-{formatCurrency(item.descontos)}</div>
                        </td>
                        <td>
                          <div className="text-success fw-medium">+{formatCurrency(item.beneficios)}</div>
                        </td>
                        <td>
                          <div className="fw-bold fs-6">{formatCurrency(item.liquido)}</div>
                        </td>
                        <td>
                          {getStatusBadge(item.status)}
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-1">
                            <button 
                              className="btn btn-outline-primary btn-sm"
                              title="Ver detalhes"
                              onClick={() => setSelectedEmployee(item)}
                            >
                              <Eye size={14} />
                            </button>
                            <button 
                              className="btn btn-outline-success btn-sm"
                              title="Aprovar"
                              onClick={() => handleApprove(item.id)}
                              disabled={item.status !== "Pendente"}
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button 
                              className="btn btn-outline-danger btn-sm"
                              title="Enviar para revisão"
                              onClick={() => handleReject(item.id)}
                              disabled={item.status !== "Pendente"}
                            >
                              <XCircle size={14} />
                            </button>
                            <button 
                              className="btn btn-outline-dark btn-sm"
                              title="Cálculos"
                            >
                              <Calculator size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredFolha.length === 0 && (
                <div className="text-center py-5">
                  <DollarSign size={48} className="text-muted mb-3" />
                  <p className="text-muted">Nenhum registro encontrado</p>
                  <small className="text-muted">
                    Tente ajustar os filtros ou verificar outro período
                  </small>
                </div>
              )}
            </div>
          </div>

          {/* Footer Summary */}
          <div className="row g-3 mt-3">
            <div className="col-12 col-md-6">
              <div className="card bg-light border-0">
                <div className="card-body py-2">
                  <small className="text-muted">
                    Mostrando {filteredFolha.length} de {folha.length} colaboradores • 
                    Período: {selectedPeriod.split('-').reverse().join('/')}
                  </small>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="card bg-primary text-white border-0">
                <div className="card-body py-2 text-center">
                  <small>
                    <strong>Total Líquido do Período:</strong> {formatCurrency(stats.totalLiquido)}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Folha;