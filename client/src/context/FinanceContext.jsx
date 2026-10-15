import { useEffect, useReducer, useState } from "react";

import { financeReducer } from "../reducers/financeReducer";
import { initialData } from "../data/InitialData";
import { FinanceContext } from "../hooks/useFinance";
import { useAuth } from "../hooks/useAuth";

import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../services/transactionService";

import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../services/budgetService";

const STORAGE_KEY = "spendwise-finance-data";

function getInitialState() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const parsedData = savedData ? JSON.parse(savedData) : {};

    return {
      // Transactions and budgets are loaded from MongoDB.
      transactions: [],
      budgets: [],

      settings: {
        name: "SpendWise User",
        email: "",
        currency: "NGN",
        theme: "light",
        ...(initialData.settings || {}),
        ...(parsedData.settings || {}),
      },
    };
  } catch (error) {
    console.error("Failed to load SpendWise data:", error);

    return {
      transactions: [],
      budgets: [],
      settings: {
        name: "SpendWise User",
        email: "",
        currency: "NGN",
        theme: "light",
        ...(initialData.settings || {}),
      },
    };
  }
}

function FinanceProvider({ children }) {
  const [state, dispatch] = useReducer(
    financeReducer,
    undefined,
    getInitialState,
  );

  const { token, user } = useAuth();

  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState("");

  const [budgetsLoading, setBudgetsLoading] = useState(false);
  const [budgetsError, setBudgetsError] = useState("");

  // Persist settings locally. Transactions and budgets belong in MongoDB.
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          settings: state.settings,
        }),
      );
    } catch (error) {
      console.error("Failed to save SpendWise settings:", error);
    }
  }, [state.settings]);

  // Load the authenticated user's transactions from MongoDB.
  useEffect(() => {
    let cancelled = false;

    async function loadTransactions() {
      // Clear previous data when the authentication context changes.
      dispatch({
        type: "SET_TRANSACTIONS",
        payload: [],
      });

      if (!token) {
        setTransactionsError("");
        setTransactionsLoading(false);
        return;
      }

      setTransactionsLoading(true);
      setTransactionsError("");

      try {
        const transactions = await getTransactions();

        if (!cancelled) {
          dispatch({
            type: "SET_TRANSACTIONS",
            payload: transactions,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setTransactionsError(error.message || "Failed to load transactions.");
        }
      } finally {
        if (!cancelled) {
          setTransactionsLoading(false);
        }
      }
    }

    loadTransactions();

    return () => {
      cancelled = true;
    };
  }, [token, user?.id]);

  // Load the authenticated user's budgets from MongoDB.
  useEffect(() => {
    let cancelled = false;

    async function loadBudgets() {
      // Never display a previous user's budgets while loading.
      dispatch({
        type: "SET_BUDGETS",
        payload: [],
      });

      if (!token) {
        setBudgetsError("");
        setBudgetsLoading(false);
        return;
      }

      setBudgetsLoading(true);
      setBudgetsError("");

      try {
        const budgets = await getBudgets();

        if (!cancelled) {
          dispatch({
            type: "SET_BUDGETS",
            payload: budgets,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setBudgetsError(error.message || "Failed to load budgets.");
        }
      } finally {
        if (!cancelled) {
          setBudgetsLoading(false);
        }
      }
    }

    loadBudgets();

    return () => {
      cancelled = true;
    };
  }, [token, user?.id]);

  // Create a transaction in MongoDB, then update React state.
  async function addTransaction(transaction) {
    const savedTransaction = await createTransaction(transaction);

    dispatch({
      type: "ADD_TRANSACTION",
      payload: savedTransaction,
    });

    return savedTransaction;
  }

  // Update MongoDB first, then update React state.
  async function editTransaction(id, updates) {
    const updatedTransaction = await updateTransaction(id, updates);

    dispatch({
      type: "UPDATE_TRANSACTION",
      payload: updatedTransaction,
    });

    return updatedTransaction;
  }

  // Delete from MongoDB first, then update React state.
  async function removeTransaction(id) {
    await deleteTransaction(id);

    dispatch({
      type: "DELETE_TRANSACTION",
      payload: id,
    });
  }

  // Create a budget in MongoDB, then update React state.
  async function addBudget(budget) {
    const savedBudget = await createBudget(budget);

    dispatch({
      type: "ADD_BUDGET",
      payload: savedBudget,
    });

    return savedBudget;
  }

  // Edit a budget in MongoDB, then update React state.
  async function editBudget(id, updates) {
    const updatedBudget = await updateBudget(id, updates);

    dispatch({
      type: "UPDATE_BUDGET",
      payload: updatedBudget,
    });

    return updatedBudget;
  }

  // Delete a budget from MongoDB, then update React state.
  async function removeBudget(id) {
    await deleteBudget(id);

    dispatch({
      type: "DELETE_BUDGET",
      payload: id,
    });
  }

  // Apply the user's selected theme.
  useEffect(() => {
    const isDark = state.settings?.theme === "dark";

    document.documentElement.classList.toggle("dark", isDark);
  }, [state.settings?.theme]);

  return (
    <FinanceContext.Provider
      value={{
        state,
        dispatch,

        // Transaction methods and states.
        addTransaction,
        editTransaction,
        removeTransaction,
        transactionsLoading,
        transactionsError,

        // Budget methods and states.
        addBudget,
        editBudget,
        removeBudget,
        budgetsLoading,
        budgetsError,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export default FinanceProvider;
