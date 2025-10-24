import { createContext, useContext, useState } from "react";

const Ctx = createContext(null);

export function BankHealthProvider({ children }) {
  const [status, setStatus] = useState(null); // "debito" | "credito" | null
  return (
    <Ctx.Provider value={{ status, setStatus }}>
      {children}
    </Ctx.Provider>
  );
}

export function useBankHealth() {
  return useContext(Ctx);
}
