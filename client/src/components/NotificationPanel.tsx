import { useEffect, useRef, useState } from "react";
import type { BankNotification } from "../api/notificationsApi";
import {
  formatNaira,
  formatTransactionDate,
} from "../utils/banking";
import "../styles/notifications.css";

type NotificationPanelProps = {
  notifications: readonly BankNotification[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
  onRead: (id: string) => Promise<void>;
  onDismiss: () => void;
};

export default function NotificationPanel({
  notifications,
  loading,
  error,
  onRefresh,
  onRead,
  onDismiss,
}: NotificationPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [readingId, setReadingId] = useState<string | null>(null);
  const [readError, setReadError] = useState("");

  // DIALOG:
  // Native modal provides keyboard focus handling and Escape support.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  async function readNotification(id: string) {
    if (readingId) return;

    setReadingId(id);
    setReadError("");

    try {
      await onRead(id);
    } catch {
      setReadError("Could not mark the notification as read. Try again.");
    } finally {
      setReadingId(null);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="reen-notifications-dialog"
      aria-labelledby="reen-notifications-title"
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
    >
      <header className="reen-notifications-header">
        <h2 id="reen-notifications-title">Notifications</h2>

        <button
          type="button"
          className="reen-notifications-close"
          aria-label="Close notifications"
          onClick={onDismiss}
          autoFocus
        >
          ×
        </button>
      </header>

      <div className="reen-notifications-body" aria-busy={loading}>
        {loading && <p role="status">Updating notifications…</p>}

        {error && (
          <div className="reen-notifications-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={onRefresh} disabled={loading}>
              Try again
            </button>
          </div>
        )}

        {readError && (
          <p className="reen-notifications-error" role="alert">
            {readError}
          </p>
        )}

        {!loading && !error && notifications.length === 0 && (
          <p className="reen-notifications-empty">
            No notifications yet. Your completed funding and withdrawals
            will appear here.
          </p>
        )}

        <ul className="reen-notifications-list">
          {notifications.map((notification) => {
            const deposit = notification.kind === "deposit";

            return (
              <li
                key={notification.id}
                className={`reen-notification ${
                  notification.readAt ? "" : "is-unread"
                }`}
              >
                <h3>
                  {deposit ? "Wallet funded" : "Withdrawal completed"}
                  {!notification.readAt && (
                    <span className="reen-notification-unread">Unread</span>
                  )}
                </h3>

                <p>
                  <strong>{formatNaira(notification.amountKobo)}</strong>
                  {deposit ? " added to " : " withdrawn from "}
                  {notification.accountLabel}.
                </p>

                {!deposit && (
                  <p className="reen-notification-recipient">
                    Recipient: {notification.counterparty}
                  </p>
                )}

                <div className="reen-notification-footer">
                  <time dateTime={notification.createdAt}>
                    {formatTransactionDate(notification.createdAt)}
                  </time>

                  {!notification.readAt && (
                    <button
                      type="button"
                      disabled={readingId !== null}
                      onClick={() => {
                        void readNotification(notification.id);
                      }}
                    >
                      {readingId === notification.id
                        ? "Saving…"
                        : "Mark as read"}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </dialog>
  );
}