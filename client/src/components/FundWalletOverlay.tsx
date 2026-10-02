import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { formatNaira } from "../utils/banking";
import "../styles/fund-wallet.css";

type FundWalletOverlayProps = {
  onDismiss: () => void;
  onFund: (amountKobo: number) => void | Promise<void>;
};

// MONEY INPUT:
// Convert a decimal naira amount into integer kobo.
// Reject invalid numbers and more than two decimal places.
// This avoids using floating-point arithmetic for stored money.
function parseAmount(value: string): number {
  const text = value.trim();

  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) {
    throw new Error("Enter a valid amount, such as 1000 or 1000.50.");
  }

  const [naira, fraction = ""] = text.split(".");
  const amountKobo =
    Number(naira) * 100 + Number(fraction.padEnd(2, "0"));

  if (!Number.isSafeInteger(amountKobo) || amountKobo <= 0) {
    throw new Error("Enter an amount greater than zero within the supported range.");
  }

  return amountKobo;
}

// FUND WALLET:
// Owns the form, validation and confirmation display.
// App owns the actual transaction list and account balances.
export default function FundWalletOverlay({
  onDismiss,
  onFund,
}: FundWalletOverlayProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittingRef = useRef(false);
  const mountedRef = useRef(false);

  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);
  const [fundedAmount, setFundedAmount] = useState<number | null>(null);

  const confirmed = fundedAmount !== null;

  // MODAL LIFECYCLE:
  // Native dialog keeps keyboard focus inside the popup.
  // Restore scrolling and the previous focus when it closes.
  useEffect(() => {
    mountedRef.current = true;

    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    if (dialog && !dialog.open) dialog.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      mountedRef.current = false;

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;

      dialog?.close();
      document.body.style.overflow = previousOverflow;

      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected
      ) {
        previousFocus.focus();
      }
    };
  }, []);

  // CONFIRMATION FOCUS:
  // Move focus to Go Back after the form becomes the success card.
  useEffect(() => {
    if (confirmed) {
      dialogRef.current
        ?.querySelector<HTMLButtonElement>(".reen-fund-back")
        ?.focus();
    }
  }, [confirmed]);

  // CLOSE ANIMATION:
  // Keep the dialog mounted during its 300ms dissolve.
  function dismiss() {
    if (submittingRef.current || closing || timerRef.current) return;

    setClosing(true);

    const duration = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
      ? 0
      : 300;

    timerRef.current = setTimeout(onDismiss, duration);
  }

  // SUBMIT:
  // Only show success after App accepts the funding transaction.
  // The ref prevents two quick submissions from creating two deposits.
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittingRef.current || closing || confirmed) return;

    setError("");

    let amountKobo: number;

    try {
      amountKobo = parseAmount(amount);
    } catch (problem) {
      setError(
        problem instanceof Error ? problem.message : "Check the amount.",
      );
      return;
    }

    submittingRef.current = true;
    setSaving(true);

    try {
      await onFund(amountKobo);

      if (mountedRef.current) {
        setFundedAmount(amountKobo);
      }
    } catch (problem) {
      if (mountedRef.current) {
        setError(
          problem instanceof Error
            ? problem.message
            : "Funding could not be completed. Try again.",
        );
      }
    } finally {
      submittingRef.current = false;

      if (mountedRef.current) setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={`reen-fund-dialog ${
        confirmed ? "is-confirmed" : ""
      } ${closing ? "is-closing" : ""}`}
      aria-labelledby={
        confirmed ? "reen-fund-confirmation" : "reen-fund-title"
      }
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
    >
      {confirmed ? (
        <div className="reen-fund-success">
          {/* CONFIRMATION ASSET:
              Reuse the existing exported confirmation GIF. */}
          <img
            src="/assets/account-confirmed.gif"
            alt=""
            className="reen-fund-success-image"
          />

          {/* CONFIRMATION MESSAGE:
              Display the submitted amount instead of Figma's sample amount. */}
          <h2 id="reen-fund-confirmation">
            <span>{formatNaira(fundedAmount)}</span>{" "}
            has been added to your Wallet!
          </h2>

          <button
            type="button"
            className="reen-fund-back"
            onClick={dismiss}
            disabled={closing}
          >
            Go Back
          </button>
        </div>
      ) : (
        <>
          <h2 id="reen-fund-title" className="reen-fund-title">
            Fund Wallet
          </h2>

          <form onSubmit={submit} aria-busy={saving}>
            {/* PAYMENT METHOD:
                Direct Pay is the currently implemented demo method.
                Credit Card will be enabled after its own form is built. */}
            <fieldset className="reen-fund-methods">
              <legend>Select Payment Method</legend>

              <div className="reen-fund-method-options">
                <label className="reen-fund-method">
                  <input
                    type="radio"
                    name="fund-payment-method"
                    value="direct-pay"
                    checked
                    readOnly
                  />
                  <span>Direct Pay</span>
                </label>

                <label
                  className="reen-fund-method"
                  title="Credit Card is not implemented yet."
                >
                  <input
                    type="radio"
                    name="fund-payment-method"
                    value="credit-card"
                    disabled
                  />
                  <span>Credit Card</span>
                </label>
              </div>
            </fieldset>

            {/* AMOUNT:
                The placeholder is a visual example, not a saved value.
                inputMode requests a decimal keyboard on mobile. */}
            <div className="reen-fund-amount">
              <label htmlFor="reen-fund-amount">Amount</label>

              <input
                id="reen-fund-amount"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="100,000"
                value={amount}
                maxLength={20}
                required
                autoFocus
                disabled={saving || closing}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "reen-fund-error" : undefined}
                onChange={(event) => {
                  setAmount(event.target.value);
                  setError("");
                }}
              />
            </div>

            {error && (
              <p id="reen-fund-error" className="reen-fund-error" role="alert">
                {error}
              </p>
            )}

            <div className="reen-fund-actions">
              <button
                type="button"
                className="reen-fund-cancel"
                onClick={dismiss}
                disabled={saving || closing}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="reen-fund-submit"
                disabled={saving || closing}
              >
                {saving ? "Funding..." : "Fund"}
              </button>
            </div>
          </form>
        </>
      )}
    </dialog>
  );
}