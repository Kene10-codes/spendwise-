import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  ChartNoAxesCombined,
  Settings,
  CircleDollarSign,
} from "lucide-react";

const links = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Transactions", path: "/transactions", icon: ArrowLeftRight },
  { name: "Budgets", path: "/budgets", icon: Wallet },
  { name: "Reports", path: "/reports", icon: ChartNoAxesCombined },
  { name: "Settings", path: "/settings", icon: Settings },
];

function Sidebar() {
  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-5">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <CircleDollarSign size={24} />
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-900">SpendWise</h1>
          <p className="text-xs text-slate-500">Personal Finance</p>
        </div>
      </div>

      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Menu
      </p>

      <nav className="flex flex-col gap-2">
        {links.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <Icon size={19} />
            {name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl bg-slate-900 p-4 text-white">
        <p className="text-sm font-semibold">Build better habits</p>
        <p className="mt-2 text-xs leading-5 text-slate-300">
          Track your spending and make every naira count.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
