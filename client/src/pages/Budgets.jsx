import { useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Pencil,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import { useFinance } from "../hooks/useFinance";
import { useCurrency } from "../hooks/useCurrency";

const categories = [
  "Food",
  "Transport",
  "Housing",
  "Utilities",
  "Shopping",
  "Health",
  "Entertainment",
];

function getCurrentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function Budgets() {
  const { state, addBudget, removeBudget, budgetsLoading, budgetsError } =
    useFinance();

  const formatCurrency = useCurrency();

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [deletingBudgetId, setDeletingBudgetId] = useState(null);

  const budgets = state.budgets || [];
  const transactions = state.transactions || [];

  const availableCategories = categories.filter(
    (item) => !budgets.some((budget) => budget.category === item),
  );

  const budgetData = useMemo(() => {
    return budgets.map((budget) => {
      const spent = transactions
        .filter(
          (transaction) =>
            transaction.type === "expense" &&
            transaction.category === budget.category &&
            transaction.date?.startsWith(selectedMonth),
        )
        .reduce((total, transaction) => total + Number(transaction.amount), 0);

      const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

      let status = "On track";

      if (percentage >= 100) {
        status = "Over budget";
      } else if (percentage >= 80) {
        status = "Near limit";
      }

      return {
        ...budget,
        spent,
        percentage,
        status,
      };
    });
  }, [budgets, transactions, selectedMonth]);

  const totalBudget = budgets.reduce(
    (total, budget) => total + Number(budget.limit),
    0,
  );

  const totalSpent = budgetData.reduce(
    (total, budget) => total + budget.spent,
    0,
  );

  const exceededBudgets = budgetData.filter(
    (budget) => budget.percentage >= 100,
  ).length;

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const numericLimit = Number(limit);

    if (!category) {
      setFormError("Please select a category.");
      return;
    }

    if (
      limit.trim() === "" ||
      !Number.isFinite(numericLimit) ||
      numericLimit <= 0
    ) {
      setFormError("Enter a budget limit greater than zero.");
      return;
    }

    if (
      !editingBudgetId &&
      budgets.some((budget) => budget.category === category)
    ) {
      setFormError("You already have a budget for this category.");
      return;
    }

    setSaving(true);

    try {
      if (editingBudgetId) {
        await editBudget(editingBudgetId, {
          limit: numericLimit,
        });
      } else {
        await addBudget({
          category,
          limit: numericLimit,
        });
      }

      setCategory("");
      setLimit("");
      setEditingBudgetId(null);
      setShowForm(false);
      setFormError("");
    } catch (error) {
      setFormError(error.message || "Failed to save budget.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(budget) {
    setEditingBudgetId(budget.id);
    setCategory(budget.category);
    setLimit(String(budget.limit));
    setFormError("");
    setShowForm(true);
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?",
    );

    if (!confirmed) return;

    setDeleteError("");
    setDeletingBudgetId(id);

    try {
      await removeBudget(id);
    } catch (error) {
      setDeleteError(error.message || "Failed to delete budget.");
    } finally {
      setDeletingBudgetId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:flex dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <Header />

        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Monthly Budgets
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Set spending limits and keep your finances on track.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <input
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                aria-label="Select budget month"
              />

              <button
                type="button"
                onClick={() => {
                  setShowForm(!showForm);
                  setFormError("");
                }}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus size={18} />
                Add Budget
              </button>
            </div>
          </div>

          {budgetsError && (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
            >
              Could not load budgets: {budgetsError}
            </div>
          )}

          {deleteError && (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
            >
              {deleteError}
            </div>
          )}

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-3"
            >
              <h2 className="text-lg font-semibold sm:col-span-3">
                {editingBudgetId ? "Edit Budget" : "Create Budget"}
              </h2>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  required
                  disabled={
                    saving || budgetsLoading || Boolean(editingBudgetId)
                  }
                  className="w-full rounded-lg border border-slate-200 p-3"
                >
                  <option value="">Choose category</option>

                  {categories
                    .filter(
                      (item) =>
                        !budgets.some((budget) => budget.category === item) ||
                        (editingBudgetId &&
                          budgets.some(
                            (budget) =>
                              budget.id === editingBudgetId &&
                              budget.category === item,
                          )),
                    )
                    .map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </select>

                {availableCategories.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">
                    All available categories already have budgets.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Monthly limit (₦)
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={limit}
                  onChange={(event) => setLimit(event.target.value)}
                  required
                  disabled={saving || budgetsLoading}
                  placeholder="e.g. 50000"
                  className="w-full rounded-lg border border-slate-200 p-3"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  disabled={
                    saving || budgetsLoading || availableCategories.length === 0
                  }
                  className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingBudgetId
                      ? "Update Budget"
                      : "Save Budget"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setCategory("");
                    setLimit("");
                    setEditingBudgetId(null);
                    setFormError("");
                  }}
                  disabled={saving}
                  className="rounded-lg border border-slate-200 px-4 py-3 text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>

              {formError && (
                <p role="alert" className="text-sm text-rose-600 sm:col-span-3">
                  {formError}
                </p>
              )}
            </form>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryCard
              title="Total Monthly Limits"
              amount={formatCurrency(totalBudget)}
              icon={<Wallet size={20} />}
            />

            <SummaryCard
              title="Spent Against Budgets"
              amount={formatCurrency(totalSpent)}
              icon={<Wallet size={20} />}
            />

            <SummaryCard
              title="Budgets Exceeded"
              amount={String(exceededBudgets)}
              icon={<AlertTriangle size={20} />}
            />
          </div>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Category Budgets
            </h2>

            {budgetsLoading ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                Loading your budgets...
              </div>
            ) : budgetData.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <Wallet className="mx-auto mb-3 text-slate-400" size={32} />

                <p className="font-medium text-slate-700">
                  No budgets created yet
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Add a budget to start tracking your spending.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {budgetData.map((budget) => {
                  const isOver = budget.percentage >= 100;
                  const isNear = budget.percentage >= 80 && !isOver;

                  const progressColor = isOver
                    ? "bg-rose-500"
                    : isNear
                      ? "bg-amber-500"
                      : "bg-emerald-500";

                  return (
                    <article
                      key={budget.id}
                      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {budget.category}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            Monthly limit: {formatCurrency(budget.limit)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDelete(budget.id)}
                          disabled={deletingBudgetId === budget.id}
                          aria-label={`Delete ${budget.category} budget`}
                          className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingBudgetId === budget.id ? (
                            <span className="text-xs">Deleting...</span>
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>

                      <div className="mt-5 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-sm text-slate-500">Amount spent</p>

                          <p className="mt-1 text-xl font-bold text-slate-900">
                            {formatCurrency(budget.spent)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p
                            className={`text-sm font-semibold ${
                              isOver
                                ? "text-rose-600"
                                : isNear
                                  ? "text-amber-600"
                                  : "text-emerald-600"
                            }`}
                          >
                            {budget.status}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {Math.round(budget.percentage)}% used
                          </p>
                        </div>
                      </div>

                      <div
                        className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100"
                        role="progressbar"
                        aria-label={`${budget.category} budget used`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.min(
                          100,
                          Math.round(budget.percentage),
                        )}
                      >
                        <div
                          className={`h-full rounded-full transition-all ${progressColor}`}
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(0, budget.percentage),
                            )}%`,
                          }}
                        />
                      </div>

                      <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                        {isOver ? (
                          <>
                            <AlertTriangle
                              size={16}
                              className="text-rose-500"
                            />
                            Over by{" "}
                            {formatCurrency(budget.spent - budget.limit)}
                          </>
                        ) : isNear ? (
                          <>
                            <AlertTriangle
                              size={16}
                              className="text-amber-500"
                            />
                            {formatCurrency(budget.limit - budget.spent)}{" "}
                            remaining
                          </>
                        ) : (
                          <>
                            <CheckCircle2
                              size={16}
                              className="text-emerald-500"
                            />
                            {formatCurrency(budget.limit - budget.spent)}{" "}
                            remaining
                          </>
                        )}
                      </p>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({ title, amount, icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        <span className="text-blue-600">{icon}</span>
      </div>

      <p className="mt-3 text-2xl font-bold text-slate-900">{amount}</p>
    </div>
  );
}

export default Budgets;
