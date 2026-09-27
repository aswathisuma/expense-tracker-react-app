// Custom Recharts tooltip. Recharts passes active, payload and label;
// we add formatters so amounts show in the chosen currency.
function ChartTooltip({ active, payload, label, formatLabel, formatValue }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{formatLabel ? formatLabel(label) : label}</p>
      <ul className="chart-tooltip__list">
        {payload.map((item) => (
          <li key={item.dataKey} className="chart-tooltip__row">
            <span
              className="chart-tooltip__swatch"
              style={{ background: item.color ?? item.fill }}
              aria-hidden="true"
            />
            <span className="chart-tooltip__name">{item.name}</span>
            <span className="chart-tooltip__value">{formatValue(item.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChartTooltip;
