// A small stat tile: label on top, big number, optional hint underneath.
// tone adds a coloured accent bar: "neutral" | "primary" | "income" | "expense" | "warning"
function SummaryCard({ label, value, hint, tone = "neutral" }) {
  return (
    <div className={`summary-card summary-card--${tone}`}>
      <p className="summary-card__label">{label}</p>
      <p className="summary-card__value">{value}</p>
      {hint && <p className="summary-card__hint">{hint}</p>}
    </div>
  );
}

export default SummaryCard;
