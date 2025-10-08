import React, { createContext, useState, useCallback } from "react";
import { http } from "../services/http";

export const UserContext = createContext();

export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // 🔹 Carrega usuário autenticado
  const fetchUser = useCallback(async () => {
    try {
      setLoadingUser(true);
      const { data } = await http.get("/usuarios/me");
      setUser(data);
      return data;
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      clearUser();
      return null;
    } finally {
      setLoadingUser(false);
    }
  }, []);

  const clearUser = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        fetchUser,
        clearUser,
        loadingUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
