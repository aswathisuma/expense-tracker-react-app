import { useEffect, useId, useRef } from "react";

// Uses the browser's built-in <dialog> element, which gives us the dark
// backdrop, Esc-to-close and keeping keyboard focus inside the modal for free.
// The parent decides WHEN to show it: {isOpen && <Modal ... />}
function Modal({ title, onClose, children }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  // Esc key: stop the browser closing the dialog by itself, let React decide.
  function handleCancel(event) {
    event.preventDefault();
    onClose();
  }

  // A press on the dark backdrop lands on the <dialog> element itself.
  function handleBackdropMouseDown(event) {
    if (event.target === dialogRef.current) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onMouseDown={handleBackdropMouseDown}
    >
      <div className="modal__content">
        <div className="modal__header">
          <h2 id={titleId} className="modal__title">
            {title}
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

export default Modal;
