import { useMemo, useState } from "react";
import { Plus, Search, Trash2, X } from "lucide-react";

import { useFinance } from "../hooks/useFinance";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TransactionForm from "../components/TransactionForm";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2,
});

function Transactions() {
  const { state, dispatch } = useFinance();

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  function handleAdd(transaction) {
    dispatch({
      type: "ADD_TRANSACTION",
      payload: transaction,
    });

    setShowForm(false);
  }

  function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?",
    );

    if (!confirmed) return;

    dispatch({
      type: "DELETE_TRANSACTION",
      payload: id,
    });
  }

  const filteredTransactions = useMemo(() => {
    return state.transactions
      .filter((transaction) => {
        const query = search.trim().toLowerCase();

        const matchesSearch =
          transaction.title.toLowerCase().includes(query) ||
          transaction.category.toLowerCase().includes(query);

        const matchesType =
          typeFilter === "all" || transaction.type === typeFilter;

        return matchesSearch && matchesType;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [state.transactions, search, typeFilter]);

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="min-w-0 flex-1">
        <Header />

        <main className="p-5 sm:p-8">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Transactions
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Manage your income and expenses.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForm(true)}
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
                  New Transaction
                </h2>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  aria-label="Close transaction form"
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <TransactionForm
                onAdd={handleAdd}
                onCancel={() => setShowForm(false)}
              />
            </section>
          )}

          <section className="mb-5 flex flex-col gap-3 sm:flex-row">
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
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
            >
              <option value="all">All transactions</option>
              <option value="income">Income only</option>
              <option value="expense">Expenses only</option>
            </select>
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
                  Try another search or add a transaction.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">
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
                        Action
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
                            {currency.format(transaction.amount)}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDelete(transaction.id)}
                              aria-label={`Delete ${transaction.title}`}
                              title="Delete transaction"
                              className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 size={17} />
                            </button>
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
