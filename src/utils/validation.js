import {
  DESCRIPTION_MAX_LENGTH,
  PAYMENT_METHODS,
  TRANSACTION_TYPES,
} from "../constants/transactions";
import { CATEGORY_NAME_MAX_LENGTH, CATEGORY_TYPES } from "../constants/categories";
import { isCategoryTypeCompatible } from "./categoryUtils";

// Shared by the transaction form and the budget form.
// Returns an error message, or null when the amount is valid.
function getAmountError(amountText) {
  const amount = Number(amountText);

  if (amountText.trim() === "") {
    return "Amount is required.";
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return "Amount must be greater than 0.";
  }
  if (/\.\d{3,}$/.test(amountText)) {
    return "Amount can have at most 2 decimal places.";
  }
  return null;
}

// Each validator returns an object like { amount: "Amount is required." }.
// An empty object means the form is valid.

export function validateTransaction(values) {
  const errors = {};

  if (!Object.values(TRANSACTION_TYPES).includes(values.type)) {
    errors.type = "Choose income or expense.";
  }

  const amountError = getAmountError(values.amount);
  if (amountError) {
    errors.amount = amountError;
  }

  if (!values.category) {
    errors.category = "Category is required.";
  }

  if (!values.date) {
    errors.date = "Date is required.";
  }

  if (!PAYMENT_METHODS.includes(values.paymentMethod)) {
    errors.paymentMethod = "Payment method is required.";
  }

  if (values.description.trim().length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer.`;
  }

  return errors;
}

// editingCategory is null when adding. usage describes the transactions
// that already use the category being edited.
export function validateCategory(values, { categories, editingCategory, usage }) {
  const errors = {};
  const name = values.name.trim();

  if (!name) {
    errors.name = "Category name is required.";
  } else if (name.length > CATEGORY_NAME_MAX_LENGTH) {
    errors.name = `Category name must be ${CATEGORY_NAME_MAX_LENGTH} characters or fewer.`;
  } else {
    const isDuplicate = categories.some(
      (category) =>
        category.id !== editingCategory?.id && category.name.toLowerCase() === name.toLowerCase()
    );
    if (isDuplicate) {
      errors.name = "A category with this name already exists.";
    }
  }

  if (!CATEGORY_TYPES.includes(values.type)) {
    errors.type = "Choose what this category is used for.";
  } else if (editingCategory && !isCategoryTypeCompatible(values.type, usage.types)) {
    errors.type = `This category already has ${[...usage.types].join(" and ")} transactions, so it must allow them.`;
  }

  return errors;
}

export function validateBudgetAmount(values) {
  const amountError = getAmountError(values.amount);
  return amountError ? { amount: amountError } : {};
}
