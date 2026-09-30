import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import AccountCreatedOverlay from "../components/AccountCreatedOverlay";

const assets = "/assets";
const demoCode = "123456";

export default function EmailVerificationPage() {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [remaining, setRemaining] = useState(45);
  const [message, setMessage] = useState("");
  const [accepted, setAccepted] = useState(false);
    const [registrationEmail] = useState(
    () => sessionStorage.getItem("reen-registration-email") ?? "",
  );

  function maskEmail(email: string) {
    const separator = email.lastIndexOf("@");

    if (separator <= 0) {
      return "us***me@gmail.com";
    }

    const name = email.slice(0, separator);
    const domain = email.slice(separator + 1);

    const maskedName =
      name.length > 4
        ? `${name.slice(0, 2)}***${name.slice(-2)}`
        : `${name.slice(0, 1)}***`;

    return `${maskedName}@${domain}`;
  }

  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const resendDeadline = useRef(Date.now() + 45_000);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining(
        Math.max(
          0,
          Math.ceil((resendDeadline.current - Date.now()) / 1000),
        ),
      );
    }, 250);

    return () => window.clearInterval(timer);
  }, []);

  function clearFeedback() {
    setMessage("");
    setAccepted(false);
  }

  function updateDigits(index: number, value: string) {
    const numbers = value.replace(/\D/g, "");

    clearFeedback();

    if (!numbers) {
      setDigits((current) => {
        const next = [...current];
        next[index] = "";
        return next;
      });
      return;
    }

    const incoming = numbers.slice(0, 6 - index);

    setDigits((current) => {
      const next = [...current];

      incoming.split("").forEach((digit, offset) => {
        next[index + offset] = digit;
      });

      return next;
    });

    inputs.current[Math.min(index + incoming.length, 5)]?.focus();
  }

  function handleKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace") {
      event.preventDefault();
      clearFeedback();

      const target = digits[index] ? index : Math.max(0, index - 1);

      setDigits((current) => {
        const next = [...current];
        next[target] = "";
        return next;
      });

      inputs.current[target]?.focus();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      inputs.current[Math.max(0, index - 1)]?.focus();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      inputs.current[Math.min(5, index + 1)]?.focus();
    }
  }

  function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const code = digits.join("");

    if (code.length !== 6) {
      setAccepted(false);
      setMessage("Enter all six digits.");
      inputs.current[digits.findIndex((digit) => !digit)]?.focus();
      return;
    }

    if (code !== demoCode) {
      setAccepted(false);
      setMessage("For this frontend preview, use the demo code 123456.");
      return;
    }

    setAccepted(true);
    setMessage(
      "Demo code accepted. This preview has not verified an email or created an account.",
    );
  }

  function resend() {
    if (remaining > 0) return;

    resendDeadline.current = Date.now() + 45_000;
    setRemaining(45);
    setDigits(Array(6).fill(""));
    setAccepted(false);
    setMessage(
      "Demo reset. No email was sent. Use 123456 to test the screen.",
    );

    inputs.current[0]?.focus();
  }

  return (
    <main
      className="reen-auth-page reen-verification-page min-h-screen bg-[#d4f3e7] text-[#252525]"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        backgroundImage: `linear-gradient(rgba(212, 243, 231, 0.9), rgba(212, 243, 231, 0.9)), url("${assets}/a9339.png")`,
        backgroundPosition: "center, center",
        backgroundRepeat: "no-repeat, repeat",
        backgroundSize: "cover, 1000px 1000px",
      }}
    >
      <div className="reen-auth-grid mx-auto grid min-h-screen w-full max-w-[1920px] gap-12 px-6 py-12 md:px-12">
        <div className="flex min-w-0 flex-col">
          <a href="/landing" className="inline-block w-fit">
            <img
              src={`${assets}/17ec0.png`}
              alt="Reen Bank"
              className="h-auto w-[210px]"
            />
          </a>

          <div className="mt-16 max-w-[780px]">
            <p className="text-lg font-medium text-[#33b786]">
              Reen Bank
            </p>

            <h1 className="mt-2 text-[clamp(42px,4.2vw,80px)] font-bold leading-[1.12]">
              Experience
              <br />
              hassle-free banking
            </h1>

            <p className="mt-8 max-w-[720px] text-base leading-[1.6] text-[#555]">
              Experience simple, secure, and stress-free banking. Say goodbye
              to long queues and complex procedures and hello to hassle-free
              banking with Reen Bank.
            </p>
          </div>

          <div className="mt-12 flex gap-4">
            <img
              src={`${assets}/landing-facebook.png`}
              alt="Facebook"
              className="h-9 w-9"
            />
            <img
              src={`${assets}/landing-instagram.png`}
              alt="Instagram"
              className="h-9 w-9"
            />
            <img
              src={`${assets}/landing-twitter.png`}
              alt="Twitter"
              className="h-9 w-9"
            />
          </div>
        </div>

        <section
          aria-labelledby="verification-title"
          className="reen-verification-card"
        >
          <h2 id="verification-title">Email Verification</h2>

          <p className="reen-verification-description">
            A 6-digit code has been sent to your email{" "}
            <span>{maskEmail(registrationEmail)}</span>{" "}
            <a href="/register">Change</a>
          </p>

          <form onSubmit={verify}>
            <div
              className="reen-code-fields"
              role="group"
              aria-label="Six-digit verification code"
            >
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  aria-label={`Code digit ${index + 1}`}
                  aria-describedby={
                    message ? "verification-feedback" : undefined
                  }
                  value={digit}
                  onChange={(event) =>
                    updateDigits(index, event.target.value)
                  }
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onFocus={(event) => event.target.select()}
                  onPaste={(event) => {
                    event.preventDefault();
                    updateDigits(
                      index,
                      event.clipboardData.getData("text"),
                    );
                  }}
                />
              ))}
            </div>

            <p className="reen-verification-countdown">
              0:{String(remaining).padStart(2, "0")} remaining
            </p>

            <button
              type="submit"
              className="reen-auth-submit reen-verification-submit"
            >
              Verify Email
            </button>
          </form>

          <p className="reen-verification-resend">
            Didn’t receive the code?{" "}
            <button
              type="button"
              onClick={resend}
              disabled={remaining > 0}
            >
              Resend
            </button>
          </p>

          <div
            id="verification-feedback"
            className="reen-verification-feedback"
            role="status"
            aria-live="polite"
          >
            {message && (
              <p
                key={message}
                className={
                  accepted
                    ? "reen-dissolve-feedback text-[#269e73]"
                    : "reen-dissolve-feedback text-[#555]"
                }
              >
                {message}
              </p>
            )}
          </div>
        </section>
      </div>
            {accepted && (
        <AccountCreatedOverlay
          onDismiss={() => setAccepted(false)}
        />
      )}
    </main>
  );
}