import { useState } from "react";
import Modal from "../common/Modal";
import ConfirmDialog from "../common/ConfirmDialog";
import FormField from "../common/FormField";

// Safe deletion:
// - unused category  -> simple confirmation
// - used category    -> choose where its transactions should move first
function DeleteCategoryDialog({ category, usage, replacementOptions, onConfirm, onCancel }) {
  // Suggest "Other" when it is allowed, otherwise the first valid option.
  const [replacementName, setReplacementName] = useState(
    replacementOptions.find((option) => option.name === "Other")?.name ??
      replacementOptions[0]?.name ??
      ""
  );

  if (usage.count === 0) {
    return (
      <ConfirmDialog
        title={`Delete "${category.name}"?`}
        message="No transactions use this category. Any budget set for it will also be removed."
        confirmLabel="Delete"
        onConfirm={() => onConfirm(null)}
        onCancel={onCancel}
      />
    );
  }

  const transactionText = `${usage.count} transaction${usage.count === 1 ? "" : "s"}`;

  if (replacementOptions.length === 0) {
    return (
      <Modal title={`Can't delete "${category.name}" yet`} onClose={onCancel}>
        <p className="confirm-message">
          {transactionText} use this category, and no other category can hold them. Create a
          category that allows {[...usage.types].join(" and ")} transactions first.
        </p>
        <div className="form-actions">
          <button type="button" className="btn btn--primary" onClick={onCancel}>
            OK
          </button>
        </div>
      </Modal>
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    onConfirm(replacementName);
  }

  return (
    <Modal title={`Delete "${category.name}"?`} onClose={onCancel}>
      <form className="form" onSubmit={handleSubmit}>
        <p className="confirm-message">
          {transactionText} use this category. Choose a category to move them to before deleting.
        </p>

        <FormField label="Move transactions to" htmlFor="replacement-category">
          <select
            id="replacement-category"
            className="form-control"
            value={replacementName}
            onChange={(event) => setReplacementName(event.target.value)}
          >
            {replacementOptions.map((option) => (
              <option key={option.id} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
        </FormField>

        <div className="form-actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn--danger">
            Move &amp; Delete
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default DeleteCategoryDialog;
