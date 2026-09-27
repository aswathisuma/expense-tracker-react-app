import { TRANSACTION_TYPES } from "../../constants/transactions";
import { formatDate } from "../../utils/formatters";
import { useCurrency } from "../../hooks/useCurrency";

// onView, onEdit and onDelete are optional. Without them the row is read-only
// (used for "Recent Transactions" on the Dashboard).
function TransactionItem({ transaction, onView, onEdit, onDelete }) {
  const { formatCurrency } = useCurrency();
  const { id, type, amount, category, date, paymentMethod, description } = transaction;
  const isIncome = type === TRANSACTION_TYPES.INCOME;
  const title = description || category;

  const details = (
    <>
      <span className="transaction-item__title">{title}</span>
      <span className="transaction-item__meta">
        {category} · {formatDate(date)} · {paymentMethod}
      </span>
    </>
  );

  return (
    <li className="transaction-item">
      <span
        className={`transaction-item__badge transaction-item__badge--${type}`}
        aria-hidden="true"
      >
        {category.charAt(0)}
      </span>

      {onView ? (
        <button type="button" className="transaction-item__main" onClick={() => onView(id)}>
          {details}
        </button>
      ) : (
        <div className="transaction-item__main">{details}</div>
      )}

      <span className={`transaction-item__amount amount--${type}`}>
        {isIncome ? "+" : "−"}
        {formatCurrency(amount)}
      </span>

      {(onEdit || onDelete) && (
        <div className="transaction-item__actions">
          {onEdit && (
            <button
              type="button"
              className="icon-btn"
              onClick={() => onEdit(id)}
              aria-label={`Edit ${title}`}
              title="Edit"
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="icon-btn"
              onClick={() => onDelete(id)}
              aria-label={`Delete ${title}`}
              title="Delete"
            >
              🗑️
            </button>
          )}
        </div>
      )}
    </li>
  );
}

export default TransactionItem;
