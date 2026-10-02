import { useState } from "react";

import DashboardLayout from "./components/DashboardLayout";
import type { NavItem } from "./components/DashboardSidebar";

import type { Account, AccountId } from "./data";
import { accounts as initialAccounts } from "./data";

import AddAccountOverlay from "./components/AddAccountOverlay";
import type { NewAccountDetails } from "./components/AddAccountOverlay";

import OverviewPage from "./screens/OverviewPage";
import type { BankTransaction } from "./utils/banking";

import AccountsScreen from "./screens/AccountsScreen";
import TransactionsScreen from "./screens/TransactionsScreen";
import ProfilePage from "./screens/ProfilePage";
import type { CustomerProfile } from "./screens/ProfilePage";

import LogoutOverlay from "./components/LogoutOverlay";
import PasswordResetOverlay from "./components/PasswordResetOverlay";
import FundWalletOverlay from "./components/FundWalletOverlay";
import { calculateBalance } from "./utils/banking";

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
  // SHARED ACCOUNTS:
  // Keep the existing account names, but remove their sample money.
  // Balances and statistics displayed by rebuilt screens come from transactions.
  // This state is temporary and resets when the browser reloads.
  const [accounts, setAccounts] = useState<Account[]>(() =>
    initialAccounts.map((account) => ({
      ...account,
      balance: "\u20A6 0.00",
      balanceRaw: 0,
      income: "\u20A6 0.00",
      expense: "\u20A6 0.00",
      incomePct: 0,
      expensePct: 0,
    })),
  );

  // BALANCE PRIVACY:
  // Overview and Profile share this visibility setting.
  const [balanceHidden, setBalanceHidden] = useState(false);

  // TRANSACTION FOUNDATION:
  // No opening deposits or sample transactions.
  // Overview therefore starts with zero balances and empty activity.
  // Transaction actions will update this state in a later step.
    // SHARED TRANSACTIONS:
  // Funding and withdrawals update this list.
  // Balances and reporting totals are calculated from these records.
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);

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
  const [addAccountOpen, setAddAccountOpen] = useState(false);
    // FUND TARGET:
  // Remember which account's Fund button opened the form.
  const [fundAccountId, setFundAccountId] = useState<AccountId | null>(null);

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

    // OPEN FUNDING:
  // Only allow funding an account in the shared account list.
  function beginFunding(accountId: AccountId) {
    if (!accounts.some((account) => account.id === accountId)) return;

    setSelectedAccount(accountId);
    setFundAccountId(accountId);
  }

  // DEMO DEPOSIT:
  // Record an accepted Direct Pay funding action with its actual timestamp.
  // This simulates a deposit; no external payment is processed.
  function fundAccount(amountKobo: number) {
    if (
      !fundAccountId ||
      !accounts.some((account) => account.id === fundAccountId)
    ) {
      throw new Error("The selected account could not be found.");
    }

    if (!Number.isSafeInteger(amountKobo) || amountKobo <= 0) {
      throw new Error("Enter a valid funding amount.");
    }

    const currentBalance = calculateBalance(transactions, fundAccountId);

    if (!Number.isSafeInteger(currentBalance + amountKobo)) {
      throw new Error("This amount exceeds the supported account balance.");
    }

    const transaction: BankTransaction & { paymentMethod: string } = {
      id: crypto.randomUUID(),
      accountId: fundAccountId,
      kind: "deposit",
      amountKobo,
      counterparty: "Wallet funding",
      createdAt: new Date().toISOString(),
      status: "completed",
      paymentMethod: "Direct Pay",
    };

    setTransactions((current) => [transaction, ...current]);
  }
  // ADD ACCOUNT:
  // Open the Accounts screen for now.
  // Replace this handler with the Figma account-creation overlay later.
  // ADD ACCOUNT: Open the form above the Accounts page.
  function beginAccountCreation() {
    navigate("Accounts");
    setAddAccountOpen(true);
  }

  // CREATE ACCOUNT:
  // Save the submitted details in shared frontend state.
  // A new account has no deposits, withdrawals or opening balance.
  // The overlay handles its closing animation after this function succeeds.
  function createAccount(details: NewAccountDetails) {
    const name = details.name.trim();
    const description = details.description.trim();

    if (!name) {
      throw new Error("Enter an account name.");
    }

    if (name.length > 80 || description.length > 500) {
      throw new Error("The account details exceed the allowed length.");
    }

    const account: Account = {
      id: crypto.randomUUID(),
      label: name,
      description,
      // No bank account number is issued by this frontend demo.
      number: "",
      balance: "\u20A6 0.00",
      balanceRaw: 0,
      income: "\u20A6 0.00",
      expense: "\u20A6 0.00",
      incomePct: 0,
      expensePct: 0,
    };

    setAccounts((current) => [...current, account]);
    setSelectedAccount(account.id);
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
            accounts={accounts}
            selectedAccountId={selectedAccount}
            onSelectAccount={setSelectedAccount}
            balanceHidden={balanceHidden}
            onToggleBalance={toggleBalance}
            transactions={transactions}
            onViewTransactions={() => navigate("Transactions")}
            onAddAccount={beginAccountCreation}
            onFundAccount={beginFunding}
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

      {/* ADD ACCOUNT:
          Keep the overlay mounted while its closing dissolve plays.
          onDismiss runs after the overlay finishes that animation. */}
      {addAccountOpen && (
        <AddAccountOverlay
          onCreate={createAccount}
          onDismiss={() => setAddAccountOpen(false)}
        />
      )}

            {/* FUND WALLET:
          Keep the account target until the user closes the form/confirmation. */}
      {fundAccountId !== null && (
        <FundWalletOverlay
          onFund={fundAccount}
          onDismiss={() => setFundAccountId(null)}
        />
      )}

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
