// DASHBOARD NAVIGATION:
// These page names are shared by App, the sidebar and the mobile menu.
export type NavItem = "Overview" | "Accounts" | "Transactions" | "Profile";

export const navItems: { id: NavItem; label: string }[] = [
  { id: "Overview", label: "Overview" },
  { id: "Accounts", label: "Accounts" },
  { id: "Transactions", label: "Transactions" },
  { id: "Profile", label: "Profile" },
];

const navigationFont = {
  fontFamily: "'DM Sans', sans-serif",
  fontVariationSettings: '"opsz" 14',
} as const;

// NAVIGATION ICONS:
// Select the exported Figma asset using the same active state as the label.
// Keep the existing dimensions and Transactions wrapper for the current CSS.
function navIcon(id: NavItem, active: boolean) {
  if (id === "Transactions") {
    return (
      <div className="reen-transactions-icon relative w-8 h-8 shrink-0">
        <img
          src={active ? "/assets/61884.svg" : "/assets/c2da1.svg"}
          alt=""
          className="absolute top-0 left-0 w-[25.56px] h-[25.56px]"
        />
        <img
          src={active ? "/assets/6a560.svg" : "/assets/d3423.svg"}
          alt=""
          className="absolute bottom-0 right-0 w-[25.56px] h-[25.56px]"
        />
      </div>
    );
  }

  const icons = {
    Overview: {
      active: "/assets/5d2cf.svg",
      inactive: "/assets/8b96e.svg",
    },
    Accounts: {
      active: "/assets/1013a.svg",
      inactive: "/assets/6e619.svg",
    },
    Profile: {
      active: "/assets/c490e.svg",
      inactive: "/assets/136ba.svg",
    },
  };

  return (
    <img
      src={active ? icons[id].active : icons[id].inactive}
      alt=""
      className="w-8 h-8 shrink-0"
    />
  );
}

// NAVIGATION BUTTON:
// Reused by the desktop sidebar and the existing compact mobile menu.
export function NavButton({
  item,
  active,
  onClick,
  compact = false,
}: {
  item: { id: NavItem; label: string };
  active: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center cursor-pointer transition-colors ${
        compact
          ? "reen-mobile-nav-button min-h-12 gap-3 rounded-lg px-3 py-2"
          : "gap-10"
      } ${compact && active ? "bg-[#33b786]/10" : ""}`}
    >
      {navIcon(item.id, active)}
      <span
        className="text-[20px] leading-normal whitespace-nowrap"
        style={{
          ...navigationFont,
          fontWeight: active ? 700 : 500,
          color: active ? "#33b786" : "#555",
        }}
      >
        {item.label}
      </span>
    </button>
  );
}

// DESKTOP SIDEBAR:
// App supplies the selected page and actions.
// Preserve direct children because profile.css uses child selectors.
export default function DashboardSidebar({
  activeNav,
  onNavigate,
  onLogout,
}: {
  activeNav: NavItem;
  onNavigate: (page: NavItem) => void;
  onLogout: () => void;
}) {
  return (
    <aside className="reen-dashboard-sidebar hidden lg:flex flex-col w-[220px] xl:w-[240px] shrink-0 px-6 xl:px-[30px] pt-10 xl:pt-[64px] pb-10 min-h-screen">
      <div className="mb-10 xl:mb-[60px]">
        <img
          src="/assets/17ec0.png"
          alt="Reen Bank"
          className="h-14 xl:h-[64px] w-auto object-contain"
        />
      </div>

      <nav className="flex flex-col gap-6 xl:gap-[28px] flex-1">
        {navItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={activeNav === item.id}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        className="reen-dashboard-logout flex items-center gap-10 cursor-pointer mt-auto"
      >
        <img src="/assets/01571.svg" alt="" className="w-8 h-8 shrink-0" />
        <span
          className="text-[20px] leading-normal text-[#555]"
          style={{ ...navigationFont, fontWeight: 500 }}
        >
          Logout
        </span>
      </button>
    </aside>
  );
}
