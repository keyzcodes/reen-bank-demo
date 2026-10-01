import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "../styles/profile.css";

// PROFILE: Shared customer details.
// App owns this data so the card and header always display the same profile.
export type CustomerProfile = {
  name: string;
  email: string;
  phone: string;
  gender: string;
  avatar: string;
};

type ProfileTransaction = {
  id: string | number;
  name: string;
  date: string;
  amount: string;
  type: string;
};

type ProfilePageProps = {
  profile: CustomerProfile;
  onProfileChange: (profile: CustomerProfile) => void;
  transactions: ProfileTransaction[];
  balanceHidden: boolean;
  onToggleBalance: () => void;
  onResetPassword: () => void;
  onViewTransactions: () => void;
};

// PROFILE: Main page component.
// Saved profile data comes from App; unsaved edits stay inside this component.
export default function ProfilePage({
  profile,
  onProfileChange,
  transactions,
  balanceHidden,
  onToggleBalance,
  onResetPassword,
  onViewTransactions,
}: ProfilePageProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<CustomerProfile>(profile);
  const [photoError, setPhotoError] = useState("");

  // PROFILE: Start editing a fresh copy of the saved details.
  function beginEditing() {
    setDraft({ ...profile });
    setPhotoError("");
    setEditing(true);
  }

  // PROFILE: Preview a selected photo.
  // This frontend preview is temporary; backend storage comes later.
  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPhotoError("Choose a JPG, PNG or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Choose an image smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const avatar = reader.result;
        setDraft((current) => ({ ...current, avatar }));
        setPhotoError("");
      }
    };
    reader.onerror = () => setPhotoError("The image could not be read.");
    reader.readAsDataURL(file);
  }

  // PROFILE: Save edits to the shared React state.
  // No database request or permanent storage happens in this stage.
  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onProfileChange({
      ...draft,
      name: draft.name.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
    });
    setEditing(false);
  }

  return (
    <div className="reen-profile-page">
      {/* PROFILE: White centre card — no border and no shadow. */}
      <section className="reen-profile-card" aria-label="Customer profile">
        <div className="reen-profile-avatar-wrap">
          <img
            src={editing ? draft.avatar : profile.avatar}
            alt={`${editing ? draft.name : profile.name}'s profile`}
            className="reen-profile-avatar"
          />

          {!editing && (
            <button
              type="button"
              className="reen-profile-edit"
              onClick={beginEditing}
              aria-label="Edit profile"
            >
              {/* PROFILE: Pencil approximation until the exact asset is mapped. */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="m14 5 5 5M4 20l5-1L20 8a2.1 2.1 0 0 0-5-5L4 14l-1 6Z" />
              </svg>
            </button>
          )}
        </div>

        <h2 className="reen-profile-name">{profile.name}</h2>
        <span className="reen-profile-badge">Pro User</span>

        {editing ? (
          /* PROFILE: Editing interface — additional functionality requested by you. */
          <form className="reen-profile-editor" onSubmit={saveProfile}>
            <label>
              Profile picture
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={selectPhoto}
              />
            </label>

            {photoError && <p role="alert">{photoError}</p>}

            <label>
              Name
              <input
                required
                maxLength={80}
                value={draft.name}
                onChange={(event) =>
                  setDraft({ ...draft, name: event.target.value })
                }
              />
            </label>

            <label>
              Email
              <input
                required
                type="email"
                value={draft.email}
                onChange={(event) =>
                  setDraft({ ...draft, email: event.target.value })
                }
              />
            </label>

            <label>
              Phone Number
              <input
                required
                type="tel"
                value={draft.phone}
                onChange={(event) =>
                  setDraft({ ...draft, phone: event.target.value })
                }
              />
            </label>

            <label>
              Gender
              <select
                value={draft.gender}
                onChange={(event) =>
                  setDraft({ ...draft, gender: event.target.value })
                }
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </label>

            <div className="reen-profile-editor-actions">
              <button type="button" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button type="submit">Save Changes</button>
            </div>
          </form>
        ) : (
          <>
            {/* PROFILE: Saved email, phone and gender. */}
            <dl className="reen-profile-details">
              <div>
                <dt>Email</dt>
                <dd>{profile.email}</dd>
              </div>
              <div>
                <dt>Phone Number</dt>
                <dd>{profile.phone}</dd>
              </div>
              <div>
                <dt>Gender</dt>
                <dd>{profile.gender}</dd>
              </div>
            </dl>

            {/* PROFILE: Open the existing password reset workflow. */}
            <button
              type="button"
              className="reen-profile-reset"
              onClick={onResetPassword}
            >
              Reset Password
            </button>
          </>
        )}
      </section>

      {/* PROFILE: Right panel — balance and existing demo transactions. */}
      <aside className="reen-profile-right" aria-label="Account summary">
        <section className="reen-profile-balance" aria-label="Main account">
          <p>Main Account</p>
          <strong>{balanceHidden ? "XXXXXXXX" : "₦ 0.00"}</strong>
          <button
            type="button"
            onClick={onToggleBalance}
            aria-label={balanceHidden ? "Show balance" : "Hide balance"}
            aria-pressed={balanceHidden}
          >
            {balanceHidden ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <img src="/assets/b8200.svg" alt="" />
            )}
          </button>
        </section>

        <section className="reen-profile-transactions">
          <div className="reen-profile-transactions-heading">
            <h2>Transactions</h2>
            <button
              type="button"
              onClick={onViewTransactions}
              aria-label="View all transactions"
            >
              <img src="/assets/613bb.svg" alt="" />
            </button>
          </div>

          {/* PROFILE: Existing fixture rows, not database transactions yet. */}
          {transactions.slice(0, 8).map((transaction) => (
            <div className="reen-profile-transaction" key={transaction.id}>
              <span>{transaction.name}</span>
              <time>{transaction.date}</time>
              <strong
                className={
                  transaction.type === "credit" ? "is-credit" : "is-debit"
                }
              >
                {transaction.amount}
              </strong>
            </div>
          ))}
        </section>
      </aside>
    </div>
  );
}