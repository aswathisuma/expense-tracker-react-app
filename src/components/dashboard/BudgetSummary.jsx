import { Link } from "react-router-dom";
import ProgressBar from "../common/ProgressBar";
import BudgetStatusBadge from "../budgets/BudgetStatusBadge";
import BudgetAlerts from "../budgets/BudgetAlerts";
import { BUDGET_STATUS } from "../../constants/budgets";
import { useCurrency } from "../../hooks/useCurrency";

const MAX_ALERTS = 3;

function BudgetSummary({ monthlyBudget, alerts }) {
  const { formatCurrency } = useCurrency();
  const hasMonthlyBudget = monthlyBudget.status !== BUDGET_STATUS.NONE;

  return (
    <section className="card budget-summary">
      <div className="section-header">
        <h2 className="chart-card__title">Budget this month</h2>
        <Link to="/budgets" className="btn btn--link">
          Manage
        </Link>
      </div>

      {hasMonthlyBudget ? (
        <>
          <div className="budget-summary__row">
            <span>
              {formatCurrency(monthlyBudget.spent)} of {formatCurrency(monthlyBudget.limit)}
            </span>
            <BudgetStatusBadge status={monthlyBudget.status} />
          </div>
          <ProgressBar
            percent={monthlyBudget.percentUsed}
            status={monthlyBudget.status}
            label="Monthly budget used"
          />
        </>
      ) : (
        <p className="text-muted">
          No monthly budget yet. <Link to="/budgets">Set one</Link> to track your spending limit.
        </p>
      )}

      {alerts.length > 0 ? (
        <BudgetAlerts alerts={alerts.slice(0, MAX_ALERTS)} />
      ) : (
        hasMonthlyBudget && <p className="text-muted budget-summary__ok">All budgets are on track.</p>
      )}
    </section>
  );
}

export default BudgetSummary;
