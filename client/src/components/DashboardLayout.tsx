import { useState } from "react";
import type { ReactNode } from "react";
import type { CustomerProfile } from "../screens/ProfilePage";
import DashboardSidebar, {
  NavButton,
  navItems,
} from "./DashboardSidebar";
import type { NavItem } from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import "../styles/dashboard.css";

type DashboardLayoutProps = {
  activeNav: NavItem;
  profile: CustomerProfile;
  onNavigate: (page: NavItem) => void;
  onLogout: () => void;
  children: ReactNode;
};

// DASHBOARD FRAME:
// Owns presentation and mobile-menu visibility.
// App still owns customer data, page selection and logout confirmation.
// Each screen is inserted through children inside the shared main area.
export default function DashboardLayout({
  activeNav,
  profile,
  onNavigate,
  onLogout,
  children,
}: DashboardLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  // MOBILE NAVIGATION:
  // Close the menu after choosing a page.
  function navigate(page: NavItem) {
    setMenuOpen(false);
    onNavigate(page);
  }

  function requestLogout() {
    setMenuOpen(false);
    onLogout();
  }

  return (
    <div
      className={`reen-dashboard-shell relative min-h-screen w-full overflow-x-hidden ${
        activeNav === "Profile"
  ? "reen-profile-shell"
  : activeNav === "Overview"
    ? "reen-overview-shell"
    : ""
      }`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* BACKGROUND: Preserve the existing colour and pattern opacity. */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none">
        <div className="absolute bg-[#d4f3e7] inset-0" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url("/assets/a9339.png")',
            backgroundSize: "1086px 1086px",
            backgroundPosition: "top left",
          }}
        />
        <div className="absolute bg-[rgba(255,255,255,0.75)] inset-0" />
      </div>

      {/* MOBILE HEADER: Preserve the current responsive presentation. */}
      <header className="md:hidden relative z-30 flex items-center justify-between px-4 py-3 border-b border-[#d4f3e7] bg-white/80 backdrop-blur-sm">
        <img
          src="/assets/17ec0.png"
          alt="Reen Bank"
          className="h-10 w-auto object-contain"
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
          >
            <img src="/assets/23954.svg" alt="" className="w-6 h-6" />
          </button>

          <button
            type="button"
            aria-label="Profile"
            className="cursor-pointer"
            onClick={() => navigate("Profile")}
          >
            <img
              src={profile.avatar}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-1.5 cursor-pointer"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="reen-mobile-navigation"
          >
            <span
              className={`block w-6 h-0.5 bg-[#252525] transition-transform origin-center ${
                menuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-[#252525] transition-opacity ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-[#252525] transition-transform origin-center ${
                menuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>

        {menuOpen && (
          <nav
            id="reen-mobile-navigation"
            aria-label="Mobile dashboard navigation"
            className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg z-50 px-4 py-4 flex flex-col gap-2 border-b border-[#d4f3e7]"
          >
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
              <button
                type="button"
                onClick={requestLogout}
                className="flex items-center gap-3 px-3 py-2 cursor-pointer"
              >
                <img
                  src="/assets/01571.svg"
                  alt=""
                  className="w-8 h-8 shrink-0"
                />
                <span className="text-[20px] leading-normal text-[#555] font-medium">
                  Logout
                </span>
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* SHARED FRAME: Components add no extra wrapper around the sidebar. */}
      <div className="reen-dashboard-frame relative flex">
        <DashboardSidebar
          activeNav={activeNav}
          onNavigate={navigate}
          onLogout={requestLogout}
        />

        <main className="reen-dashboard-main flex-1 min-w-0 px-4 md:px-5 xl:px-5 pt-5 md:pt-10 xl:pt-[64px] pb-10">
          <h1
            className="md:hidden text-[28px] font-bold text-[#252525] mb-5"
            style={{ fontVariationSettings: '"opsz" 14' }}
          >
            {activeNav}
          </h1>

          <DashboardHeader
            title={activeNav}
            profile={profile}
            accountNumber="1234567890"
          />

          {/* PAGE CONTENT: The selected screen supplies this area. */}
          {children}
        </main>
      </div>
    </div>
  );
}