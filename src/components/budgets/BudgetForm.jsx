import { useState } from "react";
import FormField from "../common/FormField";
import { validateBudgetAmount } from "../../utils/validation";
import { useCurrency } from "../../hooks/useCurrency";

// initialAmount is 0 when no budget is set yet.
function BudgetForm({ initialAmount, onSubmit, onRemove, onCancel }) {
  const { symbol } = useCurrency();
  const [values, setValues] = useState({ amount: initialAmount > 0 ? String(initialAmount) : "" });
  const [errors, setErrors] = useState({});

  function handleChange(event) {
    setValues({ amount: event.target.value });
    setErrors({});
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateBudgetAmount(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(Number(values.amount));
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <FormField label={`Monthly limit (${symbol})`} htmlFor="budget-amount" error={errors.amount}>
        <input
          id="budget-amount"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          className="form-control"
          placeholder="e.g. 5000"
          value={values.amount}
          onChange={handleChange}
          aria-invalid={Boolean(errors.amount)}
          aria-describedby={errors.amount ? "budget-amount-error" : undefined}
        />
      </FormField>

      <div className="form-actions">
        {initialAmount > 0 && (
          <button type="button" className="btn btn--danger-outline form-actions__start" onClick={onRemove}>
            Remove budget
          </button>
        )}
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary">
          Save
        </button>
      </div>
    </form>
  );
}

export default BudgetForm;
