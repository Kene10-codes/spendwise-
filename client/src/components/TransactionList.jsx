import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useCurrency } from "../hooks/useCurrency";

function TransactionList({ transactions }) {
  const recentTransactions = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  if (recentTransactions.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="font-medium text-slate-700">No transactions yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Add your first transaction to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h3 className="font-semibold text-slate-900">Recent Transactions</h3>
        <span className="text-xs text-slate-500">Latest activity</span>
      </div>

      <div className="divide-y divide-slate-100">
        {recentTransactions.map((transaction) => {
          const isIncome = transaction.type === "income";

          return (
            <div
              key={transaction.id}
              className="flex items-center justify-between gap-3 px-5 py-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`rounded-xl p-2 ${
                    isIncome
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {isIncome ? (
                    <ArrowDownLeft size={19} />
                  ) : (
                    <ArrowUpRight size={19} />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {transaction.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {transaction.category} · {transaction.date}
                  </p>
                </div>
              </div>

              <p
                className={`shrink-0 text-sm font-semibold ${
                  isIncome ? "text-emerald-700" : "text-slate-900"
                }`}
              >
                {isIncome ? "+" : "-"}
                {useCurrency(transaction.amount)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TransactionList;
