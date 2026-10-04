import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import {
  loadDashboard,
  recordTransaction,
  saveAccount,
  saveProfile as saveCloudProfile,
} from "./api/bankApi";

import DashboardLayout from "./components/DashboardLayout";
import type { NavItem } from "./components/DashboardSidebar";

import type { Account, AccountId } from "./data";

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
import WithdrawWalletOverlay from "./components/WithdrawWalletOverlay";
import type { WithdrawalDetails } from "./components/WithdrawWalletOverlay";
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
  // URL NAVIGATION:
  // Keep the current page after refresh and support browser Back/Forward.
  const [activeNav, setActiveNav] = useState<NavItem>(() => {
    const pages: NavItem[] = [
      "Overview",
      "Accounts",
      "Transactions",
      "Profile",
    ];

    return (
      pages.find(
        (page) => page.toLowerCase() === window.location.hash.slice(1),
      ) ?? "Overview"
    );
  });

  useEffect(() => {
    function syncPageFromUrl() {
      const pages: NavItem[] = [
        "Overview",
        "Accounts",
        "Transactions",
        "Profile",
      ];

      setActiveNav(
        pages.find(
          (page) => page.toLowerCase() === window.location.hash.slice(1),
        ) ?? "Overview",
      );
    }

    window.addEventListener("hashchange", syncPageFromUrl);
    return () => window.removeEventListener("hashchange", syncPageFromUrl);
  }, []);
  const [selectedAccount, setSelectedAccount] = useState<AccountId>("main");
  // SHARED ACCOUNTS:
  // Keep the existing account names, but remove their sample money.
  // Balances and statistics displayed by rebuilt screens come from transactions.
  // This state is temporary and resets when the browser reloads.
  // CLOUD ACCOUNTS: Loaded after authentication; no fixture balances.
  const [accounts, setAccounts] = useState<Account[]>([]);

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
  // CLOUD STARTUP:
  // Keep the dashboard hidden until the user's own records are loaded.
  const [loading, setLoading] = useState(true);
  const [cloudError, setCloudError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function startDashboard() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!data.session) {
          window.location.replace("/login");
          return;
        }

        const saved = await loadDashboard();
        if (cancelled) return;

        setProfile(saved.profile);
        setAccounts(saved.accounts);
        setTransactions(saved.transactions);
      } catch (error) {
        if (!cancelled) {
          setCloudError(
            error instanceof Error
              ? error.message
              : "Unable to load your account.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void startDashboard();

    // SESSION END:
    // Logout in another tab also closes this dashboard.
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        window.location.replace("/login");
      }
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

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
  // WITHDRAW TARGET:
  // Null means the popup is closed.
  // Otherwise, this identifies the account being debited.
  const [withdrawAccountId, setWithdrawAccountId] = useState<AccountId | null>(
    null,
  );

  function navigate(page: NavItem) {
    setActiveNav(page);
    window.location.hash = page.toLowerCase();
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

  // OPEN WITHDRAWAL:
  // Keep the account selection and popup target consistent.
  function beginWithdrawal(accountId: AccountId) {
    if (!accounts.some((account) => account.id === accountId)) return;

    setSelectedAccount(accountId);
    setWithdrawAccountId(accountId);
  }

  // RECORD WITHDRAWAL:
  // Validate again at the transaction boundary.
  // Completed withdrawals automatically reduce calculated balances
  // and contribute to the existing expense statistics.
  async function withdrawAccount(details: WithdrawalDetails) {
    const accountId = withdrawAccountId;

    if (
      accountId === null ||
      !accounts.some((account) => account.id === accountId)
    ) {
      throw new Error("The selected account is unavailable.");
    }

    if (!Number.isSafeInteger(details.amountKobo) || details.amountKobo <= 0) {
      throw new Error("Enter a valid withdrawal amount.");
    }

    const balance = calculateBalance(transactions, accountId);

    if (details.amountKobo > balance) {
      throw new Error("Insufficient balance for this withdrawal.");
    }

    const transaction: BankTransaction & {
      paymentMethod: string;
      recipientAccountNumber: string;
      recipientBank: string;
    } = {
      id: crypto.randomUUID(),
      accountId,
      kind: "withdrawal",
      amountKobo: details.amountKobo,
      counterparty: details.accountName,
      createdAt: new Date().toISOString(),
      status: "completed",
      paymentMethod: "Bank Transfer",
      recipientAccountNumber: details.accountNumber,
      recipientBank: details.bank,
    };

    // Save first; show success only after the database accepts the withdrawal.
    const saved = await recordTransaction(transaction);
    setTransactions((current) => [
      saved,
      ...current.filter((item) => item.id !== saved.id),
    ]);
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
  async function fundAccount(
    amountKobo: number,
    paymentMethod: "Direct Pay" | "Credit Card",
  ) {
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
      // Store the chosen method, without storing card details.
      paymentMethod,
    };

    // Save first; never persist card number, expiry or CVC.
    const saved = await recordTransaction(transaction);
    setTransactions((current) => [
      saved,
      ...current.filter((item) => item.id !== saved.id),
    ]);
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
  async function createAccount(details: NewAccountDetails) {
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

    const saved = await saveAccount(account);
    setAccounts((current) => [...current, saved]);
    setSelectedAccount(saved.id);
  }

  // REAL LOGOUT:
  // Clear the Supabase session before leaving the dashboard.
  async function confirmLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setCloudError(error.message);
      setLogoutOpen(false);
      return;
    }

    sessionStorage.removeItem("reen-registration-email");
    window.location.replace("/landing");
  }

  // PROFILE PERSISTENCE:
  // Update the displayed profile only after the cloud save succeeds.
  // The existing editor closes immediately; saving feedback appears below.
  async function updateProfile(nextProfile: CustomerProfile) {
    setCloudError("");

    try {
      const saved = await saveCloudProfile(nextProfile);
      setProfile(saved);
    } catch (error) {
      setCloudError(
        error instanceof Error ? error.message : "Unable to save your profile.",
      );
    }
  }

  // STARTUP FEEDBACK:
  // Do not display the old default profile while cloud data is loading.
  if (loading || (cloudError && accounts.length === 0)) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#d4f3e7] px-6">
        <div className="max-w-md text-center">
          <p role={cloudError ? "alert" : "status"}>
            {cloudError || "Loading your account..."}
          </p>
          {cloudError && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-[#33b786] px-5 py-3 text-white"
            >
              Try again
            </button>
          )}
        </div>
      </main>
    );
  }

  return (
    <>
      {/* CLOUD ERROR: Show failed saves without claiming success. */}
      {cloudError && (
        <div
          role="alert"
          className="relative z-50 bg-white px-4 py-3 text-sm text-[#b42318]"
        >
          {cloudError}
        </div>
      )}
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
            onWithdrawAccount={beginWithdrawal}
          />
        )}

        {/* TRANSACTIONS:
            Existing screen retained until its rebuild.
            It still uses its own fixture data. */}
        {activeNav === "Transactions" && (
          <TransactionsScreen
            accounts={accounts}
            transactions={transactions}
            selectedAccountId={selectedAccount}
            onSelectAccount={setSelectedAccount}
            balanceHidden={balanceHidden}
            onToggleBalance={() => setBalanceHidden((hidden) => !hidden)}
          />
        )}

        {/* PROFILE:
            Preserve profile editing and password-reset functionality.
            Remove the old sample transaction rows for now.
            Shared transaction rendering will be connected later. */}
        {activeNav === "Profile" && (
          <ProfilePage
            profile={profile}
            onProfileChange={updateProfile}
            transactions={transactions}
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
      {/* WITHDRAW OVERLAY:
    Uses the target account's current calculated balance.
    Closing leaves the Accounts page and selected account in place. */}
      {withdrawAccountId !== null && (
        <WithdrawWalletOverlay
          availableBalanceKobo={calculateBalance(
            transactions,
            withdrawAccountId,
          )}
          onWithdraw={withdrawAccount}
          onDismiss={() => setWithdrawAccountId(null)}
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
