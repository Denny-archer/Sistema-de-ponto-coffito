import React from "react";

export default function ColaboradorModal({
  show,
  form,
  setForm,
  onClose,
  onSave,
  loading,
  departamentos,
  cargos,
  modo = "novo",
}) {
  if (!show) return null;

  const isEditar = modo === "editar";

  const handleSubmit = () => onSave(form);

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          {/* Cabeçalho */}
          <div className="modal-header">
            <h5 className="modal-title">
              {isEditar ? "Editar Colaborador" : "Adicionar Novo Colaborador"}
            </h5>
            <button
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            />
          </div>

          {/* Corpo */}
          <div className="modal-body">
            <div className="row g-3">
              {/* Nome */}
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

              {/* Email */}
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

             

              {/* Data de Admissão */}
              <div className="col-12 col-md-6">
                <label className="form-label">Data de Admissão</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.dataAdmissao}
                  onChange={(e) =>
                    setForm({ ...form, dataAdmissao: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              {/* Departamento */}
              <div className="col-12 col-md-6">
                <label className="form-label">Departamento</label>
                <select
                  className="form-select"
                  value={form.departamento}
                  onChange={(e) =>
                    setForm({ ...form, departamento: e.target.value })
                  }
                  disabled={loading}
                >
                  <option value="">Selecione...</option>
                  {departamentos.map((depto) => (
                    <option key={depto.id} value={depto.id}>
                      {depto.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cargo */}
              <div className="col-12 col-md-6">
                <label className="form-label">Cargo</label>
                <select
                  className="form-select"
                  value={form.cargo}
                  onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                  disabled={loading}
                >
                  <option value="">Selecione...</option>
                  {cargos.map((cargo) => (
                    <option key={cargo.id} value={cargo.id}>
                      {cargo.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* CPF */}
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

              {/* Senha */}
              <div className="col-12 col-md-6">
                <label className="form-label">
                  {isEditar ? "Nova Senha (opcional)" : "Senha inicial *"}
                </label>
                <input
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  disabled={loading}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
              </div>

              {/* Matrícula */}
              <div className="col-12 col-md-6">
                <label className="form-label">Matrícula *</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.matricula}
                  onChange={(e) =>
                    setForm({ ...form, matricula: e.target.value })
                  }
                  placeholder="Ex: 121400"
                  disabled={loading}
                />
              </div>

              {/* Tipo Usuário */}
              <div className="col-12 col-md-6">
                <label className="form-label">Tipo Usuário *</label>
                <select
                  className="form-select"
                  value={form.tipoUsuario}
                  onChange={(e) =>
                    setForm({ ...form, tipoUsuario: e.target.value })
                  }
                  disabled={loading}
                >
                  <option value="2">Colaborador</option>
                  <option value="1">Administrador</option>
                </select>
              </div>

              {/* Carga Horária */}
              <div className="col-12 col-md-6">
                <label className="form-label">Carga Horária</label>
                <input
                  type="time"
                  className="form-control"
                  value={form.cargaHoraria}
                  onChange={(e) =>
                    setForm({ ...form, cargaHoraria: e.target.value })
                  }
                  disabled={loading}
                />
                <small className="text-muted">Horário padrão: 08:00</small>
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div className="modal-footer">
            <button
              className="btn btn-outline-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={
                loading ||
                (modo !== "editar" && ( // no modo "novo" exige campos mínimos
                  !form.nome || !form.email || !form.cpf || !form.password || !form.matricula
                ))
              }
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Salvando...
                </>
              ) : isEditar ? (
                "Atualizar Colaborador"
              ) : (
                "Salvar Colaborador"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
