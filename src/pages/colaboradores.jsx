import React, { useState } from "react";
import { 
  User, 
  Edit, 
  Trash2, 
  Clock, 
  Plus, 
  Search, 
  Filter,
  Download,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  BadgeCheck,
  XCircle,
  Eye,
  SortAsc,
  ChevronDown
} from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";

function Colaboradores() {
  const [colaboradores, setColaboradores] = useState([
    { 
      id: 1, 
      nome: "João Silva", 
      email: "joao.silva@empresa.com",
      telefone: "(11) 99999-9999",
      departamento: "TI", 
      cargo: "Desenvolvedor Frontend", 
      status: "Ativo",
      dataAdmissao: "15/03/2023",
      ultimoPonto: "25/09/2025 08:05",
      horasTrabalhadas: "156:30"
    },
    { 
      id: 2, 
      nome: "Maria Santos", 
      email: "maria.santos@empresa.com",
      telefone: "(11) 98888-8888",
      departamento: "RH", 
      cargo: "Analista de Recursos Humanos", 
      status: "Ativo",
      dataAdmissao: "20/01/2022",
      ultimoPonto: "25/09/2025 08:00",
      horasTrabalhadas: "142:15"
    },
    { 
      id: 3, 
      nome: "Pedro Costa", 
      email: "pedro.costa@empresa.com",
      telefone: "(11) 97777-7777",
      departamento: "Vendas", 
      cargo: "Consultor Comercial", 
      status: "Inativo",
      dataAdmissao: "10/08/2024",
      ultimoPonto: "24/09/2025 17:30",
      horasTrabalhadas: "128:45"
    },
    { 
      id: 4, 
      nome: "Ana Oliveira", 
      email: "ana.oliveira@empresa.com",
      telefone: "(11) 96666-6666",
      departamento: "Marketing", 
      cargo: "Designer Gráfico", 
      status: "Ativo",
      dataAdmissao: "05/12/2023",
      ultimoPonto: "25/09/2025 07:55",
      horasTrabalhadas: "135:20"
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterDepartamento, setFilterDepartamento] = useState("Todos");
  const [sortField, setSortField] = useState("nome");
  const [sortDirection, setSortDirection] = useState("asc");
  const [form, setForm] = useState({ 
    nome: "", 
    email: "",
    telefone: "",
    departamento: "", 
    cargo: "", 
    status: "Ativo",
    dataAdmissao: ""
  });

  // Filtros e ordenação
  const filteredColaboradores = colaboradores
    .filter(colab => 
      colab.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      colab.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      colab.departamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      colab.cargo.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(colab => 
      filterStatus === "Todos" || colab.status === filterStatus
    )
    .filter(colab =>
      filterDepartamento === "Todos" || colab.departamento === filterDepartamento
    )
    .sort((a, b) => {
      const aValue = a[sortField]?.toLowerCase() || "";
      const bValue = b[sortField]?.toLowerCase() || "";
      
      if (sortDirection === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

  const departamentos = [...new Set(colaboradores.map(c => c.departamento))];

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSalvar = () => {
    const novo = { 
      ...form, 
      id: Date.now(),
      ultimoPonto: "--/--/---- --:--",
      horasTrabalhadas: "00:00"
    };
    setColaboradores([...colaboradores, novo]);
    setShowModal(false);
    setForm({ 
      nome: "", 
      email: "",
      telefone: "",
      departamento: "", 
      cargo: "", 
      status: "Ativo",
      dataAdmissao: ""
    });
  };

  const handleExcluir = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este colaborador?")) {
      setColaboradores(colaboradores.filter(c => c.id !== id));
    }
  };

  const getStatusIcon = (status) => {
    return status === "Ativo" ? 
      <BadgeCheck size={14} className="text-success" /> : 
      <XCircle size={14} className="text-secondary" />;
  };

  const SortableHeader = ({ field, children }) => (
    <th 
      className="cursor-pointer user-select-none"
      onClick={() => handleSort(field)}
    >
      <div className="d-flex align-items-center gap-1">
        {children}
        {sortField === field && (
          <SortAsc size={12} className={sortDirection === "desc" ? "rotate-180" : ""} />
        )}
      </div>
    </th>
  );

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <Topbar />

        <div className="container-fluid py-3 py-md-4 px-3 px-md-4">
          {/* Header Section */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
            <div className="mb-3 mb-md-0">
              <h2 className="fw-bold mb-1">Gestão de Colaboradores</h2>
              <p className="text-muted mb-0">
                {filteredColaboradores.length} colaborador{filteredColaboradores.length !== 1 ? 'es' : ''} encontrado{filteredColaboradores.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button 
              className="btn btn-primary d-flex align-items-center"
              onClick={() => setShowModal(true)}
            >
              <Plus size={18} className="me-2" /> 
              Adicionar Colaborador
            </button>
          </div>

          {/* Filters Section */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12 col-md-6 col-lg-4">
                  <div className="search-box position-relative">
                    <Search size={18} className="position-absolute top-50 start-3 translate-middle-y text-muted" />
                    <input
                      type="text"
                      className="form-control ps-5"
                      placeholder="Pesquisar colaboradores..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-6 col-md-3 col-lg-2">
                  <select 
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="Todos">Todos os status</option>
                    <option value="Ativo">Ativos</option>
                    <option value="Inativo">Inativos</option>
                  </select>
                </div>
                <div className="col-6 col-md-3 col-lg-2">
                  <select 
                    className="form-select"
                    value={filterDepartamento}
                    onChange={(e) => setFilterDepartamento(e.target.value)}
                  >
                    <option value="Todos">Todos os deptos.</option>
                    {departamentos.map(depto => (
                      <option key={depto} value={depto}>{depto}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary d-flex align-items-center">
                      <Filter size={16} className="me-2" />
                      Mais Filtros
                    </button>
                    <button className="btn btn-outline-secondary d-flex align-items-center">
                      <Download size={16} className="me-2" />
                      Exportar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <SortableHeader field="nome">
                        <User size={14} className="me-1" />
                        Colaborador
                      </SortableHeader>
                      <SortableHeader field="departamento">Departamento</SortableHeader>
                      <SortableHeader field="cargo">Cargo</SortableHeader>
                      <SortableHeader field="dataAdmissao">
                        <Calendar size={14} className="me-1" />
                        Admissão
                      </SortableHeader>
                      <th>Último Ponto</th>
                      <th>Horas/Mês</th>
                      <SortableHeader field="status">Status</SortableHeader>
                      <th className="text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredColaboradores.map((colab) => (
                      <tr key={colab.id} className={colab.status === "Inativo" ? "opacity-75" : ""}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3">
                              <User size={16} className="text-primary" />
                            </div>
                            <div>
                              <div className="fw-semibold">{colab.nome}</div>
                              <div className="text-muted small">{colab.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark">{colab.departamento}</span>
                        </td>
                        <td>{colab.cargo}</td>
                        <td>
                          <small className="text-muted">{colab.dataAdmissao}</small>
                        </td>
                        <td>
                          <small className={colab.ultimoPonto.includes("--") ? "text-muted" : "text-success"}>
                            {colab.ultimoPonto}
                          </small>
                        </td>
                        <td>
                          <span className="fw-semibold">{colab.horasTrabalhadas}</span>
                        </td>
                        <td>
                          <span className={`badge d-inline-flex align-items-center ${
                            colab.status === "Ativo" ? "bg-success" : "bg-secondary"
                          }`}>
                            {getStatusIcon(colab.status)}
                            <span className="ms-1">{colab.status}</span>
                          </span>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-1">
                            <button 
                              className="btn btn-outline-primary btn-sm"
                              title="Ver detalhes"
                            >
                              <Eye size={14} />
                            </button>
                            <button 
                              className="btn btn-outline-warning btn-sm"
                              title="Editar"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              className="btn btn-outline-dark btn-sm"
                              title="Histórico de pontos"
                            >
                              <Clock size={14} />
                            </button>
                            <button 
                              className="btn btn-outline-danger btn-sm"
                              title="Excluir"
                              onClick={() => handleExcluir(colab.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredColaboradores.length === 0 && (
                <div className="text-center py-5">
                  <User size={48} className="text-muted mb-3" />
                  <p className="text-muted">Nenhum colaborador encontrado</p>
                  <small className="text-muted">
                    Tente ajustar os filtros ou adicionar um novo colaborador
                  </small>
                </div>
              )}
            </div>
          </div>

          {/* Modal Adicionar Colaborador */}
          {showModal && (
            <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Adicionar Novo Colaborador</h5>
                    <button 
                      className="btn-close" 
                      onClick={() => setShowModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Nome Completo *</label>
                        <input 
                          type="text" 
                          className="form-control"
                          value={form.nome} 
                          onChange={(e) => setForm({ ...form, nome: e.target.value })} 
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">E-mail *</label>
                        <input 
                          type="email" 
                          className="form-control"
                          value={form.email} 
                          onChange={(e) => setForm({ ...form, email: e.target.value })} 
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Telefone</label>
                        <input 
                          type="tel" 
                          className="form-control"
                          value={form.telefone} 
                          onChange={(e) => setForm({ ...form, telefone: e.target.value })} 
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Data de Admissão</label>
                        <input 
                          type="date" 
                          className="form-control"
                          value={form.dataAdmissao} 
                          onChange={(e) => setForm({ ...form, dataAdmissao: e.target.value })} 
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Departamento *</label>
                        <select 
                          className="form-select"
                          value={form.departamento} 
                          onChange={(e) => setForm({ ...form, departamento: e.target.value })}
                        >
                          <option value="">Selecione...</option>
                          {departamentos.map(depto => (
                            <option key={depto} value={depto}>{depto}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Cargo *</label>
                        <input 
                          type="text" 
                          className="form-control"
                          value={form.cargo} 
                          onChange={(e) => setForm({ ...form, cargo: e.target.value })} 
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Status</label>
                        <select 
                          className="form-select"
                          value={form.status} 
                          onChange={(e) => setForm({ ...form, status: e.target.value })}
                        >
                          <option value="Ativo">Ativo</option>
                          <option value="Inativo">Inativo</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      className="btn btn-outline-secondary" 
                      onClick={() => setShowModal(false)}
                    >
                      Cancelar
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={handleSalvar}
                      disabled={!form.nome || !form.email || !form.departamento || !form.cargo}
                    >
                      Salvar Colaborador
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Colaboradores;