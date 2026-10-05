import { useCallback, useEffect, useMemo, useState } from "react";
import { ExpenseContext } from "./ExpenseContext";
import * as api from "../services/api";
import { DEFAULT_BUDGETS } from "../constants/budgets";
import { DATA_STATUS } from "../constants/app";
import { generateId } from "../utils/generateId";
import { createTransaction, toTransactionFields } from "../utils/transactionUtils";
import { removeCategoryLimit } from "../utils/budgetUtils";

// Owns all financial data (transactions, categories, budgets) and every
// action that changes it. Components never call the API themselves.
//
// The data lives in the Django backend. Actions are "optimistic": they update
// React state straight away (so the screen never waits) and send the change to
// the server in the background. If the server refuses it, we show an error and
// reload the real data.
export function ExpenseProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState(DEFAULT_BUDGETS);
  const [status, setStatus] = useState(DATA_STATUS.LOADING);
  // Why loading failed, or why the last change could not be saved.
  const [errorMessage, setErrorMessage] = useState(null);

  const applyServerData = useCallback((data) => {
    setTransactions(data.transactions);
    setCategories(data.categories);
    setBudgets(data.budgets);
  }, []);

  // Load everything once, when the app starts.
  useEffect(() => {
    let ignore = false; // set by the cleanup, so a stale response is not used

    api
      .fetchAppData()
      .then((data) => {
        if (!ignore) {
          applyServerData(data);
          setStatus(DATA_STATUS.READY);
        }
      })
      .catch((error) => {
        if (!ignore) {
          setErrorMessage(error.message);
          setStatus(DATA_STATUS.ERROR);
        }
      });

    return () => {
      ignore = true;
    };
  }, [applyServerData]);

  // Watches a request running in the background. If it fails, the screen is
  // showing a change the server never saved, so reload what it really has.
  const syncInBackground = useCallback(
    (request) => {
      request.catch(async (error) => {
        setErrorMessage(error.message);
        try {
          applyServerData(await api.fetchAppData());
        } catch {
          // Still cannot reach the server: keep what is on screen.
        }
      });
    },
    [applyServerData]
  );

  const dismissError = useCallback(() => setErrorMessage(null), []);

  // useCallback keeps each function the same between renders, so the
  // context value below only changes when the data actually changes.

  // ----- Transactions -----
  const addTransaction = useCallback(
    (formValues) => {
      const newTransaction = createTransaction(formValues);
      setTransactions((previous) => [newTransaction, ...previous]);
      syncInBackground(api.createTransaction(newTransaction));
    },
    [syncInBackground]
  );

  const updateTransaction = useCallback(
    (id, formValues) => {
      const updatedFields = toTransactionFields(formValues);
      setTransactions((previous) =>
        previous.map((transaction) =>
          transaction.id === id ? { ...transaction, ...updatedFields } : transaction
        )
      );
      syncInBackground(api.updateTransaction(id, updatedFields));
    },
    [syncInBackground]
  );

  const deleteTransaction = useCallback(
    (id) => {
      setTransactions((previous) => previous.filter((transaction) => transaction.id !== id));
      syncInBackground(api.deleteTransaction(id));
    },
    [syncInBackground]
  );

  // ----- Categories -----
  const addCategory = useCallback(
    ({ name, type }) => {
      const newCategory = { id: generateId(), name: name.trim(), type };
      setCategories((previous) => [...previous, newCategory]);
      syncInBackground(api.createCategory(newCategory));
    },
    [syncInBackground]
  );

  // Transactions show the category NAME, so a rename is copied to them here.
  // (Django stores a foreign key, so on the server the rename is automatic.)
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
      syncInBackground(api.updateCategory(id, { name: newName, type }));
    },
    [categories, syncInBackground]
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
      // The server moves the transactions and drops the category's budget itself.
      syncInBackground(api.deleteCategory(id, isUsed ? replacementName : null));
    },
    [categories, transactions, syncInBackground]
  );

  // ----- Budgets -----
  const setMonthlyBudget = useCallback(
    (amount) => {
      setBudgets((previous) => ({ ...previous, monthlyLimit: amount }));
      syncInBackground(api.updateBudgets({ monthlyLimit: amount }));
    },
    [syncInBackground]
  );

  // An amount of 0 removes the category's budget.
  const setCategoryBudget = useCallback(
    (categoryId, amount) => {
      setBudgets((previous) =>
        amount > 0
          ? { ...previous, categoryLimits: { ...previous.categoryLimits, [categoryId]: amount } }
          : removeCategoryLimit(previous, categoryId)
      );
      syncInBackground(api.updateBudgets({ categoryLimits: { [categoryId]: amount } }));
    },
    [syncInBackground]
  );

  // ----- Whole app data -----
  // These two are done by the server, which sends back the new data.
  const clearAllData = useCallback(() => {
    syncInBackground(api.clearAppData().then(applyServerData));
  }, [syncInBackground, applyServerData]);

  const loadSampleData = useCallback(() => {
    syncInBackground(api.loadSampleData().then(applyServerData));
  }, [syncInBackground, applyServerData]);

  // useMemo: consumers re-render only when something in this object changes.
  const value = useMemo(
    () => ({
      transactions,
      categories,
      budgets,
      status,
      errorMessage,
      dismissError,
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
      status,
      errorMessage,
      dismissError,
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
