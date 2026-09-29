import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(root, "data");

fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, "reen-bank.sqlite"));

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    number TEXT NOT NULL UNIQUE,
    balance_kobo INTEGER NOT NULL CHECK (balance_kobo >= 0)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES accounts(id),
    kind TEXT NOT NULL CHECK (
      kind IN ('fund', 'withdraw', 'transfer_in', 'transfer_out')
    ),
    amount_kobo INTEGER NOT NULL CHECK (amount_kobo > 0),
    counterparty TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (
      strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    )
  );
`);

// Add fictional demo accounts only when the database is first created.
const accountCount = db
  .prepare("SELECT COUNT(*) AS count FROM accounts")
  .get().count;

if (accountCount === 0) {
  const insertAccount = db.prepare(`
    INSERT INTO accounts (name, number, balance_kobo)
    VALUES (?, ?, ?)
  `);

  insertAccount.run("Main Account", "1234567890", 4450000);
  insertAccount.run("School Savings", "1234567891", 4450000);
  insertAccount.run("Holiday Plan", "1234567892", 4450000);

  const insertTransaction = db.prepare(`
    INSERT INTO transactions
      (account_id, kind, amount_kobo, counterparty, note)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertTransaction.run(
    1,
    "fund",
    5450000,
    "Opening demo balance",
    "Seed data"
  );

  insertTransaction.run(
    1,
    "withdraw",
    1000000,
    "Oluwaben Jamin",
    "Seed data"
  );

  insertTransaction.run(
    2,
    "fund",
    4450000,
    "Opening demo balance",
    "Seed data"
  );

  insertTransaction.run(
    3,
    "fund",
    4450000,
    "Opening demo balance",
    "Seed data"
  );
}

const getAccounts = db.prepare(`
  SELECT
    id,
    name,
    number,
    balance_kobo AS balanceKobo
  FROM accounts
  ORDER BY id
`);

const getTransactions = db.prepare(`
  SELECT
    id,
    account_id AS accountId,
    kind,
    amount_kobo AS amountKobo,
    counterparty,
    note,
    created_at AS createdAt
  FROM transactions
  ORDER BY id DESC
  LIMIT 100
`);

const getAccount = db.prepare(`
  SELECT * FROM accounts WHERE id = ?
`);

const setBalance = db.prepare(`
  UPDATE accounts SET balance_kobo = ? WHERE id = ?
`);

const addTransaction = db.prepare(`
  INSERT INTO transactions
    (account_id, kind, amount_kobo, counterparty, note)
  VALUES (?, ?, ?, ?, ?)
`);

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });

  response.end(JSON.stringify(payload));
}

function getState() {
  return {
    customer: { name: "Maureen Oguche" },
    accounts: getAccounts.all(),
    transactions: getTransactions.all()
  };
}

// Store money as whole kobo so calculations avoid decimal rounding errors.
function parseAmount(value) {
  if (
    typeof value !== "string" ||
    !/^(?:0|[1-9]\d{0,8})(?:\.\d{1,2})?$/.test(value)
  ) {
    throw new Error("Enter a valid amount up to ₦999,999,999.99.");
  }

  const [naira, fraction = ""] = value.split(".");
  const amountKobo =
    Number(naira) * 100 + Number(fraction.padEnd(2, "0"));

  if (!Number.isSafeInteger(amountKobo) || amountKobo <= 0) {
    throw new Error("Amount must be greater than zero.");
  }

  return amountKobo;
}

function saveAction(body) {
  const { kind, accountId, destinationId, amount, note = "" } = body;

  const sourceId = Number(accountId);
  const targetId = Number(destinationId);
  const source = getAccount.get(sourceId);

  if (!source) {
    throw new Error("Choose a valid account.");
  }

  const amountKobo = parseAmount(amount);

  if (typeof note !== "string" || note.length > 120) {
    throw new Error("Note is too long.");
  }

  if (!["fund", "withdraw", "transfer"].includes(kind)) {
    throw new Error("Choose a valid action.");
  }

  const target =
    kind === "transfer" ? getAccount.get(targetId) : null;

  if (
    kind === "transfer" &&
    (!target || target.id === source.id)
  ) {
    throw new Error("Choose another account to receive the transfer.");
  }

  if (
    kind !== "fund" &&
    source.balance_kobo < amountKobo
  ) {
    throw new Error("Insufficient demo balance.");
  }

  // Either all balance and transaction changes succeed, or none do.
  db.exec("BEGIN IMMEDIATE");

  try {
    if (kind === "fund") {
      setBalance.run(
        source.balance_kobo + amountKobo,
        sourceId
      );

      addTransaction.run(
        sourceId,
        "fund",
        amountKobo,
        "Demo funding",
        note
      );
    } else if (kind === "withdraw") {
      setBalance.run(
        source.balance_kobo - amountKobo,
        sourceId
      );

      addTransaction.run(
        sourceId,
        "withdraw",
        amountKobo,
        "Demo withdrawal",
        note
      );
    } else {
      setBalance.run(
        source.balance_kobo - amountKobo,
        sourceId
      );

      setBalance.run(
        target.balance_kobo + amountKobo,
        targetId
      );

      addTransaction.run(
        sourceId,
        "transfer_out",
        amountKobo,
        target.name,
        note
      );

      addTransaction.run(
        targetId,
        "transfer_in",
        amountKobo,
        source.name,
        note
      );
    }

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return getState();
}

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png"
};

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");

    if (url.pathname === "/api/state" && request.method === "GET") {
      return sendJson(response, 200, getState());
    }

    if (
      url.pathname === "/api/transactions" &&
      request.method === "POST"
    ) {
      let rawBody = "";

      for await (const chunk of request) {
        rawBody += chunk;

        if (rawBody.length > 8192) {
          return sendJson(response, 413, {
            error: "Request too large."
          });
        }
      }

      let body;

      try {
        body = JSON.parse(rawBody);
      } catch {
        return sendJson(response, 400, {
          error: "Invalid JSON."
        });
      }

      try {
        return sendJson(response, 200, saveAction(body));
      } catch (error) {
        return sendJson(response, 400, {
          error: error.message
        });
      }
    }

    if (request.method !== "GET") {
      return sendJson(response, 405, {
        error: "Method not allowed."
      });
    }

    const requestedFile =
      url.pathname === "/"
        ? "index.html"
        : decodeURIComponent(url.pathname.slice(1));

    const filePath = path.resolve(
      root,
      "public",
      requestedFile
    );

    const publicRoot = path.join(root, "public");

    if (!filePath.startsWith(publicRoot + path.sep)) {
      return sendJson(response, 404, {
        error: "Not found."
      });
    }

    fs.readFile(filePath, (error, fileContents) => {
      if (error) {
        return sendJson(response, 404, {
          error: "Not found."
        });
      }

      response.writeHead(200, {
        "Content-Type":
          contentTypes[path.extname(filePath)] ||
          "application/octet-stream"
      });

      response.end(fileContents);
    });
  } catch {
    sendJson(response, 500, {
      error: "Server error."
    });
  }
});

const port = Number(process.env.PORT) || 3000;

server.listen(port, () => {
  console.log(`Reen Bank demo: http://localhost:${port}`);
});