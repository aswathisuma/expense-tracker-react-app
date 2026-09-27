import { useCallback, useMemo } from "react";
import { ExpenseContext } from "./ExpenseContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { DEFAULT_BUDGETS } from "../constants/budgets";
import { DEFAULT_CATEGORIES } from "../data/defaultCategories";
import { createSampleData } from "../data/sampleData";
import { generateId } from "../utils/generateId";
import {
  createTransaction,
  isValidTransactionList,
  toTransactionFields,
} from "../utils/transactionUtils";
import { isValidCategoryList, mergeMissingCategories } from "../utils/categoryUtils";
import { isValidBudgets, removeCategoryLimit } from "../utils/budgetUtils";

// Owns all financial data (transactions, categories, budgets) and every
// action that changes it. Components never touch localStorage themselves.
export function ExpenseProvider({ children }) {
  const [transactions, setTransactions] = useLocalStorage(
    STORAGE_KEYS.TRANSACTIONS,
    [],
    isValidTransactionList
  );
  const [categories, setCategories] = useLocalStorage(
    STORAGE_KEYS.CATEGORIES,
    DEFAULT_CATEGORIES,
    isValidCategoryList
  );
  const [budgets, setBudgets] = useLocalStorage(
    STORAGE_KEYS.BUDGETS,
    DEFAULT_BUDGETS,
    isValidBudgets
  );

  // useCallback keeps each function the same between renders, so the
  // context value below only changes when the data actually changes.

  // ----- Transactions -----
  const addTransaction = useCallback(
    (formValues) => {
      const newTransaction = createTransaction(formValues);
      setTransactions((previous) => [newTransaction, ...previous]);
    },
    [setTransactions]
  );

  const updateTransaction = useCallback(
    (id, formValues) => {
      const updatedFields = toTransactionFields(formValues);
      setTransactions((previous) =>
        previous.map((transaction) =>
          transaction.id === id ? { ...transaction, ...updatedFields } : transaction
        )
      );
    },
    [setTransactions]
  );

  const deleteTransaction = useCallback(
    (id) => {
      setTransactions((previous) => previous.filter((transaction) => transaction.id !== id));
    },
    [setTransactions]
  );

  // ----- Categories -----
  const addCategory = useCallback(
    ({ name, type }) => {
      setCategories((previous) => [...previous, { id: generateId(), name: name.trim(), type }]);
    },
    [setCategories]
  );

  // Transactions store the category NAME, so a rename is copied to them.
  const updateCategory = useCallback(
    (id, { name, type }) => {
      const existing = categories.find((category) => category.id === id);
      if (!existing) {
        return;
      }

      const newName = name.trim();
      setCategories((previous) =>
        previous.map((category) =>
          category.id === id ? { ...category, name: newName, type } : category
        )
      );

      if (existing.name !== newName) {
        setTransactions((previous) =>
          previous.map((transaction) =>
            transaction.category === existing.name ? { ...transaction, category: newName } : transaction
          )
        );
      }
    },
    [categories, setCategories, setTransactions]
  );

  // A category that is still used can only be deleted if its transactions
  // are moved to another category first (replacementName).
  const deleteCategory = useCallback(
    (id, replacementName = null) => {
      const categoryToDelete = categories.find((category) => category.id === id);
      if (!categoryToDelete) {
        return;
      }

      const isUsed = transactions.some((transaction) => transaction.category === categoryToDelete.name);
      if (isUsed && !replacementName) {
        return; // safety net: never leave transactions pointing at a missing category
      }

      if (isUsed) {
        setTransactions((previous) =>
          previous.map((transaction) =>
            transaction.category === categoryToDelete.name
              ? { ...transaction, category: replacementName }
              : transaction
          )
        );
      }
      setCategories((previous) => previous.filter((category) => category.id !== id));
      setBudgets((previous) => removeCategoryLimit(previous, id));
    },
    [categories, transactions, setCategories, setTransactions, setBudgets]
  );

  // ----- Budgets -----
  const setMonthlyBudget = useCallback(
    (amount) => {
      setBudgets((previous) => ({ ...previous, monthlyLimit: amount }));
    },
    [setBudgets]
  );

  // An amount of 0 removes the category's budget.
  const setCategoryBudget = useCallback(
    (categoryId, amount) => {
      setBudgets((previous) =>
        amount > 0
          ? { ...previous, categoryLimits: { ...previous.categoryLimits, [categoryId]: amount } }
          : removeCategoryLimit(previous, categoryId)
      );
    },
    [setBudgets]
  );

  // ----- Whole app data -----
  const clearAllData = useCallback(() => {
    setTransactions([]);
    setCategories(DEFAULT_CATEGORIES);
    setBudgets(DEFAULT_BUDGETS);
  }, [setTransactions, setCategories, setBudgets]);

  const loadSampleData = useCallback(() => {
    const sampleData = createSampleData();
    setTransactions(sampleData.transactions);
    setCategories((previous) => mergeMissingCategories(previous, DEFAULT_CATEGORIES));
    setBudgets(sampleData.budgets);
  }, [setTransactions, setCategories, setBudgets]);

  // useMemo: consumers re-render only when something in this object changes.
  const value = useMemo(
    () => ({
      transactions,
      categories,
      budgets,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      updateCategory,
      deleteCategory,
      setMonthlyBudget,
      setCategoryBudget,
      clearAllData,
      loadSampleData,
    }),
    [
      transactions,
      categories,
      budgets,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      updateCategory,
      deleteCategory,
      setMonthlyBudget,
      setCategoryBudget,
      clearAllData,
      loadSampleData,
    ]
  );

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}
