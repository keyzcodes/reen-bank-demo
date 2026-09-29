import { useState } from "react";
import type { AccountId } from "./data";
import { accounts, allTransactions } from "./data";
import AccountsScreen from "./screens/AccountsScreen";
import TransactionsScreen from "./screens/TransactionsScreen";

/* ── asset map ───────────────────────────────────────────────────── */
const assetPathPrefix = "/assets";
const imgDashboard         = `${assetPathPrefix}/a9339.png`;
const imgLogo              = `${assetPathPrefix}/17ec0.png`;
const imgImage32           = `${assetPathPrefix}/2828e.png`;
const imgImage34           = `${assetPathPrefix}/9cb34.png`;
const imgEllipse32         = `${assetPathPrefix}/3d67d.png`;
const imgRectangle167      = `${assetPathPrefix}/b525e.png`;
const imgFiSrApps          = `${assetPathPrefix}/5d2cf.svg`;
const imgFiRrCreditCard    = `${assetPathPrefix}/6e619.svg`;
const imgFiRrArrowSmallLeft= `${assetPathPrefix}/c2da1.svg`;
const imgFiRrArrowSmallRight=`${assetPathPrefix}/d3423.svg`;
const imgFiRrUser          = `${assetPathPrefix}/136ba.svg`;
const imgFiRrArrowLeft     = `${assetPathPrefix}/01571.svg`;
const imgFiRrCalendar      = `${assetPathPrefix}/b2d13.svg`;
const imgFiRrAngleSmallDown= `${assetPathPrefix}/5bab1.svg`;
const imgFiRrEyeCrossed    = `${assetPathPrefix}/b8200.svg`;
const imgFiRrPlusSmall     = `${assetPathPrefix}/acf9a.svg`;
const imgNotificationBell  = `${assetPathPrefix}/23954.svg`;
const imgFiRrSearch        = `${assetPathPrefix}/a3065.svg`;
const imgFiRrArrowSmallRight1=`${assetPathPrefix}/613bb.svg`;
const imgFiRrArrowSmallRight2=`${assetPathPrefix}/1e66e.svg`;

/* ── types ───────────────────────────────────────────────────────── */
type NavItem = "Overview" | "Accounts" | "Transactions" | "Profile";

/* ── shared style objects ────────────────────────────────────────── */
const dmBold   = { fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontVariationSettings: '"opsz" 14' } as const;
const dmMedium = { fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontVariationSettings: '"opsz" 14' } as const;
const bebasNum = { fontFamily: "'Bebas Neue', cursive", fontWeight: 400 } as const;

/* ── demo data for Overview ──────────────────────────────────────── */
const overviewTransactions = allTransactions.slice(0, 8);

const navItems: { id: NavItem; label: string }[] = [
  { id: "Overview",     label: "Overview"     },
  { id: "Accounts",     label: "Accounts"     },
  { id: "Transactions", label: "Transactions" },
  { id: "Profile",      label: "Profile"      },
];

function navIcon(id: NavItem) {
  if (id === "Overview")     return <img src={imgFiSrApps}       alt="" className="w-8 h-8 shrink-0" />;
  if (id === "Accounts")     return <img src={imgFiRrCreditCard} alt="" className="w-8 h-8 shrink-0" />;
  if (id === "Transactions") return (
    <div className="relative w-8 h-8 shrink-0">
      <img src={imgFiRrArrowSmallLeft}  alt="" className="absolute top-0 left-0 w-[25.56px] h-[25.56px]" />
      <img src={imgFiRrArrowSmallRight} alt="" className="absolute bottom-0 right-0 w-[25.56px] h-[25.56px]" />
    </div>
  );
  return <img src={imgFiRrUser} alt="" className="w-8 h-8 shrink-0" />;
}

/* ── NavButton ───────────────────────────────────────────────────── */
function NavButton({
  item, active, onClick, compact = false,
}: {
  item: { id: NavItem; label: string };
  active: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center cursor-pointer transition-colors ${
        compact ? "gap-3 px-3 py-2 rounded-lg" : "gap-10"
      } ${compact && active ? "bg-[#33b786]/10" : ""}`}
    >
      {navIcon(item.id)}
      <span
        className="text-[20px] leading-normal whitespace-nowrap"
        style={{ ...( active ? dmBold : dmMedium ), color: active ? "#33b786" : "#555" }}
      >
        {item.label}
      </span>
    </button>
  );
}

/* ── TopBar ──────────────────────────────────────────────────────── */
function TopBar({ title }: { title: string }) {
  return (
    <div className="hidden md:flex items-start justify-between flex-wrap gap-4 mb-6 md:mb-8 xl:mb-[100px]">
      <h1 className="text-[32px] xl:text-[40px] leading-normal text-[#252525]" style={dmBold}>
        {title}
      </h1>
      <div className="flex flex-col items-center">
        <span className="text-sm xl:text-[16px] text-[#33b786] leading-normal" style={dmMedium}>
          Maureen Oguche
        </span>
        <span className="text-[32px] xl:text-[40px] text-[#252525] not-italic" style={bebasNum}>
          1234567890
        </span>
      </div>
      <div className="flex flex-1 min-w-[220px] max-w-[481px] items-center gap-4 xl:gap-6">
        <div className="mr-auto flex items-center gap-3">
          <img src={imgFiRrSearch} alt="" className="w-6 h-6" />
          <span className="text-[16px] text-[#8c8c8c]" style={dmMedium}>Search</span>
        </div>
        <button className="cursor-pointer">
          <img src={imgNotificationBell} alt="Notifications" className="w-6 h-6" />
        </button>
        <button className="cursor-pointer">
          <img src={imgEllipse32} alt="Profile" className="w-12 xl:w-[56px] h-12 xl:h-[56px] rounded-full object-cover" />
        </button>
      </div>
    </div>
  );
}

/* ── Overview screen ─────────────────────────────────────────────── */
function OverviewScreen({
  balanceHidden,
  onToggleBalance,
  onNavigate,
}: {
  balanceHidden: boolean;
  onToggleBalance: () => void;
  onNavigate: (nav: NavItem) => void;
}) {
  const masked = "••••••••••";
  const fmt    = (v: string) => (balanceHidden ? masked : v);

  return (
    <div className="xl:flex xl:gap-10 2xl:gap-12">
      {/* center column */}
      <div className="flex-1 min-w-0 flex flex-col gap-8">

        {/* Current Account Balance */}
        <section>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-xl md:text-[22px] xl:text-[24px] text-[#252525]" style={dmBold}>
              Current Account Balance
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={onToggleBalance}
                className="flex items-center justify-center w-[44px] h-[44px] bg-[#f0f0f0] rounded-[8px] cursor-pointer"
                aria-label="Toggle balance visibility"
              >
                <img src={imgFiRrEyeCrossed} alt="" className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 h-[44px] px-3 bg-[#f0f0f0] rounded-[8px] cursor-pointer">
                <img src={imgFiRrCalendar} alt="" className="w-4 h-4 shrink-0" />
                <span className="text-[11px] md:text-[12px] text-[#555] whitespace-nowrap" style={dmBold}>
                  Feb 22 – Mar 21, 2023
                </span>
                <img src={imgFiRrAngleSmallDown} alt="" className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>
          <div className="bg-[#d4f3e7] rounded-[12px] p-5 md:p-6 xl:px-10 xl:py-0 xl:h-[144px] flex flex-col xl:flex-row xl:items-center gap-5 xl:gap-[60px]">
            <img src={imgImage32} alt="" className="w-14 h-14 xl:w-[64px] xl:h-[64px] rounded-full object-cover shrink-0" />
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-x-10 xl:gap-[60px]">
              {[
                { label: "Current Balance", value: "₦ 44,500.00" },
                { label: "Income",          value: "₦ 54,500.00" },
                { label: "Expense",         value: "₦ 10,000.00" },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className="text-[14px] xl:text-[16px] text-[#46237a]" style={dmMedium}>{label}</span>
                  <span className="text-[26px] xl:text-[32px] text-[#252525] not-italic leading-none" style={bebasNum}>
                    {fmt(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Accounts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-[22px] xl:text-[24px] text-[#252525]" style={dmBold}>
              Accounts
            </h2>
            <button
              onClick={() => onNavigate("Accounts")}
              className="flex items-center justify-center w-[46px] h-[46px] bg-[#f0f0f0] rounded-[8px] cursor-pointer"
            >
              <img src={imgFiRrPlusSmall} alt="View accounts" className="w-8 h-8" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {accounts.map((acc) => (
              <button
                key={acc.id}
                onClick={() => onNavigate("Accounts")}
                className="text-left bg-[#d4f3e7] rounded-[12px] h-[120px] xl:h-[144px] flex flex-col justify-center px-6 xl:px-10 cursor-pointer hover:bg-[#c4ead7] transition-colors"
              >
                <span className="text-[14px] xl:text-[16px] text-[#46237a] leading-normal mb-1" style={dmMedium}>
                  {acc.label}
                </span>
                <span className="text-[24px] xl:text-[32px] text-[#252525] not-italic leading-none" style={bebasNum}>
                  {fmt(acc.balance)}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Statistics */}
        <section>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-xl md:text-[22px] xl:text-[24px] text-[#252525]" style={dmBold}>
              Statistics
            </h2>
            <button className="flex items-center gap-2 h-[46px] px-3 bg-[#f0f0f0] rounded-[8px] cursor-pointer">
              <span className="text-[12px] text-[#555]" style={dmBold}>This Month</span>
              <img src={imgFiRrAngleSmallDown} alt="" className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-5 md:gap-7">
            {[
              { label: "Income",  value: "₦ 54,500.00", color: "#33b786", pct: "79%", img: imgImage32 },
              { label: "Expense", value: "₦ 10,000.00", color: "#e74f5b", pct: "65%", img: imgImage34 },
            ].map(({ label, value, color, pct, img }) => (
              <div key={label} className="flex items-center gap-3 md:gap-4 min-w-0">
                <img src={img} alt="" className="w-10 h-10 xl:w-12 xl:h-12 rounded-full object-cover shrink-0" />
                <span className="text-[16px] xl:text-[20px] text-[#555] shrink-0 w-[64px] xl:w-[80px]" style={dmBold}>{label}</span>
                <div className="flex-1 min-w-0 relative h-4 rounded-[4px]">
                  <div className="absolute inset-0 bg-[#f8f8f8] rounded-[4px]" />
                  <div className="absolute inset-y-0 left-0 rounded-[4px]" style={{ width: pct, backgroundColor: color }} />
                </div>
                <span className="text-[22px] xl:text-[32px] text-[#555] not-italic leading-none shrink-0 text-right min-w-[110px] xl:min-w-[140px]" style={bebasNum}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* right panel */}
      <div className="xl:w-[481px] xl:shrink-0 flex flex-col gap-8 mt-8 xl:mt-0">
        {/* Transactions */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl md:text-[22px] xl:text-[24px] text-[#252525]" style={dmBold}>
              Transactions
            </h2>
            <button
              onClick={() => onNavigate("Transactions")}
              className="cursor-pointer w-10 h-10 flex items-center justify-center"
            >
              <img src={imgFiRrArrowSmallRight1} alt="View all" className="w-10 h-10" />
            </button>
          </div>
          <div className="flex flex-col">
            {overviewTransactions.map((tx, i) => (
              <div key={tx.id}>
                <div className="flex items-center justify-between py-3 gap-2 min-w-0">
                  <span className="text-[14px] xl:text-[16px] text-[#8c8c8c] truncate flex-1 min-w-0" style={dmMedium}>
                    {tx.name}
                  </span>
                  <span className="text-[12px] xl:text-[16px] text-[#8c8c8c] shrink-0 whitespace-nowrap px-1" style={dmMedium}>
                    {tx.date}
                  </span>
                  <span
                    className="text-[18px] xl:text-[24px] not-italic text-right shrink-0 w-[90px] xl:w-[110px] leading-none"
                    style={{ ...bebasNum, color: tx.type === "credit" ? "#33b786" : "#e74f5b" }}
                  >
                    {tx.amount}
                  </span>
                </div>
                {i < overviewTransactions.length - 1 && <div className="h-px bg-[#e5e5e5]" />}
              </div>
            ))}
          </div>
        </section>

        {/* Upgrade to PRO */}
        <div className="relative rounded-[15px] overflow-hidden" style={{ minHeight: "180px" }}>
          <div className="absolute inset-0 bg-[#33b786] rounded-[15px]" />
          <img
            src={imgRectangle167}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-5 rounded-[15px] pointer-events-none"
          />
          <div className="relative flex flex-col justify-between h-full p-6" style={{ minHeight: "180px" }}>
            <img src={imgFiRrArrowSmallRight2} alt="" className="w-10 h-10" />
            <div className="mt-auto pt-4">
              <p className="text-[26px] xl:text-[32px] text-[#d4f3e7] leading-normal" style={dmBold}>
                Upgrade to PRO
              </p>
              <p className="text-[14px] xl:text-[16px] text-white leading-normal" style={dmMedium}>
                Sign in on more than one device
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Shell ───────────────────────────────────────────────────────── */
export default function App() {
  const [activeNav,       setActiveNav      ] = useState<NavItem>("Overview");
  const [balanceHidden,   setBalanceHidden  ] = useState(false);
  const [menuOpen,        setMenuOpen       ] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountId>("main");

  const pageTitle: Record<NavItem, string> = {
    Overview:     "Overview",
    Accounts:     "Accounts",
    Transactions: "Transactions",
    Profile:      "Profile",
  };

  function navigate(nav: NavItem) {
    setActiveNav(nav);
    setMenuOpen(false);
  }

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── background ───────────────────────────────────────────── */}
      <div aria-hidden className="fixed inset-0 pointer-events-none">
        <div className="absolute bg-[#d4f3e7] inset-0" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("${imgDashboard}")`,
            backgroundSize: "1086px 1086px",
            backgroundPosition: "top left",
          }}
        />
        <div className="absolute bg-[rgba(255,255,255,0.75)] inset-0" />
      </div>

      {/* ── mobile header ────────────────────────────────────────── */}
      <header className="md:hidden relative z-30 flex items-center justify-between px-4 py-3 border-b border-[#d4f3e7] bg-white/80 backdrop-blur-sm">
        <img src={imgLogo} alt="Reen Bank" className="h-10 w-auto object-contain" />
        <div className="flex items-center gap-3">
          <button className="min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer">
            <img src={imgNotificationBell} alt="Notifications" className="w-6 h-6" />
          </button>
          <button className="cursor-pointer">
            <img src={imgEllipse32} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-1.5 cursor-pointer"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <span className={`block w-6 h-0.5 bg-[#252525] transition-transform origin-center ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-[#252525] transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-[#252525] transition-transform origin-center ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg z-50 px-4 py-4 flex flex-col gap-2 border-b border-[#d4f3e7]">
            {navItems.map((item) => (
              <NavButton
                key={item.id}
                item={item}
                active={activeNav === item.id}
                onClick={() => navigate(item.id)}
                compact
              />
            ))}
            <div className="border-t border-[#d4f3e7] mt-2 pt-2">
              <button className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                <img src={imgFiRrArrowLeft} alt="" className="w-8 h-8 shrink-0" />
                <span className="text-[20px] leading-normal text-[#555]" style={dmMedium}>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="relative flex">
        {/* ── desktop sidebar ───────────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-[220px] xl:w-[240px] shrink-0 px-6 xl:px-[30px] pt-10 xl:pt-[64px] pb-10 min-h-screen">
          <div className="mb-10 xl:mb-[60px]">
            <img src={imgLogo} alt="Reen Bank" className="h-14 xl:h-[64px] w-auto object-contain" />
          </div>
          <nav className="flex flex-col gap-6 xl:gap-[28px] flex-1">
            {navItems.map((item) => (
              <NavButton
                key={item.id}
                item={item}
                active={activeNav === item.id}
                onClick={() => navigate(item.id)}
              />
            ))}
          </nav>
          <button className="flex items-center gap-10 cursor-pointer mt-auto">
            <img src={imgFiRrArrowLeft} alt="" className="w-8 h-8 shrink-0" />
            <span className="text-[20px] leading-normal text-[#555]" style={dmMedium}>Logout</span>
          </button>
        </aside>

        {/* ── main ──────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-4 md:px-5 xl:px-5 pt-5 md:pt-10 xl:pt-[64px] pb-10">
          {/* mobile page title */}
          <h1
            className="md:hidden text-[28px] font-bold text-[#252525] mb-5"
            style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: '"opsz" 14' }}
          >
            {pageTitle[activeNav]}
          </h1>

          {/* desktop top bar */}
          <TopBar title={pageTitle[activeNav]} />

          {/* screens */}
          {activeNav === "Overview" && (
            <OverviewScreen
              balanceHidden={balanceHidden}
              onToggleBalance={() => setBalanceHidden(!balanceHidden)}
              onNavigate={navigate}
            />
          )}

          {activeNav === "Accounts" && (
            <AccountsScreen
              selectedAccountId={selectedAccount}
              onSelectAccount={setSelectedAccount}
              balanceHidden={balanceHidden}
              onToggleBalance={() => setBalanceHidden(!balanceHidden)}
            />
          )}

          {activeNav === "Transactions" && (
            <TransactionsScreen
              selectedAccountId={selectedAccount}
              onSelectAccount={setSelectedAccount}
            />
          )}

          {activeNav === "Profile" && (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
              <img src={imgEllipse32} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
              <div>
                <p className="text-[24px] text-[#252525]" style={dmBold}>Maureen Oguche</p>
                <p className="text-[16px] text-[#8c8c8c]" style={dmMedium}>maureen@reenbank.demo</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#d4f3e7] rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#33b786]" />
                <span className="text-[13px] text-[#33b786]" style={dmBold}>Active Account</span>
              </span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
