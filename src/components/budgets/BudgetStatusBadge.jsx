// Status is always shown as icon + text, never colour alone, so it also
// works for colour-blind users.
const STATUS_DISPLAY = {
  ok: { icon: "✓", label: "On track" },
  warning: { icon: "⚠", label: "Near limit" },
  exceeded: { icon: "✕", label: "Over budget" },
};

function BudgetStatusBadge({ status }) {
  const display = STATUS_DISPLAY[status];
  if (!display) {
    return null;
  }

  return (
    <span className={`status-badge status-badge--${status}`}>
      <span aria-hidden="true">{display.icon}</span>
      {display.label}
    </span>
  );
}

export default BudgetStatusBadge;
