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

    // sempre valida com a API, mas mantém cache local enquanto carrega
    meRequest()
      .then((me) => {
        setUser(me);
        localStorage.setItem("user", JSON.stringify(me));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("user");
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
