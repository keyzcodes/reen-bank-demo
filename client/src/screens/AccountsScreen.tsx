import { useState } from "react";
import type { Account, AccountId } from "../data";
import { accounts, allTransactions } from "../data";

const assetPathPrefix = "/assets";
const imgImage32      = `${assetPathPrefix}/2828e.png`;
const imgImage34      = `${assetPathPrefix}/9cb34.png`;
const imgFiRrEyeCrossed    = `${assetPathPrefix}/b8200.svg`;
const imgFiRrAngleSmallDown= `${assetPathPrefix}/5bab1.svg`;

/* ── shared typographic helpers ─────────────────────────────────── */
const dmBold   = { fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontVariationSettings: '"opsz" 14' } as const;
const dmMedium = { fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontVariationSettings: '"opsz" 14' } as const;
const bebasNum = { fontFamily: "'Bebas Neue', cursive", fontWeight: 400 } as const;

/* ── Fund / Withdraw modal ───────────────────────────────────────── */
function ActionModal({
  mode,
  account,
  onClose,
}: {
  mode: "fund" | "withdraw";
  account: Account;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [error,  setError]  = useState("");
  const [done,   setDone]   = useState(false);

  const label = mode === "fund" ? "Fund" : "Withdraw";
  const color = mode === "fund" ? "#33b786" : "#e74f5b";

  function submit() {
    const n = parseFloat(amount.replace(/,/g, ""));
    if (!amount || isNaN(n) || n <= 0) {
      setError("Please enter a valid amount greater than ₦ 0.");
      return;
    }
    if (mode === "withdraw" && n > account.balanceRaw) {
      setError(`Insufficient funds. Available: ${account.balance}`);
      return;
    }
    setError("");
    setDone(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-[16px] shadow-2xl w-full max-w-[420px] p-6 md:p-8">
        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-[#8c8c8c] mb-0.5" style={dmMedium}>
              Simulated action
            </p>
            <h3 className="text-[24px] text-[#252525]" style={dmBold}>
              {label} Account
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#f0f0f0] text-[#555] text-lg cursor-pointer"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {!done ? (
          <>
            {/* account info */}
            <div className="bg-[#d4f3e7] rounded-[12px] px-5 py-4 mb-5">
              <p className="text-[13px] text-[#46237a] mb-0.5" style={dmMedium}>{account.label}</p>
              <p className="text-[26px] text-[#252525]" style={bebasNum}>{account.balance}</p>
              <p className="text-[12px] text-[#8c8c8c] mt-0.5" style={dmMedium}>{account.number}</p>
            </div>

            {/* amount input */}
            <label className="block mb-1.5">
              <span className="text-[13px] text-[#252525]" style={dmMedium}>Amount (₦)</span>
            </label>
            <input
              type="number"
              min="0"
              step="100"
              placeholder="0.00"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(""); }}
              className="w-full h-[48px] rounded-[10px] border border-[#e0e0e0] px-4 text-[18px] text-[#252525] bg-white outline-none focus:border-[#33b786] transition-colors"
              style={bebasNum}
            />
            {error && (
              <p className="text-[12px] text-[#e74f5b] mt-1.5" style={dmMedium}>{error}</p>
            )}

            <p className="text-[11px] text-[#8c8c8c] mt-3" style={dmMedium}>
              This is a simulated demo — no real transaction will occur.
            </p>

            {/* actions */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={onClose}
                className="flex-1 h-[48px] rounded-[10px] border border-[#e0e0e0] text-[#555] text-[15px] cursor-pointer"
                style={dmMedium}
              >
                Cancel
              </button>
              <button
                onClick={submit}
                className="flex-1 h-[48px] rounded-[10px] text-white text-[15px] cursor-pointer"
                style={{ ...dmBold, backgroundColor: color }}
              >
                {label}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-4 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-white text-2xl"
              style={{ backgroundColor: color }}
            >
              ✓
            </div>
            <p className="text-[20px] text-[#252525] mb-1" style={dmBold}>
              {label} Simulated
            </p>
            <p className="text-[14px] text-[#8c8c8c] mb-6" style={dmMedium}>
              ₦ {parseFloat(amount.replace(/,/g, "")).toLocaleString("en-NG", { minimumFractionDigits: 2 })} would be {mode === "fund" ? "added to" : "removed from"} {account.label}.
            </p>
            <button
              onClick={onClose}
              className="h-[48px] px-8 rounded-[10px] text-white text-[15px] cursor-pointer"
              style={{ ...dmBold, backgroundColor: "#33b786" }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Accounts screen ─────────────────────────────────────────────── */
interface Props {
  selectedAccountId: AccountId;
  onSelectAccount: (id: AccountId) => void;
  balanceHidden: boolean;
  onToggleBalance: () => void;
}

export default function AccountsScreen({
  selectedAccountId,
  onSelectAccount,
  balanceHidden,
  onToggleBalance,
}: Props) {
  const [modal, setModal] = useState<"fund" | "withdraw" | null>(null);

  const masked   = "••••••••••";
  const fmt      = (v: string) => (balanceHidden ? masked : v);
  const selected = accounts.find((a) => a.id === selectedAccountId) ?? accounts[0];
  const txns     = allTransactions.filter((t) => t.account === selectedAccountId).slice(0, 8);

  return (
    <>
      {modal && (
        <ActionModal
          mode={modal}
          account={selected}
          onClose={() => setModal(null)}
        />
      )}

      <div className="flex flex-col gap-8">
        {/* ── account selector cards ─────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-[22px] xl:text-[24px] text-[#252525]" style={dmBold}>
              My Accounts
            </h2>
            <button
              onClick={onToggleBalance}
              className="flex items-center justify-center w-[44px] h-[44px] bg-[#f0f0f0] rounded-[8px] cursor-pointer"
              aria-label="Toggle balance visibility"
            >
              <img src={imgFiRrEyeCrossed} alt="" className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 min-[480px]:grid-cols-3 gap-3 md:gap-4">
            {accounts.map((acc) => {
              const isActive = acc.id === selectedAccountId;
              return (
                <button
                  key={acc.id}
                  onClick={() => onSelectAccount(acc.id)}
                  className={`text-left rounded-[12px] h-[120px] xl:h-[144px] flex flex-col justify-center px-6 xl:px-8 cursor-pointer transition-all border-2 ${
                    isActive
                      ? "bg-[#33b786] border-[#33b786]"
                      : "bg-[#d4f3e7] border-transparent hover:border-[#33b786]/40"
                  }`}
                >
                  <span
                    className="text-[14px] xl:text-[16px] leading-normal mb-1"
                    style={{ ...dmMedium, color: isActive ? "rgba(255,255,255,0.85)" : "#46237a" }}
                  >
                    {acc.label}
                  </span>
                  <span
                    className="text-[24px] xl:text-[32px] not-italic leading-none"
                    style={{ ...bebasNum, color: isActive ? "#fff" : "#252525" }}
                  >
                    {fmt(acc.balance)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── selected account detail + actions ─────────────────── */}
        <div className="xl:flex xl:gap-8">
          {/* detail card */}
          <section className="flex-1 min-w-0">
            <h2 className="text-xl md:text-[22px] xl:text-[24px] text-[#252525] mb-4" style={dmBold}>
              Account Details
            </h2>

            <div className="bg-[#d4f3e7] rounded-[12px] p-5 md:p-6 xl:p-8">
              {/* top row: logo + name */}
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={imgImage32}
                  alt=""
                  className="w-14 h-14 xl:w-[64px] xl:h-[64px] rounded-full object-cover shrink-0"
                />
                <div>
                  <p className="text-[14px] xl:text-[16px] text-[#46237a]" style={dmMedium}>
                    {selected.label}
                  </p>
                  <p className="text-[12px] text-[#8c8c8c] mt-0.5" style={dmMedium}>
                    {selected.number}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-[#33b786]/20 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#33b786]" />
                    <span className="text-[11px] text-[#33b786]" style={dmBold}>Active</span>
                  </span>
                </div>
              </div>

              {/* balance + income + expense */}
              <div className="flex flex-wrap gap-x-10 gap-y-4 mb-6">
                {[
                  { label: "Current Balance", value: selected.balance },
                  { label: "Income",          value: selected.income  },
                  { label: "Expense",         value: selected.expense },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <span className="text-[13px] xl:text-[16px] text-[#46237a]" style={dmMedium}>{label}</span>
                    <span className="text-[26px] xl:text-[32px] text-[#252525] not-italic leading-none" style={bebasNum}>
                      {fmt(value)}
                    </span>
                  </div>
                ))}
              </div>

              {/* statistics bars */}
              <div className="flex flex-col gap-4">
                {[
                  { label: "Income",  pct: selected.incomePct,  color: "#33b786", img: imgImage32 },
                  { label: "Expense", pct: selected.expensePct, color: "#e74f5b", img: imgImage34 },
                ].map(({ label, pct, color, img }) => (
                  <div key={label} className="flex items-center gap-3 min-w-0">
                    <img src={img} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <span className="text-[14px] text-[#555] w-[60px] shrink-0" style={dmBold}>{label}</span>
                    <div className="flex-1 min-w-0 relative h-3 rounded-[4px]">
                      <div className="absolute inset-0 bg-[#f8f8f8] rounded-[4px]" />
                      <div
                        className="absolute inset-y-0 left-0 rounded-[4px] transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                    <span className="text-[12px] text-[#555] shrink-0 w-8 text-right" style={dmMedium}>
                      {pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fund / Withdraw buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setModal("fund")}
                className="flex-1 h-[52px] rounded-[12px] text-white text-[16px] cursor-pointer transition-opacity hover:opacity-90"
                style={{ ...dmBold, backgroundColor: "#33b786" }}
              >
                Fund
              </button>
              <button
                onClick={() => setModal("withdraw")}
                className="flex-1 h-[52px] rounded-[12px] text-[16px] cursor-pointer border-2 border-[#f0f0f0] bg-white text-[#555] transition-colors hover:border-[#e74f5b] hover:text-[#e74f5b]"
                style={dmBold}
              >
                Withdraw
              </button>
            </div>
          </section>

          {/* ── recent transactions for this account ───────────── */}
          <section className="xl:w-[380px] xl:shrink-0 mt-8 xl:mt-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl md:text-[22px] xl:text-[24px] text-[#252525]" style={dmBold}>
                Recent Activity
              </h2>
              <button className="flex items-center gap-1.5 h-[40px] px-3 bg-[#f0f0f0] rounded-[8px] cursor-pointer">
                <span className="text-[12px] text-[#555]" style={dmBold}>Filter</span>
                <img src={imgFiRrAngleSmallDown} alt="" className="w-4 h-4" />
              </button>
            </div>

            {txns.length === 0 ? (
              <p className="text-[14px] text-[#8c8c8c] py-8 text-center" style={dmMedium}>
                No transactions yet.
              </p>
            ) : (
              <div className="flex flex-col">
                {txns.map((tx, i) => (
                  <div key={tx.id}>
                    <div className="flex items-center gap-2 py-3 min-w-0">
                      {/* type badge */}
                      <span
                        className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 leading-tight"
                        style={{
                          ...dmBold,
                          backgroundColor: tx.type === "credit" ? "#d4f3e7" : "#fde8ea",
                          color:           tx.type === "credit" ? "#33b786"  : "#e74f5b",
                        }}
                      >
                        {tx.type === "credit" ? "Credit" : "Debit"}
                      </span>
                      <span
                        className="text-[13px] xl:text-[14px] text-[#8c8c8c] truncate flex-1 min-w-0"
                        style={dmMedium}
                      >
                        {tx.name}
                      </span>
                      <span
                        className="text-[11px] text-[#8c8c8c] shrink-0 whitespace-nowrap hidden sm:block"
                        style={dmMedium}
                      >
                        {tx.date}
                      </span>
                      <span
                        className="text-[16px] xl:text-[20px] not-italic text-right shrink-0 w-[80px] xl:w-[90px] leading-none"
                        style={{ ...bebasNum, color: tx.type === "credit" ? "#33b786" : "#e74f5b" }}
                      >
                        {tx.amount}
                      </span>
                    </div>
                    {i < txns.length - 1 && <div className="h-px bg-[#e5e5e5]" />}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
