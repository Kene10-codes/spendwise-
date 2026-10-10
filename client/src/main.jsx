import { StrictMode } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import FinanceProvider from "./context/FinanceContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <FinanceProvider>
        <App />
      </FinanceProvider>
    </Router>
  </StrictMode>,
);
