import { useState } from "react";
import PasswordResetOverlay from "../components/PasswordResetOverlay";
const assets = "/assets";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordResetOpen, setPasswordResetOpen] = useState(false);

  return (
    <main
      className="reen-auth-page reen-login-page min-h-screen bg-[#d4f3e7] text-[#252525]"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        backgroundImage: `linear-gradient(rgba(212, 243, 231, 0.9), rgba(212, 243, 231, 0.9)), url("${assets}/a9339.png")`,
        backgroundPosition: "center, center",
        backgroundRepeat: "no-repeat, repeat",
        backgroundSize: "cover, 1000px 1000px",
      }}
    >
      <div className="reen-auth-grid mx-auto grid min-h-screen w-full max-w-[1920px] gap-12 px-6 py-12 md:px-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,620px)] lg:items-center lg:gap-20 lg:px-[80px] lg:py-8">
        <div className="flex min-w-0 flex-col lg:min-h-[560px]">
          <a href="/landing" className="inline-block w-fit">
            <img
              src={`${assets}/17ec0.png`}
              alt="Reen Bank"
              className="h-auto w-[210px] lg:w-[273px]"
            />
          </a>

          <div className="mt-16 max-w-[780px] lg:mt-[110px]">
            <p className="text-lg font-medium text-[#33b786] lg:text-[32px]">
              Reen Bank
            </p>
            <h1 className="mt-2 text-[clamp(42px,4.2vw,80px)] font-bold leading-[1.12]">
              Welcome Back
            </h1>
            <p className="mt-7 max-w-[720px] text-base leading-[1.6] text-[#555] lg:text-[24px]">
              Enter Your Details to login to your Banking Dashboard again!
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
          aria-labelledby="login-title"
          className="reen-auth-card w-full min-w-0 rounded-[24px] bg-white px-6 py-9 shadow-sm sm:px-10 lg:px-[64px] lg:py-[64px]"
        >
          <h2
            id="login-title"
            className="text-[32px] font-bold text-[#33b786] lg:text-[40px]"
          >
            Login
          </h2>

          <form className="mt-8" onSubmit={(event) => event.preventDefault()}>
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-sm font-semibold"
              >
                Email
              </label>
              <div className="relative">
                <input
                  id="login-email"
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

            <div className="mt-6">
              <label
                htmlFor="login-password"
                className="mb-2 block text-sm font-semibold"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your Password"
                  required
                  className="h-[65px] w-full rounded-[10px] border border-[#b8b8b8] bg-white px-5 pr-28 text-base outline-none focus:border-[#33b786] focus:ring-2 focus:ring-[#33b786]/20"
                />
                <button
                  type="button"
                  onClick={() => setPasswordResetOpen(true)}
                  className="reen-login-forgot"
                >
                  Forgot?
                </button>
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
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

            <button
              type="submit"
              className="reen-auth-submit mt-10 h-[65px] w-full rounded-[10px] bg-[#33b786] font-semibold text-white"
            >
              Login
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#999]">
            Don&apos;t Have an Account?{" "}
            <a href="/register" className="font-semibold text-[#33b786]">
              Register
            </a>
          </p>
        </section>
      </div>

      {passwordResetOpen && (
        <PasswordResetOverlay onDismiss={() => setPasswordResetOpen(false)} />
      )}
    </main>
  );
}
