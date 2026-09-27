// Realistic demo data for the last 6 months, so the dashboard, budgets and
// charts have something to show. Loaded from the Dashboard or Settings page.
import { generateId } from "../utils/generateId";
import { getCurrentMonthKey, getRecentMonthKeys, getTodayISODate } from "../utils/dateUtils";

// [day, type, category, amount, paymentMethod, description]
const MONTHLY_TEMPLATE = [
  [1, "income", "Salary", 55000, "Bank Transfer", "Monthly salary"],
  [2, "expense", "Bills", 15000, "Bank Transfer", "House rent"],
  [3, "expense", "Food", 2400, "UPI", "Groceries"],
  [5, "expense", "Bills", 1850, "UPI", "Electricity bill"],
  [7, "expense", "Travel", 1200, "UPI", "Metro card recharge"],
  [9, "expense", "Entertainment", 649, "Credit Card", "Streaming subscription"],
  [11, "expense", "Food", 1350, "Credit Card", "Dinner with friends"],
  [14, "expense", "Shopping", 2999, "Credit Card", "Clothes"],
  [16, "expense", "Health", 800, "Cash", "Pharmacy"],
  [18, "expense", "Food", 2100, "UPI", "Groceries"],
  [20, "income", "Freelance", 12000, "Bank Transfer", "Website project"],
  [22, "expense", "Travel", 2600, "Debit Card", "Weekend trip bus tickets"],
  [24, "expense", "Education", 1499, "Debit Card", "Online course"],
  [26, "expense", "Shopping", 1850, "UPI", "Home essentials"],
  [27, "expense", "Food", 950, "Cash", "Snacks and tea"],
];

// Day-to-day spending changes a little every month; rent and salary do not.
const VARIABLE_CATEGORIES = new Set(["Food", "Travel", "Shopping", "Health"]);
const MONTH_FACTORS = [0.9, 1.05, 0.95, 1.12, 1, 1.08];

export function createSampleData() {
  const today = getTodayISODate();
  const monthKeys = getRecentMonthKeys(MONTH_FACTORS.length, getCurrentMonthKey());
  const transactions = [];

  monthKeys.forEach((monthKey, monthIndex) => {
    MONTHLY_TEMPLATE.forEach(([day, type, category, amount, paymentMethod, description], rowIndex) => {
      const date = `${monthKey}-${String(day).padStart(2, "0")}`;
      const isFreelanceMonth = monthIndex % 2 === 1;

      if (date > today || (category === "Freelance" && !isFreelanceMonth)) {
        return;
      }

      const factor = VARIABLE_CATEGORIES.has(category) ? MONTH_FACTORS[monthIndex] : 1;
      transactions.push({
        id: generateId(),
        type,
        amount: Math.round(amount * factor),
        category,
        date,
        paymentMethod,
        description,
        createdAt: `${date}T${String(8 + (rowIndex % 12)).padStart(2, "0")}:00:00.000Z`,
      });
    });
  });

  const budgets = {
    monthlyLimit: 40000,
    categoryLimits: {
      "cat-food": 6000,
      "cat-travel": 4500,
      "cat-shopping": 7000,
      "cat-entertainment": 1500,
    },
  };

  return { transactions, budgets };
}
