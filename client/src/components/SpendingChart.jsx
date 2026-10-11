import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useCurrency } from "../hooks/useCurrency";
const COLORS = [
  "#059669",
  "#2563eb",
  "#d97706",
  "#7c3aed",
  "#e11d48",
  "#0891b2",
];


export default function SpendingChart({ transactions }) {
  const categoryTotals = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((totals, transaction) => {
      const category = transaction.category;

      totals[category] = (totals[category] || 0) + transaction.amount;

      return totals;
    }, {});

  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900">Spending by Category</h3>
        <p className="mt-1 text-sm text-slate-500">Where your money goes</p>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-slate-500">
          No expense data to display yet.
        </div>
      ) : (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                >
                  {chartData.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip formatter={(value) => useCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            {chartData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{
                    backgroundColor: COLORS[index % COLORS.length],
                  }}
                />
                <div className="min-w-0">
                  <p className="truncate text-xs text-slate-500">{item.name}</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {useCurrency(item.value)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
