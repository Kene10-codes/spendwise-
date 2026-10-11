import { useEffect, useReducer } from "react";

import { financeReducer } from "../reducers/financeReducer";
import { initialData } from "../data/InitialData";
import { FinanceContext } from "../hooks/useFinance";

const STORAGE_KEY = "spendwise-finance-data";

function getInitialState() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData) {
      const parsedData = JSON.parse(savedData);

      return {
        transactions: Array.isArray(parsedData.transactions)
          ? parsedData.transactions
          : initialData.transactions,

        budgets: Array.isArray(parsedData.budgets)
          ? parsedData.budgets
          : initialData.budgets,

        settings: {
          ...initialData.settings,
          ...(parsedData.settings || {}),
        },
      };
    }
  } catch (error) {
    console.error("Failed to load SpendWise data:", error);
  }

  return {
    ...initialData,
    settings: {
      name: "SpendWise User",
      email: "",
      currency: "NGN",
      theme: "light",
      ...(initialData.settings || {}),
    },
  };
}

function FinanceProvider({ children }) {
  const [state, dispatch] = useReducer(
    financeReducer,
    undefined,
    getInitialState,
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save SpendWise data:", error);
    }
  }, [state]);

  useEffect(() => {
    const isDark = state.settings?.theme === "dark";

    document.documentElement.classList.toggle("dark", isDark);
  }, [state.settings?.theme]);

  return (
    <FinanceContext.Provider value={{ state, dispatch }}>
      {children}
    </FinanceContext.Provider>
  );
}

export default FinanceProvider;
