import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";



export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />

      <Route path="/transactions" element={<Transactions />} />
      <Route path="/budgets" element={<Budgets />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />

    </Routes>
  );
}
