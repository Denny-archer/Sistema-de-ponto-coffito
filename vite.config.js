import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   
    port: 5173,
    allowedHosts: [
      "2cd262c2b202.ngrok-free.app", // 🔹 copie exatamente o host gerado pelo ngrok
    ]
  },
});
