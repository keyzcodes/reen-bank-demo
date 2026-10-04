import type { Account, AccountId } from "../data";
import {
  calculateBalance,
  formatNaira,
  formatTransactionDate,
} from "../utils/banking";
import type { BankTransaction } from "../utils/banking";
import "../styles/transactions.css";

// TRANSACTION DATA:
// The payment method comes from the funding/withdrawal form.
// Never invent a method for a transaction that does not contain one.
type HistoryTransaction = BankTransaction & {
  paymentMethod?: string;
};

type TransactionsScreenProps = {
  accounts: readonly Account[];
  transactions: readonly HistoryTransaction[];
  selectedAccountId: AccountId;
  onSelectAccount: (id: AccountId) => void;
  balanceHidden: boolean;
  onToggleBalance: () => void;
};

// STATUS LABELS:
// Failed and Canceled are different outcomes.
// Our current transaction model supports these three statuses.
const statusLabels: Record<BankTransaction["status"], string> = {
  pending: "Pending",
  completed: "Completed",
  failed: "Failed",
};

export default function TransactionsScreen({
  accounts,
  transactions,
  selectedAccountId,
  onSelectAccount,
  balanceHidden,
  onToggleBalance,
}: TransactionsScreenProps) {
  // ACCOUNT HISTORY:
  // Filter the shared data and sort a new array.
  // This leaves App's original transaction order unchanged.
  const selectedAccount = accounts.find(
    (account) => account.id === selectedAccountId,
  );

  const accountTransactions = transactions
    .filter((transaction) => transaction.accountId === selectedAccountId)
    .sort(
      (first, second) =>
        Date.parse(second.createdAt) - Date.parse(first.createdAt),
    );

  function displayBalance(accountId: AccountId) {
    return balanceHidden
      ? "XXXXXXXX"
      : formatNaira(calculateBalance(transactions, accountId));
  }

  return (
    <div className="reen-transactions-page">
      {/* ACCOUNT CARDS:
          Selection filters the history below.
          The eye button is separate from the selection button. */}
      <section
        className="reen-history-account-grid"
        aria-label="Choose an account"
      >
        {accounts.map((account) => (
          <article
            key={account.id}
            className={`reen-history-account-card ${
              selectedAccountId === account.id ? "is-selected" : ""
            }`}
          >
            <button
              type="button"
              className="reen-history-account-select"
              onClick={() => onSelectAccount(account.id)}
              aria-label={`View ${account.label} transactions`}
              aria-pressed={selectedAccountId === account.id}
            >
              <span className="reen-history-account-name">
                {account.label}
              </span>

              <span className="reen-history-account-balance">
                {displayBalance(account.id)}
              </span>
            </button>

            {/* VISIBILITY:
                Uses the same setting as Accounts and Overview.
                The 44px mobile touch target contains a smaller icon. */}
            <button
              type="button"
              className="reen-history-visibility"
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
          </article>
        ))}
      </section>

      {/* HISTORY:
          All rows belong to the selected account.
          No fixture rows, invented dates or fixed sample amounts. */}
      <section
        className="reen-history"
        aria-label={`Transactions for ${selectedAccount?.label ?? "the selected account"}`}
      >
        {accountTransactions.length === 0 ? (
          <p className="reen-history-empty" role="status">
            No transactions for this account yet.
          </p>
        ) : (
          <ul className="reen-history-list">
            {accountTransactions.map((transaction) => {
              const credit = transaction.kind === "deposit";

              return (
                <li className="reen-history-row" key={transaction.id}>
                  {/* SYMBOL:
                      Text approximation until the exact exported
                      credit/debit symbol assets are mapped. */}
                  <span
                    className={`reen-history-symbol ${
                      credit ? "is-credit" : "is-debit"
                    }`}
                    aria-label={credit ? "Credit" : "Debit"}
                  >
                    {credit ? "+" : "\u2212"}
                  </span>

                  <span className="reen-history-name">
                    {transaction.counterparty}
                  </span>

                  <time
                    className="reen-history-date"
                    dateTime={transaction.createdAt}
                  >
                    {formatTransactionDate(transaction.createdAt)}
                  </time>

                  <strong
                    className={`reen-history-amount ${
                      credit ? "is-credit" : "is-debit"
                    }`}
                  >
                    {balanceHidden
                      ? "XXXXXXXX"
                      : `${credit ? "+" : "\u2212"}${formatNaira(
                          transaction.amountKobo,
                        )}`}
                  </strong>

                  <span
                    className={`reen-history-status is-${transaction.status}`}
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