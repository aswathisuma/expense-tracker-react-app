import { TRANSACTION_TYPES } from "../constants/transactions";
import { generateId } from "./generateId";

// Form inputs give us strings. This converts them into clean stored values.
export function toTransactionFields(formValues) {
  return {
    type: formValues.type,
    amount: Number(formValues.amount),
    category: formValues.category,
    date: formValues.date,
    paymentMethod: formValues.paymentMethod,
    description: formValues.description.trim(),
  };
}

export function createTransaction(formValues) {
  return {
    id: generateId(),
    ...toTransactionFields(formValues),
    createdAt: new Date().toISOString(),
  };
}

// Newest date first. Same date: the most recently created first.
function compareNewest(a, b) {
  return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
}

const COMPARATORS = {
  newest: compareNewest,
  oldest: (a, b) => compareNewest(b, a),
  highest: (a, b) => b.amount - a.amount || compareNewest(a, b),
  lowest: (a, b) => a.amount - b.amount || compareNewest(a, b),
};

// [...transactions] copies the array, because .sort() changes the array it is
// called on, and state must never be changed directly.
export function sortTransactions(transactions, sortBy = "newest") {
  const compare = COMPARATORS[sortBy] ?? compareNewest;
  return [...transactions].sort(compare);
}

// Used to reject corrupted localStorage data.
function isValidTransaction(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.id === "string" &&
    Object.values(TRANSACTION_TYPES).includes(value.type) &&
    typeof value.amount === "number" &&
    value.amount > 0 &&
    typeof value.category === "string" &&
    typeof value.date === "string" &&
    typeof value.paymentMethod === "string" &&
    typeof value.description === "string" &&
    typeof value.createdAt === "string"
  );
}

export function isValidTransactionList(value) {
  return Array.isArray(value) && value.every(isValidTransaction);
}
