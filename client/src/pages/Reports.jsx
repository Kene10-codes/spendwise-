import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import { useFinance } from "../hooks/useFinance";
import { useCurrency } from "../hooks/useCurrency";

const COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#64748b",
];

function getCurrentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function Reports() {
  const { state } = useFinance();

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);

  const transactions = state.transactions || [];

  const monthlyTransactions = useMemo(
    () =>
      transactions.filter((transaction) =>
        transaction.date.startsWith(selectedMonth),
      ),
    [transactions, selectedMonth],
  );

  const income = monthlyTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const expenses = monthlyTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const cashFlow = income - expenses;

  const categoryData = useMemo(() => {
    const totals = {};

    monthlyTransactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        totals[transaction.category] =
          (totals[transaction.category] || 0) + Number(transaction.amount);
      });

    return Object.entries(totals)
      .map(([category, amount]) => ({
        category,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthlyTransactions]);

  const monthlyComparison = useMemo(() => {
    const results = [];

    // Include the selected month and the five preceding months.
    const [year, month] = selectedMonth.split("-").map(Number);

    for (let offset = 5; offset >= 0; offset--) {
      const date = new Date(year, month - 1 - offset, 1);

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0",
      )}`;

      const monthTransactions = transactions.filter((transaction) =>
        transaction.date.startsWith(key),
      );

      const monthIncome = monthTransactions
        .filter((transaction) => transaction.type === "income")
        .reduce((total, transaction) => total + Number(transaction.amount), 0);

      const monthExpenses = monthTransactions
        .filter((transaction) => transaction.type === "expense")
        .reduce((total, transaction) => total + Number(transaction.amount), 0);

      results.push({
        month: date.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        Income: monthIncome,
        Expenses: monthExpenses,
      });
    }

    return results;
  }, [transactions, selectedMonth]);

  const savingsRate = income > 0 ? (cashFlow / income) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 lg:flex dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <Header />

        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Reports & Analytics
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Understand your income, spending, and cash flow.
              </p>
            </div>

            <input
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              aria-label="Select report month"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total Income"
              amount={useCurrency(income)}
              color="text-emerald-600"
            />

            <SummaryCard
              title="Total Expenses"
              amount={useCurrency(expenses)}
              color="text-rose-600"
            />

            <SummaryCard
              title="Net Cash Flow"
              amount={useCurrency(cashFlow)}
              color={cashFlow >= 0 ? "text-blue-600" : "text-rose-600"}
            />

            <SummaryCard
              title="Savings Rate"
              amount={`${savingsRate.toFixed(1)}%`}
              color="text-violet-600"
            />
          </div>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">
              Monthly Income vs. Expenses
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              The selected month and five preceding months.
            </p>

            <div className="mt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyComparison}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />

                  <XAxis dataKey="month" />

                  <YAxis
                    tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                  />

                  <Tooltip formatter={(value) => useCurrency(value)} />

                  <Legend />

                  <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />

                  <Bar
                    dataKey="Expenses"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900">
                Spending by Category
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Where your money went during the selected month.
              </p>

              {categoryData.length === 0 ? (
                <EmptyChart />
              ) : (
                <>
                  <div className="mt-4 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="amount"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          label={({ percent }) =>
                            `${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {categoryData.map((item, index) => (
                            <Cell
                              key={item.category}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>

                        <Tooltip formatter={(value) => useCurrency(value)} />

                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 space-y-3">
                    {categoryData.map((item, index) => (
                      <div
                        key={item.category}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />

                          <span className="text-slate-600">
                            {item.category}
                          </span>
                        </div>

                        <span className="font-medium text-slate-900">
                          {useCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900">Monthly Summary</h2>

              <p className="mt-1 text-sm text-slate-500">
                A breakdown of your selected month's transactions.
              </p>

              <div className="mt-6 space-y-5">
                <SummaryRow
                  label="Number of transactions"
                  value={String(monthlyTransactions.length)}
                />

                <SummaryRow
                  label="Average expense"
                  value={useCurrency(
                    monthlyTransactions.filter(
                      (transaction) => transaction.type === "expense",
                    ).length > 0
                      ? expenses /
                          monthlyTransactions.filter(
                            (transaction) => transaction.type === "expense",
                          ).length
                      : 0,
                  )}
                />

                <SummaryRow
                  label="Highest spending category"
                  value={categoryData[0]?.category || "No expenses"}
                />

                <SummaryRow
                  label="Highest category spending"
                  value={useCurrency(categoryData[0]?.amount || 0)}
                />

                <SummaryRow
                  label="Income minus expenses"
                  value={useCurrency(cashFlow)}
                  valueColor={
                    cashFlow >= 0 ? "text-emerald-600" : "text-rose-600"
                  }
                />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({ title, amount, color }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>

      <p className={`mt-3 text-2xl font-bold ${color}`}>{amount}</p>
    </div>
  );
}

function SummaryRow({ label, value, valueColor = "text-slate-900" }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
      <span className="text-sm text-slate-500">{label}</span>

      <span className={`text-right text-sm font-semibold ${valueColor}`}>
        {value}
      </span>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-64 items-center justify-center text-center text-sm text-slate-500">
      No expense transactions for this month yet.
    </div>
  );
}

export default Reports;
