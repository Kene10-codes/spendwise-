import { StrictMode } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import AuthProvider from "./context/AuthContext";
import FinanceProvider from "./context/FinanceContext.jsx";

import "./index.css";

function applySavedTheme() {
  const savedTheme = localStorage.getItem("spendwise-theme") || "light";

  document.documentElement.classList.toggle("dark", savedTheme === "dark");
}

applySavedTheme();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <FinanceProvider>
          <App />
        </FinanceProvider>
      </AuthProvider>
    </Router>
  </StrictMode>,
);
