import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useFinance } from "../hooks/useFinance";
import { useCurrency } from "../hooks/useCurrency";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CHART_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
];

const currentDate = new Date();

function getTransactionDate(transaction) {
  const value = transaction.date || transaction.createdAt;

  if (!value) return null;

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function Reports() {
  const { state } = useFinance();
  const formatCurrency = useCurrency();

  const transactions = state.transactions || [];

  const [selectedMonth, setSelectedMonth] = useState(
    String(currentDate.getMonth()),
  );

  const [selectedYear, setSelectedYear] = useState(
    String(currentDate.getFullYear()),
  );

  const years = useMemo(() => {
    const transactionYears = transactions
      .map(getTransactionDate)
      .filter(Boolean)
      .map((transactionDate) => transactionDate.getFullYear());

    return [...new Set([currentDate.getFullYear(), ...transactionYears])]
      .sort((a, b) => b - a)
      .map(String);
  }, [transactions]);

  const monthlyTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = getTransactionDate(transaction);

      if (!transactionDate) return false;

      return (
        transactionDate.getMonth() === Number(selectedMonth) &&
        transactionDate.getFullYear() === Number(selectedYear)
      );
    });
  }, [transactions, selectedMonth, selectedYear]);

  const income = monthlyTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);

  const expenses = monthlyTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);

  const savings = income - expenses;

  const savingsRate =
    income > 0 ? ((savings / income) * 100).toFixed(1) : "0.0";

  const comparisonData = [
    {
      name: MONTHS[Number(selectedMonth)].slice(0, 3),
      Income: income,
      Expenses: expenses,
    },
  ];

  const categoryData = useMemo(() => {
    const categoryTotals = {};

    monthlyTransactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        const category = transaction.category || "Other";

        categoryTotals[category] =
          (categoryTotals[category] || 0) + Number(transaction.amount || 0);
      });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [monthlyTransactions]);

  const handleExportCSV = () => {
    const escapeCSV = (value) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = [
      ["SpendWise Financial Report"],
      [`Period: ${MONTHS[Number(selectedMonth)]} ${selectedYear}`],
      [],
      ["Financial Summary"],
      ["Total Income", income],
      ["Total Expenses", expenses],
      ["Net Savings", savings],
      ["Savings Rate (%)", savingsRate],
      [],
      ["Date", "Description", "Category", "Type", "Amount"],
      ...monthlyTransactions.map((transaction) => {
        const transactionDate = getTransactionDate(transaction);

        return [
          transactionDate ? transactionDate.toLocaleDateString("en-CA") : "",
          transaction.description || "Transaction",
          transaction.category || "Other",
          transaction.type,
          Number(transaction.amount || 0),
        ];
      }),
    ];

    const csvContent = rows
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    // Add a UTF-8 BOM for better Excel compatibility.
    const blob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `spendwise-report-${selectedYear}-${String(
      Number(selectedMonth) + 1,
    ).padStart(2, "0")}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };
  const tooltipFormatter = (value) => formatCurrency(Number(value));

  return (
    <div className="min-h-screen bg-slate-50 lg:flex dark:bg-slate-950 dark:text-slate-100">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="min-w-0 flex-1">
        <Header />

        <main className="p-5 sm:p-8">
          {/* Page heading */}
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Financial Reports
              </h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Understand your income, expenses, and savings over time.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>

          {/* Date filters */}
          <section className="mb-7 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label
                htmlFor="report-month"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Month
              </label>

              <select
                id="report-month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {MONTHS.map((month, index) => (
                  <option key={month} value={String(index)}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label
                htmlFor="report-year"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Year
              </label>

              <select
                id="report-year"
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Summary cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Monthly Income
              </p>

              <p className="mt-3 break-words text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(income)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Monthly Expenses
              </p>

              <p className="mt-3 break-words text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(expenses)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Net Savings
              </p>

              <p
                className={`mt-3 break-words text-2xl font-bold ${
                  savings >= 0
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(savings)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Savings Rate
              </p>

              <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                {savingsRate}%
              </p>
            </div>
          </section>

          {/* Income versus expenses */}
          <section className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Income vs. Expenses
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Financial activity for {MONTHS[Number(selectedMonth)]}{" "}
                {selectedYear}.
              </p>

              <div className="mt-5 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparisonData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#94a3b8"
                      opacity={0.25}
                    />

                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={75}
                      tickFormatter={(value) =>
                        new Intl.NumberFormat("en-NG", {
                          notation: "compact",
                          maximumFractionDigits: 1,
                        }).format(value)
                      }
                    />

                    <Tooltip formatter={tooltipFormatter} />

                    <Legend />

                    <Bar
                      dataKey="Income"
                      fill="#10b981"
                      radius={[5, 5, 0, 0]}
                    />

                    <Bar
                      dataKey="Expenses"
                      fill="#ef4444"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {monthlyTransactions.length === 0 && (
                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                  No transactions recorded for this period.
                </p>
              )}
            </div>

            {/* Expense breakdown */}
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Expense Breakdown
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                See which categories account for your spending.
              </p>

              {categoryData.length === 0 ? (
                <div className="flex h-72 items-center justify-center text-center text-sm text-slate-500 dark:text-slate-400">
                  No expense data available for this period.
                </div>
              ) : (
                <>
                  <div className="mt-4 h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          innerRadius={48}
                          paddingAngle={3}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>

                        <Tooltip formatter={tooltipFormatter} />

                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-3 space-y-3">
                    {categoryData.map((category) => {
                      const percentage =
                        expenses > 0 ? (category.value / expenses) * 100 : 0;

                      return (
                        <div key={category.name}>
                          <div className="mb-1 flex justify-between gap-3 text-sm">
                            <span className="text-slate-600 dark:text-slate-300">
                              {category.name}
                            </span>

                            <span className="text-right font-medium text-slate-900 dark:text-white">
                              {formatCurrency(category.value)} (
                              {percentage.toFixed(1)}%)
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor:
                                  CHART_COLORS[
                                    categoryData.findIndex(
                                      (item) => item.name === category.name,
                                    ) % CHART_COLORS.length
                                  ],
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Selected period transaction summary */}
          <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Transactions for {MONTHS[Number(selectedMonth)]} {selectedYear}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {monthlyTransactions.length}{" "}
                {monthlyTransactions.length === 1
                  ? "transaction"
                  : "transactions"}{" "}
                recorded during this period.
              </p>
            </div>

            {monthlyTransactions.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No transactions found for the selected month.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium">Description</th>
                      <th className="px-5 py-3 font-medium">Category</th>
                      <th className="px-5 py-3 font-medium">Type</th>
                      <th className="px-5 py-3 text-right font-medium">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[...monthlyTransactions]
                      .sort((a, b) => {
                        return (
                          getTransactionDate(b)?.getTime() -
                          getTransactionDate(a)?.getTime()
                        );
                      })
                      .map((transaction) => {
                        const transactionDate = getTransactionDate(transaction);

                        return (
                          <tr
                            key={transaction.id || transaction._id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          >
                            <td className="whitespace-nowrap px-5 py-4 text-slate-600 dark:text-slate-300">
                              {transactionDate
                                ? transactionDate.toLocaleDateString("en-NG", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "—"}
                            </td>

                            <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                              {transaction.description || "Transaction"}
                            </td>

                            <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                              {transaction.category || "Other"}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  transaction.type === "income"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                    : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                                }`}
                              >
                                {transaction.type}
                              </span>
                            </td>

                            <td
                              className={`whitespace-nowrap px-5 py-4 text-right font-semibold ${
                                transaction.type === "income"
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {transaction.type === "income" ? "+" : "-"}
                              {formatCurrency(Number(transaction.amount || 0))}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <p className="mt-6 text-xs text-slate-400">
            Reports are calculated from the transactions recorded in your
            account. Select another month or year to review a different period.
          </p>
        </main>
      </div>
    </div>
  );
}

export default Reports;
