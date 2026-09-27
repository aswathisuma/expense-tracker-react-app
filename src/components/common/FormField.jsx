// Wraps one input with its label, an optional hint and an error message.
// The error's id is "<htmlFor>-error", so the input can point to it with
// aria-describedby and screen readers will read the error aloud.
function FormField({ label, htmlFor, error, hint, children }) {
  return (
    <div className="form-field">
      <label htmlFor={htmlFor} className="form-label">
        {label}
      </label>
      {children}
      {hint && <p className="form-hint">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} className="form-error">
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;
