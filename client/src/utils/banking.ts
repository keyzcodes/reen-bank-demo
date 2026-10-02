// BANKING DATA:
// Store money as whole kobo to avoid decimal rounding errors.
// Example: ₦20,000 = 2,000,000 kobo.
export type BankTransaction = {
  id: string;
  accountId: string;
  kind: "deposit" | "withdrawal";
  amountKobo: number;
  counterparty: string;
  createdAt: string; // ISO timestamp supplied when the transaction happens.
  status: "pending" | "completed" | "failed";
};

export type DateRange = {
  start: string; // Inclusive ISO timestamp.
  end: string; // Exclusive ISO timestamp.
};

export type ActivitySummary = {
  incomeKobo: number;
  expenseKobo: number;
  incomePercent: number;
  expensePercent: number;
};

// MONEY VALIDATION:
// Run this before accepting a deposit or withdrawal.
// Backend validation will also be required when we connect the API.
export function validateAmount(amountKobo: number): void {
  if (!Number.isSafeInteger(amountKobo) || amountKobo <= 0) {
    throw new Error("The amount must be a positive whole number of kobo.");
  }
}

// SAFE TOTALS:
// Stop rather than silently produce an inaccurate financial total.
function addMoney(total: number, amount: number): number {
  const result = total + amount;

  if (!Number.isSafeInteger(result)) {
    throw new Error("The money total exceeds the supported range.");
  }

  return result;
}

// TRANSACTION SELECTION:
// Pending and failed transactions never affect completed totals.
// A date range includes its start and excludes its end.
export function selectTransactions(
  transactions: readonly BankTransaction[],
  accountId?: string,
  range?: DateRange,
): BankTransaction[] {
  const start = range ? Date.parse(range.start) : undefined;
  const end = range ? Date.parse(range.end) : undefined;

  if (
    range &&
    (!Number.isFinite(start) ||
      !Number.isFinite(end) ||
      start! >= end!)
  ) {
    throw new Error("Choose a valid date range.");
  }

  return transactions.filter((transaction) => {
    if (transaction.status !== "completed") return false;
    if (accountId && transaction.accountId !== accountId) return false;

    validateAmount(transaction.amountKobo);

    const timestamp = Date.parse(transaction.createdAt);

    if (!Number.isFinite(timestamp)) {
      throw new Error("A transaction has an invalid date.");
    }

    return (
      !range ||
      (timestamp >= start! && timestamp < end!)
    );
  });
}

// ACCOUNT BALANCE:
// Uses all completed activity for this account.
// Changing the Statistics month does not change today's balance.
// New accounts start at zero because they have no transactions.
export function calculateBalance(
  transactions: readonly BankTransaction[],
  accountId: string,
): number {
  return selectTransactions(transactions, accountId).reduce(
    (balance, transaction) =>
      addMoney(
        balance,
        transaction.kind === "deposit"
          ? transaction.amountKobo
          : -transaction.amountKobo,
      ),
    0,
  );
}

// STATISTICS:
// Calculate income and expenses for the selected account and period.
// Each bar represents its share of total money moving in and out.
// This is our functional rule; Figma only supplies the visual styling.
export function calculateActivity(
  transactions: readonly BankTransaction[],
  accountId?: string,
  range?: DateRange,
): ActivitySummary {
  let incomeKobo = 0;
  let expenseKobo = 0;

  for (const transaction of selectTransactions(
    transactions,
    accountId,
    range,
  )) {
    if (transaction.kind === "deposit") {
      incomeKobo = addMoney(incomeKobo, transaction.amountKobo);
    } else {
      expenseKobo = addMoney(expenseKobo, transaction.amountKobo);
    }
  }

  const totalKobo = addMoney(incomeKobo, expenseKobo);

  return {
    incomeKobo,
    expenseKobo,
    incomePercent: totalKobo === 0 ? 0 : (incomeKobo / totalKobo) * 100,
    expensePercent: totalKobo === 0 ? 0 : (expenseKobo / totalKobo) * 100,
  };
}

// DISPLAY MONEY:
// Keep calculations numeric; format only when displaying the result.
const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatNaira(amountKobo: number): string {
  if (!Number.isSafeInteger(amountKobo)) {
    throw new Error("Money must be stored as whole kobo.");
  }

  return nairaFormatter.format(amountKobo / 100);
}

// DISPLAY DATES:
// Show transaction times in Nigeria, regardless of the viewer's device zone.
export function formatTransactionDate(createdAt: string): string {
  const date = new Date(createdAt);

  if (!Number.isFinite(date.getTime())) {
    throw new Error("The transaction date is invalid.");
  }

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}