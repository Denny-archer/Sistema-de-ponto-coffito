import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/custom.css"; // onde colocamos os ajustes globais

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", senha: "" });
  const [lembrar, setLembrar] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login:", form, "Lembrar:", lembrar);
    // 👉 Aqui vai chamada à API futuramente
    navigate("/home");
  };

  return (
    <div className="login-container">
      {/* LOGO */}
      <img
        src="src\assets\logo.png"
        alt="COFFITO"
        className="login-logo"
      />

      {/* CARD DE LOGIN */}
      <div className="card login-card">
        <h4 className="text-center mb-4">Entrar na sua conta</h4>

        <form onSubmit={handleSubmit}>
          {/* Usuário/E-mail */}
          <div className="mb-5">
            <input
              type="text"
              name="email"
              className="form-control"
              placeholder="Usuário ou E-mail"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Senha */}
          <div className="mb-3">
            <input
              type="password"
              name="senha"
              className="form-control"
              placeholder="Senha"
              value={form.senha}
              onChange={handleChange}
              required
            />
          </div>

          {/* Lembrar + Esqueci */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="form-check">
              <input
                type="checkbox"
                id="lembrar"
                className="form-check-input"
                checked={lembrar}
                onChange={(e) => setLembrar(e.target.checked)}
              />
              <label htmlFor="lembrar" className="form-check-label">
                Lembrar de mim
              </label>
            </div>
            <a href="#" className="small text-primary">
              Esqueci minha senha
            </a>
          </div>

          {/* Botão Entrar */}
          <button type="submit" className="btn btn-primary">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
