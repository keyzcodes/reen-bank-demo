import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabase";
const assets = "/assets";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  // REGISTRATION FEEDBACK:
  // Show progress, errors and email-confirmation instructions.
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (registering) return;

    const fields = new FormData(event.currentTarget);
    const name = String(fields.get("name") ?? "").trim();
    const email = String(fields.get("email") ?? "").trim();
    const password = String(fields.get("password") ?? "");

    setRegisterError("");
    setRegisterMessage("");

    if (!name) {
      setRegisterError("Enter your name.");
      return;
    }

    setRegistering(true);

    try {
      // CLOUD REGISTRATION:
      // Supabase stores the credentials; name is saved as user metadata.
      // Separate profile and bank-account records will be connected next.
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        setRegisterError(error.message);
        return;
      }

      if (data.session) {
        // Email confirmation is disabled: signup also creates a session.
        window.location.replace("/dashboard");
        return;
      }

      // Email confirmation is enabled: require the actual email link.
      // Do not send the user through the old simulated verification page.
      setRegisterMessage(
        "Check your email for a confirmation link, then return to Login. If you already have an account, log in instead.",
      );
    } catch {
      setRegisterError("Unable to connect. Check your internet and try again.");
    } finally {
      setRegistering(false);
    }
  }

  return (
    <main
      className="reen-auth-page reen-register-page min-h-screen bg-[#d4f3e7] text-[#252525]"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        backgroundImage: `linear-gradient(rgba(212, 243, 231, 0.9), rgba(212, 243, 231, 0.9)), url("${assets}/a9339.png")`,
        backgroundPosition: "center, center",
        backgroundRepeat: "no-repeat, repeat",
        backgroundSize: "cover, 1000px 1000px",
      }}
    >
      <div className="reen-auth-grid mx-auto grid min-h-screen w-full max-w-[1920px] gap-12 px-6 py-12 md:px-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,620px)] lg:items-stretchlg:gap-20 lg:px-[80px] lg:py-8 xl:py-10">
        <div className="flex min-w-0 flex-col">
          <a href="/landing" className="inline-block w-fit">
            <img
              src={`${assets}/17ec0.png`}
              alt="Reen Bank"
              className="h-auto w-[210px] lg:w-[273px]"
            />
          </a>

          <div className="mt-16 max-w-[780px] lg:mt-[140px]">
            <p className="text-lg font-medium text-[#33b786] lg:text-[32px]">
              Reen Bank
            </p>
            <h1 className="mt-2 text-[clamp(42px,4.2vw,80px)] font-bold leading-[1.12]">
              Experience
              <br />
              hassle-free banking
            </h1>
            <p className="mt-8 max-w-[720px] text-base leading-[1.6] text-[#555] lg:text-[24px]">
              Experience simple, secure, and stress-free banking. Say goodbye to
              long queues and complex procedures and hello to hassle-free
              banking with Reen Bank.
            </p>
          </div>

          <div className="mt-12 flex gap-4 lg:mt-auto">
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
          aria-labelledby="register-title"
          className="w-full min-w-0 rounded-[24px] bg-white px-6 py-9 shadow-sm sm:px-10 lg:px-[64px] lg:py-[64px] reen-auth-card"
        >
          <h2
            id="register-title"
            className="text-[32px] font-bold text-[#33b786] lg:text-[40px]"
          >
            Register
          </h2>

          <form className="mt-8" onSubmit={handleRegister}>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="register-name"
                  className="mb-2 block text-sm font-semibold"
                >
                  Name
                </label>
                <div className="relative">
                  <input
                    id="register-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter name here"
                    required
                    className="h-[65px] w-full rounded-[10px] border border-[#b8b8b8] bg-white px-5 pr-14 text-base outline-none focus:border-[#33b786] focus:ring-2 focus:ring-[#33b786]/20"
                  />
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#aaa]"
                  >
                    <circle cx="12" cy="8" r="3.25" />
                    <path d="M5.5 20v-1.5a6.5 6.5 0 0 1 13 0V20" />
                  </svg>
                </div>
              </div>

              <div>
                <label
                  htmlFor="register-email"
                  className="mb-2 block text-sm font-semibold"
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your Email"
                    required
                    className="h-[65px] w-full rounded-[10px] border border-[#b8b8b8] bg-white px-5 pr-14 text-base outline-none focus:border-[#33b786] focus:ring-2 focus:ring-[#33b786]/20"
                  />
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#aaa]"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m4 7 8 6 8-6" />
                  </svg>
                </div>
              </div>

              <div>
                <label
                  htmlFor="register-password"
                  className="mb-2 block text-sm font-semibold"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter your Password"
                    minLength={8}
                    required
                    className="h-[65px] w-full rounded-[10px] border border-[#b8b8b8] bg-white px-5 pr-14 text-base outline-none focus:border-[#33b786] focus:ring-2 focus:ring-[#33b786]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-[#888] hover:text-[#33b786] focus-visible:outline-2 focus-visible:outline-[#33b786]"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <rect x="5" y="10" width="14" height="11" rx="2" />
                      {showPassword ? (
                        <path d="M8 10V7a4 4 0 0 1 8-0.5" />
                      ) : (
                        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                      )}
                      <path d="M12 14v3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <label className="mt-6 flex items-start gap-3 text-sm text-[#888]">
              <input
                type="checkbox"
                required
                className="mt-0.5 h-4 w-4 accent-[#33b786]"
              />
              <span>
                I agree to all the{" "}
                <span className="text-[#33b786]">Terms, Privacy Policy</span>{" "}
                and <span className="text-[#33b786]">Fees.</span>
              </span>
            </label>

            {/* REGISTRATION FEEDBACK: Keep messages inside the existing form. */}
            {registerError && (
              <p role="alert" className="mt-4 text-sm text-[#b42318]">
                {registerError}
              </p>
            )}

            {registerMessage && (
              <p role="status" className="mt-4 text-sm text-[#269e73]">
                {registerMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={registering}
              aria-busy={registering}
              className="reen-auth-submit mt-10 h-[65px] w-full rounded-[10px] bg-[#33b786] font-semibold text-white disabled:cursor-wait disabled:opacity-60"
            >
              {registering ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#999]">
            Already have an Account?{" "}
            <a href="/login" className="font-semibold text-[#33b786]">
              Log in.
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
