import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartTooltip from "./ChartTooltip";
import { AXIS_TICK, CHART_COLORS, CHART_MARGIN } from "./chartTheme";
import { formatMonthLabel, formatShortMonthLabel } from "../../utils/formatters";
import { useCurrency } from "../../hooks/useCurrency";

// data: [{ monthKey: "2026-09", expenses: 32000 }, ...] from getMonthlyTotals()
function ExpenseTrendChart({ data, height = 260 }) {
  const { formatCurrency, formatCompactCurrency } = useCurrency();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={CHART_MARGIN}>
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
          cursor={{ stroke: CHART_COLORS.grid }}
          content={(props) => (
            <ChartTooltip {...props} formatLabel={formatMonthLabel} formatValue={formatCurrency} />
          )}
        />
        <Area
          type="monotone"
          dataKey="expenses"
          name="Expenses"
          stroke={CHART_COLORS.expense}
          strokeWidth={2}
          fill={CHART_COLORS.expense}
          fillOpacity={0.12}
          dot={{ r: 4, fill: CHART_COLORS.expense, stroke: CHART_COLORS.surface, strokeWidth: 2 }}
          activeDot={{ r: 6, fill: CHART_COLORS.expense, stroke: CHART_COLORS.surface, strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default ExpenseTrendChart;
