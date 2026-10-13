import { useMemo, useState } from "react";
import { Plus, Search, Trash2, Pencil, X, CalendarDays } from "lucide-react";

import { useFinance } from "../hooks/useFinance";
import { useCurrency } from "../hooks/useCurrency";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TransactionForm from "../components/TransactionForm";

function Transactions() {
  const {
    state,
    addTransaction,
    editTransaction,
    removeTransaction,
    transactionsLoading,
    transactionsError,
  } = useFinance();

  const formatCurrency = useCurrency();
  const [apiError, setApiError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  function openAddForm() {
    setEditingTransaction(null);
    setShowForm(true);
  }

  function openEditForm(transaction) {
    setEditingTransaction(transaction);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingTransaction(null);
  }

 async function handleSave(transaction) {
  try {
    setApiError("");
    setSaving(true);

    if (editingTransaction) {
      await editTransaction(editingTransaction.id, transaction);
    } else {
      await addTransaction(transaction);
    }

    closeForm();
  } catch (error) {
    setApiError(error.message || "Failed to save transaction.");
  } finally {
    setSaving(false);
  }
}

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?",
    );

    if (!confirmed) return;

    try {
      setApiError("");
      await removeTransaction(id);
    } catch (error) {
      setApiError(error.message || "Failed to delete transaction.");
    }
  }
  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return state.transactions
      .filter((transaction) => {
        const matchesSearch =
          transaction.title.toLowerCase().includes(query) ||
          transaction.category.toLowerCase().includes(query);

        const matchesType =
          typeFilter === "all" || transaction.type === typeFilter;

        const matchesStartDate = !startDate || transaction.date >= startDate;

        const matchesEndDate = !endDate || transaction.date <= endDate;

        return (
          matchesSearch && matchesType && matchesStartDate && matchesEndDate
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [state.transactions, search, typeFilter, startDate, endDate]);

  if (transactionsLoading) {
    return <p className="p-6">Loading transactions...</p>;
  }
  return (
    <div className="min-h-screen bg-slate-50 lg:flex dark:bg-slate-950 dark:text-slate-100">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="min-w-0 flex-1">
        <Header />

        <main className="p-5 sm:p-8">
          {(apiError || transactionsError) && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
            >
              {apiError || transactionsError}
            </div>
          )}
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Transactions
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Track and manage your income and expenses.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Plus size={18} />
              Add Transaction
            </button>
          </div>

          {showForm && (
            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingTransaction ? "Edit Transaction" : "New Transaction"}
                </h2>

                <button
                  type="button"
                  onClick={closeForm}
                  aria-label="Close form"
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <TransactionForm
                key={editingTransaction?.id ?? "new-transaction"}
                initialTransaction={editingTransaction}
                onAdd={handleSave}
                onCancel={closeForm}
                saving={saving}
              />
            </section>
          )}

          <section className="mb-5 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <Search size={18} className="text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search description or category..."
                  aria-label="Search transactions"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                aria-label="Filter transaction type"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
              >
                <option value="all">All types</option>
                <option value="income">Income only</option>
                <option value="expense">Expenses only</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3 sm:items-end">
              <div>
                <label
                  htmlFor="startDate"
                  className="flex items-center gap-2 text-sm font-medium text-slate-600"
                >
                  <CalendarDays size={16} />
                  From
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="text-sm font-medium text-slate-600"
                >
                  To
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  max={new Date().toLocaleDateString("en-CA")}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setSearch("");
                  setTypeFilter("all");
                }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Clear filters
              </button>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900">All Transactions</h2>
              <span className="text-sm text-slate-500">
                {filteredTransactions.length} records
              </span>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <p className="font-medium text-slate-700">
                  No transactions found
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Try changing your filters or add a transaction.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-medium">Description</th>
                      <th className="px-5 py-4 font-medium">Category</th>
                      <th className="px-5 py-4 font-medium">Date</th>
                      <th className="px-5 py-4 font-medium">Type</th>
                      <th className="px-5 py-4 text-right font-medium">
                        Amount
                      </th>
                      <th className="px-5 py-4 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.map((transaction) => {
                      const isIncome = transaction.type === "income";

                      return (
                        <tr key={transaction.id} className="hover:bg-slate-50">
                          <td className="px-5 py-4 text-sm font-medium text-slate-800">
                            {transaction.title}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {transaction.category}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {transaction.date}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                isIncome
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {isIncome ? "Income" : "Expense"}
                            </span>
                          </td>

                          <td
                            className={`px-5 py-4 text-right text-sm font-semibold ${
                              isIncome ? "text-emerald-700" : "text-slate-800"
                            }`}
                          >
                            {isIncome ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => openEditForm(transaction)}
                                aria-label={`Edit ${transaction.title}`}
                                title="Edit transaction"
                                className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700"
                              >
                                <Pencil size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(transaction.id)}
                                aria-label={`Delete ${transaction.title}`}
                                title="Delete transaction"
                                className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default Transactions;
