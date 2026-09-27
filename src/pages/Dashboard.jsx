import { useMemo } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";
import SummaryCard from "../components/common/SummaryCard";
import TransactionList from "../components/transactions/TransactionList";
import BudgetSummary from "../components/dashboard/BudgetSummary";
import ChartCard from "../components/charts/ChartCard";
import IncomeExpenseChart from "../components/charts/IncomeExpenseChart";
import CategoryExpenseChart from "../components/charts/CategoryExpenseChart";
import ExpenseTrendChart from "../components/charts/ExpenseTrendChart";
import { useExpenses } from "../hooks/useExpenses";
import { useCurrency } from "../hooks/useCurrency";
import {
  getBalance,
  getBudgetStatus,
  getExpensesByCategory,
  getMonthlyTotals,
  getTotalExpenses,
  getTotalIncome,
  getTransactionsForMonth,
  limitCategoryRows,
  trimLeadingEmptyMonths,
} from "../utils/calculations";
import { getBudgetAlerts, getCategoryBudgetRows } from "../utils/budgetUtils";
import { sortTransactions } from "../utils/transactionUtils";
import { getCurrentMonthKey, getRecentMonthKeys } from "../utils/dateUtils";
import { formatMonthLabel, formatPercent } from "../utils/formatters";

const RECENT_TRANSACTION_COUNT = 5;
const CHART_MONTHS = 6;
const MAX_CATEGORY_BARS = 6;

function Dashboard() {
  const { transactions, categories, budgets, loadSampleData } = useExpenses();
  const { formatCurrency } = useCurrency();
  const currentMonthKey = getCurrentMonthKey();

  // Derived state: every number below is calculated from transactions and
  // budgets. Nothing is stored twice, so nothing can get out of sync.
  const dashboard = useMemo(() => {
    const monthTransactions = getTransactionsForMonth(transactions, currentMonthKey);
    const monthExpenses = getTotalExpenses(monthTransactions);
    const monthlyBudget = getBudgetStatus(budgets.monthlyLimit, monthExpenses);
    const categoryAlerts = getCategoryBudgetRows(categories, budgets, monthTransactions).map(
      ({ category, budgetStatus }) => ({ id: category.id, name: category.name, budgetStatus })
    );

    return {
      totalIncome: getTotalIncome(transactions),
      totalExpenses: getTotalExpenses(transactions),
      balance: getBalance(transactions),
      monthExpenses,
      monthlyBudget,
      alerts: getBudgetAlerts([
        { id: "monthly", name: "Monthly budget", budgetStatus: monthlyBudget },
        ...categoryAlerts,
      ]),
      categoryData: limitCategoryRows(getExpensesByCategory(monthTransactions), MAX_CATEGORY_BARS),
      monthlyTotals: trimLeadingEmptyMonths(
        getMonthlyTotals(transactions, getRecentMonthKeys(CHART_MONTHS, currentMonthKey))
      ),
      recentTransactions: sortTransactions(transactions, "newest").slice(0, RECENT_TRANSACTION_COUNT),
    };
  }, [transactions, categories, budgets, currentMonthKey]);

  if (transactions.length === 0) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Your financial overview at a glance" />
        <EmptyState
          icon="👋"
          title="Welcome to Expense Tracker"
          message="Add your first transaction, or load sample data to explore the dashboard, budgets and charts."
        >
          <div className="button-row">
            <Link to="/transactions" className="btn btn--primary">
              Add a transaction
            </Link>
            <button type="button" className="btn btn--ghost" onClick={loadSampleData}>
              Load sample data
            </button>
          </div>
        </EmptyState>
      </>
    );
  }

  const { monthlyBudget } = dashboard;
  const hasMonthlyBudget = monthlyBudget.limit > 0;
  const currentMonthLabel = formatMonthLabel(currentMonthKey);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Your financial overview at a glance" />

      <div className="summary-grid">
        <SummaryCard
          label="Total Balance"
          value={formatCurrency(dashboard.balance)}
          hint="Income minus expenses, all time"
          tone={dashboard.balance < 0 ? "expense" : "primary"}
        />
        <SummaryCard
          label="Total Income"
          value={formatCurrency(dashboard.totalIncome)}
          hint="All time"
          tone="income"
        />
        <SummaryCard
          label="Total Expenses"
          value={formatCurrency(dashboard.totalExpenses)}
          hint="All time"
          tone="expense"
        />
        <SummaryCard
          label="This Month's Expenses"
          value={formatCurrency(dashboard.monthExpenses)}
          hint={currentMonthLabel}
        />
        <SummaryCard
          label="Monthly Budget"
          value={hasMonthlyBudget ? formatCurrency(monthlyBudget.limit) : "Not set"}
          hint={hasMonthlyBudget ? `${formatPercent(monthlyBudget.percentUsed)} used` : "Set it on the Budgets page"}
        />
        <SummaryCard
          label="Remaining Budget"
          value={hasMonthlyBudget ? formatCurrency(monthlyBudget.remaining) : "—"}
          hint={
            !hasMonthlyBudget
              ? "No budget set"
              : monthlyBudget.remaining < 0
                ? "Over budget this month"
                : "Left to spend this month"
          }
          tone={hasMonthlyBudget && monthlyBudget.remaining < 0 ? "warning" : "neutral"}
        />
      </div>

      <div className="dashboard-grid">
        <ChartCard title="Income vs Expense" subtitle={`Last ${CHART_MONTHS} months`}>
          <IncomeExpenseChart data={dashboard.monthlyTotals} />
        </ChartCard>

        <ChartCard
          title="Expense by Category"
          subtitle={currentMonthLabel}
          isEmpty={dashboard.categoryData.length === 0}
          emptyMessage="No expenses recorded this month yet."
        >
          <CategoryExpenseChart data={dashboard.categoryData} />
        </ChartCard>

        <ChartCard title="Monthly Expense Trend" subtitle={`Last ${CHART_MONTHS} months`}>
          <ExpenseTrendChart data={dashboard.monthlyTotals} />
        </ChartCard>

        <BudgetSummary monthlyBudget={monthlyBudget} alerts={dashboard.alerts} />

        <section className="card dashboard-grid__wide">
          <div className="section-header">
            <h2 className="chart-card__title">Recent Transactions</h2>
            <Link to="/transactions" className="btn btn--link">
              View all
            </Link>
          </div>
          <TransactionList transactions={dashboard.recentTransactions} />
        </section>
      </div>
    </>
  );
}

export default Dashboard;
