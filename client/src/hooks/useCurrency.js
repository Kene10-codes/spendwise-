import { useMemo } from "react";
import { useFinance } from "./useFinance";

function useCurrency() {
  const { state } = useFinance();
  const currency = state.settings?.currency || "NGN";

  const formatCurrency = useMemo(() => {
    return (amount) =>
      new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(Number(amount) || 0);
  }, [currency]);

  return formatCurrency;
}

export { useCurrency };
