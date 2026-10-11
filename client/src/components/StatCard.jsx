import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";

function StatCard({ title, amount, description, type = "balance" }) {
  const styles = {
    income: {
      icon: ArrowDownRight,
      color: "bg-emerald-50 text-emerald-700",
    },
    expenses: {
      icon: ArrowUpRight,
      color: "bg-rose-50 text-rose-700",
    },
    balance: {
      icon: Wallet,
      color: "bg-blue-50 text-blue-700",
    },
    savings: {
      icon: Wallet,
      color: "bg-violet-50 text-violet-700",
    },
  };

  const { icon: Icon, color } = styles[type] ?? styles.balance;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>

        <div className={`rounded-xl p-2 ${color}`}>
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-5 break-words text-2xl font-bold tracking-tight text-slate-900">
        {amount}
      </p>

      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </article>
  );
}

export default StatCard;
