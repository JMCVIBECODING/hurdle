// Vercel serverless function: add an email to Beehiiv with forced double
// opt-in. The Beehiiv API key is a server-only secret (no VITE_ prefix), so it
// never reaches the browser. Called from the game only when the player ticks
// the optional "email me" box. Beehiiv sends the confirmation email; only
// confirmed addresses become active subscribers.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const email = req.body && req.body.email;
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "invalid_email" });
  }

  const key = process.env.BEEHIIV_API_KEY;
  const pub = process.env.BEEHIIV_PUBLICATION_ID;
  // Not configured yet: succeed quietly so the game flow never breaks.
  if (!key || !pub) return res.status(200).json({ ok: true, configured: false });

  try {
    const r = await fetch(`https://api.beehiiv.com/v2/publications/${pub}/subscriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        reactivate_existing: false,
        send_welcome_email: false,
        double_opt_override: "on", // require click-to-confirm
        utm_source: "ascot-seven",
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(502).json({ ok: false, status: r.status });
    // status is typically "validating" until they confirm.
    return res.status(200).json({ ok: true, status: data?.data?.status || "validating" });
  } catch {
    return res.status(502).json({ ok: false });
  }
}
