import { CATEGORY_TYPE_LABELS } from "../../constants/categories";
import { useCurrency } from "../../hooks/useCurrency";

function CategoryCard({ category, usage, canDelete, onEdit, onDelete }) {
  const { formatCurrency } = useCurrency();

  const usageParts = [];
  if (usage.expenseTotal > 0) {
    usageParts.push(`${formatCurrency(usage.expenseTotal)} spent`);
  }
  if (usage.incomeTotal > 0) {
    usageParts.push(`${formatCurrency(usage.incomeTotal)} earned`);
  }

  return (
    <article className="card category-card">
      <div className="category-card__header">
        <span
          className={`category-card__avatar category-card__avatar--${category.type}`}
          aria-hidden="true"
        >
          {category.name.charAt(0)}
        </span>
        <div className="category-card__info">
          <h3 className="category-card__name">{category.name}</h3>
          <span className="badge">{CATEGORY_TYPE_LABELS[category.type]}</span>
        </div>
      </div>

      <p className="category-card__usage">
        {usage.count === 0
          ? "Not used yet"
          : `${usage.count} transaction${usage.count === 1 ? "" : "s"} · ${usageParts.join(" · ")}`}
      </p>

      <div className="category-card__actions">
        <button type="button" className="btn btn--ghost btn--small" onClick={() => onEdit(category.id)}>
          Edit
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--small btn--danger-text"
          onClick={() => onDelete(category.id)}
          disabled={!canDelete}
          title={canDelete ? undefined : "You need at least one category"}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default CategoryCard;
