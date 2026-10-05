import { TRANSACTION_TYPES } from "../constants/transactions";

const EMPTY_USAGE = { count: 0, expenseTotal: 0, incomeTotal: 0, types: new Set() };

// Categories allowed for a transaction type ("expense" or "income").
export function getCategoriesForType(categories, transactionType) {
  return categories.filter(
    (category) => category.type === "both" || category.type === transactionType
  );
}

// Categories that can have a budget (anything that can hold expenses).
export function getExpenseCategories(categories) {
  return getCategoriesForType(categories, TRANSACTION_TYPES.EXPENSE);
}

// Map of category name -> how the transactions use it. Built in one pass.
export function getCategoryUsageMap(transactions) {
  const usageByName = new Map();

  for (const transaction of transactions) {
    const usage = usageByName.get(transaction.category) ?? {
      count: 0,
      expenseTotal: 0,
      incomeTotal: 0,
      types: new Set(),
    };
    usage.count += 1;
    usage.types.add(transaction.type);
    if (transaction.type === TRANSACTION_TYPES.INCOME) {
      usage.incomeTotal += transaction.amount;
    } else {
      usage.expenseTotal += transaction.amount;
    }
    usageByName.set(transaction.category, usage);
  }

  return usageByName;
}

export function getCategoryUsage(usageMap, categoryName) {
  return usageMap.get(categoryName) ?? EMPTY_USAGE;
}

// Can this category type hold every transaction type in usedTypes?
export function isCategoryTypeCompatible(categoryType, usedTypes) {
  return categoryType === "both" || [...usedTypes].every((type) => type === categoryType);
}

// Categories that can take over the transactions of a category being deleted.
export function getReplacementCategories(categories, categoryToDelete, usage) {
  return categories.filter(
    (category) =>
      category.id !== categoryToDelete.id && isCategoryTypeCompatible(category.type, usage.types)
  );
}
