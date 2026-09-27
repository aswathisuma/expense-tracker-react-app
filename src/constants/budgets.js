// categoryLimits is keyed by category id, so renaming a category keeps its budget.
export const DEFAULT_BUDGETS = {
  monthlyLimit: 0,
  categoryLimits: {},
};

// Show a warning once this percentage of a budget is used.
export const BUDGET_WARNING_PERCENT = 80;

export const BUDGET_STATUS = {
  NONE: "none",
  OK: "ok",
  WARNING: "warning",
  EXCEEDED: "exceeded",
};
