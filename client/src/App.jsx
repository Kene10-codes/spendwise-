import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";

function PlaceholderPage({ title }) {
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="min-w-0 flex-1">
        <Header />

        <main className="p-5 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-2 text-slate-500">
            We'll build this section in an upcoming stage.
          </p>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />

      <Route path="/transactions" element={<Transactions />} />
    </Routes>
  );
}
