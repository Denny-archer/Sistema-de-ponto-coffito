import React, { createContext, useState, useEffect, useCallback } from "react";
import { http, getToken, clearToken } from "../services/http";

export const UserContext = createContext();

export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true); // começa true
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        setIsAuthenticated(false);
        return null;
      }

      const { data } = await http.get("/usuarios/me");
      setUser(data);
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      clearToken();
      setIsAuthenticated(false);
      setUser(null);
      return null;
    } finally {
      setLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    fetchUser(); // roda uma vez ao montar o app
  }, [fetchUser]);

  const clearUser = useCallback(() => {
    clearToken();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        fetchUser,
        clearUser,
        loadingUser,
        isAuthenticated,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
