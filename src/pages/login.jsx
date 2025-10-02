import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import logo from "../assets/logo.png";
import "../styles/custom.css";

function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [form, setForm] = useState({ email: "", senha: "" });
  const [lembrar, setLembrar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      // Backend exige username/password (form-urlencoded)
      await signIn({
        email: form.email,          // vai virar "username"
        password: form.senha,       // vai virar "password"
        remember: lembrar,
      });
      navigate("/home", { replace: true });
    } catch (err) {
      // FastAPI retorna um array de erros em err.response.data.detail
      let msg = "Falha no login. Verifique suas credenciais.";
      if (err?.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          msg = err.response.data.detail.map((e) => e.msg).join(", ");
        } else if (typeof err.response.data.detail === "string") {
          msg = err.response.data.detail;
        }
      }
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* LOGO */}
      <img src={logo} alt="COFFITO" className="login-logo" />

      {/* CARD DE LOGIN */}
      <div className="card login-card">
        <h4 className="text-center mb-4">Entrar na sua conta</h4>

        {erro && (
          <div className="alert alert-danger py-2 text-sm mb-3">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Usuário/E-mail */}
          <div className="mb-5">
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Usuário ou E-mail"
              value={form.email}
              onChange={handleChange}
              required
              autoFocus
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
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
