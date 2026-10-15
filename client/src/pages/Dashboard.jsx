import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import TransactionList from "../components/TransactionList";
import SpendingChart from "../components/SpendingChart";

import { useFinance } from "../hooks/useFinance";
import { useCurrency } from "../hooks/useCurrency";

const date = new Date().toLocaleDateString("en-NG", {
  month: "long",
  year: "numeric",
});

function Dashboard() {
  const { state } = useFinance();
  const formatCurrency = useCurrency();

  const transactions = state.transactions || [];
  const budgets = state.budgets || [];

  // Calculate total income.
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
      0,
    );

  // Calculate total expenses.
  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
      0,
    );

  // Calculate net cash flow and savings rate.
  const balance = income - expenses;

  const savingsRate =
    income > 0 ? ((balance / income) * 100).toFixed(1) : "0.0";

  // Calculate spending for each budget category.
  const budgetOverview = budgets.map((budget) => {
    const categoryExpenses = transactions
      .filter(
        (transaction) =>
          transaction.type === "expense" &&
          transaction.category === budget.category,
      )
      .reduce(
        (total, transaction) => total + Number(transaction.amount || 0),
        0,
      );

    const limit = Number(budget.limit || 0);
    const percentage =
      limit > 0 ? (categoryExpenses / limit) * 100 : 0;

    return {
      ...budget,
      spent: categoryExpenses,
      remaining: limit - categoryExpenses,
      percentage,
      progress: Math.min(percentage, 100),
    };
  });

  const totalBudget = budgets.reduce(
    (total, budget) => total + Number(budget.limit || 0),
    0,
  );

  const totalBudgetSpent = budgetOverview.reduce(
    (total, budget) => total + budget.spent,
    0,
  );

  const budgetUsage =
    totalBudget > 0
      ? Math.min((totalBudgetSpent / totalBudget) * 100, 100)
      : 0;

  const exceededBudgets = budgetOverview.filter(
    (budget) => budget.spent > Number(budget.limit || 0),
  ).length;

  // Sort transactions by date to find the most recent activity.
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt || 0).getTime();
    const dateB = new Date(b.date || b.createdAt || 0).getTime();

    return dateB - dateA;
  });

  const latestTransaction = sortedTransactions[0];

  // Generate a financial insight based on recorded activity.
  let insightTitle = "Start tracking your finances";
  let insightMessage =
    "Record your income and expenses to see useful financial insights.";

  if (transactions.length > 0) {
    if (income === 0 && expenses > 0) {
      insightTitle = "Your expenses need attention";
      insightMessage =
        "You have recorded expenses but no income yet. Add your income to get a clearer picture of your finances.";
    } else if (income > 0 && balance < 0) {
      insightTitle = "You're spending more than you earn";
      insightMessage =
        "Your recorded expenses exceed your income. Review your spending categories and look for areas to reduce costs.";
    } else if (income > 0 && Number(savingsRate) >= 20) {
      insightTitle = "You're building a healthy surplus";
      insightMessage =
        "You're keeping at least 20% of your recorded income after expenses. Keep monitoring your spending and savings goals.";
    } else if (income > 0 && balance >= 0) {
      insightTitle = "Your cash flow is positive";
      insightMessage =
        "Your recorded income covers your expenses. Review your budget limits to stay on track.";
    } else {
      insightTitle = "Keep tracking your activity";
      insightMessage =
        "Continue recording your financial activity to build a more complete picture of your spending.";
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:flex dark:bg-slate-950 dark:text-slate-100">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="min-w-0 flex-1">
        <Header />

        <main className="p-5 sm:p-8">
          {/* Page heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Financial Overview
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Here's your financial summary for {date}.
            </p>
          </div>

          {/* Financial summary cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Income"
              amount={formatCurrency(income)}
              description="Income in your recorded transactions"
              type="income"
            />

            <StatCard
              title="Total Expenses"
              amount={formatCurrency(expenses)}
              description="Expenses in your recorded transactions"
              type="expenses"
            />

            <StatCard
              title="Net Cash Flow"
              amount={formatCurrency(balance)}
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

          {/* Budget overview and financial insights */}
          <section className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Budget overview */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Budget Overview
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Track your spending against your limits.
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {budgets.length} {budgets.length === 1 ? "budget" : "budgets"}
                </span>
              </div>

              {budgets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center dark:border-slate-700">
                  <p className="font-medium text-slate-700 dark:text-slate-200">
                    No budgets created yet
                  </p>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Create budgets for categories such as Food, Transport, and
                    Shopping to track your spending.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        Total budget usage
                      </span>

                      <span className="font-bold text-slate-900 dark:text-white">
                        {budgetUsage.toFixed(1)}%
                      </span>
                    </div>

                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className={`h-full rounded-full transition-all ${
                          budgetUsage >= 100
                            ? "bg-red-500"
                            : budgetUsage >= 80
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                        }`}
                        style={{ width: `${budgetUsage}%` }}
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        Spent: {formatCurrency(totalBudgetSpent)}
                      </span>

                      <span>
                        Budget: {formatCurrency(totalBudget)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {budgetOverview.map((budget) => {
                      const isExceeded =
                        budget.spent > Number(budget.limit || 0);

                      const isNearLimit =
                        budget.percentage >= 80 && !isExceeded;

                      return (
                        <div key={budget.id || budget.category}>
                          <div className="mb-2 flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-100">
                                {budget.category}
                              </p>

                              <p
                                className={`mt-1 text-xs ${
                                  isExceeded
                                    ? "text-red-600 dark:text-red-400"
                                    : isNearLimit
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-slate-500 dark:text-slate-400"
                                }`}
                              >
                                {isExceeded
                                  ? "Budget exceeded"
                                  : isNearLimit
                                    ? "Approaching budget limit"
                                    : "Within budget"}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                {formatCurrency(budget.spent)}
                              </p>

                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                of {formatCurrency(Number(budget.limit || 0))}
                              </p>
                            </div>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isExceeded
                                  ? "bg-red-500"
                                  : isNearLimit
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                              }`}
                              style={{ width: `${budget.progress}%` }}
                            />
                          </div>

                          <p className="mt-1.5 text-right text-xs text-slate-500 dark:text-slate-400">
                            {isExceeded
                              ? `${formatCurrency(Math.abs(budget.remaining))} over budget`
                              : `${formatCurrency(budget.remaining)} remaining`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Financial insights */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Financial Insights
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  A quick look at your financial activity.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                      balance < 0
                        ? "bg-red-100 dark:bg-red-950"
                        : "bg-emerald-100 dark:bg-emerald-950"
                    }`}
                  >
                    {balance < 0 ? "!" : "✓"}
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {insightTitle}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {insightMessage}
                    </p>
                  </div>
                </div>
              </div>

              {exceededBudgets > 0 && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
                  <p className="font-semibold text-red-800 dark:text-red-300">
                    {exceededBudgets}{" "}
                    {exceededBudgets === 1 ? "budget has" : "budgets have"}{" "}
                    exceeded its limit
                  </p>

                  <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                    Review your category spending to help control costs.
                  </p>
                </div>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Transactions
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                    {transactions.length}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Recorded entries
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Budgets over limit
                  </p>

                  <p
                    className={`mt-2 text-2xl font-bold ${
                      exceededBudgets > 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {exceededBudgets}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Out of {budgets.length} budgets
                  </p>
                </div>
              </div>

              {latestTransaction && (
                <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Latest recorded transaction
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-800 dark:text-slate-100">
                        {latestTransaction.description ||
                          latestTransaction.category ||
                          "Transaction"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {latestTransaction.date
                          ? new Date(
                              latestTransaction.date,
                            ).toLocaleDateString("en-NG", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : latestTransaction.createdAt
                            ? new Date(
                                latestTransaction.createdAt,
                              ).toLocaleDateString("en-NG", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Date unavailable"}
                      </p>
                    </div>

                    <p
                      className={`shrink-0 font-bold ${
                        latestTransaction.type === "income"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {latestTransaction.type === "income" ? "+" : "-"}
                      {formatCurrency(
                        Number(latestTransaction.amount || 0),
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Transactions and spending chart */}
          <section className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-5">
            <div className="min-w-0 xl:col-span-3">
              <TransactionList transactions={transactions} />
            </div>

            <div className="min-w-0 xl:col-span-2">
              <SpendingChart transactions={transactions} />
            </div>
          </section>

          <p className="mt-6 text-xs text-slate-400">
            Figures reflect the transactions and budgets currently recorded in
            your account.
          </p>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;