import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { formatNaira } from "../utils/banking";
import "../styles/withdraw-wallet.css";

// WITHDRAWAL REQUEST:
// Account numbers remain strings so leading zeros are preserved.
// App receives the details needed to create the simulated transaction.
export type WithdrawalDetails = {
  amountKobo: number;
  accountNumber: string;
  accountName: string;
  bank: string;
};

type WithdrawWalletOverlayProps = {
  availableBalanceKobo: number;
  onDismiss: () => void;
  onWithdraw: (details: WithdrawalDetails) => void | Promise<void>;
};

// BANK OPTIONS:
// Static demo choices, not a live bank directory or account lookup.
const demoBanks = [
  "Access Bank",
  "First Bank",
  "GTBank",
  "UBA",
  "Zenith Bank",
  "Moniepoint",
  "OPay",
];

// MONEY INPUT:
// Accept plain numbers or correctly grouped commas.
// Store money as integer kobo rather than decimal naira.
function parseAmount(value: string): number {
  const text = value.trim();

  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(text)) {
    throw new Error("Enter a valid amount, such as 1000 or 1,000.50.");
  }

  const [naira, fraction = ""] = text.replace(/,/g, "").split(".");
  const amountKobo =
    Number(naira) * 100 + Number(fraction.padEnd(2, "0"));

  if (!Number.isSafeInteger(amountKobo) || amountKobo <= 0) {
    throw new Error("Enter an amount greater than zero within the supported range.");
  }

  return amountKobo;
}

export default function WithdrawWalletOverlay({
  availableBalanceKobo,
  onDismiss,
  onWithdraw,
}: WithdrawWalletOverlayProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittingRef = useRef(false);
  const mountedRef = useRef(false);

  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bank, setBank] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);
  const [withdrawnAmount, setWithdrawnAmount] = useState<number | null>(null);

  const confirmed = withdrawnAmount !== null;

  // MODAL LIFECYCLE:
  // Native dialog contains keyboard focus while open.
  // Closing restores page scrolling and focus to the previous control.
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

  // CONFIRMATION:
  // Move focus to the remaining action after the form disappears.
  useEffect(() => {
    if (confirmed) {
      dialogRef.current
        ?.querySelector<HTMLButtonElement>(".reen-withdraw-back")
        ?.focus();
    }
  }, [confirmed]);

  // DISMISS:
  // Cancel and Go Back both return to Accounts.
  // Prevent dismissal while App is processing the request.
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
  // Validate the request before passing it to App.
  // App checks the balance again before recording the withdrawal.
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittingRef.current || closing || confirmed) return;

    setError("");

    let details: WithdrawalDetails;

    try {
      const amountKobo = parseAmount(amount);
      const number = accountNumber.replace(/\s/g, "");
      const name = accountName.trim();

      if (amountKobo > availableBalanceKobo) {
        throw new Error("Insufficient balance for this withdrawal.");
      }

      if (!/^\d{10}$/.test(number)) {
        throw new Error("Enter a 10-digit account number.");
      }

      if (!name) {
        throw new Error("Enter the account name.");
      }

      if (!demoBanks.includes(bank)) {
        throw new Error("Choose a bank.");
      }

      details = {
        amountKobo,
        accountNumber: number,
        accountName: name,
        bank,
      };
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : "Check the withdrawal details.",
      );
      return;
    }

    // SUBMISSION LOCK:
    // Stops rapid repeated clicks from creating duplicate withdrawals.
    submittingRef.current = true;
    setSaving(true);

    try {
      await onWithdraw(details);

      if (mountedRef.current) {
        setWithdrawnAmount(details.amountKobo);
      }
    } catch (problem) {
      if (mountedRef.current) {
        setError(
          problem instanceof Error
            ? problem.message
            : "Withdrawal could not be completed. Try again.",
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
      className={`reen-withdraw-dialog ${
        confirmed ? "is-confirmed" : ""
      } ${closing ? "is-closing" : ""}`}
      aria-labelledby={
        confirmed ? "reen-withdraw-confirmation" : "reen-withdraw-title"
      }
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
    >
      {confirmed ? (
        <div className="reen-withdraw-success">
          {/* CONFIRMATION:
              Reuse the existing GIF.
              Show the actual submitted amount instead of sample money. */}
          <img
            src="/assets/account-confirmed.gif"
            alt=""
            className="reen-withdraw-success-image"
          />

          <h2 id="reen-withdraw-confirmation">
            <span>{formatNaira(withdrawnAmount)}</span>{" "}
            has been withdrawn from your Wallet!
          </h2>

          <button
            type="button"
            className="reen-withdraw-back"
            onClick={dismiss}
            disabled={closing}
          >
            Go Back
          </button>
        </div>
      ) : (
        <>
          <h2 id="reen-withdraw-title" className="reen-withdraw-title">
            Withdraw
          </h2>

          <form onSubmit={submit} aria-busy={saving}>
            {/* FORM FIELDS:
                Empty values with the exact supplied placeholders.
                Labels remain visible while the user types. */}
            <div className="reen-withdraw-fields">
              <div className="reen-withdraw-field">
                <label htmlFor="reen-withdraw-amount">Amount</label>
                <input
                  id="reen-withdraw-amount"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="100,000"
                  value={amount}
                  maxLength={20}
                  required
                  autoFocus
                  disabled={saving || closing}
                  onChange={(event) => {
                    setAmount(event.target.value);
                    setError("");
                  }}
                />
              </div>

              <div className="reen-withdraw-field">
                <label htmlFor="reen-withdraw-number">Account Number</label>
                <input
                  id="reen-withdraw-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="00 00 00 00 00"
                  value={accountNumber}
                  maxLength={14}
                  required
                  disabled={saving || closing}
                  onChange={(event) => {
                    const digits = event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);

                    setAccountNumber(
                      digits.replace(/(.{2})/g, "$1 ").trim(),
                    );
                    setError("");
                  }}
                />
              </div>

              <div className="reen-withdraw-field">
                <label htmlFor="reen-withdraw-name">Account Name</label>
                <input
                  id="reen-withdraw-name"
                  type="text"
                  autoComplete="off"
                  placeholder="Enter account name"
                  value={accountName}
                  maxLength={80}
                  required
                  disabled={saving || closing}
                  onChange={(event) => {
                    setAccountName(event.target.value);
                    setError("");
                  }}
                />
              </div>

              <div className="reen-withdraw-field">
                <label htmlFor="reen-withdraw-bank">Bank</label>

                {/* BANK SELECT:
                    Native dropdown supports keyboard and mobile selection.
                    CSS supplies the measured grey caret appearance. */}
                <div className="reen-withdraw-select-wrap">
                  <select
                    id="reen-withdraw-bank"
                    value={bank}
                    required
                    disabled={saving || closing}
                    className={bank ? "" : "is-placeholder"}
                    onChange={(event) => {
                      setBank(event.target.value);
                      setError("");
                    }}
                  >
                    <option value="" disabled>
                      Bank Name
                    </option>

                    {demoBanks.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <p className="reen-withdraw-error" role="alert">
                {error}
              </p>
            )}

            {/* ACTIONS:
                Cancel leaves balances unchanged.
                Withdraw only confirms after App accepts the request. */}
            <div className="reen-withdraw-actions">
              <button
                type="button"
                className="reen-withdraw-cancel"
                onClick={dismiss}
                disabled={saving || closing}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="reen-withdraw-submit"
                disabled={saving || closing}
              >
                {saving ? "Withdrawing..." : "Withdraw"}
              </button>
            </div>
          </form>
        </>
      )}
    </dialog>
  );
}