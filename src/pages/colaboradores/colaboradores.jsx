import React, { useState, useEffect } from "react";
import { listarUsuarios, createUsuario } from "../../services/usuarios";
import { listarDepartamentos } from "../../services/departamentos";
import { listarCargos } from "../../services/cargos";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

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
  const [loading, setLoading] = useState(false);

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
    tipoUsuario: "2", // Default para Colaborador
    cargaHoraria: "08:00",
  });

  // 🔹 carregar usuários, cargos e departamentos
  useEffect(() => {
    async function carregarDados() {
      try {
        // --- Usuários ---
        const usuariosResponse = await listarUsuarios();
        console.log("USUÁRIOS:", usuariosResponse);

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
        Swal.fire({
          icon: "error",
          title: "Erro ao carregar dados",
          text: "Não foi possível carregar a lista de colaboradores.",
          confirmButtonText: "OK",
        });
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

  const handleExcluir = async (id, nome) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Excluir colaborador?",
      html: `Tem certeza que deseja excluir <strong>${nome}</strong>?<br>Esta ação não pode ser desfeita.`,
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      try {
        // Aqui você chamaria a API para excluir
        // await excluirUsuario(id);
        
        setColaboradores(colaboradores.filter((c) => c.id !== id));
        
        Swal.fire({
          icon: "success",
          title: "Excluído!",
          text: "Colaborador excluído com sucesso.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Erro ao excluir",
          text: "Não foi possível excluir o colaborador.",
          confirmButtonText: "OK",
        });
      }
    }
  };

  // 🔹 Validação do formulário
  const validarFormulario = () => {
    if (!form.nome.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campo obrigatório",
        text: "Por favor, preencha o nome do colaborador.",
        confirmButtonText: "OK",
      });
      return false;
    }

    if (!form.email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campo obrigatório",
        text: "Por favor, preencha o e-mail do colaborador.",
        confirmButtonText: "OK",
      });
      return false;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      Swal.fire({
        icon: "warning",
        title: "E-mail inválido",
        text: "Por favor, digite um e-mail válido.",
        confirmButtonText: "OK",
      });
      return false;
    }

    if (!form.cpf) {
      Swal.fire({
        icon: "warning",
        title: "Campo obrigatório",
        text: "Por favor, preencha o CPF.",
        confirmButtonText: "OK",
      });
      return false;
    }

    // Validação de CPF básica
    const cpfLimpo = form.cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      Swal.fire({
        icon: "warning",
        title: "CPF inválido",
        text: "Por favor, digite um CPF válido com 11 dígitos.",
        confirmButtonText: "OK",
      });
      return false;
    }

    if (!form.password) {
      Swal.fire({
        icon: "warning",
        title: "Campo obrigatório",
        text: "Por favor, defina uma senha inicial.",
        confirmButtonText: "OK",
      });
      return false;
    }

    if (!form.matricula) {
      Swal.fire({
        icon: "warning",
        title: "Campo obrigatório",
        text: "Por favor, preencha a matrícula.",
        confirmButtonText: "OK",
      });
      return false;
    }

    return true;
  };

  const handleSalvar = async () => {
  if (!validarFormulario()) return;
  setLoading(true);

  try {
    // 🔹 Monta o payload apenas com campos válidos
    const payload = {
      nome: form.nome.trim(),
      email: form.email.trim().toLowerCase(),
      cpf: form.cpf.replace(/\D/g, ""),
      password: form.password,
      matricula: form.matricula,
      tipo_usuario: Number(form.tipoUsuario) || 2,
      status: form.status ? form.status === "Ativo" : true,
    };

    

    if (form.departamento) payload.departamento = Number(form.departamento);
    else delete payload.departamento;

    if (form.cargo) payload.cargo = Number(form.cargo);
    else delete payload.cargo;

    if (form.dataAdmissao?.trim()) payload.data_admissao = form.dataAdmissao;

    payload.carga_horaria = form.cargaHoraria.length === 5
    ? `${form.cargaHoraria}:00`
    : form.cargaHoraria;


    console.log("📤 Payload final:", JSON.stringify(payload, null, 2));

    // 🔹 Mostra loading durante envio
    Swal.fire({
      title: "Salvando...",
      text: "Cadastrando novo colaborador",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const novoUsuario = await createUsuario(payload);
    Swal.close();

    // 🔹 Atualiza lista local
    const colaboradorUI = {
      id: novoUsuario.id,
      nome: payload.nome,
      email: payload.email,
      telefone: payload.telefone || "",
      departamento:
        departamentosApi.find((d) => d.id === payload.departamento)?.nome ||
        payload.departamento ||
        "-",
      cargo:
        cargosApi.find((c) => c.id === payload.cargo)?.nome ||
        payload.cargo ||
        "-",
      status: payload.status ? "Ativo" : "Inativo",
      dataAdmissao: payload.data_admissao || "-",
      ultimoPonto: "--/--/---- --:--",
      horasTrabalhadas: "00:00",
    };

    setColaboradores((prev) => [...prev, colaboradorUI]);
    setShowModal(false);

    await Swal.fire({
      icon: "success",
      title: "Colaborador cadastrado!",
      html: `
        <div class="text-center">
          <div class="mb-3">
            <i class="fas fa-check-circle text-success" style="font-size: 3rem;"></i>
          </div>
          <strong>${payload.nome}</strong> foi adicionado com sucesso ao sistema.
        </div>
      `,
      confirmButtonText: "Continuar",
      confirmButtonColor: "#198754",
    });

    // 🔹 Reseta formulário
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
      tipoUsuario: "2",
      cargaHoraria: "08:00",
    });
  } catch (error) {
    Swal.close();
    console.error("Erro detalhado:", error);

    let errorTitle = "Erro ao cadastrar";
    let errorMessage = "Não foi possível salvar o colaborador.";
    let errorDetails = "";

    if (error.response?.status === 409) {
      errorTitle = "Dados duplicados";
      errorMessage = "Já existe um colaborador com este e-mail ou CPF.";
    } else if (error.response?.status === 400 || error.response?.status === 422) {
      errorTitle = "Dados inválidos";
      errorMessage = "Verifique os dados informados.";
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        errorDetails =
          typeof detail === "string"
            ? `<br><small class='text-muted'>${detail}</small>`
            : Array.isArray(detail)
            ? `<br><small class='text-muted'>${detail.map((e) => e.msg).join(", ")}</small>`
            : "";
      }
    } else if (error.code === "ERR_NETWORK") {
      errorTitle = "Erro de conexão";
      errorMessage = "Não foi possível conectar ao servidor.";
    }

    await Swal.fire({
      icon: "error",
      title: errorTitle,
      html: `
        <div class="text-start">
          <p class="mb-2">${errorMessage}</p>
          ${errorDetails}
          <small class="text-muted d-block mt-2">Verifique os dados e tente novamente.</small>
        </div>
      `,
      confirmButtonText: "Entendi",
      confirmButtonColor: "#d33",
    });
  } finally {
    setLoading(false);
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

  // 🔹 Fechar modal e limpar formulário
  const handleCloseModal = () => {
    if (loading) return; // Não permite fechar durante o carregamento
    
    const hasData = Object.values(form).some(value => 
      value !== "" && 
      value !== "2" && 
      value !== "08:00" && 
      value !== "Ativo"
    );

    if (hasData) {
      Swal.fire({
        title: "Descartar alterações?",
        text: "Há dados não salvos no formulário.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sim, descartar",
        cancelButtonText: "Continuar editando"
      }).then((result) => {
        if (result.isConfirmed) {
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
            tipoUsuario: "2",
            cargaHoraria: "08:00",
          });
        }
      });
    } else {
      setShowModal(false);
    }
  };

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
              disabled={loading}
            >
              <Plus size={18} className="me-2" /> 
              Adicionar Colaborador
            </button>
          </div>

          {/* Tabela - mantida igual */}
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
                              onClick={() => handleExcluir(colab.id, colab.nome)}
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
                    <button 
                      className="btn-close" 
                      onClick={handleCloseModal}
                      disabled={loading}
                    />
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
                          disabled={loading}
                          placeholder="Nome completo"
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">E-mail *</label>
                        <input
                          type="email"
                          className="form-control"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          disabled={loading}
                          placeholder="email@empresa.com"
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Telefone</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={form.telefone}
                          onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                          disabled={loading}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Data de Admissão</label>
                        <input
                          type="date"
                          className="form-control"
                          value={form.dataAdmissao}
                          onChange={(e) => setForm({ ...form, dataAdmissao: e.target.value })}
                          disabled={loading}
                        />
                      </div>

                      {/* Select Departamento */}
                      <div className="col-12 col-md-6">
                        <label className="form-label">Departamento</label>
                        <select
                          className="form-select"
                          value={form.departamento}
                          onChange={(e) => setForm({ ...form, departamento: e.target.value })}
                          disabled={loading}
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
                        <label className="form-label">Cargo</label>
                        <select
                          className="form-select"
                          value={form.cargo}
                          onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                          disabled={loading}
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
                          disabled={loading}
                          maxLength={14}
                        />
                        <small className="text-muted">Apenas números</small>
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label">Senha inicial *</label>
                        <input
                          type="password"
                          className="form-control"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          disabled={loading}
                          placeholder="Mínimo 6 caracteres"
                          minLength={6}
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
                          disabled={loading}
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label">Tipo Usuário *</label>
                        <select
                          className="form-select"
                          value={form.tipoUsuario}
                          onChange={(e) => setForm({ ...form, tipoUsuario: e.target.value })}
                          disabled={loading}
                        >
                          <option value="2">Colaborador</option>
                          <option value="1">Administrador</option>
                        </select>
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label">Carga Horária</label>
                        <input
                          type="time"
                          className="form-control"
                          value={form.cargaHoraria}
                          onChange={(e) => setForm({ ...form, cargaHoraria: e.target.value })}
                          disabled={loading}
                        />
                        <small className="text-muted">Horário padrão: 08:00</small>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={handleCloseModal}
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleSalvar}
                      disabled={loading || !form.nome || !form.email || !form.cpf || !form.password || !form.matricula}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Salvando...
                        </>
                      ) : (
                        "Salvar Colaborador"
                      )}
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