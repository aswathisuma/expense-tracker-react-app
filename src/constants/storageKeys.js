// Every localStorage key the app uses, in one place.
// The "expense-tracker:" prefix avoids clashes with other apps on localhost.
// Only device preferences live here; the financial data is in the Django backend.
export const STORAGE_KEYS = {
  SETTINGS: "expense-tracker:settings",
  THEME: "expense-tracker:theme",
};
