import { parseISODate } from "./dateUtils";
import { CURRENCIES } from "../constants/settings";

const DEFAULT_CURRENCY = "INR";

// Creating an Intl formatter is the slow part, so each one is created once
// and reused from this cache.
const currencyFormatters = new Map();

function getCurrencyFormatter(currencyCode, isCompact) {
  const cacheKey = `${currencyCode}:${isCompact ? "compact" : "full"}`;

  if (!currencyFormatters.has(cacheKey)) {
    const locale = CURRENCIES.find((currency) => currency.code === currencyCode)?.locale ?? "en-IN";
    const options = isCompact
      ? { notation: "compact", maximumFractionDigits: 1 }
      : { minimumFractionDigits: 0, maximumFractionDigits: 2 };

    currencyFormatters.set(
      cacheKey,
      new Intl.NumberFormat(locale, { style: "currency", currency: currencyCode, ...options })
    );
  }

  return currencyFormatters.get(cacheKey);
}

// 125000 -> "₹1,25,000"
export function formatCurrency(amount, currencyCode = DEFAULT_CURRENCY) {
  return getCurrencyFormatter(currencyCode, false).format(amount);
}

// 125000 -> "₹1.3L" (used on chart axes where space is tight)
export function formatCompactCurrency(amount, currencyCode = DEFAULT_CURRENCY) {
  return getCurrencyFormatter(currencyCode, true).format(amount);
}

// "INR" -> "₹"
export function getCurrencySymbol(currencyCode = DEFAULT_CURRENCY) {
  const parts = getCurrencyFormatter(currencyCode, false).formatToParts(0);
  return parts.find((part) => part.type === "currency")?.value ?? currencyCode;
}

// 83.4 -> "83%"
export function formatPercent(value) {
  return `${Math.round(value)}%`;
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const longMonthFormatter = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });
const shortMonthFormatter = new Intl.DateTimeFormat("en-IN", { month: "short", year: "2-digit" });

// "2026-09-27" -> "27 Sept 2026"
export function formatDate(isoDate) {
  return dateFormatter.format(parseISODate(isoDate));
}

// "2026-09-27T05:00:00.000Z" -> "27 Sept 2026, 10:30 am"
export function formatDateTime(isoString) {
  return dateTimeFormatter.format(new Date(isoString));
}

// "2026-09" -> "September 2026"
export function formatMonthLabel(monthKey) {
  return longMonthFormatter.format(parseISODate(`${monthKey}-01`));
}

// "2026-09" -> "Sept 26" (used on chart axes)
export function formatShortMonthLabel(monthKey) {
  return shortMonthFormatter.format(parseISODate(`${monthKey}-01`));
}
