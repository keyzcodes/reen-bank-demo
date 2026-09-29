import { useState } from "react";
import type { AccountId } from "../data";
import { accounts, allTransactions } from "../data";

const assetPathPrefix = "/assets";
const imgFiRrAngleSmallDown = `${assetPathPrefix}/5bab1.svg`;
const imgFiRrSearch         = `${assetPathPrefix}/a3065.svg`;

const dmBold   = { fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontVariationSettings: '"opsz" 14' } as const;
const dmMedium = { fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontVariationSettings: '"opsz" 14' } as const;
const bebasNum = { fontFamily: "'Bebas Neue', cursive", fontWeight: 400 } as const;

type FilterType = "all" | "credit" | "debit";
type AccountFilter = AccountId | "all";

interface Props {
  selectedAccountId: AccountId;
  onSelectAccount: (id: AccountId) => void;
}

export default function TransactionsScreen({ selectedAccountId, onSelectAccount }: Props) {
  const [accountFilter, setAccountFilter] = useState<AccountFilter>(selectedAccountId);
  const [typeFilter,    setTypeFilter]    = useState<FilterType>("all");
  const [searchQuery,   setSearchQuery]   = useState("");

  const filtered = allTransactions.filter((tx) => {
    if (accountFilter !== "all" && tx.account !== accountFilter) return false;
    if (typeFilter    !== "all" && tx.type    !== typeFilter)    return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!tx.name.toLowerCase().includes(q) && !tx.date.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalCredit = filtered
    .filter((t) => t.type === "credit")
    .reduce((s, t) => s + t.amountRaw, 0);
  const totalDebit = filtered
    .filter((t) => t.type === "debit")
    .reduce((s, t) => s + Math.abs(t.amountRaw), 0);

  function fmtNum(n: number) {
    return "₦ " + n.toLocaleString("en-NG", { minimumFractionDigits: 2 });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ── filters row ──────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl md:text-[22px] xl:text-[24px] text-[#252525] mb-4" style={dmBold}>
          Transaction History
        </h2>

        <div className="flex flex-wrap gap-3 mb-4">
          {/* account selector */}
          <div className="relative">
            <select
              value={accountFilter}
              onChange={(e) => {
                const v = e.target.value as AccountFilter;
                setAccountFilter(v);
                if (v !== "all") onSelectAccount(v as AccountId);
              }}
              className="appearance-none h-[46px] pl-4 pr-9 bg-[#f0f0f0] rounded-[8px] text-[13px] text-[#252525] cursor-pointer outline-none border border-transparent focus:border-[#33b786]"
              style={dmBold}
            >
              <option value="all">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
            <img
              src={imgFiRrAngleSmallDown}
              alt=""
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            />
          </div>

          {/* type filter pills */}
          {(["all", "credit", "debit"] as FilterType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`h-[46px] px-4 rounded-[8px] text-[13px] cursor-pointer capitalize transition-colors ${
                typeFilter === t
                  ? t === "credit"
                    ? "bg-[#33b786] text-white"
                    : t === "debit"
                    ? "bg-[#e74f5b] text-white"
                    : "bg-[#252525] text-white"
                  : "bg-[#f0f0f0] text-[#555] hover:bg-[#e0e0e0]"
              }`}
              style={dmBold}
            >
              {t === "all" ? "All Types" : t === "credit" ? "Credits" : "Debits"}
            </button>
          ))}

          {/* search */}
          <div className="flex items-center gap-2 h-[46px] px-4 bg-[#f0f0f0] rounded-[8px] flex-1 min-w-[160px] max-w-[280px]">
            <img src={imgFiRrSearch} alt="" className="w-4 h-4 shrink-0" />
            <input
              type="text"
              placeholder="Search transactions…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-[13px] text-[#252525] w-full placeholder:text-[#8c8c8c]"
              style={dmMedium}
            />
          </div>
        </div>

        {/* ── summary cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 min-[480px]:grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total Transactions", value: String(filtered.length),  color: "#252525", bg: "#f0f0f0" },
            { label: "Total Credits",       value: fmtNum(totalCredit),     color: "#33b786", bg: "#d4f3e7" },
            { label: "Total Debits",        value: fmtNum(totalDebit),      color: "#e74f5b", bg: "#fde8ea" },
          ].map(({ label, value, color, bg }) => (
            <div
              key={label}
              className="rounded-[12px] px-5 py-4 flex flex-col gap-1"
              style={{ backgroundColor: bg }}
            >
              <span className="text-[13px]" style={{ ...dmMedium, color: "#555" }}>{label}</span>
              <span
                className="text-[24px] xl:text-[28px] not-italic leading-none"
                style={{ ...bebasNum, color }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── transaction table ──────────────────────────────────────── */}
      <section>
        {/* header row — hidden on mobile */}
        <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 pb-2 border-b border-[#e5e5e5]">
          {["Description", "Account", "Date", "Type", "Amount"].map((h) => (
            <span
              key={h}
              className="text-[12px] uppercase tracking-wider text-[#8c8c8c]"
              style={dmBold}
            >
              {h}
            </span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#8c8c8c]">
            <p className="text-[18px]" style={dmBold}>No transactions found</p>
            <p className="text-[14px] mt-1" style={dmMedium}>Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((tx, i) => {
              const acct = accounts.find((a) => a.id === tx.account);
              return (
                <div key={tx.id}>
                  {/* Desktop row */}
                  <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-4 py-3">
                    <span
                      className="text-[14px] xl:text-[16px] text-[#252525] truncate"
                      style={dmMedium}
                    >
                      {tx.name}
                    </span>
                    <span
                      className="text-[13px] text-[#8c8c8c] whitespace-nowrap"
                      style={dmMedium}
                    >
                      {acct?.label}
                    </span>
                    <span
                      className="text-[13px] text-[#8c8c8c] whitespace-nowrap"
                      style={dmMedium}
                    >
                      {tx.date}
                    </span>
                    <span
                      className="text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full text-center whitespace-nowrap"
                      style={{
                        ...dmBold,
                        backgroundColor: tx.type === "credit" ? "#d4f3e7" : "#fde8ea",
                        color:           tx.type === "credit" ? "#33b786"  : "#e74f5b",
                      }}
                    >
                      {tx.type === "credit" ? "Credit" : "Debit"}
                    </span>
                    <span
                      className="text-[20px] xl:text-[24px] not-italic text-right leading-none w-[110px]"
                      style={{ ...bebasNum, color: tx.type === "credit" ? "#33b786" : "#e74f5b" }}
                    >
                      {tx.amount}
                    </span>
                  </div>

                  {/* Mobile card */}
                  <div className="md:hidden flex items-start justify-between gap-3 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full leading-tight shrink-0"
                          style={{
                            ...dmBold,
                            backgroundColor: tx.type === "credit" ? "#d4f3e7" : "#fde8ea",
                            color:           tx.type === "credit" ? "#33b786"  : "#e74f5b",
                          }}
                        >
                          {tx.type === "credit" ? "Credit" : "Debit"}
                        </span>
                        <span className="text-[13px] text-[#252525] truncate" style={dmMedium}>
                          {tx.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8c8c8c]" style={dmMedium}>{tx.date}</p>
                      <p className="text-[11px] text-[#8c8c8c]" style={dmMedium}>{acct?.label}</p>
                    </div>
                    <span
                      className="text-[18px] not-italic text-right leading-none shrink-0"
                      style={{ ...bebasNum, color: tx.type === "credit" ? "#33b786" : "#e74f5b" }}
                    >
                      {tx.amount}
                    </span>
                  </div>

                  {i < filtered.length - 1 && <div className="h-px bg-[#e5e5e5]" />}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
