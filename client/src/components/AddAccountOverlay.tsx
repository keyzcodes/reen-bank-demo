import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import "../styles/add-account.css";

// ADD ACCOUNT DATA:
// The overlay collects details; App decides how they are saved.
// This keeps the form ready for a future backend request.
export type NewAccountDetails = {
  name: string;
  description: string;
};

type AddAccountOverlayProps = {
  onDismiss: () => void;
  onCreate: (
    details: NewAccountDetails,
  ) => void | Promise<void>;
};

export default function AddAccountOverlay({
  onDismiss,
  onCreate,
}: AddAccountOverlayProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittingRef = useRef(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);

  // MODAL ACCESSIBILITY:
  // Native dialog keeps keyboard focus inside the overlay and makes
  // the underlying page unavailable while the modal is open.
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    dialog?.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
      }

      dialog?.close();
      document.body.style.overflow = previousOverflow;

      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      }
    };
  }, []);

  // MODAL CLOSE:
  // Keep the component mounted until the dissolve animation finishes.
  // Reduced-motion users receive an immediate close.
  function dismiss() {
    if (closing || dismissTimer.current || submittingRef.current) return;

    setClosing(true);

    const duration = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
      ? 0
      : 300;

    dismissTimer.current = setTimeout(onDismiss, duration);
  }

  // CREATE ACCOUNT:
  // Trim text and prevent duplicate submissions.
  // No opening deposit is created here; a new account starts at zero.
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittingRef.current || closing) return;

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setError("Enter an account name.");
      return;
    }

    submittingRef.current = true;
    setSaving(true);
    setError("");

    try {
      await onCreate({
        name: trimmedName,
        description: trimmedDescription,
      });

      submittingRef.current = false;
      setSaving(false);
      dismiss();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The account could not be created. Try again.",
      );

      submittingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={`reen-add-dialog ${closing ? "is-closing" : ""}`}
      aria-labelledby="reen-add-account-title"
      onCancel={(event) => {
        // Escape uses our animated close instead of closing instantly.
        event.preventDefault();
        dismiss();
      }}
    >
      <h2 id="reen-add-account-title">Add Account</h2>

      <form onSubmit={submit} aria-busy={saving}>
        {/* ACCOUNT NAME: Verified 400 x 64px desktop input. */}
        <div className="reen-add-name-field">
          <label htmlFor="reen-new-account-name">Account Name</label>
          <input
            id="reen-new-account-name"
            name="accountName"
            type="text"
            placeholder="Enter name"
            autoFocus
            required
            maxLength={80}
            value={name}
            disabled={saving || closing}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "reen-add-account-error" : undefined}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
          />
        </div>

        {/* DESCRIPTION: Verified 400 x 180px desktop textarea.
            Length limits are implementation choices, not Figma properties. */}
        <div className="reen-add-description-field">
          <label htmlFor="reen-new-account-description">
            Short Description
          </label>
          <textarea
            id="reen-new-account-description"
            name="description"
            placeholder="Description"
            maxLength={500}
            value={description}
            disabled={saving || closing}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        {error && (
          <p
            id="reen-add-account-error"
            className="reen-add-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* ACTIONS: Two 180 x 64px buttons separated by 40px. */}
        <div className="reen-add-dialog-actions">
          <button
            type="button"
            className="reen-add-cancel"
            disabled={saving || closing}
            onClick={dismiss}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="reen-add-submit"
            disabled={saving || closing}
          >
            {saving ? "Adding…" : "Add"}
          </button>
        </div>
      </form>
    </dialog>
  );
}