import { createContext, useContext } from "react";

const FinanceContext = createContext(null);

function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}

export { FinanceContext, useFinance };