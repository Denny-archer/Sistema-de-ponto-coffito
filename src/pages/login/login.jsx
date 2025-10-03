import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button, Card, Spinner, Form, Image } from "react-bootstrap";
import { FaUser, FaLock } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import logo from "../../assets/logo.png";
import "./login.css"; // CSS específico do login

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  // Estados
  const [showWelcome, setShowWelcome] = useState(true);
  const [form, setForm] = useState({ email: "", senha: "" });
  const [lembrar, setLembrar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // Tela de boas-vindas temporária
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      await signIn({
        email: form.email,
        password: form.senha,
        remember: lembrar,
      });
      navigate("/home", { replace: true });
    } catch (err) {
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

  if (showWelcome) {
    return (
      <Container className="vh-100 d-flex flex-column justify-content-center align-items-center bg-welcome animate-fade-in">
        <Image src={logo} alt="Logo" width={100} className="mb-4 animate-pop-in" />
        <h1 className="text-primary fw-bold animate-slide-up">Bem-vindo ao Sistema!</h1>
        <Spinner animation="border" variant="primary" className="mt-3" />
      </Container>
    );
  }

return (
  <Container fluid className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-login p-3 animate-fade-in">
    <Image src={logo} alt="Logo" width={80} className="mb-4" />

    {/* Card Sobre o Projeto */}
    <Card className="p-4 shadow-lg text-center w-100 mb-4 login-card" style={{ maxWidth: "500px" }}>
      <Card.Body>
        <Card.Title className="fs-3 fw-bold text-primary">Sistema de Ponto Eletrônico</Card.Title>
        <Card.Text className="text-muted">
          Registre, acompanhe e gerencie os horários de trabalho de forma prática e segura.
        </Card.Text>
      </Card.Body>
    </Card>

    {/* Card Login */}
    <Card className="p-4 shadow-lg w-100 login-card" style={{ maxWidth: "500px" }}>
      <Card.Body>
        <Card.Title className="fs-4 fw-bold text-primary text-center mb-4">Login</Card.Title>

        {erro && <div className="alert alert-danger py-2 text-sm mb-3">{erro}</div>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3 d-flex align-items-center input-group-custom" controlId="formEmail">
            <FaUser className="me-2 icon-lg text-secondary" />
            <Form.Control
              type="email"
              name="email"
              placeholder="Digite seu e-mail"
              value={form.email}
              onChange={handleChange}
              required
              autoFocus
            />
          </Form.Group>

          <Form.Group className="mb-3 d-flex align-items-center input-group-custom" controlId="formSenha">
            <FaLock className="me-2 icon-lg text-secondary" />
            <Form.Control
              type="password"
              name="senha"
              placeholder="Digite sua senha"
              value={form.senha}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <Form.Check
              type="checkbox"
              id="lembrar"
              label="Lembrar de mim"
              checked={lembrar}
              onChange={(e) => setLembrar(e.target.checked)}
            />
            <a href="#" className="small text-primary">
              Esqueci minha senha
            </a>
          </div>

          <div className="d-grid">
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  </Container>
);

};