import { TRANSACTION_TYPE_LABELS } from "../../constants/transactions";
import { formatDate, formatDateTime } from "../../utils/formatters";
import { useCurrency } from "../../hooks/useCurrency";

function TransactionDetails({ transaction, onEdit, onDelete }) {
  const { formatCurrency } = useCurrency();

  const rows = [
    { label: "Type", value: TRANSACTION_TYPE_LABELS[transaction.type] },
    { label: "Amount", value: formatCurrency(transaction.amount) },
    { label: "Category", value: transaction.category },
    { label: "Date", value: formatDate(transaction.date) },
    { label: "Payment Method", value: transaction.paymentMethod },
    { label: "Description", value: transaction.description || "—" },
    { label: "Created", value: formatDateTime(transaction.createdAt) },
  ];

  return (
    <>
      <dl className="details-list">
        {rows.map((row) => (
          <div key={row.label} className="details-list__row">
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="form-actions">
        <button type="button" className="btn btn--danger-outline" onClick={onDelete}>
          Delete
        </button>
        <button type="button" className="btn btn--primary" onClick={onEdit}>
          Edit
        </button>
      </div>
    </>
  );
}

export default TransactionDetails;
