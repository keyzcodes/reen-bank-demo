import type { CustomerProfile } from "../screens/ProfilePage";

const dmMedium = {
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 500,
  fontVariationSettings: '"opsz" 14',
} as const;

// DESKTOP HEADER:
// Preserve the existing groups and classes used by profile.css.
// Search and Notifications retain their current presentation.
// The account number remains a demo value supplied by App.
export default function DashboardHeader({
  title,
  profile,
  accountNumber,
}: {
  title: string;
  profile: CustomerProfile;
  accountNumber: string;
}) {
  return (
    <div className="reen-dashboard-header hidden md:flex items-start justify-between flex-wrap gap-4 mb-6 md:mb-8 xl:mb-[100px]">
      {/* HEADER TITLE: Existing position is controlled by the page CSS. */}
      <h1
        className="reen-dashboard-title text-[32px] xl:text-[40px] leading-normal text-[#252525]"
        style={{ ...dmMedium, fontWeight: 700 }}
      >
        {title}
      </h1>

      {/* CUSTOMER: Both lines use the saved customer details. */}
      <div className="reen-dashboard-customer flex flex-col items-center">
        <span
          className="text-sm xl:text-[16px] text-[#33b786] leading-normal"
          style={dmMedium}
        >
          {profile.name}
        </span>
        <span
          className="text-[32px] xl:text-[40px] text-[#252525] not-italic"
          style={{
            fontFamily: "'Bebas Neue', cursive",
            fontWeight: 400,
          }}
        >
          {accountNumber}
        </span>
      </div>

      {/* HEADER TOOLS: Preserve the existing right-panel alignment. */}
      <div className="reen-dashboard-tools flex flex-1 min-w-[220px] max-w-[481px] items-center gap-4 xl:gap-6">
        <div className="reen-dashboard-search mr-auto flex items-center gap-3">
          <img src="/assets/a3065.svg" alt="" className="w-6 h-6" />
          <span className="text-[16px] text-[#8c8c8c]" style={dmMedium}>
            Search
          </span>
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="reen-dashboard-notifications cursor-pointer"
        >
          <img src="/assets/23954.svg" alt="" className="w-6 h-6" />
        </button>

        <button
          type="button"
          aria-label="Profile"
          className="reen-dashboard-avatar cursor-pointer"
        >
          <img
            src={profile.avatar}
            alt=""
            className="w-12 xl:w-[56px] h-12 xl:h-[56px] rounded-full object-cover"
          />
        </button>
      </div>
    </div>
  );
}