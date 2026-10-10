import { useContext, useReducer } from "react";
import { initialData } from "../data/InitialData.js";
import { financeReducer } from "../reducers/financeReducer";
import { FinanceContext } from "../hooks/useFinance";

function FinanceProvider({ children }) {
  const [state, dispatch] = useReducer(financeReducer, initialData);
  return (
    <FinanceContext.Provider value={{ state, dispatch }}>
      {children}
    </FinanceContext.Provider>
  );
}


export default FinanceProvider;
