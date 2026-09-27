import { useState } from "react";
import FormField from "../common/FormField";
import {
  DESCRIPTION_MAX_LENGTH,
  PAYMENT_METHODS,
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_LABELS,
} from "../../constants/transactions";
import { getCategoriesForType } from "../../utils/categoryUtils";
import { getTodayISODate } from "../../utils/dateUtils";
import { validateTransaction } from "../../utils/validation";
import { useCurrency } from "../../hooks/useCurrency";

// Form inputs always hold strings, so the amount becomes a string here.
function getInitialValues(transaction) {
  if (!transaction) {
    return {
      type: TRANSACTION_TYPES.EXPENSE,
      amount: "",
      category: "",
      date: getTodayISODate(),
      paymentMethod: "",
      description: "",
    };
  }

  return {
    type: transaction.type,
    amount: String(transaction.amount),
    category: transaction.category,
    date: transaction.date,
    paymentMethod: transaction.paymentMethod,
    description: transaction.description,
  };
}

// Used for both "Add" (no transaction prop) and "Edit" (transaction prop given).
function TransactionForm({ transaction, categories, onSubmit, onCancel }) {
  const { symbol } = useCurrency();
  const [values, setValues] = useState(() => getInitialValues(transaction));
  const [errors, setErrors] = useState({});

  // Derived value: calculated from state on every render, never stored in state.
  const availableCategories = getCategoriesForType(categories, values.type);

  function handleChange(event) {
    const { name, value } = event.target;

    setValues((previous) => {
      const next = { ...previous, [name]: value };

      // Switching expense <-> income can make the chosen category invalid
      // (e.g. "Salary" is not an expense category), so clear it.
      if (name === "type") {
        const categoryStillAllowed = getCategoriesForType(categories, value).some(
          (category) => category.name === previous.category
        );
        if (!categoryStillAllowed) {
          next.category = "";
        }
      }

      return next;
    });

    // Hide a field's error as soon as the user starts fixing it.
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault(); // stop the browser from reloading the page

    const validationErrors = validateTransaction(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(values);
  }

  // The props every text input and select needs. Writing them once here
  // avoids repeating the same 7 lines for each field.
  function getFieldProps(name) {
    const id = `transaction-${name}`;
    return {
      id,
      name,
      value: values[name],
      onChange: handleChange,
      className: "form-control",
      "aria-invalid": Boolean(errors[name]),
      "aria-describedby": errors[name] ? `${id}-error` : undefined,
    };
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <fieldset className="type-toggle">
        <legend className="form-label">Transaction Type</legend>
        {Object.values(TRANSACTION_TYPES).map((type) => (
          <label
            key={type}
            className={`type-toggle__option type-toggle__option--${type}${
              values.type === type ? " type-toggle__option--selected" : ""
            }`}
          >
            <input
              type="radio"
              name="type"
              value={type}
              checked={values.type === type}
              onChange={handleChange}
            />
            {TRANSACTION_TYPE_LABELS[type]}
          </label>
        ))}
        {errors.type && <p className="form-error">{errors.type}</p>}
      </fieldset>

      <div className="form-grid">
        <FormField label={`Amount (${symbol})`} htmlFor="transaction-amount" error={errors.amount}>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0"
            {...getFieldProps("amount")}
          />
        </FormField>

        <FormField label="Date" htmlFor="transaction-date" error={errors.date}>
          <input type="date" {...getFieldProps("date")} />
        </FormField>

        <FormField label="Category" htmlFor="transaction-category" error={errors.category}>
          <select {...getFieldProps("category")}>
            <option value="">Select a category</option>
            {availableCategories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Payment Method"
          htmlFor="transaction-paymentMethod"
          error={errors.paymentMethod}
        >
          <select {...getFieldProps("paymentMethod")}>
            <option value="">Select a payment method</option>
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField
        label="Description (optional)"
        htmlFor="transaction-description"
        error={errors.description}
        hint={`${values.description.length}/${DESCRIPTION_MAX_LENGTH} characters`}
      >
        <input
          type="text"
          placeholder="e.g. Dinner with friends"
          {...getFieldProps("description")}
        />
      </FormField>

      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary">
          {transaction ? "Save Changes" : "Add Transaction"}
        </button>
      </div>
    </form>
  );
}

export default TransactionForm;
