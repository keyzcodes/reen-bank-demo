import { supabase } from "../lib/supabase";

export type BankNotification = {
  id: string;
  transactionId: string;
  accountLabel: string;
  kind: "deposit" | "withdrawal";
  amountKobo: number;
  counterparty: string;
  createdAt: string;
  readAt: string | null;
};

type NotificationRow = {
  id: string;
  transaction_id: string;
  account_label: string;
  kind: "deposit" | "withdrawal";
  amount_kobo: number | string;
  counterparty: string;
  created_at: string;
  read_at: string | null;
};

// NOTIFICATIONS:
// Load the latest 50 alerts and the total unread count.
// Database policies restrict results to the signed-in user.
export async function loadNotifications(): Promise<{
  notifications: BankNotification[];
  unreadCount: number;
}> {
  const [listResult, countResult] = await Promise.all([
    supabase
      .from("notifications")
      .select(
        "id, transaction_id, account_label, kind, amount_kobo, counterparty, created_at, read_at",
      )
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(50),

    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .is("read_at", null),
  ]);

  if (listResult.error) throw listResult.error;
  if (countResult.error) throw countResult.error;

  const notifications = (
    (listResult.data ?? []) as NotificationRow[]
  ).map((row): BankNotification => {
    const amountKobo = Number(row.amount_kobo);

    if (!Number.isSafeInteger(amountKobo) || amountKobo <= 0) {
      throw new Error("A notification contains an invalid amount.");
    }

    return {
      id: row.id,
      transactionId: row.transaction_id,
      accountLabel: row.account_label,
      kind: row.kind,
      amountKobo,
      counterparty: row.counterparty,
      createdAt: row.created_at,
      readAt: row.read_at,
    };
  });

  return {
    notifications,
    unreadCount: countResult.count ?? 0,
  };
}

// READ STATE:
// Save the read timestamp so it survives refresh and device changes.
// Reopening an already-read notification preserves its first timestamp.
export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null);

  if (error) throw error;
}