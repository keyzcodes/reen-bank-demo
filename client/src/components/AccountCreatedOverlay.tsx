import { useEffect, useRef } from "react";

interface AccountCreatedOverlayProps {
  onDismiss: () => void;
}

export default function AccountCreatedOverlay({
  onDismiss,
}: AccountCreatedOverlayProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    dialog.showModal();
    dialog.focus();

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      tabIndex={-1}
      className="reen-account-created"
      aria-labelledby="account-created-title"
      aria-describedby="account-created-demo-note"
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
    >
      <div className="reen-account-created-content">
        <img
          src="/assets/account-confirmed.gif"
          alt=""
          className="reen-account-created-animation"
        />

        <h2 id="account-created-title">
          Your account <span>has been created Successfully!</span>
        </h2>

        <p id="account-created-demo-note" className="sr-only">
          Frontend demonstration only. No account has been created. The
          dashboard currently displays sample data.
        </p>

        <a
          href="/"
          onClick={(event) => {
            event.preventDefault();
            sessionStorage.removeItem("reen-registration-email");
            window.location.replace("/");
          }}
          className="reen-auth-submit reen-account-created-button"
        >
          Go to Dashboard
        </a>
      </div>
    </dialog>
  );
}
