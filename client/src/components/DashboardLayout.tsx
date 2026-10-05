import { useCallback, useEffect, useRef, useState } from "react";
import NotificationPanel from "./NotificationPanel";
import {
  loadNotifications,
  markNotificationRead,
} from "../api/notificationsApi";
import type { BankNotification } from "../api/notificationsApi";
import type { ReactNode } from "react";
import type { CustomerProfile } from "../screens/ProfilePage";
import DashboardSidebar, { NavButton, navItems } from "./DashboardSidebar";
import type { NavItem } from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
// DASHBOARD STYLES:
// Load the shared frame first, then Overview's page-specific overrides.
// Overview selectors apply only when the shell has reen-overview-shell.
import "../styles/dashboard.css";
import "../styles/overview.css";

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
  // NOTIFICATIONS: Both bells share these saved cloud alerts.
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<BankNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");

  const notificationsMounted = useRef(false);
  const notificationsRequest = useRef(0);

  // Ignore older responses if another refresh has already started.
  const refreshNotifications = useCallback(async () => {
    const requestId = ++notificationsRequest.current;

    setNotificationsLoading(true);
    setNotificationsError("");

    try {
      const result = await loadNotifications();

      if (
        notificationsMounted.current &&
        requestId === notificationsRequest.current
      ) {
        setNotifications(result.notifications);
        setUnreadCount(result.unreadCount);
      }
    } catch {
      if (
        notificationsMounted.current &&
        requestId === notificationsRequest.current
      ) {
        setNotificationsError("Could not load notifications. Try again.");
      }
    } finally {
      if (
        notificationsMounted.current &&
        requestId === notificationsRequest.current
      ) {
        setNotificationsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    notificationsMounted.current = true;
    void refreshNotifications();

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") {
        void refreshNotifications();
      }
    }

    // Refresh after this app saves a transaction, when returning to the
    // browser, and every 30 seconds while the page is visible.
    window.addEventListener("reen-transaction-saved", refreshWhenVisible);
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    const interval = window.setInterval(refreshWhenVisible, 30_000);

    return () => {
      notificationsMounted.current = false;
      notificationsRequest.current += 1;
      window.clearInterval(interval);
      window.removeEventListener("reen-transaction-saved", refreshWhenVisible);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refreshNotifications]);

 function openNotifications() {
  setMenuOpen(false);
  setNotificationsOpen(true);
  void refreshNotifications();
}

  async function readNotification(id: string) {
    await markNotificationRead(id);
    await refreshNotifications();
  }

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
          className="h-auto w-[130px] min-w-0 object-contain sm:w-[170px]"
        />

        {/* HEADER CONTROLS:
    Prevent the buttons and avatar from shrinking beside the logo. */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          <button
            type="button"
            aria-label={`Notifications, ${unreadCount} unread`}
            onClick={openNotifications}
            className="reen-notification-bell relative flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-[#252525]"
              aria-hidden="true"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>

            {unreadCount > 0 && (
              <span className="reen-notification-count" aria-hidden="true">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            aria-label="Profile"
            className="flex h-11 w-11 shrink-0 items-center justify-center cursor-pointer"
            onClick={() => navigate("Profile")}
          >
            <img
              src={profile.avatar}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full object-cover sm:h-10 sm:w-10"
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
            className="lg:hidden mb-5 text-[26px] font-bold text-[#252525] sm:text-[28px]"
            style={{ fontVariationSettings: '"opsz" 14' }}
          >
            {activeNav}
          </h1>

          <DashboardHeader
            title={activeNav}
            profile={profile}
            accountNumber="1234567890"
            onNotifications={openNotifications}
            unreadCount={unreadCount}
          />

          {/* PAGE CONTENT: The selected screen supplies this area. */}
          {children}
          {notificationsOpen && (
            <NotificationPanel
              notifications={notifications}
              loading={notificationsLoading}
              error={notificationsError}
              onRefresh={() => {
                void refreshNotifications();
              }}
              onRead={readNotification}
              onDismiss={() => setNotificationsOpen(false)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
