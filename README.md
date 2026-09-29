# Reen Bank

A banking web application based on the ReenBank Figma design, developed as a Software Engineering SIWES project.

The project focuses first on reproducing the supplied interface and user journeys, then integrating the frontend with a backend and database so account activity persists beyond the browser.

## Project Status

**In development — frontend implementation and refinement.**

Currently implemented:

- Landing page with services, FAQs, supported finance services, and footer.
- Registration and login interfaces.
- Responsive layouts for desktop and mobile.
- Password visibility controls.
- Button interaction feedback and scroll animations.
- An initial banking dashboard generated with Figma Make and undergoing design review.
- Locally stored design assets.
- A separate initial backend prototype.

TypeScript validation and the frontend production build currently pass.

Registration and login are currently interface implementations. They do not yet create or authenticate users through the backend.

## Design Reference

The desktop interface follows the supplied ReenBank Figma design:

[View the Figma design](https://www.figma.com/design/NsmZbm2A223y1QLKn6yKhx/ReenBank-WebApp--Community---Copy-?node-id=602-11351)

The supplied design has no mobile reference. Mobile layouts adapt the desktop content to smaller screens while preserving the visual hierarchy.

Some screens still require alignment and workflow refinement. Full design parity has not yet been verified.

## Technology Stack

| Area               | Technology                  |
| ------------------ | --------------------------- |
| Frontend           | React and TypeScript        |
| Styling            | Tailwind CSS and custom CSS |
| Frontend tooling   | Vite                        |
| Backend prototype  | Node.js                     |
| Database prototype | SQLite                      |
| Version control    | Git and GitHub              |

Figma Make provided the initial frontend scaffold. The implementation is being reviewed and refined manually against the original design.

## Project Structure

```text
reen-bank-demo/
├── client/
│   ├── public/
│   │   └── assets/         # Local images, logos, and icons
│   ├── src/
│   │   ├── screens/        # Page and screen components
│   │   ├── App.tsx         # Existing dashboard application
│   │   ├── main.tsx        # Frontend entry point and page selection
│   │   └── index.css       # Shared styling and animations
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── public/                 # Initial backend prototype frontend
├── data/                   # Local database files; excluded from Git
├── backups/                # Local backups; excluded from Git
├── server.js               # Initial backend prototype
├── package.json
├── .gitignore
└── README.md
```

The root prototype and the React frontend are currently separate. Their integration will follow completion of the frontend design and user flow.

## Requirements

- Node.js 22.13.0 or later
- npm
- Git

## Run the Frontend

From the project root:

```powershell
Set-Location ".\client"
npm install
npm run dev
```

Open the local address printed by Vite. The current development configuration uses:

```text
http://localhost:8443
```

### Available Pages

| Path        | Page                           |
| ----------- | ------------------------------ |
| `/landing`  | Landing page                   |
| `/register` | Registration interface         |
| `/login`    | Login interface                |
| `/`         | Existing dashboard application |

These paths currently select frontend screens. Authentication and protected access are not yet implemented.

## Validate the Frontend

Run these commands inside `client`:

```powershell
npx tsc --noEmit
npm run build
```

The first command checks TypeScript without generating files. The second creates the production frontend build in `client/dist`.

Passing these checks confirms compilation and build success. Visual accuracy and user interactions require separate browser review.

## Planned User Flow

1. Visit the landing page.
2. Register an account.
3. Verify the email address.
4. View the account creation confirmation.
5. Sign in and access the dashboard.
6. Create a banking account.
7. Deposit and withdraw demo funds.
8. Review balances and transaction history.

New banking accounts are intended to start with a zero balance. Balances will change through recorded account activity rather than preloaded dashboard amounts.

## Development Roadmap

- Complete the email verification and account confirmation screens.
- Implement the password recovery interface.
- Complete the remaining screens from the Figma design.
- Refine dashboard alignment and responsive behavior.
- Verify navigation, validation, and interaction states.
- Connect registration and login to backend authentication.
- Implement database-backed accounts and transactions.
- Verify balance calculations and transaction persistence.

## Local Files and Configuration

The repository excludes:

- Dependency directories.
- Generated frontend builds.
- Local database files.
- Backup archives.
- Environment files.
- Local editor settings.

Design assets are included under `client/public/assets` so the frontend can use them directly from the codebase.

## Project Scope

This is an educational banking demonstration. It does not connect to payment networks or process real money.

The database integration is an extension of the original frontend assignment, intended to demonstrate how interface actions connect to persistent application data.

## Attribution

The interface is based on the ReenBank WebApp community design referenced above. Design assets and third-party brand marks belong to their respective owners.

This repository does not claim ownership of the original Figma design.
