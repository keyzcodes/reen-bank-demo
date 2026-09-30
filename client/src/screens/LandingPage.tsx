import { useLayoutEffect, useRef, useState } from "react";

const assets = "/assets";

const services = [
  {
    title: "Savings accounts",
    icon: "landing-savings.png",
    description:
      "Reen Bank could offer a variety of savings accounts with different interest rates and terms, allowing customers to save money and earn interest over time. These accounts could include features like automatic transfers, overdraft protection, and mobile banking access.",
  },
  {
    title: "Personal loans",
    icon: "landing-personal.png",
    description:
      "Reen Bank could offer personal loans for a variety of purposes, such as debt consolidation, home improvements, or major purchases. Customers could apply online and receive a decision quickly, with flexible repayment terms and competitive interest rates.",
  },
  {
    title: "Credit cards",
    icon: "landing-credit-card.png",
    description:
      "Reen Bank could offer credit cards with different rewards programs and benefits, such as cash back, travel rewards, or low interest rates. Customers could manage their cards online and receive alerts for suspicious activity or due dates.",
  },
  {
    title: "Investment services",
    icon: "landing-investment.png",
    description:
      "Reen Bank could offer investment services for customers looking to grow their wealth over time. These services could include mutual funds, exchange-traded funds, and other investment vehicles, with access to professional financial advice and analysis.",
  },
  {
    title: "Online bill pay",
    icon: "landing-bill-pay.png",
    description:
      "Reen Bank could offer a convenient online bill pay service, allowing customers to pay bills and manage expenses from their computer or mobile device. This service could include features like automatic payments, bill reminders, and customizable payment schedules.",
  },
  {
    title: "Business banking",
    icon: "landing-business.png",
    description:
      "Reen Bank could offer a range of banking services for small and medium-sized businesses, including checking accounts, business loans, merchant services, and cash management tools. These services could help businesses streamline their financial operations and grow their operations over time.",
  },
] as const;

const faqs = [
  {
    question: "How do I sign up for an account with Reen Bank?",
    answer:
      "You can sign up for an account with Reen Bank online by visiting our website and filling out the online application form. Once your application is approved, you will receive instructions for setting up your account and accessing our online banking platform.",
  },
  {
    question: "What types of accounts does Reen Bank offer?",
    answer:
      "Reen Bank offers a variety of accounts to suit your financial needs, including savings accounts, checking accounts, and credit cards. We also offer loans, investment services, and other financial products.",
  },
  {
    question: "Is Reen Bank FDIC insured?",
    answer:
      "Yes, Reen Bank is FDIC insured, which means that your deposits are insured up to $250,000 per depositor, per insured bank, for each account ownership category.",
  },
  {
    question: "How can I access my Reen Bank account online?",
    answer:
      "You can access your Reen Bank account online by logging into our secure online banking platform using your username and password. From there, you can view your account balances, transfer funds, pay bills, and more.",
  },
  {
    question:
      "What security measures does Reen Bank have in place to protect my financial information?",
    answer:
      "Reen Bank takes the security of your financial information seriously and has a number of measures in place to protect against unauthorized access and fraud. These measures include encryption, two-factor authentication, fraud detection, and regular security updates and monitoring.",
  },
] as const;

export default function LandingPage() {
  const pageRef = useRef<HTMLElement>(null);
  const [activeFaq, setActiveFaq] = useState(0);

  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const elements = page.querySelectorAll<HTMLElement>("[data-reveal]");
    page.classList.add("reen-motion-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle("reen-revealed", entry.isIntersecting);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -5% 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      page.classList.remove("reen-motion-ready");
    };
  }, []);

  return (
    <main
      ref={pageRef}
      className="reen-landing-page"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <section className="relative min-h-screen overflow-hidden bg-[#d4f3e7] lg:min-h-[1080px]">
        <header className="relative z-10 mx-auto flex w-full max-w-[1680px] flex-wrap items-center gap-6 px-6 pt-6 lg:h-[128px] lg:flex-nowrap lg:gap-0 lg:px-8 lg:pt-[64px] xl:px-10 min-[1700px]:px-0">
          <img
            src={`${assets}/17ec0.png`}
            alt="Reen Bank"
            className="h-auto w-[190px] lg:w-[273px]"
          />

          <nav
            aria-label="Main navigation"
            className="flex items-center gap-6 lg:ml-[120px] lg:gap-[64px]"
          >
            <a
              href="#about"
              className="text-[#252525] hover:text-[#33b786] lg:text-[24px]"
            >
              About
            </a>
            <a
              href="#contact"
              className="whitespace-nowrap text-[#252525] hover:text-[#33b786] lg:text-[24px]"
            >
              Contact Us
            </a>
          </nav>

          <a
            href="/login"
            className="ml-auto inline-flex h-11 items-center justify-center rounded-[10px] border-[3px] border-[#33b786] px-5 font-medium text-[#33b786] transition-[transform,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.96] motion-reduce:transition-none lg:h-[64px] lg:w-[140px] lg:px-0 lg:text-[24px]"
          >
            Login
          </a>
        </header>

        <div className="relative z-10 mx-auto w-full max-w-[1680px] px-6 pb-12 lg:mt-[207px] lg:px-8 xl:px-10 min-[1700px]:px-0">
          <div className="max-w-[773px] pt-16 lg:pt-0">
            <p
              data-reveal="hero-left"
              className="text-[22px] font-medium text-[#33b786] lg:text-[32px]"
            >
              Reen Bank
            </p>

            <h1
              data-reveal="hero-left"
              className="mt-1 text-[clamp(42px,8vw,80px)] font-bold leading-[1.12] text-[#252525]"
              style={{ transitionDelay: "100ms" }}
            >
              <span>
                Experience
                <br />
                hassle-free banking
              </span>
            </h1>

            <p
              data-reveal="hero-left"
              className="mt-8 max-w-[720px] text-[17px] leading-[1.6] text-[#555] lg:mt-10 lg:text-[24px]"
              style={{ transitionDelay: "200ms" }}
            >
              Experience simple, secure, and stress-free banking. Say goodbye to
              long queues and complex procedures and hello to hassle-free
              banking with Reen Bank.
            </p>

            <div
              data-reveal="hero-left"
              className="mt-10 flex flex-wrap gap-4 lg:mt-16 lg:gap-10"
              style={{ transitionDelay: "300ms" }}
            >
              <a
                href="/register"
                className="reen-action inline-flex h-[56px] items-center justify-center rounded-[10px] bg-[#33b786] px-8 text-[18px] font-bold text-white lg:h-[72px] lg:w-[234px] lg:px-0 lg:text-[24px]"
              >
                Get Started
              </a>

              <a
                href="#services"
                className="reen-action inline-flex h-[56px] items-center justify-center gap-2 rounded-[10px] border-[3px] border-[#33b786] px-7 text-[18px] font-bold text-[#33b786] lg:h-[72px] lg:w-[234px] lg:px-0 lg:text-[24px]"
              >
                Learn More
                <img
                  src={`${assets}/landing-arrow.svg`}
                  alt=""
                  className="h-6 w-6"
                />
              </a>
            </div>
          </div>
        </div>

        <div
          data-reveal="hero-right"
          className="relative mx-auto mt-4 w-full max-w-[720px] lg:absolute lg:right-[-5%] lg:top-[128px] lg:mt-0 lg:w-[62%] lg:max-w-[1191px] min-[1700px]:right-[-178px] min-[1700px]:w-[1191px]"
        >
          <img
            src={`${assets}/landing-cards.png`}
            alt="Two Reen Bank card designs"
            className="block w-full"
          />
        </div>
      </section>

      <section
        id="services"
        className="overflow-hidden bg-white py-20 lg:py-[120px]"
      >
        <div className="mx-auto max-w-[1680px] px-6 lg:px-8 xl:px-10 min-[1700px]:px-0">
          <h2
            data-reveal="left"
            className="mb-16 text-[42px] font-bold text-[#252525] lg:mb-[96px] lg:text-[64px]"
          >
            Services
          </h2>

          <div className="grid grid-cols-1 gap-x-[160px] gap-y-16 lg:grid-cols-2 lg:gap-y-[96px]">
            {services.map((service, index) => (
              <article
                key={service.title}
                data-reveal={index % 2 === 0 ? "left" : "right"}
                className="flex items-start gap-5 lg:gap-10"
              >
                <img
                  src={`${assets}/${service.icon}`}
                  alt=""
                  className="h-14 w-14 shrink-0 object-contain lg:h-20 lg:w-20"
                />

                <div>
                  <h3 className="text-[25px] font-bold leading-tight text-[#33b786] lg:text-[40px]">
                    {service.title}
                  </h3>
                  <p className="mt-4 text-[16px] leading-[1.6] text-[#555] lg:mt-6 lg:text-[24px]">
                    {service.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="faqs"
        className="relative overflow-hidden bg-[#d4f3e7] py-20 lg:min-h-[746px] lg:py-[120px]"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 -top-[260px] hidden select-none text-[850px] font-bold leading-none text-[#252525]/10 lg:block"
        >
          ?
        </span>

        <div className="relative mx-auto max-w-[1680px] px-6 lg:px-8 xl:px-10 min-[1700px]:px-0">
          <h2
            data-reveal="left"
            className="text-[42px] font-bold text-[#252525] lg:text-[64px]"
          >
            FAQs
          </h2>

          <div className="mt-14 grid gap-12 lg:mt-[80px] lg:grid-cols-[minmax(0,888px)_minmax(0,632px)] lg:gap-[160px]">
            <div key={activeFaq} className="reen-faq-change">
              <h3 className="max-w-[760px] text-[27px] font-bold leading-[1.3] text-[#33b786] underline lg:text-[40px]">
                {faqs[activeFaq].question}
              </h3>
              <p className="mt-8 max-w-[888px] text-[17px] leading-[1.6] text-[#555] lg:mt-12 lg:text-[24px]">
                {faqs[activeFaq].answer}
              </p>
            </div>

            <div data-reveal="right" className="flex flex-col gap-5 lg:gap-10">
              {faqs.map((faq, index) =>
                index === activeFaq ? null : (
                  <button
                    key={faq.question}
                    type="button"
                    onClick={() => setActiveFaq(index)}
                    className="flex w-full items-start justify-between gap-4 text-left text-[#46237a] hover:text-[#33b786]"
                  >
                    <span className="text-[18px] font-bold leading-[1.35] underline lg:text-[24px]">
                      {faq.question}
                    </span>
                    <img
                      src={`${assets}/landing-faq-arrow.svg`}
                      alt=""
                      className="h-8 w-8 shrink-0"
                    />
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-white py-20 lg:min-h-[484px] lg:py-[120px]">
        <div className="mx-auto max-w-[1680px] px-6 text-center lg:px-8 xl:px-10 min-[1700px]:px-0">
          <h2
            data-reveal="left"
            className="text-[25px] font-bold text-[#252525] lg:text-[40px]"
          >
            Supported by various finance services
          </h2>

          <div
            data-reveal="right"
            className="mt-14 grid grid-cols-2 items-center justify-items-center gap-10 lg:mt-[96px] lg:grid-cols-4 lg:gap-14"
          >
            <img
              src={`${assets}/landing-mastercard.png`}
              alt="Mastercard"
              className="max-h-[56px] max-w-full object-contain lg:max-h-[72px]"
            />
            <img
              src={`${assets}/landing-visa.png`}
              alt="Visa"
              className="max-h-[56px] max-w-full object-contain lg:max-h-[72px]"
            />
            <img
              src={`${assets}/landing-paypal.png`}
              alt="PayPal"
              className="max-h-[56px] max-w-full object-contain lg:max-h-[72px]"
            />
            <img
              src={`${assets}/landing-payoneer.png`}
              alt="Payoneer"
              className="max-h-[56px] max-w-full object-contain lg:max-h-[72px]"
            />
          </div>
        </div>
      </section>

      <footer id="contact" className="overflow-hidden bg-[#d4f3e7]">
        <div className="grid w-full lg:grid-cols-[42%_58%]">
          <div
            data-reveal="left"
            className="flex flex-col px-6 py-12 sm:px-10 lg:min-h-[600px] lg:py-14 lg:pl-16 lg:pr-8"
          >
            <div className="grid grid-cols-2 gap-5">
              <div>
                <h2 className="mb-5 text-xl font-bold text-[#33b786]">HELP</h2>
                <div className="flex flex-col gap-3 text-base text-[#555] lg:text-lg">
                  <a href="#faqs">Help Center</a>
                  <a href="#contact">Contact Us</a>
                  <a href="#services">How to Use</a>
                </div>
              </div>

              <div id="about">
                <h2 className="mb-5 text-xl font-bold text-[#33b786]">ABOUT</h2>
                <div className="flex flex-col gap-3 text-base text-[#555] lg:text-lg">
                  <a href="#about">About Reem Bank</a>
                  <a href="#about">Terms &amp; Conditions</a>
                  <a href="#about">Privacy Policy</a>
                </div>
              </div>
            </div>

            <img
              src={`${assets}/17ec0.png`}
              alt="Reen Bank"
              className="mt-14 w-[190px] lg:mt-auto lg:w-[210px]"
            />

            <div className="mt-14 lg:mt-auto">
              <p className="text-sm text-[#555] lg:text-base">
                2023 ReenBank. All rights reserved!
              </p>
              <div className="mt-4 flex gap-3">
                <img
                  src={`${assets}/landing-facebook.png`}
                  alt="Facebook"
                  className="h-8 w-8"
                />
                <img
                  src={`${assets}/landing-instagram.png`}
                  alt="Instagram"
                  className="h-8 w-8"
                />
                <img
                  src={`${assets}/landing-twitter.png`}
                  alt="Twitter"
                  className="h-8 w-8"
                />
              </div>
            </div>
          </div>

          <div
            data-reveal="right"
            className="relative flex min-w-0 min-h-[460px] items-end overflow-hidden rounded-tl-[70px] bg-cover bg-center p-8 sm:p-12 lg:min-h-[600px] lg:rounded-tl-[120px] lg:p-16"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, .38), rgba(0, 0, 0, .52)), url("${assets}/landing-footer.png")`,
            }}
          >
            <div className="relative z-10 min-w-0 w-full">
              <p className="text-base font-medium text-white lg:text-lg">
                New to Reem Bank?
              </p>
              <h2 className="mt-3 text-[clamp(32px,3.4vw,48px)] font-bold leading-[1.2] text-white">
                Enter your Email
                <br />
                and Get Started Now
              </h2>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  aria-label="Enter your Email"
                  placeholder="Enter your Email"
                  className="h-12 w-full min-w-0 rounded-lg border-2 border-[#E74F5B] bg-transparent px-4 text-base text-white placeholder:text-white sm:w-[280px] sm:flex-none"
                />
                <button
                  type="button"
                  className="reen-action h-12 shrink-0 rounded-lg bg-[#33b786] px-6 font-bold text-white"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
