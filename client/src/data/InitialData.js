export const initialData = {
  transactions: [
    {
      id: "1",
      title: "Monthly Salary",
      category: "Salary",
      type: "income",
      amount: 250000,
      date: "2026-10-01",
    },
    {
      id: "2",
      title: "House Rent",
      category: "Housing",
      type: "expense",
      amount: 100000,
      date: "2026-10-02",
    },
    {
      id: "3",
      title: "Groceries",
      category: "Food",
      type: "expense",
      amount: 15000,
      date: "2026-10-04",
    },
    {
      id: "4",
      title: "Freelance Project",
      category: "Freelance",
      type: "income",
      amount: 80000,
      date: "2026-10-05",
    },
  ],

  budgets: [
    { id: "1", category: "Food", limit: 50000 },
    { id: "2", category: "Transport", limit: 30000 },
    { id: "3", category: "Housing", limit: 100000 },
  ],
};