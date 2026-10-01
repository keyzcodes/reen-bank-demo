import { useEffect, useRef } from "react";

type LogoutOverlayProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

export default function LogoutOverlay({
  onCancel,
  onConfirm,
}: LogoutOverlayProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    dialog.showModal();

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="reen-logout-dialog"
      aria-labelledby="logout-message"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <div className="reen-logout-content">
        <p id="logout-message" className="reen-logout-message">
          Are you sure you want to Logout?
        </p>

        <div className="reen-logout-actions">
          <button
            type="button"
            autoFocus
            className="reen-logout-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className="reen-logout-confirm"
            onClick={onConfirm}
          >
            Logout
          </button>
        </div>
      </div>
    </dialog>
  );
}