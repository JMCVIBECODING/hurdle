import crypto from "crypto";

// Meta Conversions API (server-side). Mirrors the browser pixel event with the
// same event_id so Meta de-duplicates. Email is hashed (sha256) for matching.
// Secrets: META_CAPI_TOKEN (server only). Pixel id reused from VITE_META_PIXEL_ID.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const { event, eventId, email, url, custom } = req.body || {};
  if (!event) return res.status(400).json({ error: "missing_event" });

  const pixel = process.env.META_PIXEL_ID || process.env.VITE_META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixel || !token) return res.status(200).json({ ok: true, configured: false });

  const hash = (v) => crypto.createHash("sha256").update(String(v).trim().toLowerCase()).digest("hex");
  const fwd = req.headers["x-forwarded-for"] || "";
  const ip = Array.isArray(fwd) ? fwd[0] : String(fwd).split(",")[0].trim();

  const user_data = { client_user_agent: req.headers["user-agent"] };
  if (email) user_data.em = [hash(email)];
  if (ip) user_data.client_ip_address = ip;

  const body = {
    data: [{
      event_name: event,
      event_time: Math.floor(Date.now() / 1000),
      action_source: "website",
      event_id: eventId,
      event_source_url: url,
      user_data,
      custom_data: custom || {},
    }],
  };

  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/${pixel}/events?access_token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => ({}));
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok, data });
  } catch {
    return res.status(502).json({ ok: false });
  }
}
