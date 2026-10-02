import type { AccountId } from "../data";
import { accounts } from "../data";
import {
  calculateBalance,
  formatNaira,
  formatTransactionDate,
} from "../utils/banking";
import type { BankTransaction } from "../utils/banking";
import "../styles/accounts.css";

// ACCOUNTS: Payment method is optional until our transaction forms supply it.
// Never invent a payment method when the data does not contain one.
type AccountTransaction = BankTransaction & {
  paymentMethod?: string;
};

type AccountsScreenProps = {
  selectedAccountId: AccountId;
  onSelectAccount: (accountId: AccountId) => void;
  balanceHidden: boolean;
  onToggleBalance: () => void;
  transactions?: readonly AccountTransaction[];
  onViewTransactions?: () => void;

  // ACCOUNTS OVERLAYS: App will provide these handlers when the
  // corresponding Figma overlays are implemented.
  onAddAccount?: () => void;
  onFundAccount?: (accountId: AccountId) => void;
  onWithdrawAccount?: (accountId: AccountId) => void;
};

// ACCOUNTS STATUS: Display the actual status stored in the transaction.
// "Failed" is not relabelled "Canceled"; those are different outcomes.
const statusLabels: Record<BankTransaction["status"], string> = {
  pending: "Pending",
  completed: "Completed",
  failed: "Failed",
};

export default function AccountsScreen({
  selectedAccountId,
  onSelectAccount,
  balanceHidden,
  onToggleBalance,
  transactions = [],
  onViewTransactions,
  onAddAccount,
  onFundAccount,
  onWithdrawAccount,
}: AccountsScreenProps) {
  // ACCOUNT SELECTION: Only show activity belonging to the selected account.
  // Sort a new array so the shared transaction data remains unchanged.
  const recentTransactions = transactions
    .filter((transaction) => transaction.accountId === selectedAccountId)
    .sort(
      (first, second) =>
        Date.parse(second.createdAt) - Date.parse(first.createdAt),
    )
    .slice(0, 7);

  function displayBalance(accountId: AccountId) {
    return balanceHidden
      ? "XXXXXXXX"
      : formatNaira(calculateBalance(transactions, accountId));
  }

  return (
    <div className="reen-accounts-page">
      {/* ACCOUNT CARDS:
          All three cards share one design.
          The selected account receives the purple selection strip. */}
      <section aria-label="Your accounts" className="reen-account-grid">
        {accounts.map((account) => (
          <article
            key={account.id}
            className={`reen-account-card ${
              selectedAccountId === account.id ? "is-selected" : ""
            }`}
          >
            {/* ACCOUNT SELECTION:
                A real button supports mouse, touch and keyboard navigation.
                It covers the name/balance area without nesting other buttons. */}
            <button
              type="button"
              className="reen-account-select"
              onClick={() => onSelectAccount(account.id)}
              aria-label={`View ${account.label}`}
              aria-pressed={selectedAccountId === account.id}
            >
              <span className="reen-account-name">{account.label}</span>
              <span className="reen-account-balance">
                {displayBalance(account.id)}
              </span>
            </button>

            {/* BALANCE VISIBILITY:
                Uses the same shared visibility setting as Overview/Profile. */}
            <button
              type="button"
              className="reen-account-visibility"
              onClick={onToggleBalance}
              aria-label={balanceHidden ? "Show balances" : "Hide balances"}
              aria-pressed={balanceHidden}
            >
              <img
                src={
                  balanceHidden
                    ? "/assets/dc3ce.svg"
                    : "/assets/b8200.svg"
                }
                alt=""
              />
            </button>

            <div className="reen-account-actions">
              <button
                type="button"
                className="reen-account-fund"
                disabled={!onFundAccount}
                onClick={() => onFundAccount?.(account.id)}
              >
                Fund
              </button>

              <button
                type="button"
                className="reen-account-withdraw"
                disabled={!onWithdrawAccount}
                onClick={() => onWithdrawAccount?.(account.id)}
              >
                Withdraw
              </button>
            </div>
          </article>
        ))}

        {/* ADD ACCOUNT: Separate card with its verified translucent grey fill. */}
        <button
          type="button"
          className="reen-add-account"
          disabled={!onAddAccount}
          onClick={onAddAccount}
          aria-label="Add account"
        >
          <img src="/assets/acf9a.svg" alt="" />
          <span className="reen-add-account-label">Add Account</span>
          <span className="reen-add-account-balance">
            {balanceHidden ? "XXXXXXXX" : formatNaira(0)}
          </span>
        </button>
      </section>

      {/* ACCOUNT TRANSACTIONS:
          This section spans the full content width.
          Rows use actual transaction timestamps, amounts and statuses. */}
      <section
        className="reen-account-transactions"
        aria-labelledby="account-transactions-title"
      >
        <div className="reen-account-transactions-header">
          <h2 id="account-transactions-title">Transactions</h2>

          <button
            type="button"
            className="reen-account-view-all"
            disabled={!onViewTransactions}
            onClick={onViewTransactions}
          >
            <span>View All</span>
            <img src="/assets/613bb.svg" alt="" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <p className="reen-account-empty" role="status">
            No transactions for this account yet.
          </p>
        ) : (
          <ul className="reen-account-transaction-list">
            {recentTransactions.map((transaction) => {
              const credit = transaction.kind === "deposit";

              return (
                <li
                  key={transaction.id}
                  className="reen-account-transaction"
                >
                  {/* TRANSACTION SYMBOL:
                      Plus/minus is rendered as text until the exact
                      exported symbol assets have been mapped. */}
                  <span
                    aria-label={credit ? "Credit" : "Debit"}
                    className={`reen-account-transaction-symbol ${
                      credit ? "is-credit" : "is-debit"
                    }`}
                  >
                    {credit ? "+" : "−"}
                  </span>

                  <span className="reen-account-transaction-name">
                    {transaction.counterparty}
                  </span>

                  <span className="reen-account-transaction-method">
                    {transaction.paymentMethod || "—"}
                  </span>

                  <time
                    className="reen-account-transaction-date"
                    dateTime={transaction.createdAt}
                  >
                    {formatTransactionDate(transaction.createdAt)}
                  </time>

                  <span
                    className={`reen-account-transaction-amount ${
                      credit ? "is-credit" : "is-debit"
                    }`}
                  >
                    {balanceHidden
                      ? "XXXXXXXX"
                      : `${credit ? "+" : "−"}${formatNaira(
                          transaction.amountKobo,
                        )}`}
                  </span>

                  <span
                    className={`reen-account-transaction-status is-${transaction.status}`}
                  >
                    {statusLabels[transaction.status]}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}