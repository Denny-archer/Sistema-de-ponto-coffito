// 📂 src/services/usuarios.js
import { http } from "./http";

/**
 * 🟢 Criar novo usuário (POST /usuarios/)
 */
export async function createUsuario(payload) {
  try {
    const body = {
      nome: payload.nome,
      tipo_usuario: Number(payload.tipoUsuario || 2),
      matricula: payload.matricula,
      departamento: Number(payload.departamento) || 0,
      cargo: Number(payload.cargo) || 0,
      carga_horaria: payload.cargaHoraria
        ? `${payload.cargaHoraria}:00.000Z`
        : "08:00:00.000Z",
      cpf: payload.cpf,
      email: payload.email,
      password: payload.password,
      data_admissao:
        payload.dataAdmissao || new Date().toISOString().split("T")[0],
    };

    // ✅ Endpoint correto e com barra final
    const response = await http.post("/usuarios/", body);
    return response.data;
  } catch (error) {
    console.error(
      "Erro ao criar usuário:",
      error.response?.data || error.message
    );
    throw error;
  }
}


/**
 * 🟡 Listar todos os usuários (GET /usuarios)
 */
export async function listarUsuarios(skip = 0, sort = false) {
  try {
    const response = await http.get(`/usuarios/`, {
      params: { skip, sort },
    });
    return response.data.usuarios || [];
  } catch (error) {
    console.error(
      "Erro ao listar usuários:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * 🔵 Buscar usuário por ID (via query param id=)
 * Exemplo: GET /usuarios/?id=1
 */
export async function getUsuario(id) {
  try {
    const response = await http.get(`/usuarios/`, { params: { id } });

    // pode vir {usuarios: [...] } ou objeto direto
    const data = response.data.usuarios || response.data;
    if (!data) throw new Error("Usuário não encontrado");

    // se vier lista, devolve o primeiro
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error(
      "Erro ao buscar usuário:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * 🟣 Atualizar usuário parcialmente (PATCH /usuario/:id)
 */
export async function updateUsuario(id, payload) {
  try {
    // 🔧 converte a carga horária para o formato exato exigido
    let cargaFormatada = "08:00:00.000Z";
    if (payload.cargaHoraria) {
      const [h, m] = payload.cargaHoraria.split(":");
      cargaFormatada = `${h.padStart(2, "0")}:${m.padStart(2, "0")}:00.000Z`;
    }

    // 🔧 monta o corpo somente com campos válidos
    const body = {
      nome: payload.nome?.trim(),
      tipo_usuario: Number(payload.tipoUsuario || 2),
      matricula: payload.matricula?.trim(),
      departamento: Number(payload.departamento) || 0,
      cargo: Number(payload.cargo) || 0,
      carga_horaria: cargaFormatada,
      cpf: payload.cpf?.replace(/\D/g, ""),
      email: payload.email?.trim(),
      data_admissao:
        payload.dataAdmissao || new Date().toISOString().split("T")[0],
      status: payload.status === "Ativo" || payload.status === true,
    };

    // só envia senha se foi preenchida (para não invalidar hash)
    if (payload.password && payload.password.length >= 3) {
      body.password = payload.password;
    }

    const response = await http.patch(`/usuarios/${id}`, body);
    return response.data;
  } catch (error) {
    console.error(
      "Erro ao atualizar usuário:",
      error.response?.data || error.message,
      error.response?.data?.detail || ""
    );
    throw error;
  }
}


/**
 * 🔴 Deletar usuário (DELETE /usuario/:id)
 */
export async function deleteUsuario(id) {
  try {
    await http.delete(`/usuario/${id}`);
    return true;
  } catch (error) {
    console.error(
      "Erro ao deletar usuário:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * ⚙️ Buscar batidas (pontos registrados)
 */
export async function getBatidas() {
  try {
    const response = await http.get("/batidas/", { params: { skip: 0 } });
    return response.data.batidas || [];
  } catch (error) {
    console.error(
      "Erro ao carregar batidas:",
      error.response?.data || error.message
    );    
    throw error;
  }
}
