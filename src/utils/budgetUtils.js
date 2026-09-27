import { BUDGET_STATUS } from "../constants/budgets";
import { getBudgetStatus, getExpensesByCategory } from "./calculations";
import { getExpenseCategories } from "./categoryUtils";

// One row per expense category: { category, budgetStatus }.
export function getCategoryBudgetRows(categories, budgets, monthTransactions) {
  const spentByCategory = new Map(
    getExpensesByCategory(monthTransactions).map((row) => [row.category, row.amount])
  );

  return getExpenseCategories(categories).map((category) => ({
    category,
    budgetStatus: getBudgetStatus(
      budgets.categoryLimits[category.id] ?? 0,
      spentByCategory.get(category.name) ?? 0
    ),
  }));
}

// Items that need attention, the most-used budget first.
// items: [{ id, name, budgetStatus }]
export function getBudgetAlerts(items) {
  return items
    .filter(
      ({ budgetStatus }) =>
        budgetStatus.status === BUDGET_STATUS.WARNING ||
        budgetStatus.status === BUDGET_STATUS.EXCEEDED
    )
    .sort((a, b) => b.budgetStatus.percentUsed - a.budgetStatus.percentUsed);
}

export function getTotalCategoryLimits(budgets) {
  return Object.values(budgets.categoryLimits).reduce((total, limit) => total + limit, 0);
}

// Returns a new categoryLimits object without the given category.
export function removeCategoryLimit(budgets, categoryId) {
  return {
    ...budgets,
    categoryLimits: Object.fromEntries(
      Object.entries(budgets.categoryLimits).filter(([id]) => id !== categoryId)
    ),
  };
}

function isPositiveNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function isValidBudgets(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    isPositiveNumber(value.monthlyLimit) &&
    typeof value.categoryLimits === "object" &&
    value.categoryLimits !== null &&
    Object.values(value.categoryLimits).every(isPositiveNumber)
  );
}
