// Stripe webhook -> Meta Conversions API Purchase event.
// Fires a server-side Purchase (hashed email, exact amount) on every
// checkout.session.completed. event_id = the Checkout Session id, which the
// HRO /thanks page also uses as its fbq eventID -> Meta dedupes the pair.
//
// Setup (one-time, Joe):
// 1. Vercel env var STRIPE_WEBHOOK_SECRET = signing secret from
//    Stripe dashboard -> Developers -> Webhooks -> Add endpoint:
//    https://hurdlegame.app/api/stripe-webhook   (event: checkout.session.completed)
// 2. Redeploy. Until the secret is set this endpoint refuses everything.

import crypto from "node:crypto";

export const config = { api: { bodyParser: false } };

function rawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function verifySignature(payload, header, secret) {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")));
  const t = parts.t, v1 = parts.v1;
  if (!t || !v1) return false;
  // Reject events older than 5 minutes (replay protection).
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch { return false; }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(503).json({ error: "webhook_secret_not_configured" });

  const payload = await rawBody(req);
  if (!verifySignature(payload.toString("utf8"), req.headers["stripe-signature"], secret)) {
    return res.status(400).json({ error: "bad_signature" });
  }

  let event;
  try { event = JSON.parse(payload.toString("utf8")); } catch { return res.status(400).json({ error: "bad_json" }); }
  if (event.type !== "checkout.session.completed") return res.status(200).json({ ok: true, ignored: event.type });

  const s = event.data?.object || {};
  const email = (s.customer_details?.email || s.customer_email || "").trim().toLowerCase();
  const value = (s.amount_total ?? 0) / 100;
  const currency = (s.currency || "gbp").toLowerCase();

  const pixelId = process.env.META_PIXEL_ID || process.env.VITE_META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixelId || !token) return res.status(200).json({ ok: true, capi: "not_configured" });

  const sha = (v) => crypto.createHash("sha256").update(v).digest("hex");
  const body = {
    data: [{
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_id: s.id, // matches the /thanks page fbq eventID -> deduped
      action_source: "website",
      event_source_url: "https://horseracingoracleai.com/thanks",
      user_data: { ...(email ? { em: [sha(email)] } : {}) },
      custom_data: { value, currency },
    }],
  };

  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const out = await r.json().catch(() => ({}));
    return res.status(200).json({ ok: r.ok, events_received: out.events_received });
  } catch {
    // Never 5xx back at Stripe for a CAPI blip -- it would retry forever.
    return res.status(200).json({ ok: false });
  }
}
