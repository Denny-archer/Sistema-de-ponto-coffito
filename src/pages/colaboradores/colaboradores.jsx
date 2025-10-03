import React, { useState, useEffect } from "react";
import { listarUsuarios, createUsuario } from "../../services/usuarios";
import { listarDepartamentos } from "../../services/departamentos";
import { listarCargos } from "../../services/cargos";

import {
  User,
  Edit,
  Trash2,
  Clock,
  Plus,
  Search,
  Filter,
  Download,
  BadgeCheck,
  XCircle,
  Eye,
  SortAsc,
  Calendar,
} from "lucide-react";

function Colaboradores() {
  const [colaboradores, setColaboradores] = useState([]);
  const [departamentosApi, setDepartamentosApi] = useState([]);
  const [cargosApi, setCargosApi] = useState([]);
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
  dataAdmissao: "",
  cpf: "",
  password: "",
  matricula: "",
  tipoUsuario: "",
  cargaHoraria: "08:00:00",
});


  // 🔹 carregar departamentos e cargos
// 🔹 carregar usuários, cargos e departamentos
useEffect(() => {
  async function carregarDados() {
    try {
      // --- Usuários ---
      const usuariosResponse = await listarUsuarios();
      console.log("USUÁRIOS:", usuariosResponse);

      // Se o backend retorna { usuarios: [...] }, pegue o array
      const usuarios = usuariosResponse.usuarios || usuariosResponse;

      // Normalizar para UI
      const usuariosUI = usuarios.map((u) => ({
        id: u.id,
        nome: u.nome,
        email: u.email,
        telefone: u.telefone ?? "",
        departamento: u.departamento ?? "-",
        cargo: u.cargo ?? "-",
        status: u.status ? "Ativo" : "Inativo",
        dataAdmissao: u.data_admissao,
        ultimoPonto: "--/--/---- --:--",
        horasTrabalhadas: "00:00",
      }));

      setColaboradores(usuariosUI);

      // --- Cargos ---
      const cargos = await listarCargos();
      console.log("CARGOS:", cargos);
      setCargosApi(cargos.cargos || cargos);

      // --- Departamentos ---
      const departamentos = await listarDepartamentos();
      console.log("DEPARTAMENTOS:", departamentos);
      setDepartamentosApi(departamentos.departamentos || departamentos);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  }

  carregarDados();
}, []);




  // --- Helpers ---
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStatusIcon = (status) =>
    status === "Ativo" ? (
      <BadgeCheck size={14} className="text-success" />
    ) : (
      <XCircle size={14} className="text-secondary" />
    );

  const handleExcluir = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este colaborador?")) {
      setColaboradores(colaboradores.filter((c) => c.id !== id));
    }
  };

  const handleSalvar = async () => {
  try {
    const payload = {
      nome: form.nome,
      email: form.email,
      telefone: form.telefone || null,
      departamento: form.departamento ? Number(form.departamento) : null,
      cargo: form.cargo ? Number(form.cargo) : null,
      status: form.status === "Ativo",
      cpf: form.cpf.replace(/\D/g, ""),
      matricula: form.matricula || "MAT-" + Date.now(),
      tipo_usuario: Number(form.tipoUsuario) || 2, // default Colaborador
      carga_horaria: form.cargaHoraria || null,
      password: form.password,
      data_admissao: form.dataAdmissao || null,
    };

    const novoUsuario = await createUsuario(payload);

    const colaboradorUI = {
      ...form,
      id: novoUsuario.id,
      status: payload.status ? "Ativo" : "Inativo",
      ultimoPonto: "--/--/---- --:--",
      horasTrabalhadas: "00:00",
    };

    setColaboradores((prev) => [...prev, colaboradorUI]);
    setShowModal(false);

    setForm({
      nome: "",
      email: "",
      telefone: "",
      departamento: "",
      cargo: "",
      status: "Ativo",
      dataAdmissao: "",
      cpf: "",
      password: "",
      matricula: "",
      tipoUsuario: "",
      cargaHoraria: "08:00:00",
    });

    alert("✅ Colaborador cadastrado com sucesso!");
  } catch (error) {
    console.error(error);
    alert(
      "❌ Erro ao salvar colaborador: " +
        (error.response?.data?.detail || error.message)
    );
  }
};


  // --- Filtro + Ordenação ---
  const filteredColaboradores = colaboradores
    .filter((colab) => {
      const t = searchTerm.toLowerCase();
      return (
        colab.nome?.toLowerCase().includes(t) ||
        colab.email?.toLowerCase().includes(t) ||
        colab.departamento?.toString().toLowerCase().includes(t) ||
        colab.cargo?.toString().toLowerCase().includes(t)
      );
    })
    .filter((colab) => filterStatus === "Todos" || colab.status === filterStatus)
    .filter(
      (colab) =>
        filterDepartamento === "Todos" ||
        colab.departamento?.toString() === filterDepartamento
    )
    .sort((a, b) => {
      const aValue = `${a[sortField] ?? ""}`.toLowerCase();
      const bValue = `${b[sortField] ?? ""}`.toLowerCase();
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  const SortableHeader = ({ field, children }) => (
    <th className="cursor-pointer user-select-none" onClick={() => handleSort(field)}>
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
      <main className="main-content">
        <div className="container-fluid py-3 py-md-4 px-3 px-md-4">
          {/* Header */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
            <div className="mb-3 mb-md-0">
              <h2 className="fw-bold mb-1">Gestão de Colaboradores</h2>
              <p className="text-muted mb-0">
                {filteredColaboradores.length} colaborador
                {filteredColaboradores.length !== 1 ? "es" : ""} encontrado
                {filteredColaboradores.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              className="btn btn-primary d-flex align-items-center"
              onClick={() => setShowModal(true)}
            >
              <Plus size={18} className="me-2" /> Adicionar Colaborador
            </button>
          </div>

          {/* Tabela */}
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <SortableHeader field="nome">
                        <User size={14} className="me-1" /> Colaborador
                      </SortableHeader>
                      <SortableHeader field="departamento">Departamento</SortableHeader>
                      <SortableHeader field="cargo">Cargo</SortableHeader>
                      <SortableHeader field="dataAdmissao">
                        <Calendar size={14} className="me-1" /> Admissão
                      </SortableHeader>
                      <th>Último Ponto</th>
                      <th>Horas/Mês</th>
                      <SortableHeader field="status">Status</SortableHeader>
                      <th className="text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredColaboradores.map((colab) => (
                      <tr
                        key={colab.id}
                        className={colab.status === "Inativo" ? "opacity-75" : ""}
                      >
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
                          <span className="badge bg-light text-dark">
                            {colab.departamento}
                          </span>
                        </td>
                        <td>{colab.cargo}</td>
                        <td>
                          <small className="text-muted">{colab.dataAdmissao}</small>
                        </td>
                        <td>
                          <small className="text-muted">{colab.ultimoPonto}</small>
                        </td>
                        <td>
                          <span className="fw-semibold">{colab.horasTrabalhadas}</span>
                        </td>
                        <td>
                          <span
                            className={`badge d-inline-flex align-items-center ${
                              colab.status === "Ativo" ? "bg-success" : "bg-secondary"
                            }`}
                          >
                            {getStatusIcon(colab.status)}
                            <span className="ms-1">{colab.status}</span>
                          </span>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-1">
                            <button className="btn btn-outline-primary btn-sm">
                              <Eye size={14} />
                            </button>
                            <button className="btn btn-outline-warning btn-sm">
                              <Edit size={14} />
                            </button>
                            <button className="btn btn-outline-dark btn-sm">
                              <Clock size={14} />
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm"
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

          {/* Modal */}
          {showModal && (
            <div
              className="modal fade show d-block"
              tabIndex="-1"
              style={{ background: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Adicionar Novo Colaborador</h5>
                    <button className="btn-close" onClick={() => setShowModal(false)} />
                  </div>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Nome *</label>
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

                      {/* Select Departamento */}
                      <div className="col-12 col-md-6">
                        <label className="form-label">Departamento *</label>
                        <select
                          className="form-select"
                          value={form.departamento}
                          onChange={(e) => setForm({ ...form, departamento: e.target.value })}
                        >
                          <option value="">Selecione...</option>
                          {departamentosApi.map((depto) => (
                            <option key={depto.id} value={depto.id}>
                              {depto.nome}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Select Cargo */}
                      <div className="col-12 col-md-6">
                        <label className="form-label">Cargo *</label>
                        <select
                          className="form-select"
                          value={form.cargo}
                          onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                        >
                          <option value="">Selecione...</option>
                          {cargosApi.map((cargo) => (
                          <option key={cargo.id} value={cargo.id}>
                            {cargo.nome}
                          </option>
                        ))}

                        </select>
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label">CPF *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={form.cpf}
                          onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                          placeholder="Digite o CPF (somente números)"
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label">Senha inicial *</label>
                        <input
                          type="password"
                          className="form-control"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label">Matrícula *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={form.matricula}
                          onChange={(e) => setForm({ ...form, matricula: e.target.value })}
                          placeholder="Ex: 121400"
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label">Tipo Usuário *</label>
                        <select
                          className="form-select"
                          value={form.tipoUsuario}
                          onChange={(e) => setForm({ ...form, tipoUsuario: e.target.value })}
                        >
                          <option value="">Selecione...</option>
                          <option value="1">Administrador</option>
                          <option value="2">Colaborador</option>
                        </select>
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label">Carga Horária</label>
                        <input
                          type="time"
                          step="1"
                          className="form-control"
                          value={form.cargaHoraria}
                          onChange={(e) => setForm({ ...form, cargaHoraria: e.target.value })}
                        />
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
