// Dates are stored as "YYYY-MM-DD" strings (the format <input type="date"> uses).
// Months are identified by a "month key": "YYYY-MM".

// Uses LOCAL time. toISOString() uses UTC, which gives yesterday's date
// in India between 12:00 AM and 5:30 AM.
export function toISODateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayISODate() {
  return toISODateString(new Date());
}

// new Date("2026-09-27") is parsed as UTC midnight, which can shift the day.
// Building the date from its parts keeps it in local time.
export function parseISODate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// "2026-09-27" -> "2026-09"
export function getMonthKey(isoDate) {
  return isoDate.slice(0, 7);
}

export function getCurrentMonthKey() {
  return getMonthKey(getTodayISODate());
}

// shiftMonthKey("2026-01", -1) -> "2025-12"
export function shiftMonthKey(monthKey, offset) {
  const [year, month] = monthKey.split("-").map(Number);
  return getMonthKey(toISODateString(new Date(year, month - 1 + offset, 1)));
}

// getRecentMonthKeys(3, "2026-09") -> ["2026-07", "2026-08", "2026-09"]
export function getRecentMonthKeys(count, endMonthKey) {
  return Array.from({ length: count }, (_, index) =>
    shiftMonthKey(endMonthKey, index - (count - 1))
  );
}

export function getDaysInMonth(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month, 0).getDate(); // day 0 of next month = last day of this month
}
