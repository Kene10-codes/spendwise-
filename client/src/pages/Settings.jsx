import { useEffect, useState } from "react";
import { Download, Save, UserRound, Palette, Banknote } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useFinance } from "../hooks/useFinance";

const currencies = [
  { value: "NGN", label: "Nigerian Naira (NGN)" },
  { value: "USD", label: "US Dollar (USD)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "EUR", label: "Euro (EUR)" },
];

function Settings() {
  const { state, dispatch } = useFinance();

  const savedSettings = state.settings || {
    name: "SpendWise User",
    email: "",
    currency: "NGN",
    theme: "light",
  };

  const [form, setForm] = useState(savedSettings);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setForm(savedSettings);
  }, [state.settings]);

  useEffect(() => {
    const savedTheme =
      state.settings?.theme ||
      localStorage.getItem("spendwise-theme") ||
      "light";

    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, [state.settings?.theme]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    dispatch({
      type: "UPDATE_SETTINGS",
      payload: form,
    });

    document.documentElement.classList.toggle("dark", form.theme === "dark");

    localStorage.setItem("spendwise-theme", form.theme);

    setMessage("Settings saved successfully.");
  }

  function exportData() {
    const backup = {
      exportedAt: new Date().toISOString(),
      ...state,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "spendwise-backup.json";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:flex dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <Header />

        <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your profile and application preferences.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <UserRound className="text-blue-600" size={22} />

                <div>
                  <h2 className="font-semibold text-slate-900">Profile</h2>
                  <p className="text-sm text-slate-500">
                    Your personal details.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Display name
                  </label>

                  <input
                    name="name"
                    value={form.name || ""}
                    onChange={handleChange}
                    required
                    className="w-full text-blue-900 rounded-lg border border-slate-200 px-3 py-2.5"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email || ""}
                    onChange={handleChange}
                    className="w-full text-blue-900 rounded-lg border border-slate-200 px-3 py-2.5"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <Banknote className="text-blue-600" size={22} />

                <div>
                  <h2 className="font-semibold text-slate-900">Currency</h2>
                  <p className="text-sm text-slate-500">
                    Choose your preferred display currency.
                  </p>
                </div>
              </div>

              <label className="mb-2 block text-sm font-medium">
                Preferred currency
              </label>

              <select
                name="currency"
                value={form.currency || "NGN"}
                onChange={handleChange}
                className="w-full rounded-lg text-blue-900 border border-slate-200 px-3 py-2.5 sm:max-w-sm"
              >
                {currencies.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs text-slate-500">
                This saves your preference. Your existing currency formatting
                functions must also read this setting for amounts throughout the
                app to change.
              </p>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <Palette className="text-blue-600" size={22} />

                <div>
                  <h2 className="font-semibold text-slate-900">Appearance</h2>
                  <p className="text-sm text-slate-500">
                    Choose your preferred theme.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {["light", "dark"].map((theme) => (
                  <label
                    key={theme}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 ${
                      form.theme === theme
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-slate-200 text-blue-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={theme}
                      checked={form.theme === theme}
                      onChange={handleChange}
                    />

                    <span className="text-sm capitalize">{theme}</span>
                  </label>
                ))}
              </div>

              <p className="mt-2 text-xs text-slate-500">
                This stores your theme preference. Applying dark styles across
                every page is a separate step.
              </p>
            </section>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Save size={18} />
                Save Settings
              </button>

              {message && (
                <p role="status" className="text-sm text-emerald-600">
                  {message}
                </p>
              )}
            </div>
          </form>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Export your data
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Download your transactions, budgets, and settings as a JSON
                  backup.
                </p>
              </div>

              <button
                type="button"
                onClick={exportData}
                className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium hover:bg-slate-50"
              >
                <Download size={18} />
                Export JSON
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Settings;
