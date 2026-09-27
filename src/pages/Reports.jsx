import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";
import SummaryCard from "../components/common/SummaryCard";
import ChartCard from "../components/charts/ChartCard";
import IncomeExpenseChart from "../components/charts/IncomeExpenseChart";
import CategoryExpenseChart from "../components/charts/CategoryExpenseChart";
import ExpenseTrendChart from "../components/charts/ExpenseTrendChart";
import MonthlyTotalsTable from "../components/charts/MonthlyTotalsTable";
import CategoryBreakdownTable from "../components/charts/CategoryBreakdownTable";
import { useExpenses } from "../hooks/useExpenses";
import { useCurrency } from "../hooks/useCurrency";
import {
  getAverageDailySpending,
  getExpensesByCategory,
  getHighestExpense,
  getMonthlyTotals,
  getMonthSummary,
  getMonthsWithTransactions,
  getTransactionsForMonth,
  trimLeadingEmptyMonths,
} from "../utils/calculations";
import { getCurrentMonthKey, getRecentMonthKeys } from "../utils/dateUtils";
import { formatDate, formatMonthLabel, formatPercent } from "../utils/formatters";

const COMPARISON_MONTHS = 6;
const TREND_MONTHS = 12;

function Reports() {
  const { transactions } = useExpenses();
  const { formatCurrency } = useCurrency();
  const currentMonthKey = getCurrentMonthKey();
  const [selectedMonthKey, setSelectedMonthKey] = useState(currentMonthKey);

  // Months the user can pick: every month with data, plus the current month.
  const monthOptions = useMemo(() => {
    const monthKeys = new Set(getMonthsWithTransactions(transactions));
    monthKeys.add(currentMonthKey);
    return [...monthKeys].sort().reverse();
  }, [transactions, currentMonthKey]);

  const report = useMemo(() => {
    const monthTransactions = getTransactionsForMonth(transactions, selectedMonthKey);
    return {
      summary: getMonthSummary(transactions, selectedMonthKey),
      highestExpense: getHighestExpense(monthTransactions),
      averageDailySpending: getAverageDailySpending(transactions, selectedMonthKey),
      categoryRows: getExpensesByCategory(monthTransactions),
      comparison: trimLeadingEmptyMonths(
        getMonthlyTotals(transactions, getRecentMonthKeys(COMPARISON_MONTHS, selectedMonthKey))
      ),
      trend: trimLeadingEmptyMonths(
        getMonthlyTotals(transactions, getRecentMonthKeys(TREND_MONTHS, selectedMonthKey))
      ),
    };
  }, [transactions, selectedMonthKey]);

  if (transactions.length === 0) {
    return (
      <>
        <PageHeader title="Reports" subtitle="Analyse your spending patterns" />
        <EmptyState
          icon="📈"
          title="No data to report yet"
          message="Reports are built from your transactions. Add a few to see them here."
        >
          <Link to="/transactions" className="btn btn--primary">
            Go to Transactions
          </Link>
        </EmptyState>
      </>
    );
  }

  const { summary, highestExpense } = report;
  const monthLabel = formatMonthLabel(selectedMonthKey);

  return (
    <>
      <PageHeader title="Reports" subtitle="Analyse your spending patterns">
        <label className="inline-field">
          <span className="form-label">Month</span>
          <select
            className="form-control"
            value={selectedMonthKey}
            onChange={(event) => setSelectedMonthKey(event.target.value)}
          >
            {monthOptions.map((monthKey) => (
              <option key={monthKey} value={monthKey}>
                {formatMonthLabel(monthKey)}
              </option>
            ))}
          </select>
        </label>
      </PageHeader>

      <div className="summary-grid">
        <SummaryCard label="Monthly Income" value={formatCurrency(summary.income)} tone="income" hint={monthLabel} />
        <SummaryCard label="Monthly Expenses" value={formatCurrency(summary.expenses)} tone="expense" hint={monthLabel} />
        <SummaryCard
          label="Monthly Savings"
          value={formatCurrency(summary.savings)}
          tone={summary.savings < 0 ? "warning" : "primary"}
          hint={summary.savingsRate === null ? "No income this month" : `${formatPercent(summary.savingsRate)} of income saved`}
        />
        <SummaryCard
          label="Average Daily Spending"
          value={formatCurrency(report.averageDailySpending)}
          hint={selectedMonthKey === currentMonthKey ? "So far this month" : "Across the whole month"}
        />
        <SummaryCard
          label="Highest Expense"
          value={highestExpense ? formatCurrency(highestExpense.amount) : "—"}
          hint={
            highestExpense
              ? `${highestExpense.description || highestExpense.category} · ${formatDate(highestExpense.date)}`
              : "No expenses this month"
          }
        />
        <SummaryCard
          label="Transactions"
          value={summary.transactionCount}
          hint={`Recorded in ${monthLabel}`}
        />
      </div>

      <div className="report-grid">
        <ChartCard
          title="Category-wise Spending"
          subtitle={monthLabel}
          isEmpty={report.categoryRows.length === 0}
          emptyMessage="No expenses recorded in this month."
        >
          <CategoryExpenseChart data={report.categoryRows} />
          <CategoryBreakdownTable data={report.categoryRows} />
        </ChartCard>

        <ChartCard title="Income vs Expense" subtitle={`Up to ${COMPARISON_MONTHS} months ending ${monthLabel}`}>
          <IncomeExpenseChart data={report.comparison} />
          <details className="table-toggle">
            <summary>Show as table</summary>
            <MonthlyTotalsTable data={report.comparison} />
          </details>
        </ChartCard>

        <ChartCard
          title="Monthly Spending Trend"
          subtitle={`Up to ${TREND_MONTHS} months ending ${monthLabel}`}
        >
          <ExpenseTrendChart data={report.trend} height={280} />
        </ChartCard>
      </div>
    </>
  );
}

export default Reports;
