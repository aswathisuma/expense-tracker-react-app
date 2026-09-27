import { formatPercent } from "../../utils/formatters";
import { useCurrency } from "../../hooks/useCurrency";

// data: [{ category, amount, percentage }] from getExpensesByCategory()
function CategoryBreakdownTable({ data }) {
  const { formatCurrency } = useCurrency();

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col" className="data-table__number">Spent</th>
            <th scope="col" className="data-table__number">Share</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.category}>
              <th scope="row">{row.category}</th>
              <td className="data-table__number">{formatCurrency(row.amount)}</td>
              <td className="data-table__number">{formatPercent(row.percentage)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CategoryBreakdownTable;
