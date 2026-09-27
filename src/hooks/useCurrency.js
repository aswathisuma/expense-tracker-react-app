import { useMemo } from "react";
import { useSettings } from "./useSettings";
import { formatCompactCurrency, formatCurrency, getCurrencySymbol } from "../utils/formatters";

// Currency formatting that follows the currency chosen in Settings.
// Usage: const { formatCurrency } = useCurrency();
export function useCurrency() {
  const { settings } = useSettings();
  const currencyCode = settings.currency;

  return useMemo(
    () => ({
      currencyCode,
      symbol: getCurrencySymbol(currencyCode),
      formatCurrency: (amount) => formatCurrency(amount, currencyCode),
      formatCompactCurrency: (amount) => formatCompactCurrency(amount, currencyCode),
    }),
    [currencyCode]
  );
}
