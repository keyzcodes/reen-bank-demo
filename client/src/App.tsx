import { useState } from "react";
import DashboardLayout from "./components/DashboardLayout";
import type { NavItem } from "./components/DashboardSidebar";
import type { AccountId } from "./data";
import { accounts, allTransactions } from "./data";
import AccountsScreen from "./screens/AccountsScreen";
import TransactionsScreen from "./screens/TransactionsScreen";
import ProfilePage from "./screens/ProfilePage";
import type { CustomerProfile } from "./screens/ProfilePage";
import LogoutOverlay from "./components/LogoutOverlay";
import PasswordResetOverlay from "./components/PasswordResetOverlay";

// OVERVIEW ASSETS: Retained for the existing Overview content.
// The shared frame now owns its background, logo and navigation assets.
const assetPathPrefix = "/assets";
const imgImage32 = `${assetPathPrefix}/2828e.png`;
const imgImage34 = `${assetPathPrefix}/9cb34.png`;
const imgEllipse32 = `${assetPathPrefix}/3d67d.png`;
const imgRectangle167 = `${assetPathPrefix}/b525e.png`;
const imgFiRrCalendar = `${assetPathPrefix}/b2d13.svg`;
const imgFiRrAngleSmallDown = `${assetPathPrefix}/5bab1.svg`;
const imgFiRrEyeCrossed = `${assetPathPrefix}/b8200.svg`;
const imgFiRrPlusSmall = `${assetPathPrefix}/acf9a.svg`;
const imgFiRrArrowSmallRight1 = `${assetPathPrefix}/613bb.svg`;
const imgFiRrArrowSmallRight2 = `${assetPathPrefix}/1e66e.svg`;

// OVERVIEW TYPOGRAPHY: Existing styles remain until Overview is rebuilt.
const dmBold = {
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 700,
  fontVariationSettings: '\"opsz\" 14',
} as const;
const dmMedium = {
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 500,
  fontVariationSettings: '\"opsz\" 14',
} as const;
const bebasNum = {
  fontFamily: "'Bebas Neue', cursive",
  fontWeight: 400,
} as const;

// DEMO DATA: These fixture transactions are not connected to the backend.
const overviewTransactions = allTransactions.slice(0, 8);

// OVERVIEW CONTENT: Preserved during the frame extraction.
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
  const fmt = (v: string) => (balanceHidden ? masked : v);
  return (
    <div className="xl:flex xl:gap-10 2xl:gap-12">
      {/* center column */}
      <div className="flex-1 min-w-0 flex flex-col gap-8">
        {/* Current Account Balance */}
        <section>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2
              className="text-xl md:text-[22px] xl:text-[24px] text-[#252525]"
              style={dmBold}
            >
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
                <img
                  src={imgFiRrCalendar}
                  alt=""
                  className="w-4 h-4 shrink-0"
                />
                <span
                  className="text-[11px] md:text-[12px] text-[#555] whitespace-nowrap"
                  style={dmBold}
                >
                  Feb 22 – Mar 21, 2023
                </span>
                <img
                  src={imgFiRrAngleSmallDown}
                  alt=""
                  className="w-4 h-4 shrink-0"
                />
              </button>
            </div>
          </div>
          <div className="bg-[#d4f3e7] rounded-[12px] p-5 md:p-6 xl:px-10 xl:py-0 xl:h-[144px] flex flex-col xl:flex-row xl:items-center gap-5 xl:gap-[60px]">
            <img
              src={imgImage32}
              alt=""
              className="w-14 h-14 xl:w-[64px] xl:h-[64px] rounded-full object-cover shrink-0"
            />
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-x-10 xl:gap-[60px]">
              {[
                { label: "Current Balance", value: "₦ 44,500.00" },
                { label: "Income", value: "₦ 54,500.00" },
                { label: "Expense", value: "₦ 10,000.00" },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span
                    className="text-[14px] xl:text-[16px] text-[#46237a]"
                    style={dmMedium}
                  >
                    {label}
                  </span>
                  <span
                    className="text-[26px] xl:text-[32px] text-[#252525] not-italic leading-none"
                    style={bebasNum}
                  >
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
            <h2
              className="text-xl md:text-[22px] xl:text-[24px] text-[#252525]"
              style={dmBold}
            >
              Accounts
            </h2>
            <button
              onClick={() => onNavigate("Accounts")}
              className="flex items-center justify-center w-[46px] h-[46px] bg-[#f0f0f0] rounded-[8px] cursor-pointer"
            >
              <img
                src={imgFiRrPlusSmall}
                alt="View accounts"
                className="w-8 h-8"
              />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {accounts.map((acc) => (
              <button
                key={acc.id}
                onClick={() => onNavigate("Accounts")}
                className="text-left bg-[#d4f3e7] rounded-[12px] h-[120px] xl:h-[144px] flex flex-col justify-center px-6 xl:px-10 cursor-pointer hover:bg-[#c4ead7] transition-colors"
              >
                <span
                  className="text-[14px] xl:text-[16px] text-[#46237a] leading-normal mb-1"
                  style={dmMedium}
                >
                  {acc.label}
                </span>
                <span
                  className="text-[24px] xl:text-[32px] text-[#252525] not-italic leading-none"
                  style={bebasNum}
                >
                  {fmt(acc.balance)}
                </span>
              </button>
            ))}
          </div>
        </section>
        {/* Statistics */}
        <section>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2
              className="text-xl md:text-[22px] xl:text-[24px] text-[#252525]"
              style={dmBold}
            >
              Statistics
            </h2>
            <button className="flex items-center gap-2 h-[46px] px-3 bg-[#f0f0f0] rounded-[8px] cursor-pointer">
              <span className="text-[12px] text-[#555]" style={dmBold}>
                This Month
              </span>
              <img src={imgFiRrAngleSmallDown} alt="" className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-5 md:gap-7">
            {[
              {
                label: "Income",
                value: "₦ 54,500.00",
                color: "#33b786",
                pct: "79%",
                img: imgImage32,
              },
              {
                label: "Expense",
                value: "₦ 10,000.00",
                color: "#e74f5b",
                pct: "65%",
                img: imgImage34,
              },
            ].map(({ label, value, color, pct, img }) => (
              <div
                key={label}
                className="flex items-center gap-3 md:gap-4 min-w-0"
              >
                <img
                  src={img}
                  alt=""
                  className="w-10 h-10 xl:w-12 xl:h-12 rounded-full object-cover shrink-0"
                />
                <span
                  className="text-[16px] xl:text-[20px] text-[#555] shrink-0 w-[64px] xl:w-[80px]"
                  style={dmBold}
                >
                  {label}
                </span>
                <div className="flex-1 min-w-0 relative h-4 rounded-[4px]">
                  <div className="absolute inset-0 bg-[#f8f8f8] rounded-[4px]" />
                  <div
                    className="absolute inset-y-0 left-0 rounded-[4px]"
                    style={{ width: pct, backgroundColor: color }}
                  />
                </div>
                <span
                  className="text-[22px] xl:text-[32px] text-[#555] not-italic leading-none shrink-0 text-right min-w-[110px] xl:min-w-[140px]"
                  style={bebasNum}
                >
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
            <h2
              className="text-xl md:text-[22px] xl:text-[24px] text-[#252525]"
              style={dmBold}
            >
              Transactions
            </h2>
            <button
              onClick={() => onNavigate("Transactions")}
              className="cursor-pointer w-10 h-10 flex items-center justify-center"
            >
              <img
                src={imgFiRrArrowSmallRight1}
                alt="View all"
                className="w-10 h-10"
              />
            </button>
          </div>
          <div className="flex flex-col">
            {overviewTransactions.map((tx, i) => (
              <div key={tx.id}>
                <div className="flex items-center justify-between py-3 gap-2 min-w-0">
                  <span
                    className="text-[14px] xl:text-[16px] text-[#8c8c8c] truncate flex-1 min-w-0"
                    style={dmMedium}
                  >
                    {tx.name}
                  </span>
                  <span
                    className="text-[12px] xl:text-[16px] text-[#8c8c8c] shrink-0 whitespace-nowrap px-1"
                    style={dmMedium}
                  >
                    {tx.date}
                  </span>
                  <span
                    className="text-[18px] xl:text-[24px] not-italic text-right shrink-0 w-[90px] xl:w-[110px] leading-none"
                    style={{
                      ...bebasNum,
                      color: tx.type === "credit" ? "#33b786" : "#e74f5b",
                    }}
                  >
                    {tx.amount}
                  </span>
                </div>
                {i < overviewTransactions.length - 1 && (
                  <div className="h-px bg-[#e5e5e5]" />
                )}
              </div>
            ))}
          </div>
        </section>
        {/* Upgrade to PRO */}
        <div
          className="relative rounded-[15px] overflow-hidden"
          style={{ minHeight: "180px" }}
        >
          <div className="absolute inset-0 bg-[#33b786] rounded-[15px]" />
          <img
            src={imgRectangle167}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-5 rounded-[15px] pointer-events-none"
          />
          <div
            className="relative flex flex-col justify-between h-full p-6"
            style={{ minHeight: "180px" }}
          >
            <img src={imgFiRrArrowSmallRight2} alt="" className="w-10 h-10" />
            <div className="mt-auto pt-4">
              <p
                className="text-[26px] xl:text-[32px] text-[#d4f3e7] leading-normal"
                style={dmBold}
              >
                Upgrade to PRO
              </p>
              <p
                className="text-[14px] xl:text-[16px] text-white leading-normal"
                style={dmMedium}
              >
                Sign in on more than one device
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// APP COORDINATOR:
// Owns shared data, selected page and overlay visibility.
// DashboardLayout owns the frame and mobile-menu visibility.
export default function App() {
  // PROFILE DATA: Temporary React state; refresh restores these defaults.
  const [profile, setProfile] = useState<CustomerProfile>({
    name: "Maureen Oguche",
    email: "oguchemaureenm@gmail.com",
    phone: "+234 803 041 1314",
    gender: "Female",
    avatar: imgEllipse32,
  });
  const [activeNav, setActiveNav] = useState<NavItem>("Overview");
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountId>("main");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [passwordResetOpen, setPasswordResetOpen] = useState(false);

  function navigate(page: NavItem) {
    setActiveNav(page);
  }

  // DEMO LOGOUT: Clears the registration-flow email and returns to Landing.
  // This does not invalidate a backend session; real authentication comes later.
  function confirmLogout() {
    sessionStorage.removeItem("reen-registration-email");
    window.location.replace("/landing");
  }

  return (
    <>
      {/* SHARED FRAME: Every dashboard page uses the same outer layout. */}
      <DashboardLayout
        activeNav={activeNav}
        profile={profile}
        onNavigate={navigate}
        onLogout={() => setLogoutOpen(true)}
      >
        {/* PAGE CONTENT: Kept separate from the shared sidebar and header. */}
        {activeNav === "Overview" && (
          <OverviewScreen
            balanceHidden={balanceHidden}
            onToggleBalance={() => setBalanceHidden((hidden) => !hidden)}
            onNavigate={navigate}
          />
        )}
        {activeNav === "Accounts" && (
          <AccountsScreen
            selectedAccountId={selectedAccount}
            onSelectAccount={setSelectedAccount}
            balanceHidden={balanceHidden}
            onToggleBalance={() => setBalanceHidden((hidden) => !hidden)}
          />
        )}
        {activeNav === "Transactions" && (
          <TransactionsScreen
            selectedAccountId={selectedAccount}
            onSelectAccount={setSelectedAccount}
          />
        )}
        {activeNav === "Profile" && (
          <ProfilePage
            profile={profile}
            onProfileChange={setProfile}
            transactions={overviewTransactions}
            balanceHidden={balanceHidden}
            onToggleBalance={() => setBalanceHidden((hidden) => !hidden)}
            onResetPassword={() => setPasswordResetOpen(true)}
            onViewTransactions={() => navigate("Transactions")}
          />
        )}
      </DashboardLayout>

      {/* OVERLAYS: App controls these independently of the selected page. */}
      {logoutOpen && (
        <LogoutOverlay
          onCancel={() => setLogoutOpen(false)}
          onConfirm={confirmLogout}
        />
      )}
      {passwordResetOpen && (
        <PasswordResetOverlay onDismiss={() => setPasswordResetOpen(false)} />
      )}
    </>
  );
}
