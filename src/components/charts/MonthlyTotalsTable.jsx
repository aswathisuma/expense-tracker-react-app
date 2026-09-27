import { formatMonthLabel } from "../../utils/formatters";
import { useCurrency } from "../../hooks/useCurrency";

// The same numbers as the Income vs Expense chart, as a table. Useful for
// screen readers and for reading exact values.
function MonthlyTotalsTable({ data }) {
  const { formatCurrency } = useCurrency();

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col" className="data-table__number">Income</th>
            <th scope="col" className="data-table__number">Expenses</th>
            <th scope="col" className="data-table__number">Savings</th>
          </tr>
        </thead>
        <tbody>
          {[...data].reverse().map((row) => (
            <tr key={row.monthKey}>
              <th scope="row">{formatMonthLabel(row.monthKey)}</th>
              <td className="data-table__number">{formatCurrency(row.income)}</td>
              <td className="data-table__number">{formatCurrency(row.expenses)}</td>
              <td className={`data-table__number${row.savings < 0 ? " text-danger" : ""}`}>
                {formatCurrency(row.savings)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MonthlyTotalsTable;
