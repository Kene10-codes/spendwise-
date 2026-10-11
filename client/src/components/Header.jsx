import { Bell, Search } from "lucide-react";

function Header() {
  return (
    <header className="flex flex-col justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:flex-row sm:items-center sm:px-8">
      <div>
        <p className="text-sm text-slate-500">Welcome back</p>
        <h2 className="text-2xl font-bold text-slate-900">Your Dashboard</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
          <Search size={18} className="text-slate-400" />
          <input
            type="search"
            placeholder="Search..."
            aria-label="Search"
            className="w-full bg-transparent text-sm outline-none sm:w-36"
          />
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
        >
          <Bell size={19} />
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
          SW
        </div>
      </div>
    </header>
  );
}

export default Header;
