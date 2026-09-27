// Shared Recharts styling. Colours are CSS variables from index.css, so the
// charts switch with light/dark mode automatically.
export const CHART_COLORS = {
  income: "var(--chart-income)",
  expense: "var(--chart-expense)",
  grid: "var(--color-border)",
  cursor: "var(--color-surface-hover)",
  surface: "var(--color-surface)",
};

export const AXIS_TICK = { fill: "var(--color-text-muted)", fontSize: 12 };

export const CHART_MARGIN = { top: 8, right: 8, bottom: 0, left: 0 };
