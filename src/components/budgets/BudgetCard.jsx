import ProgressBar from "../common/ProgressBar";
import BudgetStatusBadge from "./BudgetStatusBadge";
import { BUDGET_STATUS } from "../../constants/budgets";
import { formatPercent } from "../../utils/formatters";
import { useCurrency } from "../../hooks/useCurrency";

// budgetStatus comes from getBudgetStatus() in utils/calculations.js
function BudgetCard({ title, budgetStatus, onEdit, isHighlighted = false }) {
  const { formatCurrency } = useCurrency();
  const { limit, spent, remaining, percentUsed, status } = budgetStatus;
  const hasBudget = status !== BUDGET_STATUS.NONE;
  const isOverBudget = remaining < 0;

  return (
    <article className={`card budget-card${isHighlighted ? " budget-card--highlighted" : ""}`}>
      <div className="budget-card__header">
        <h3 className="budget-card__title">{title}</h3>
        {hasBudget && <BudgetStatusBadge status={status} />}
      </div>

      {hasBudget ? (
        <>
          <ProgressBar percent={percentUsed} status={status} label={`${title} budget used`} />
          <dl className="budget-card__stats">
            <div>
              <dt>Budget</dt>
              <dd>{formatCurrency(limit)}</dd>
            </div>
            <div>
              <dt>Spent</dt>
              <dd>{formatCurrency(spent)}</dd>
            </div>
            <div>
              <dt>{isOverBudget ? "Over by" : "Remaining"}</dt>
              <dd className={isOverBudget ? "text-danger" : undefined}>
                {formatCurrency(Math.abs(remaining))}
              </dd>
            </div>
            <div>
              <dt>Used</dt>
              <dd>{formatPercent(percentUsed)}</dd>
            </div>
          </dl>
        </>
      ) : (
        <p className="text-muted budget-card__empty">
          No budget set. {formatCurrency(spent)} spent this month.
        </p>
      )}

      <button type="button" className="btn btn--ghost btn--small" onClick={onEdit}>
        {hasBudget ? "Edit budget" : "Set budget"}
      </button>
    </article>
  );
}

export default BudgetCard;
