import { useFinance } from "../hooks/useFinance";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import TransactionList from "../components/TransactionList";
import SpendingChart from "../components/SpendingChart";

const date = new Date().toLocaleDateString("en-NG", { month: "long", year: "numeric" })
const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

function Dashboard() {
  const { state } = useFinance();

  const { transactions } = state;

  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const balance = income - expenses;

  const savingsRate =
    income > 0 ? ((balance / income) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="min-w-0 flex-1">
        <Header />

        <main className="p-5 sm:p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-slate-900">
              Financial Overview on {date}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Here's a summary of your recorded finances.
            </p>
          </div>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Income"
              amount={currency.format(income)}
              description="Income in your recorded transactions"
              type="income"
            />

            <StatCard
              title="Total Expenses"
              amount={currency.format(expenses)}
              description="Expenses in your recorded transactions"
              type="expenses"
            />

            <StatCard
              title="Net Cash Flow"
              amount={currency.format(balance)}
              description="Income minus expenses"
              type="balance"
            />

            <StatCard
              title="Savings Rate"
              amount={`${savingsRate}%`}
              description="Net cash flow as a share of income"
              type="savings"
            />
          </section>

          <section className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-5">
            <div className="xl:col-span-3">
              <TransactionList transactions={transactions} />
            </div>

            <div className="xl:col-span-2">
              <SpendingChart transactions={transactions} />
            </div>
          </section>

          <p className="mt-6 text-xs text-slate-400">
            Demo data only. Figures reflect transactions currently recorded in
            the application.
          </p>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
