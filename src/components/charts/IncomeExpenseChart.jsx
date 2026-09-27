import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartTooltip from "./ChartTooltip";
import { AXIS_TICK, CHART_COLORS, CHART_MARGIN } from "./chartTheme";
import { formatMonthLabel, formatShortMonthLabel } from "../../utils/formatters";
import { useCurrency } from "../../hooks/useCurrency";

// data: [{ monthKey: "2026-09", income: 55000, expenses: 32000 }, ...]
// from getMonthlyTotals() in utils/calculations.js
function IncomeExpenseChart({ data, height = 280 }) {
  const { formatCurrency, formatCompactCurrency } = useCurrency();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={CHART_MARGIN} barGap={2}>
        <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
        <XAxis
          dataKey="monthKey"
          tickFormatter={formatShortMonthLabel}
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={{ stroke: CHART_COLORS.grid }}
        />
        <YAxis
          tickFormatter={formatCompactCurrency}
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          width={64}
        />
        <Tooltip
          cursor={{ fill: CHART_COLORS.cursor }}
          content={(props) => (
            <ChartTooltip {...props} formatLabel={formatMonthLabel} formatValue={formatCurrency} />
          )}
        />
        {/* itemSorter keeps Income first (the default sorts alphabetically) */}
        <Legend
          iconType="circle"
          iconSize={10}
          wrapperStyle={{ fontSize: 13 }}
          itemSorter={(item) => (item.dataKey === "income" ? 0 : 1)}
        />
        <Bar dataKey="income" name="Income" fill={CHART_COLORS.income} radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="expenses" name="Expenses" fill={CHART_COLORS.expense} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default IncomeExpenseChart;
