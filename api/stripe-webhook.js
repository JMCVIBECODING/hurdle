// Vercel serverless function: Stripe webhook -> mark the subscriber as paid
// in Beehiiv (custom field "paid" = "true"). Lets emails and automations
// exclude paying members from promo sends.
//
// Setup (one time):
//   1. Stripe dashboard -> Developers -> Webhooks -> Add endpoint
//      URL: https://hurdlegame.app/api/stripe-webhook
//      Events: checkout.session.completed
//   2. Copy the endpoint's signing secret into Vercel env: STRIPE_WEBHOOK_SECRET
//   (BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID are already set for /api/subscribe.)

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

// Verify Stripe's signature header: v1 = HMAC-SHA256(`${t}.${payload}`, secret).
function verifyStripeSig(payload, header, secret) {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")));
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 600) return false; // 10 min tolerance
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(v1, "hex"));
  } catch {
    return false;
  }
}

async function markPaidInBeehiiv(email) {
  const key = process.env.BEEHIIV_API_KEY;
  const pub = process.env.BEEHIIV_PUBLICATION_ID;
  if (!key || !pub) return { ok: false, reason: "beehiiv_not_configured" };
  const base = `https://api.beehiiv.com/v2/publications/${pub}`;
  const auth = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

  // Find the subscriber (may not exist if they bought without ever subscribing).
  const lookup = await fetch(`${base}/subscriptions/by_email/${encodeURIComponent(email)}`, { headers: auth });
  if (lookup.ok) {
    const sub = (await lookup.json())?.data;
    const r = await fetch(`${base}/subscriptions/${sub.id}`, {
      method: "PATCH",
      headers: auth,
      body: JSON.stringify({ custom_fields: [{ name: "paid", value: "true" }] }),
    });
    return { ok: r.ok, mode: "patched" };
  }
  // Not on the list yet: add them, already marked paid.
  const r = await fetch(`${base}/subscriptions`, {
    method: "POST",
    headers: auth,
    body: JSON.stringify({
      email,
      reactivate_existing: true,
      send_welcome_email: false,
      utm_source: "stripe",
      custom_fields: [{ name: "paid", value: "true" }],
    }),
  });
  return { ok: r.ok, mode: "created" };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(200).json({ ok: true, configured: false });

  const payload = await rawBody(req);
  if (!verifyStripeSig(payload.toString("utf8"), req.headers["stripe-signature"], secret)) {
    return res.status(400).json({ error: "bad_signature" });
  }

  let event;
  try {
    event = JSON.parse(payload.toString("utf8"));
  } catch {
    return res.status(400).json({ error: "bad_payload" });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data?.object || {};
    const email = s.customer_details?.email || s.customer_email;
    if (email && (s.payment_status === "paid" || s.mode === "subscription")) {
      const out = await markPaidInBeehiiv(email.toLowerCase());
      return res.status(200).json({ ok: true, ...out });
    }
  }
  return res.status(200).json({ ok: true, ignored: event.type });
}
