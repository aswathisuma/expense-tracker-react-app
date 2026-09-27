import { BUDGET_STATUS } from "../../constants/budgets";
import { formatPercent } from "../../utils/formatters";
import { useCurrency } from "../../hooks/useCurrency";

// alerts: [{ id, name, budgetStatus }] from getBudgetAlerts() in utils/budgetUtils.js
function BudgetAlerts({ alerts }) {
  const { formatCurrency } = useCurrency();

  if (alerts.length === 0) {
    return null;
  }

  return (
    <ul className="alert-list" aria-label="Budget warnings">
      {alerts.map(({ id, name, budgetStatus }) => {
        const isExceeded = budgetStatus.status === BUDGET_STATUS.EXCEEDED;
        return (
          <li key={id} className={`alert alert--${budgetStatus.status}`}>
            <span className="alert__icon" aria-hidden="true">
              {isExceeded ? "✕" : "⚠"}
            </span>
            <span>
              <strong>{name}</strong>
              {isExceeded
                ? ` is over budget by ${formatCurrency(Math.abs(budgetStatus.remaining))}.`
                : ` has used ${formatPercent(budgetStatus.percentUsed)} of its budget. ${formatCurrency(
                    budgetStatus.remaining
                  )} left.`}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export default BudgetAlerts;
