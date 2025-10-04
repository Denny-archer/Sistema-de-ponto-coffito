import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Import global bootstrap + estilos se tiver
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css"; // caso você tenha um global

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
