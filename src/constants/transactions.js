export const TRANSACTION_TYPES = {
  EXPENSE: "expense",
  INCOME: "income",
};

export const TRANSACTION_TYPE_LABELS = {
  expense: "Expense",
  income: "Income",
};

export const PAYMENT_METHODS = [
  "Cash",
  "UPI",
  "Credit Card",
  "Debit Card",
  "Bank Transfer",
  "Other",
];

export const DESCRIPTION_MAX_LENGTH = 100;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "highest", label: "Highest amount" },
  { value: "lowest", label: "Lowest amount" },
];
