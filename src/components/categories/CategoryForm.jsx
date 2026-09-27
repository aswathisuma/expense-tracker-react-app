import { useState } from "react";
import FormField from "../common/FormField";
import {
  CATEGORY_NAME_MAX_LENGTH,
  CATEGORY_TYPES,
  CATEGORY_TYPE_LABELS,
} from "../../constants/categories";
import { validateCategory } from "../../utils/validation";

// Used for both adding (no category prop) and editing (category prop given).
function CategoryForm({ category, categories, usage, onSubmit, onCancel }) {
  const [values, setValues] = useState({
    name: category?.name ?? "",
    type: category?.type ?? "expense",
  });
  const [errors, setErrors] = useState({});

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateCategory(values, {
      categories,
      editingCategory: category ?? null,
      usage,
    });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit({ name: values.name.trim(), type: values.type });
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <FormField
        label="Category name"
        htmlFor="category-name"
        error={errors.name}
        hint={
          category && usage.count > 0
            ? `Renaming also updates ${usage.count} existing transaction${usage.count === 1 ? "" : "s"}.`
            : undefined
        }
      >
        <input
          id="category-name"
          name="name"
          type="text"
          className="form-control"
          placeholder="e.g. Groceries"
          maxLength={CATEGORY_NAME_MAX_LENGTH + 10}
          value={values.name}
          onChange={handleChange}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "category-name-error" : undefined}
        />
      </FormField>

      <fieldset className="type-toggle type-toggle--three">
        <legend className="form-label">Used for</legend>
        {CATEGORY_TYPES.map((type) => (
          <label
            key={type}
            className={`type-toggle__option${values.type === type ? " type-toggle__option--selected" : ""}`}
          >
            <input
              type="radio"
              name="type"
              value={type}
              checked={values.type === type}
              onChange={handleChange}
            />
            {CATEGORY_TYPE_LABELS[type]}
          </label>
        ))}
        {errors.type && <p className="form-error type-toggle__error">{errors.type}</p>}
      </fieldset>

      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary">
          {category ? "Save Changes" : "Add Category"}
        </button>
      </div>
    </form>
  );
}

export default CategoryForm;
