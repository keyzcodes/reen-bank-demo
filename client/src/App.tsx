import { useState } from "react";

import DashboardLayout from "./components/DashboardLayout";
import type { NavItem } from "./components/DashboardSidebar";

import type { AccountId } from "./data";
import { accounts } from "./data";

import OverviewPage from "./screens/OverviewPage";
import type { BankTransaction } from "./utils/banking";

import AccountsScreen from "./screens/AccountsScreen";
import TransactionsScreen from "./screens/TransactionsScreen";
import ProfilePage from "./screens/ProfilePage";
import type { CustomerProfile } from "./screens/ProfilePage";

import LogoutOverlay from "./components/LogoutOverlay";
import PasswordResetOverlay from "./components/PasswordResetOverlay";

// APP COORDINATOR:
// Owns shared profile data, page selection and overlay visibility.
// Each screen owns its visible content.
// DashboardLayout owns the shared header, sidebar and mobile navigation.
export default function App() {
  // CUSTOMER PROFILE:
  // Temporary React state. Refresh restores these defaults.
  // Permanent profile storage will be connected through the backend.
  const [profile, setProfile] = useState<CustomerProfile>({
    name: "Maureen Oguche",
    email: "oguchemaureenm@gmail.com",
    phone: "+234 803 041 1314",
    gender: "Female",
    avatar: "/assets/3d67d.png",
  });

  // NAVIGATION:
  // Keep the selected account when moving between dashboard pages.
  const [activeNav, setActiveNav] = useState<NavItem>("Overview");
  const [selectedAccount, setSelectedAccount] = useState<AccountId>("main");

  // BALANCE PRIVACY:
  // Overview and Profile share this visibility setting.
  const [balanceHidden, setBalanceHidden] = useState(false);

  // TRANSACTION FOUNDATION:
  // No opening deposits or sample transactions.
  // Overview therefore starts with zero balances and empty activity.
  // Transaction actions will update this state in a later step.
  const [transactions] = useState<BankTransaction[]>([]);

  // OVERVIEW ACCOUNTS:
  // Reuse the existing account IDs and names.
  // Ignore the old formatted sample balances.
  const overviewAccounts = accounts.map((account) => ({
    id: account.id,
    name: account.label,
  }));

  // OVERLAYS:
  // App controls these independently of the selected screen.
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [passwordResetOpen, setPasswordResetOpen] = useState(false);

  function navigate(page: NavItem) {
    setActiveNav(page);
  }

  function toggleBalance() {
    setBalanceHidden((hidden) => !hidden);
  }

  // ACCOUNT SELECTION:
  // Accept only an ID belonging to an existing account.
  function openAccount(accountId: string) {
    const account = accounts.find((item) => item.id === accountId);

    if (!account) return;

    setSelectedAccount(account.id);
    navigate("Accounts");
  }

  // ADD ACCOUNT:
  // Open the Accounts screen for now.
  // Replace this handler with the Figma account-creation overlay later.
  function beginAccountCreation() {
    navigate("Accounts");
  }

  // DEMO LOGOUT:
  // Clears the registration-flow email and returns to Landing.
  // Backend session invalidation is not implemented yet.
  function confirmLogout() {
    sessionStorage.removeItem("reen-registration-email");
    window.location.replace("/landing");
  }

  return (
    <>
      {/* SHARED FRAME: Header, sidebar and mobile navigation. */}
      <DashboardLayout
        activeNav={activeNav}
        profile={profile}
        onNavigate={navigate}
        onLogout={() => setLogoutOpen(true)}
      >
        {/* OVERVIEW: Calculated balances and activity, no sample money. */}
        {activeNav === "Overview" && (
          <OverviewPage
            accounts={overviewAccounts}
            transactions={transactions}
            balanceHidden={balanceHidden}
            onToggleBalance={toggleBalance}
            onAddAccount={beginAccountCreation}
            onSelectAccount={openAccount}
            onViewTransactions={() => navigate("Transactions")}
          />
        )}

        {/* ACCOUNTS:
            Existing screen retained until its rebuild.
            Its old data is not connected to transactions above yet. */}
        {activeNav === "Accounts" && (
          <AccountsScreen
            selectedAccountId={selectedAccount}
            onSelectAccount={setSelectedAccount}
            balanceHidden={balanceHidden}
            onToggleBalance={() => setBalanceHidden((hidden) => !hidden)}
            transactions={transactions}
            onViewTransactions={() => navigate("Transactions")}
          />
        )}

        {/* TRANSACTIONS:
            Existing screen retained until its rebuild.
            It still uses its own fixture data. */}
        {activeNav === "Transactions" && (
          <TransactionsScreen
            selectedAccountId={selectedAccount}
            onSelectAccount={setSelectedAccount}
          />
        )}

        {/* PROFILE:
            Preserve profile editing and password-reset functionality.
            Remove the old sample transaction rows for now.
            Shared transaction rendering will be connected later. */}
        {activeNav === "Profile" && (
          <ProfilePage
            profile={profile}
            onProfileChange={setProfile}
            transactions={[]}
            balanceHidden={balanceHidden}
            onToggleBalance={toggleBalance}
            onResetPassword={() => setPasswordResetOpen(true)}
            onViewTransactions={() => navigate("Transactions")}
          />
        )}
      </DashboardLayout>

      {/* LOGOUT CONFIRMATION */}
      {logoutOpen && (
        <LogoutOverlay
          onCancel={() => setLogoutOpen(false)}
          onConfirm={confirmLogout}
        />
      )}

      {/* PASSWORD RESET WORKFLOW */}
      {passwordResetOpen && (
        <PasswordResetOverlay onDismiss={() => setPasswordResetOpen(false)} />
      )}
    </>
  );
}
