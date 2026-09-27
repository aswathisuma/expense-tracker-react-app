import { getMonthKey } from "./dateUtils";

export const DEFAULT_FILTERS = {
  search: "",
  type: "all",
  category: "all",
  paymentMethod: "all",
  startDate: "",
  endDate: "",
  currentMonthOnly: false,
  sortBy: "newest",
};

// Filters in the collapsible panel (search and sort are always visible).
const PANEL_FILTER_KEYS = [
  "type",
  "category",
  "paymentMethod",
  "startDate",
  "endDate",
  "currentMonthOnly",
];

// Every filter must pass for a transaction to be kept, so they all work together.
export function filterTransactions(transactions, filters, currentMonthKey) {
  const searchText = filters.search.trim().toLowerCase();

  return transactions.filter((transaction) => {
    if (searchText) {
      const searchableText = [transaction.description, transaction.category, transaction.paymentMethod]
        .join(" | ")
        .toLowerCase();
      if (!searchableText.includes(searchText)) {
        return false;
      }
    }

    if (filters.type !== "all" && transaction.type !== filters.type) {
      return false;
    }

    if (filters.category !== "all" && transaction.category !== filters.category) {
      return false;
    }

    if (filters.paymentMethod !== "all" && transaction.paymentMethod !== filters.paymentMethod) {
      return false;
    }

    // "Current month" replaces the custom date range when it is ticked.
    if (filters.currentMonthOnly) {
      return getMonthKey(transaction.date) === currentMonthKey;
    }

    // "YYYY-MM-DD" strings sort the same way as dates, so they can be compared directly.
    if (filters.startDate && transaction.date < filters.startDate) {
      return false;
    }
    if (filters.endDate && transaction.date > filters.endDate) {
      return false;
    }

    return true;
  });
}

export function countActivePanelFilters(filters) {
  return PANEL_FILTER_KEYS.filter((key) => filters[key] !== DEFAULT_FILTERS[key]).length;
}

export function hasAnyFilterChanges(filters) {
  return Object.keys(DEFAULT_FILTERS).some((key) => filters[key] !== DEFAULT_FILTERS[key]);
}

export function isDateRangeInvalid(filters) {
  return (
    !filters.currentMonthOnly &&
    Boolean(filters.startDate) &&
    Boolean(filters.endDate) &&
    filters.startDate > filters.endDate
  );
}
