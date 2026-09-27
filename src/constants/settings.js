// "locale" controls number grouping: en-IN gives ₹1,25,000, en-US gives $125,000.
export const CURRENCIES = [
  { code: "INR", label: "Indian Rupee", locale: "en-IN" },
  { code: "USD", label: "US Dollar", locale: "en-US" },
  { code: "EUR", label: "Euro", locale: "en-IE" },
  { code: "GBP", label: "British Pound", locale: "en-GB" },
];

export const DEFAULT_SETTINGS = {
  currency: "INR",
};
