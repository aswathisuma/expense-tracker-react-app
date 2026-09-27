// "type" decides which transactions a category can be used for:
// "expense", "income", or "both".
export const DEFAULT_CATEGORIES = [
  { id: "cat-food", name: "Food", type: "expense" },
  { id: "cat-travel", name: "Travel", type: "expense" },
  { id: "cat-shopping", name: "Shopping", type: "expense" },
  { id: "cat-bills", name: "Bills", type: "expense" },
  { id: "cat-entertainment", name: "Entertainment", type: "expense" },
  { id: "cat-health", name: "Health", type: "expense" },
  { id: "cat-education", name: "Education", type: "expense" },
  { id: "cat-salary", name: "Salary", type: "income" },
  { id: "cat-freelance", name: "Freelance", type: "income" },
  { id: "cat-other", name: "Other", type: "both" },
];
