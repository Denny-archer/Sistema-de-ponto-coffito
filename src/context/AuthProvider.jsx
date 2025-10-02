import { createContext, useEffect, useState } from "react";
import { meRequest, loginRequest, logoutRequest } from "../services/auth";
import { getToken } from "../services/http";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setBooting(false); return; }
    meRequest().then(setUser).catch(()=>setUser(null)).finally(()=>setBooting(false));
  }, []);

  async function signIn({ email, password, remember }) {
    await loginRequest({ email, password, remember });
    const me = await meRequest();
    setUser(me);
  }
  async function signOut() {
    await logoutRequest();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, booting, signIn, signOut, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

