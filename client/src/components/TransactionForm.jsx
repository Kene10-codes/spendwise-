import { useState } from "react";

const today = new Date().toLocaleDateString("en-CA");

const categories = {
  income: ["Salary", "Freelance", "Business", "Medicals", "Investment", "Other"],
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

function TransactionForm({ onAdd, onCancel }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => {
      const next = { ...previous, [name]: value };

      if (name === "type") {
        next.category = categories[value][0];
      }

      return next;
    });

    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    const amount = Number(form.amount);

    if (!form.title.trim()) {
      setError("Please enter a transaction description.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    if (!form.date || Number.isNaN(Date.parse(form.date))) {
      setError("Please select a valid date.");
      return;
    }

    onAdd({
      id: crypto.randomUUID(),
      title: form.title.trim(),
      type: form.type,
      category: form.category,
      amount,
      date: form.date,
    });

    setForm({
      ...initialForm,
      date: today,
    });
    setError("");
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="text-sm font-medium">
          Description
        </label>
        <input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Monthly salary"
          className={inputClass}
          maxLength={100}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="type" className="text-sm font-medium">
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
          <label htmlFor="category" className="text-sm font-medium">
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
          <label htmlFor="amount" className="text-sm font-medium">
            Amount (₦)
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            placeholder="5000"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="date" className="text-sm font-medium">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
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
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Save Transaction
        </button>
      </div>
    </form>
  );
}

export default TransactionForm;
