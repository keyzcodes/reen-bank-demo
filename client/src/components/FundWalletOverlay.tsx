import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { formatNaira } from "../utils/banking";
import "../styles/fund-wallet.css";

// PAYMENT METHOD:
// App stores this label on the simulated transaction.
// Card number, expiry and CVC are never passed to App.
export type FundingMethod = "Direct Pay" | "Credit Card";

type FundWalletOverlayProps = {
  onDismiss: () => void;
  onFund: (
    amountKobo: number,
    paymentMethod: FundingMethod,
  ) => void | Promise<void>;
};
// MONEY INPUT:
// Convert a decimal naira amount into integer kobo.
// Reject invalid numbers and more than two decimal places.
// This avoids using floating-point arithmetic for stored money.
function parseAmount(value: string): number {
  const text = value.trim();

  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(text)) {
    throw new Error("Enter a valid amount, such as 1000 or 1000.50.");
  }

  const [naira, fraction = ""] = text.replace(/,/g, "").split(".");
  const amountKobo = Number(naira) * 100 + Number(fraction.padEnd(2, "0"));

  if (!Number.isSafeInteger(amountKobo) || amountKobo <= 0) {
    throw new Error(
      "Enter an amount greater than zero within the supported range.",
    );
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

  // FUNDING FORM:
  // Amount survives switching between payment methods.
  // Card details are temporary and disappear when this overlay unmounts.
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<FundingMethod>("Direct Pay");
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
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

      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
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

    const duration = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 0
      : 300;

    timerRef.current = setTimeout(onDismiss, duration);
  }

  // METHOD SWITCH:
  // Credit Card uses the amount entered under Direct Pay.
  // Keep the current method visible if that amount is missing or invalid.
  function changePaymentMethod(nextMethod: FundingMethod) {
    if (saving || closing) return;

    if (nextMethod === "Credit Card") {
      try {
        parseAmount(amount);
      } catch {
        setError(
          "Enter a valid amount under Direct Pay before selecting Credit Card.",
        );
        document.getElementById("reen-fund-amount")?.focus();
        return;
      }
    }

    setPaymentMethod(nextMethod);
    setError("");
  }

  // DEMO CARD VALIDATION:
  // Check the input format before creating a simulated deposit.
  // This does not contact a bank or authorise a real card payment.
  function validateCard() {
    const digits = cardNumber.replace(/\s/g, "");

    if (!/^\d{13,19}$/.test(digits)) {
      throw new Error("Enter a card number containing 13 to 19 digits.");
    }

    if (!cardholderName.trim()) {
      throw new Error("Enter the cardholder name.");
    }

    const match = /^(\d{2})\/(\d{2})$/.exec(expiry);

    if (!match) {
      throw new Error("Enter the expiry date as MM/YY.");
    }

    const month = Number(match[1]);
    const year = 2000 + Number(match[2]);
    const today = new Date();

    if (month < 1 || month > 12) {
      throw new Error("Enter an expiry month between 01 and 12.");
    }

    if (
      year < today.getFullYear() ||
      (year === today.getFullYear() && month < today.getMonth() + 1)
    ) {
      throw new Error("The card expiry date has passed.");
    }

    if (!/^\d{3,4}$/.test(cvc)) {
      throw new Error("Enter a CVC containing 3 or 4 digits.");
    }
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

      if (paymentMethod === "Credit Card") {
        validateCard();
      }
    } catch (problem) {
      setError(
        problem instanceof Error ? problem.message : "Check the amount.",
      );
      return;
    }

    submittingRef.current = true;
    setSaving(true);

    try {
      // TRANSACTION:
      // Send the amount and method only; never send card details.
      await onFund(amountKobo, paymentMethod);

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
        confirmed
          ? "is-confirmed"
          : paymentMethod === "Credit Card"
            ? "is-credit-card"
            : ""
      } ${closing ? "is-closing" : ""}`}
      aria-labelledby={confirmed ? "reen-fund-confirmation" : "reen-fund-title"}
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
            <span>{formatNaira(fundedAmount)}</span> has been added to your
            Wallet!
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
    Both methods share the amount entered under Direct Pay. */}
            <fieldset
              className="reen-fund-methods"
              disabled={saving || closing}
            >
              <legend>Select Payment Method</legend>

              <div className="reen-fund-method-options">
                <label className="reen-fund-method">
                  <input
                    type="radio"
                    name="fund-payment-method"
                    value="direct-pay"
                    checked={paymentMethod === "Direct Pay"}
                    onChange={() => changePaymentMethod("Direct Pay")}
                  />
                  <span>Direct Pay</span>
                </label>

                <label className="reen-fund-method">
                  <input
                    type="radio"
                    name="fund-payment-method"
                    value="credit-card"
                    checked={paymentMethod === "Credit Card"}
                    onChange={() => changePaymentMethod("Credit Card")}
                  />
                  <span>Credit Card</span>
                </label>
              </div>
            </fieldset>

            {paymentMethod === "Direct Pay" ? (
              /* DIRECT PAY:
     The amount remains in React state when this field is hidden. */
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
                  aria-describedby={error ? "reen-fund-error" : undefined}
                  onChange={(event) => {
                    setAmount(event.target.value);
                    setError("");
                  }}
                />
              </div>
            ) : (
              /* CREDIT CARD:
     Matches the supplied field arrangement.
     These values are used only for frontend demo validation. */
              <div className="reen-fund-card-fields">
                <div className="reen-fund-card-field">
                  <label htmlFor="reen-fund-card-number">Card Number</label>
                  <input
                    id="reen-fund-card-number"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    maxLength={23}
                    required
                    disabled={saving || closing}
                    onChange={(event) => {
                      const digits = event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 19);
                      setCardNumber(digits.replace(/(.{4})/g, "$1 ").trim());
                      setError("");
                    }}
                  />
                </div>

                <div className="reen-fund-card-field">
                  <label htmlFor="reen-fund-cardholder">Card holder name</label>
                  <input
                    id="reen-fund-cardholder"
                    type="text"
                    autoComplete="off"
                    placeholder="Enter card holder name"
                    value={cardholderName}
                    maxLength={80}
                    required
                    disabled={saving || closing}
                    onChange={(event) => {
                      setCardholderName(event.target.value);
                      setError("");
                    }}
                  />
                </div>

                <div className="reen-fund-card-pair">
                  <div className="reen-fund-card-field">
                    <label htmlFor="reen-fund-expiry">Expiry date</label>
                    <input
                      id="reen-fund-expiry"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="MM/YY"
                      value={expiry}
                      maxLength={5}
                      required
                      disabled={saving || closing}
                      onChange={(event) => {
                        const digits = event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 4);
                        setExpiry(
                          digits.length > 2
                            ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                            : digits,
                        );
                        setError("");
                      }}
                    />
                  </div>

                  <div className="reen-fund-card-field">
                    <label htmlFor="reen-fund-cvc">CVC</label>
                    <input
                      id="reen-fund-cvc"
                      type="password"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="000"
                      value={cvc}
                      maxLength={4}
                      required
                      disabled={saving || closing}
                      onChange={(event) => {
                        setCvc(
                          event.target.value.replace(/\D/g, "").slice(0, 4),
                        );
                        setError("");
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

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
