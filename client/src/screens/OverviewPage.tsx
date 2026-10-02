import { useState } from "react";
import ReportingDropdown from "../components/ReportingDropdown";
import type { BankTransaction, DateRange } from "../utils/banking";
import {
  calculateActivity,
  calculateBalance,
  formatNaira,
  formatTransactionDate,
  selectTransactions,
} from "../utils/banking";

const assets = "/assets";

// OVERVIEW ACCOUNTS:
// Names and IDs come from App.
// Creating an account does not give it an opening balance.
export type OverviewAccount = {
  id: string;
  name: string;
};

type OverviewPageProps = {
  accounts: readonly OverviewAccount[];
  transactions: readonly BankTransaction[];
  balanceHidden: boolean;
  onToggleBalance: () => void;
  onAddAccount: () => void;
  onSelectAccount: (accountId: string) => void;
  onViewTransactions: () => void;
};

// MONTH FILTER:
// Build calendar-month boundaries in Nigeria's UTC+01:00 time zone.
// These are functional calendar months, not Figma's sample 22–21 cycles.
// REPORTING DATES:
// Read today's date in Nigeria, independently of the device time zone.
function getNigeriaDate() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());

  function part(type: "year" | "month" | "day") {
    return Number(parts.find((item) => item.type === type)!.value);
  }

  return {
    year: part("year"),
    month: part("month"),
    day: part("day"),
  };
}

// PERIOD BOUNDARIES:
// Nigeria uses UTC+01:00.
// The end timestamp is exclusive, so midnight on the 22nd includes
// every transaction through the end of the previous day, the 21st.
function periodBoundary(year: number, monthIndex: number, day: number) {
  const date = new Date(Date.UTC(year, monthIndex, day));

  return (
    `${date.getUTCFullYear()}-` +
    `${String(date.getUTCMonth() + 1).padStart(2, "0")}-` +
    `${String(date.getUTCDate()).padStart(2, "0")}` +
    "T00:00:00+01:00"
  );
}

// STATISTICS OPTIONS:
// Match Figma's "This Month", followed by previous month names.
// Calculations use calendar months.
function getMonthOptions() {
  const today = getNigeriaDate();

  return Array.from({ length: 3 }, (_, index) => {
    const date = new Date(
      Date.UTC(today.year, today.month - 1 - index, 1),
    );

    const year = date.getUTCFullYear();
    const monthIndex = date.getUTCMonth();

    return {
      label:
        index === 0
          ? "This Month"
          : new Intl.DateTimeFormat("en-GB", {
              timeZone: "UTC",
              month: "long",
            }).format(date),
      range: {
        start: periodBoundary(year, monthIndex, 1),
        end: periodBoundary(year, monthIndex + 1, 1),
      } satisfies DateRange,
    };
  });
}

// BALANCE OPTIONS:
// Match Figma's 22nd–21st reporting cycles.
// Show the cycle containing today, followed by the previous two cycles.
function getBalancePeriods() {
  const today = getNigeriaDate();

  const currentStartMonth =
    today.month - 1 - (today.day < 22 ? 1 : 0);

  const monthName = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    month: "short",
  });

  return Array.from({ length: 3 }, (_, index) => {
    const start = new Date(
      Date.UTC(today.year, currentStartMonth - index, 22),
    );

    const finish = new Date(
      Date.UTC(
        start.getUTCFullYear(),
        start.getUTCMonth() + 1,
        21,
      ),
    );

    const sameYear =
      start.getUTCFullYear() === finish.getUTCFullYear();

    const startLabel =
      `${monthName.format(start)} 22` +
      (sameYear ? "" : `, ${start.getUTCFullYear()}`);

    return {
      label:
        `${startLabel} – ${monthName.format(finish)} 21, ` +
        finish.getUTCFullYear(),
      range: {
        start: periodBoundary(
          start.getUTCFullYear(),
          start.getUTCMonth(),
          22,
        ),
        end: periodBoundary(
          finish.getUTCFullYear(),
          finish.getUTCMonth(),
          22,
        ),
      } satisfies DateRange,
    };
  });
}

// OVERVIEW CONTENT:
// App owns the data and navigation.
// This component owns only the selected reporting months.
export default function OverviewPage({
  accounts,
  transactions,
  balanceHidden,
  onToggleBalance,
  onAddAccount,
  onSelectAccount,
  onViewTransactions,
}: OverviewPageProps) {
  const months = getMonthOptions();
  const balancePeriods = getBalancePeriods();
  const [balanceMonth, setBalanceMonth] = useState(0);
  const [statisticsMonth, setStatisticsMonth] = useState(0);

  const balanceActivity = calculateActivity(
    transactions,
    undefined,
    balancePeriods[balanceMonth].range
  );

  const statistics = calculateActivity(
    transactions,
    undefined,
    months[statisticsMonth].range,
  );

  // CURRENT BALANCE:
  // Sum all account balances, independently of the reporting month.
  const currentBalance = accounts.reduce(
    (total, account) => total + calculateBalance(transactions, account.id),
    0,
  );

  // RECENT ACTIVITY:
  // Show the newest eight completed transactions.
  // Failed and pending activity is excluded from this summary.
  const recentTransactions = selectTransactions(transactions)
    .sort(
      (first, second) =>
        Date.parse(second.createdAt) - Date.parse(first.createdAt),
    )
    .slice(0, 8);

  function displayMoney(amountKobo: number) {
    return balanceHidden ? "XXXXXXXX" : formatNaira(amountKobo);
  }

  const numberClass =
    "font-['Bebas_Neue'] text-[28px] font-normal leading-none lg:text-[32px]";

  return (
    <div className="reen-overview-page grid min-w-0 gap-10 font-['DM_Sans'] text-[#252525] xl:grid-cols-[minmax(0,711fr)_minmax(0,481fr)] xl:gap-16">
      {/* OVERVIEW CENTRE: Balance, accounts and Statistics. */}
      <div className="reen-overview-centre min-w-0 space-y-12 lg:space-y-14">
        <section aria-labelledby="overview-balance-title">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <h2 id="overview-balance-title" className="text-[24px] font-bold">
              Current Account Balance
            </h2>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onToggleBalance}
                aria-label={balanceHidden ? "Show balances" : "Hide balances"}
                aria-pressed={balanceHidden}
                className="grid h-[46px] w-[46px] place-items-center rounded-lg bg-[#f0f0f0] focus-visible:outline-2 focus-visible:outline-[#33b786]"
              >
                <img
                  src={`${assets}/${balanceHidden ? "dc3ce.svg" : "b8200.svg"}`}
                  alt=""
                  className="h-4 w-4"
                />
              </button>

                          {/* BALANCE FILTER:
                  The component contains its own calendar and dropdown. */}
              <ReportingDropdown
                label="Balance reporting month"
                calendar
                options={balancePeriods.map((period) => period.label)}
                value={balanceMonth}
                onChange={setBalanceMonth}
              />
            </div>
          </div>

          {/* BALANCE CARD: Figures calculated from transaction records. */}
          <div className="grid gap-6 rounded-xl bg-[#d4f3e7] p-6 sm:grid-cols-3 lg:min-h-[144px] lg:grid-cols-[64px_repeat(3,minmax(0,1fr))] lg:items-center lg:px-10">
            <img
              src={`${assets}/2828e.png`}
              alt=""
              className="h-16 w-16 sm:hidden lg:block"
            />

            {[
              { label: "Current Balance", amount: currentBalance },
              { label: "Income", amount: balanceActivity.incomeKobo },
              { label: "Expense", amount: balanceActivity.expenseKobo },
            ].map((item) => (
              <div key={item.label} className="min-w-0">
                <p className="text-[16px] font-medium text-[#46237a]">
                  {item.label}
                </p>
                <p className={`mt-2 break-words ${numberClass}`}>
                  {displayMoney(item.amount)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ACCOUNTS: Reuse one card design for every account. */}
        <section aria-labelledby="overview-accounts-title">
          <div className="mb-7 flex items-center justify-between">
            <h2 id="overview-accounts-title" className="text-[24px] font-bold">
              Accounts
            </h2>
            <button
              type="button"
              onClick={onAddAccount}
              aria-label="Create an account"
              className="grid h-[46px] w-[46px] place-items-center rounded-lg bg-[#f0f0f0] focus-visible:outline-2 focus-visible:outline-[#33b786]"
            >
              <img src={`${assets}/acf9a.svg`} alt="" className="h-8 w-8" />
            </button>
          </div>

          {accounts.length === 0 ? (
            <p className="rounded-xl bg-[#d4f3e7] p-6 text-[#555]">
              Create an account to get started.
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-3">
              {accounts.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => onSelectAccount(account.id)}
                  className="flex min-h-[144px] min-w-0 flex-col justify-center rounded-xl bg-[#d4f3e7] px-6 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#33b786]"
                >
                  <span className="text-[16px] font-medium text-[#46237a]">
                    {account.name}
                  </span>
                  <span className={`mt-2 break-words ${numberClass}`}>
                    {displayMoney(calculateBalance(transactions, account.id))}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* STATISTICS: Both rows use the same selected month. */}
        <section aria-labelledby="overview-statistics-title">
          <div className="mb-7 flex items-center justify-between gap-4">
            <h2
              id="overview-statistics-title"
              className="text-[24px] font-bold"
            >
              Statistics
            </h2>

            <ReportingDropdown
  label="Statistics month"
  options={months.map((month) => month.label)}
  value={statisticsMonth}
  onChange={setStatisticsMonth}
/>
          </div>

          <div className="space-y-10">
            {[
              {
                label: "Income",
                icon: "2828e.png",
                amount: statistics.incomeKobo,
                percent: statistics.incomePercent,
                color: "#33b786",
              },
              {
                label: "Expense",
                icon: "9cb34.png",
                amount: statistics.expenseKobo,
                percent: statistics.expensePercent,
                color: "#e74f5b",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="grid min-w-0 grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 lg:grid-cols-[48px_97px_minmax(0,1fr)_auto]"
              >
                <img
                  src={`${assets}/${item.icon}`}
                  alt=""
                  className="h-12 w-12"
                />
                <p className="text-[20px] font-bold text-[#555]">
                  {item.label}
                </p>

                <div
                  role="meter"
                  aria-label={`${item.label} share of activity`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={item.percent}
                  className="col-span-2 col-start-2 row-start-2 h-4 overflow-hidden rounded bg-[#f8f8f8] lg:col-span-1 lg:col-start-auto lg:row-start-auto"
                >
                  <div
                    className="h-full rounded transition-[width] duration-300 ease-out motion-reduce:transition-none"
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>

                <p className={`text-right text-[#555] ${numberClass}`}>
                  {displayMoney(item.amount)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* OVERVIEW RIGHT: Recent completed transactions and PRO card. */}
      <aside
        className="reen-overview-right min-w-0"
        aria-label="Recent account activity"
      >
        <section aria-labelledby="overview-transactions-title">
          <div className="mb-6 flex items-center justify-between">
            <h2
              id="overview-transactions-title"
              className="text-[24px] font-bold"
            >
              Transactions
            </h2>
            <button
              type="button"
              onClick={onViewTransactions}
              aria-label="View all transactions"
              className="grid h-10 w-10 place-items-center"
            >
              <img src={`${assets}/613bb.svg`} alt="" className="h-10 w-10" />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <p className="py-8 text-[16px] text-[#8c8c8c]">
              No transactions yet.
            </p>
          ) : (
            <ul>
              {recentTransactions.map((transaction) => (
                <li
                  key={transaction.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-b border-[#d9d9d9] py-4 text-[16px] font-medium text-[#8c8c8c]"
                >
                  <span className="min-w-0 truncate">
                    {transaction.counterparty}
                  </span>
                  <span
                    className="row-span-2 text-right font-['Bebas_Neue'] text-[24px] font-normal"
                    style={{
                      color:
                        transaction.kind === "deposit" ? "#33b786" : "#e74f5b",
                    }}
                  >
                    {balanceHidden
                      ? "XXXXXXXX"
                      : `${transaction.kind === "deposit" ? "+" : "−"}${formatNaira(transaction.amountKobo)}`}
                  </span>
                  <time
                    dateTime={transaction.createdAt}
                    className="text-[12px]"
                  >
                    {formatTransactionDate(transaction.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* PRO PROMO:
            Visual content from Figma.
            No subscription purchase is implemented. */}
        <section
          aria-label="Upgrade to PRO"
          className="relative mt-12 flex min-h-[217px] flex-col justify-between overflow-hidden rounded-[15px] bg-[#33b786] p-6"
        >
          <img
            src={`${assets}/b525e.png`}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-multiply"
          />
          <img
            src={`${assets}/1e66e.svg`}
            alt=""
            className="relative h-10 w-10"
          />
          <div className="relative">
            <h2 className="text-[32px] font-bold text-[#d4f3e7]">
              Upgrade to PRO
            </h2>
            <p className="text-[16px] font-medium text-white">
              Sign in on more than one device
            </p>
          </div>
        </section>
      </aside>
    </div>
  );
}
