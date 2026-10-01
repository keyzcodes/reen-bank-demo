import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

type Props = {
  onDismiss: () => void;
};

type Step = "email" | "otp" | "password" | "success";

function ResetPasswordField({
  id,
  name,
  placeholder,
}: {
  id: string;
  name: string;
  placeholder: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="reen-reset-field">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete="new-password"
        placeholder={placeholder}
        minLength={8}
        required
        aria-describedby="reset-password-help"
      />

      <button
        type="button"
        className="reen-reset-lock-toggle"
        onClick={() => setVisible((previous) => !previous)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        aria-controls={id}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="5" y="10" width="14" height="11" rx="2" />
          {visible ? (
            <path d="M8 10V7a4 4 0 0 1 8-0.5" />
          ) : (
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          )}
          <path d="M12 14v3" />
        </svg>
      </button>
    </div>
  );
}
export default function PasswordResetOverlay({ onDismiss }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const deadline = useRef(0);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [remaining, setRemaining] = useState(45);
  const [message, setMessage] = useState("");

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

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (step !== "otp") return;

    function updateRemaining() {
      setRemaining(
        Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)),
      );
    }

    updateRemaining();
    const timer = window.setInterval(updateRemaining, 250);
    return () => window.clearInterval(timer);
  }, [step]);

  function beginOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmail(email.trim());
    setDigits(Array(6).fill(""));
    deadline.current = Date.now() + 45_000;
    setRemaining(45);
    setMessage("");
    setStep("otp");
  }

  function fillDigits(index: number, value: string) {
    const numbers = value.replace(/\D/g, "").slice(0, 6 - index);
    if (!numbers) return;

    setDigits((previous) => {
      const next = [...previous];
      for (let offset = 0; offset < numbers.length; offset++) {
        next[index + offset] = numbers[offset];
      }
      return next;
    });

    otpRefs.current[Math.min(index + numbers.length, 5)]?.focus();
    setMessage("");
  }

  function confirmOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (digits.join("") !== "123456") {
      setMessage("For this frontend demo, enter 123456.");
      return;
    }

    setMessage("");
    setStep("password");
  }

  function resendCode() {
    if (remaining > 0) return;

    deadline.current = Date.now() + 45_000;
    setRemaining(45);
    setDigits(Array(6).fill(""));
    setMessage("Demo code: 123456. No email has been sent.");
    otpRefs.current[0]?.focus();
  }

  function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const values = new FormData(form);
    const password = String(values.get("password") ?? "");
    const repeated = String(values.get("repeatPassword") ?? "");

    if (!password || !repeated) {
      setMessage("Enter your new password in both fields.");
      return;
    }

    if (password.length < 8 || repeated.length < 8) {
      setMessage("Both passwords must contain at least 8 characters.");
      return;
    }

    if (password !== repeated) {
      setMessage("The passwords do not match.");
      return;
    }

    form.reset();
    setMessage("");
    setStep("success");
  }

  const maskedEmail = email
    ? `${email.split("@")[0].slice(0, 2)}***@${email.split("@")[1]}`
    : "";

  const titles: Record<Step, string> = {
    email: "Reset Password",
    otp: "Enter Otp",
    password: "Enter new Password",
    success: "Your password has been changed!",
  };

  return (
    <dialog
      ref={dialogRef}
      className={`reen-reset-dialog reen-reset-${step}`}
      aria-labelledby="reset-title"
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
    >
      <div className="reen-reset-content">
        {step === "success" && (
          <img
            src="/assets/account-confirmed.gif"
            alt=""
            className="reen-reset-tick"
          />
        )}

        <h2 id="reset-title" ref={headingRef} tabIndex={-1}>
          {titles[step]}
        </h2>

        {step === "email" && (
          <form key="reset-email-form" onSubmit={beginOtp}>
            <label htmlFor="reset-email">Email</label>

            <div className="reen-reset-field reen-reset-email-field">
              <input
                id="reset-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="reen-reset-envelope"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m4 7 8 6 8-6" />
              </svg>
            </div>

            <button type="submit" className="reen-reset-primary">
              Reset Password
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={confirmOtp}>
            <p className="reen-reset-description">
              A 6-digit code has been sent to your email {maskedEmail}{" "}
              <button
                type="button"
                className="reen-reset-link"
                onClick={() => {
                  setMessage("");
                  setStep("email");
                }}
              >
                Change
              </button>
            </p>

            <div className="reen-reset-otp-fields">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    otpRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  aria-label={`Code digit ${index + 1}`}
                  value={digit}
                  onFocus={(event) => event.currentTarget.select()}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (!value) {
                      setDigits((previous) =>
                        previous.map((item, position) =>
                          position === index ? "" : item,
                        ),
                      );
                      return;
                    }
                    fillDigits(index, value);
                  }}
                  onPaste={(event) => {
                    event.preventDefault();
                    fillDigits(index, event.clipboardData.getData("text"));
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Backspace" && !digit && index > 0) {
                      otpRefs.current[index - 1]?.focus();
                    }
                    if (event.key === "ArrowLeft" && index > 0) {
                      event.preventDefault();
                      otpRefs.current[index - 1]?.focus();
                    }
                    if (event.key === "ArrowRight" && index < 5) {
                      event.preventDefault();
                      otpRefs.current[index + 1]?.focus();
                    }
                  }}
                />
              ))}
            </div>

            <p className="reen-reset-countdown">
              0:{String(remaining).padStart(2, "0")} remaining
            </p>

            <button type="submit" className="reen-reset-primary">
              Confirm
            </button>

            <p className="reen-reset-resend">
              Didn’t receive the code?{" "}
              <button
                type="button"
                className="reen-reset-link"
                disabled={remaining > 0}
                onClick={resendCode}
              >
                Resend
              </button>
            </p>
          </form>
        )}

        {step === "password" && (
          <form key="reset-password-form" noValidate onSubmit={changePassword}>
            <label htmlFor="reset-password">New Password</label>

            <ResetPasswordField
              id="reset-password"
              name="password"
              placeholder="Enter your Password"
            />

            <label htmlFor="reset-repeat" className="reen-reset-repeat-label">
              Retype Password
            </label>

            <ResetPasswordField
              id="reset-repeat"
              name="repeatPassword"
              placeholder="Retype your Password"
            />

            <p id="reset-password-help" className="reen-reset-password-help">
              Use at least 8 characters. Both passwords must match.
            </p>

            <button type="submit" className="reen-reset-primary">
              Change Password
            </button>
          </form>
        )}

        {step === "success" && (
          <button
            type="button"
            className="reen-reset-primary"
            onClick={onDismiss}
          >
            Go Back
          </button>
        )}

        <p className="reen-reset-demo">
          Frontend demo only. No email is sent or password changed.
          {step === "otp" && " Use code 123456."}
        </p>

        {message && (
          <p className="reen-reset-feedback" role="alert">
            {message}
          </p>
        )}
      </div>
    </dialog>
  );
}
