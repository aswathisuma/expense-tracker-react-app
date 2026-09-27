// A card that holds one chart, with a built-in empty state.
function ChartCard({ title, subtitle, isEmpty, emptyMessage = "No data for this period yet.", children }) {
  return (
    <section className="card chart-card">
      <div className="chart-card__header">
        <h2 className="chart-card__title">{title}</h2>
        {subtitle && <p className="chart-card__subtitle">{subtitle}</p>}
      </div>
      {isEmpty ? <p className="chart-card__empty">{emptyMessage}</p> : children}
    </section>
  );
}

export default ChartCard;
