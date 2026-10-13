
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

const STORAGE_KEY = "spendwise-finance-data";

function getInitialState() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const parsedData = savedData ? JSON.parse(savedData) : {};

    return {
      // Transactions are loaded from MongoDB after authentication.
      transactions: [],

      budgets: Array.isArray(parsedData.budgets)
        ? parsedData.budgets
        : initialData.budgets,

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
      budgets: initialData.budgets || [],
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

  // Save budgets and settings locally, not transactions.
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          budgets: state.budgets,
          settings: state.settings,
        }),
      );
    } catch (error) {
      console.error("Failed to save SpendWise data:", error);
    }
  }, [state.budgets, state.settings]);

  // Load the authenticated user's transactions from MongoDB.
  useEffect(() => {
    let cancelled = false;

    async function loadTransactions() {
      if (!token) {
        dispatch({
          type: "SET_TRANSACTIONS",
          payload: [],
        });
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

  useEffect(() => {
    const isDark = state.settings?.theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
  }, [state.settings?.theme]);

  return (
    <FinanceContext.Provider
      value={{
        state,
        dispatch,
        addTransaction,
        editTransaction,
        removeTransaction,
        transactionsLoading,
        transactionsError,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export default FinanceProvider;
