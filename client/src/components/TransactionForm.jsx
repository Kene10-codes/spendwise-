import { useState } from "react";
import { useFinance } from "../hooks/useFinance";

const today = new Date().toLocaleDateString("en-CA");

const categories = {
  income: ["Salary", "Freelance", "Business", "Investment", "Other"],
  expense: [
    "Food",
    "Transport",
    "Housing",
    "Utilities",
    "Shopping",
    "Health",
    "Entertainment",
    "Other",
  ],
};

const initialForm = {
  title: "",
  type: "expense",
  category: "Food",
  amount: "",
  date: today,
};

function TransactionForm({
  onAdd,
  onCancel,
  initialTransaction = null,
  saving = false,
}) {
  const { state } = useFinance();
  const [form, setForm] = useState(() => {
    if (!initialTransaction) return initialForm;

    return {
      title: initialTransaction.title,
      type: initialTransaction.type,
      category: initialTransaction.category,
      amount: String(initialTransaction.amount),
      date: initialTransaction.date,
    };
  });

  const [error, setError] = useState("");

  const inputClass =
    "mt-1 w-full rounded-xl text-blue-900 border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => {
      if (name === "type") {
        return {
          ...previous,
          type: value,
          category: categories[value][0],
        };
      }

      return {
        ...previous,
        [name]: value,
      };
    });

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const amount = Number(form.amount);

    if (!form.title.trim()) {
      setError("Enter a transaction description.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    if (
      !form.date ||
      Number.isNaN(Date.parse(form.date)) ||
      form.date > today
    ) {
      setError("Enter a valid date that is not in the future.");
      return;
    }

    try {
      setError("");

      await onAdd({
        ...(initialTransaction ? { id: initialTransaction.id } : {}),
        title: form.title.trim(),
        type: form.type,
        category: form.category,
        amount,
        date: form.date,
      });
    } catch (error) {
      setError(error.message || "Failed to save transaction.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="text-sm font-medium text-blue-900">
          Description
        </label>
        <input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          className={inputClass}
          maxLength={100}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="type" className="text-sm font-medium text-blue-900">
            Transaction type
          </label>
          <select
            id="type"
            name="type"
            value={form.type}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div>
          <label htmlFor="category" className="text-sm font-medium text-blue-900">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className={inputClass}
          >
            {categories[form.type].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="amount" className="text-sm font-medium text-blue-900">
            Amount ({state.settings.currency})
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="date" className="text-sm font-medium text-blue-900">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            max={today}
            value={form.date}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          disabled={saving}
          type="button"
          onClick={onCancel}
          className="rounded-xl text-blue-900 border border-slate-200 px-4 py-2.5 text-sm hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? "Saving..."
            : initialTransaction
              ? "Save Changes"
              : "Add Transaction"}
        </button>
      </div>
    </form>
  );
}

export default TransactionForm;
