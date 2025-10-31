// src/pages/colaboradores/hooks/useColaboradores.js
import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import {
  listarUsuarios,
  createUsuario,
  updateUsuario,
  getUsuario,     // ⬅️ vamos buscar os detalhes no editar
} from "../../../services/usuarios";
import { listarDepartamentos } from "../../../services/departamentos";
import { listarCargos } from "../../../services/cargos";

const INITIAL_FORM = {
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
};

export function useColaboradores() {
  const [colaboradores, setColaboradores] = useState([]);
  const [departamentosApi, setDepartamentosApi] = useState([]);
  const [cargosApi, setCargosApi] = useState([]);
  const [form, setForm] = useState({ ...INITIAL_FORM });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterDepartamento, setFilterDepartamento] = useState("Todos");
  const [sortField, setSortField] = useState("nome");
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(false);

  const [modo, setModo] = useState("novo");
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const usuariosResponse = await listarUsuarios();
        const usuarios = usuariosResponse.usuarios || usuariosResponse;

        const usuariosUI = usuarios.map((u) => ({
          id: u.id,
          nome: u.nome,
          email: u.email,
          telefone: u.telefone ?? "",
          departamento: u.departamento ?? "-",
          cargo: u.cargo ?? "-",
          status: u.status ? "Ativo" : "Inativo",
          dataAdmissao: u.data_admissao || "-",
          ultimoPonto: "--/--/---- --:--",
          horasTrabalhadas: "00:00",
        }));
        setColaboradores(usuariosUI);

        const cargos = await listarCargos();
        setCargosApi(cargos.cargos || cargos);

        const departamentos = await listarDepartamentos();
        setDepartamentosApi(departamentos.departamentos || departamentos);
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Erro ao carregar dados",
          text: "Não foi possível carregar colaboradores, cargos ou departamentos.",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🔹 expõe uma ação para “Novo colaborador” já zerando o form
  const novoColaborador = () => {
    setModo("novo");
    setEditandoId(null);
    setForm({ ...INITIAL_FORM });
  };

  // 🔹 ao editar, buscamos detalhes do usuário (cpf, matrícula, etc.)
  const handleEditar = async (colab) => {
    setLoading(true);
    try {
      setModo("editar");
      setEditandoId(colab.id);
      const det = await getUsuario(colab.id); // precisa existir no service

      setForm({
        nome: det.nome ?? colab.nome ?? "",
        email: det.email ?? colab.email ?? "",
        telefone: det.telefone ?? "",
        departamento: det.departamento ?? "",
        cargo: det.cargo ?? "",
        status: det.status ? "Ativo" : "Inativo",
        dataAdmissao: det.data_admissao ?? "",
        cpf: det.cpf ?? "",
        password: "", // opcional no PATCH
        matricula: det.matricula ?? "",
        tipoUsuario: String(det.tipo_usuario ?? "2"),
        cargaHoraria:
          (det.carga_horaria && det.carga_horaria.substring(0, 5)) || "08:00",
      });
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Erro ao carregar colaborador",
        text: "Não foi possível carregar dados completos para edição.",
      });
      // fallback: volta para “novo”
      novoColaborador();
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDirection("asc"); }
  };

  const filtered = useMemo(() => {
    return colaboradores
      .filter((c) => {
        const t = searchTerm.toLowerCase();
        return (
          c.nome?.toLowerCase().includes(t) ||
          c.email?.toLowerCase().includes(t) ||
          c.departamento?.toString().toLowerCase().includes(t) ||
          c.cargo?.toString().toLowerCase().includes(t)
        );
      })
      .filter((c) => filterStatus === "Todos" || c.status === filterStatus)
      .filter(
        (c) =>
          filterDepartamento === "Todos" ||
          c.departamento?.toString() === filterDepartamento
      )
      .sort((a, b) => {
        const aVal = `${a[sortField] ?? ""}`.toLowerCase();
        const bVal = `${b[sortField] ?? ""}`.toLowerCase();
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
  }, [colaboradores, searchTerm, filterStatus, filterDepartamento, sortField, sortDirection]);

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
      setColaboradores((prev) => prev.filter((c) => c.id !== id));
      Swal.fire({
        icon: "success",
        title: "Excluído!",
        text: "Colaborador removido localmente (aguardando endpoint DELETE).",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const handleSalvar = async (payload) => {
    setLoading(true);
    try {
      if (modo === "editar" && editandoId) {
        await updateUsuario(editandoId, payload);
        setColaboradores((prev) =>
          prev.map((c) =>
            c.id === editandoId
              ? {
                  ...c,
                  nome: payload.nome ?? c.nome,
                  email: payload.email ?? c.email,
                  departamento:
                    departamentosApi.find((d) => d.id === Number(payload.departamento))?.nome ??
                    c.departamento,
                  cargo:
                    cargosApi.find((x) => x.id === Number(payload.cargo))?.nome ??
                    c.cargo,
                  status: payload.status ? "Ativo" : payload.status === false ? "Inativo" : c.status,
                  dataAdmissao: payload.dataAdmissao ?? c.dataAdmissao,
                }
              : c
          )
        );
        Swal.fire({ icon: "success", title: "Atualizado!", text: "Colaborador editado com sucesso." });
      } else {
        const novo = await createUsuario(payload);
        const colaboradorUI = {
          id: novo.id,
          nome: payload.nome,
          email: payload.email,
          telefone: payload.telefone || "",
          departamento:
            departamentosApi.find((d) => d.id === Number(payload.departamento))?.nome || "-",
          cargo:
            cargosApi.find((c) => c.id === Number(payload.cargo))?.nome || "-",
          status: payload.status ? "Ativo" : "Inativo",
          dataAdmissao: payload.dataAdmissao || "-",
          ultimoPonto: "--/--/---- --:--",
          horasTrabalhadas: "00:00",
        };
        setColaboradores((prev) => [...prev, colaboradorUI]);
        Swal.fire({ icon: "success", title: "Cadastrado!", text: "Novo colaborador adicionado." });
      }
    } catch (e) {
      console.error("Erro ao salvar:", e);
      Swal.fire({ icon: "error", title: "Erro", text: "Falha ao salvar colaborador." });
    } finally {
      setLoading(false);
      setModo("novo");
      setEditandoId(null);
    }
  };

  return {
    // dados
    colaboradores: filtered,
    departamentosApi,
    cargosApi,
    loading,
    // form
    form,
    setForm,
    modo,
    setModo,
    novoColaborador,  // ⬅️ exposto
    // ações
    handleSort,
    handleExcluir,
    handleSalvar,
    handleEditar,
    // filtros / sort
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterDepartamento,
    setFilterDepartamento,
    sortField,
    sortDirection,
  };
}
