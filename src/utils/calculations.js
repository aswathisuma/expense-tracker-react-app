// Pure financial calculations. They take data in and return numbers out,
// never read from React state or localStorage, so they are easy to test
// and reuse on any page.
import { TRANSACTION_TYPES } from "../constants/transactions";
import { BUDGET_STATUS, BUDGET_WARNING_PERCENT } from "../constants/budgets";
import { getDaysInMonth, getMonthKey, getTodayISODate } from "./dateUtils";

// Rounds to paise, so 0.1 + 0.2 shows as 0.3, not 0.30000000000000004.
function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

export function sumAmounts(transactions) {
  return roundMoney(transactions.reduce((total, transaction) => total + transaction.amount, 0));
}

export function getExpenseTransactions(transactions) {
  return transactions.filter((transaction) => transaction.type === TRANSACTION_TYPES.EXPENSE);
}

export function getIncomeTransactions(transactions) {
  return transactions.filter((transaction) => transaction.type === TRANSACTION_TYPES.INCOME);
}

export function getTotalIncome(transactions) {
  return sumAmounts(getIncomeTransactions(transactions));
}

export function getTotalExpenses(transactions) {
  return sumAmounts(getExpenseTransactions(transactions));
}

// Balance = Total Income - Total Expenses
export function getBalance(transactions) {
  return roundMoney(getTotalIncome(transactions) - getTotalExpenses(transactions));
}

export function getTransactionsForMonth(transactions, monthKey) {
  return transactions.filter((transaction) => getMonthKey(transaction.date) === monthKey);
}

// Unique months that have at least one transaction, newest first.
export function getMonthsWithTransactions(transactions) {
  const monthKeys = new Set(transactions.map((transaction) => getMonthKey(transaction.date)));
  return [...monthKeys].sort().reverse();
}

export function getMonthSummary(transactions, monthKey) {
  const monthTransactions = getTransactionsForMonth(transactions, monthKey);
  const income = getTotalIncome(monthTransactions);
  const expenses = getTotalExpenses(monthTransactions);
  const savings = roundMoney(income - expenses);

  return {
    income,
    expenses,
    savings,
    savingsRate: income > 0 ? (savings / income) * 100 : null,
    transactionCount: monthTransactions.length,
  };
}

// Remaining Budget = Monthly Budget - Current Month Expenses
export function getRemainingBudget(budgetLimit, spent) {
  return roundMoney(budgetLimit - spent);
}

export function getBudgetStatus(budgetLimit, spent) {
  if (!budgetLimit) {
    return { limit: 0, spent, remaining: 0, percentUsed: 0, status: BUDGET_STATUS.NONE };
  }

  const percentUsed = (spent / budgetLimit) * 100;
  let status = BUDGET_STATUS.OK;
  if (percentUsed > 100) {
    status = BUDGET_STATUS.EXCEEDED;
  } else if (percentUsed >= BUDGET_WARNING_PERCENT) {
    status = BUDGET_STATUS.WARNING;
  }

  return {
    limit: budgetLimit,
    spent,
    remaining: getRemainingBudget(budgetLimit, spent),
    percentUsed,
    status,
  };
}

// [{ category: "Food", amount: 5000, percentage: 40 }, ...] sorted largest first.
export function getExpensesByCategory(transactions) {
  const expenses = getExpenseTransactions(transactions);
  const totalExpenses = sumAmounts(expenses);
  const totalsByCategory = new Map();

  for (const expense of expenses) {
    const previousTotal = totalsByCategory.get(expense.category) ?? 0;
    totalsByCategory.set(expense.category, previousTotal + expense.amount);
  }

  return [...totalsByCategory]
    .map(([category, amount]) => ({
      category,
      amount: roundMoney(amount),
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

// Keeps the largest (maxRows - 1) categories and adds the rest into one row,
// so a chart never has too many bars to read.
export function limitCategoryRows(categoryRows, maxRows) {
  if (categoryRows.length <= maxRows) {
    return categoryRows;
  }

  const visibleRows = categoryRows.slice(0, maxRows - 1);
  const remainingRows = categoryRows.slice(maxRows - 1);

  return [
    ...visibleRows,
    {
      category: `${remainingRows.length} more`,
      amount: roundMoney(remainingRows.reduce((total, row) => total + row.amount, 0)),
      percentage: remainingRows.reduce((total, row) => total + row.percentage, 0),
    },
  ];
}

// One row per month, including months with no transactions (they show as 0).
// [{ monthKey: "2026-09", income: 55000, expenses: 32000, savings: 23000 }, ...]
export function getMonthlyTotals(transactions, monthKeys) {
  const totalsByMonth = new Map(monthKeys.map((monthKey) => [monthKey, { income: 0, expenses: 0 }]));

  for (const transaction of transactions) {
    const monthTotals = totalsByMonth.get(getMonthKey(transaction.date));
    if (!monthTotals) {
      continue; // transaction is outside the requested months
    }
    if (transaction.type === TRANSACTION_TYPES.INCOME) {
      monthTotals.income += transaction.amount;
    } else {
      monthTotals.expenses += transaction.amount;
    }
  }

  return monthKeys.map((monthKey) => {
    const { income, expenses } = totalsByMonth.get(monthKey);
    return {
      monthKey,
      income: roundMoney(income),
      expenses: roundMoney(expenses),
      savings: roundMoney(income - expenses),
    };
  });
}

// Drops months before the first recorded transaction, so a chart doesn't show
// a misleading drop to 0 for months when the app wasn't being used yet.
export function trimLeadingEmptyMonths(monthlyTotals) {
  const firstIndexWithData = monthlyTotals.findIndex((row) => row.income > 0 || row.expenses > 0);
  return firstIndexWithData === -1 ? monthlyTotals : monthlyTotals.slice(firstIndexWithData);
}

export function getHighestExpense(transactions) {
  return getExpenseTransactions(transactions).reduce(
    (highest, transaction) => (!highest || transaction.amount > highest.amount ? transaction : highest),
    null
  );
}

// For the current month, divides by the days passed so far (not the whole month).
export function getAverageDailySpending(transactions, monthKey, todayISODate = getTodayISODate()) {
  const currentMonthKey = getMonthKey(todayISODate);
  if (monthKey > currentMonthKey) {
    return 0;
  }

  const days =
    monthKey === currentMonthKey ? Number(todayISODate.slice(8, 10)) : getDaysInMonth(monthKey);
  const monthExpenses = getTotalExpenses(getTransactionsForMonth(transactions, monthKey));

  return roundMoney(monthExpenses / days);
}
