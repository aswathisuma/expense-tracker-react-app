import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartTooltip from "./ChartTooltip";
import { AXIS_TICK, CHART_COLORS } from "./chartTheme";
import { useCurrency } from "../../hooks/useCurrency";

const ROW_HEIGHT = 36;

// A horizontal bar chart: category names are easy to read on the left, and
// bar lengths are easier to compare than pie slices.
// data: [{ category: "Food", amount: 5000 }, ...] from getExpensesByCategory()
function CategoryExpenseChart({ data }) {
  const { formatCurrency, formatCompactCurrency } = useCurrency();
  const height = Math.max(160, data.length * ROW_HEIGHT + 32);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid horizontal={false} stroke={CHART_COLORS.grid} />
        <XAxis
          type="number"
          tickFormatter={formatCompactCurrency}
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="category"
          width={104}
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={{ stroke: CHART_COLORS.grid }}
        />
        <Tooltip
          cursor={{ fill: CHART_COLORS.cursor }}
          content={(props) => <ChartTooltip {...props} formatValue={formatCurrency} />}
        />
        <Bar dataKey="amount" name="Spent" fill={CHART_COLORS.expense} radius={[0, 4, 4, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default CategoryExpenseChart;
