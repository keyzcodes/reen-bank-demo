import { supabase } from "../lib/supabase";
import { accounts as starterAccounts } from "../data";
import type { Account } from "../data";
import type { CustomerProfile } from "../screens/ProfilePage";
import type { BankTransaction } from "../utils/banking";

// CLOUD TRANSACTION:
// Translate database column names into the existing screen data format.
export type CloudTransaction = BankTransaction & {
  paymentMethod?: string;
  recipientAccountNumber?: string;
  recipientBank?: string;
};

type TransactionRow = {
  id: string;
  account_id: string;
  kind: BankTransaction["kind"];
  amount_kobo: number;
  counterparty: string;
  created_at: string;
  status: BankTransaction["status"];
  payment_method: string | null;
  recipient_account_number: string | null;
  recipient_bank: string | null;
};

function mapTransaction(row: TransactionRow): CloudTransaction {
  const amountKobo = Number(row.amount_kobo);

  if (!Number.isSafeInteger(amountKobo) || amountKobo <= 0) {
    throw new Error("A stored transaction has an invalid amount.");
  }

  return {
    id: row.id,
    accountId: row.account_id,
    kind: row.kind,
    amountKobo,
    counterparty: row.counterparty,
    createdAt: row.created_at,
    status: row.status,
    paymentMethod: row.payment_method ?? undefined,
    recipientAccountNumber: row.recipient_account_number ?? undefined,
    recipientBank: row.recipient_bank ?? undefined,
  };
}

// ACCOUNT DISPLAY:
// Stored accounts start with no sample money.
// Screens calculate current balances from saved transactions.
function mapAccount(row: {
  id: string;
  label: string;
  description: string;
  number: string;
}): Account {
  return {
    ...row,
    balance: "\u20A6 0.00",
    balanceRaw: 0,
    income: "\u20A6 0.00",
    expense: "\u20A6 0.00",
    incomePct: 0,
    expensePct: 0,
  };
}

async function requireUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error("Please log in again.");
  }

  return data.user;
}

// DASHBOARD STARTUP:
// Create missing first-login records without overwriting saved edits.
// Starter account names come from the existing frontend, with zero money.
export async function loadDashboard() {
  const user = await requireUser();

  const { error: profileCreateError } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: user.id,
        name:
          typeof user.user_metadata.name === "string"
            ? user.user_metadata.name
            : "Reen User",
      },
      { onConflict: "user_id", ignoreDuplicates: true },
    );

  if (profileCreateError) throw new Error(profileCreateError.message);

  const { error: accountCreateError } = await supabase
    .from("demo_accounts")
    .upsert(
      starterAccounts.map((account) => ({
        user_id: user.id,
        id: account.id,
        label: account.label,
        description: account.description ?? "",
        // These are demo accounts; do not reuse fixture bank numbers.
        number: "",
      })),
      { onConflict: "user_id,id", ignoreDuplicates: true },
    );

  if (accountCreateError) throw new Error(accountCreateError.message);

  const [profileResult, accountResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).single(),
    supabase
      .from("demo_accounts")
      .select("id,label,description,number")
      .eq("user_id", user.id)
      .order("id"),
  ]);

  if (profileResult.error) throw new Error(profileResult.error.message);
  if (accountResult.error) throw new Error(accountResult.error.message);

  // HISTORY PAGINATION:
  // Load every page so the API's row limit cannot silently reduce balances.
  const transactions: CloudTransaction[] = [];
  const pageSize = 500;

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from("demo_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw new Error(error.message);

    const rows = data as TransactionRow[];
    transactions.push(...rows.map(mapTransaction));

    if (rows.length < pageSize) break;
  }

  const saved = profileResult.data;
  const profile: CustomerProfile = {
    name: saved.name,
    email: user.email ?? "",
    phone: saved.phone,
    gender: saved.gender,
    avatar: saved.avatar,
  };

  const accounts = accountResult.data.map(mapAccount);

  // Preserve the existing starter-card order.
  accounts.sort((a, b) => {
    const position = (id: string) => {
      const index = starterAccounts.findIndex((account) => account.id === id);
      return index < 0 ? starterAccounts.length : index;
    };

    return position(a.id) - position(b.id);
  });

  return { profile, accounts, transactions };
}

// MONEY WRITE:
// The database validates ownership and balance before accepting the action.
// Reuse the same transaction ID if retrying an uncertain request.
export async function recordTransaction(
  transaction: CloudTransaction,
): Promise<CloudTransaction> {
  const { data, error } = await supabase.rpc("record_demo_transaction", {
    p_id: transaction.id,
    p_account_id: transaction.accountId,
    p_kind: transaction.kind,
    p_amount_kobo: transaction.amountKobo,
    p_counterparty: transaction.counterparty,
    p_payment_method: transaction.paymentMethod ?? null,
    p_recipient_account_number: transaction.recipientAccountNumber ?? null,
    p_recipient_bank: transaction.recipientBank ?? null,
  });

  if (error) throw new Error(error.message);

  return mapTransaction(data as TransactionRow);
}

// ACCOUNT WRITE:
// Return the stored account only after the insert succeeds.
export async function saveAccount(account: Account): Promise<Account> {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("demo_accounts")
    .insert({
      user_id: user.id,
      id: account.id,
      label: account.label,
      description: account.description ?? "",
      number: account.number,
    })
    .select("id,label,description,number")
    .single();

  if (error) throw new Error(error.message);

  return mapAccount(data);
}

// PROFILE WRITE:
// Email belongs to Authentication and is not changed by this profile update.
// Avatar data currently follows the existing frontend representation.
export async function saveProfile(
  profile: CustomerProfile,
): Promise<CustomerProfile> {
  const user = await requireUser();

  if (profile.email.trim() !== (user.email ?? "")) {
    throw new Error(
      "Email changes are not connected yet. Keep your login email unchanged.",
    );
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      name: profile.name.trim(),
      phone: profile.phone.trim(),
      gender: profile.gender,
      avatar: profile.avatar,
    })
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  return {
    name: data.name,
    email: user.email ?? "",
    phone: data.phone,
    gender: data.gender,
    avatar: data.avatar,
  };
}