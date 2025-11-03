import { createContext, useEffect, useState } from "react";
import { meRequest, loginRequest, logoutRequest } from "../services/auth";
import { getToken } from "../services/http";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Recupera usuário do localStorage se existir
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setBooting(false);
      return;
    }

    // 🔹 Se houver usuário salvo, mantém ele enquanto valida no backend
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // 🔹 Valida em background
    meRequest()
      .then((me) => {
        setUser(me);
        localStorage.setItem("user", JSON.stringify(me));
      })
      .catch((error) => {
        console.warn("Token inválido ou expirado:", error);
        // só desloga se for erro 401 (token expirado de verdade)
        if (error.response?.status === 401) {
          setUser(null);
          localStorage.removeItem("user");
        }
      })
      .finally(() => setBooting(false));
  }, []);


  async function signIn({ email, password, remember }) {
    await loginRequest({ email, password, remember });
    const me = await meRequest();
    setUser(me);
    localStorage.setItem("user", JSON.stringify(me));
  }

  async function signOut() {
    await logoutRequest();
    setUser(null);
    localStorage.removeItem("user");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        booting,
        signIn,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
