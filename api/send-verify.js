// Vercel serverless function: send the Hurdle-branded "confirm your entry"
// email via Resend. Confirming makes a player eligible for the prize.
// Secrets: RESEND_API_KEY. From address: RESEND_FROM (defaults to hurdlegame.app).
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const { email, token } = req.body || {};
  if (!email || !email.includes("@") || !token) return res.status(400).json({ error: "bad_request" });

  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "The Ascot Seven <noreply@hurdlegame.app>";
  if (!key) return res.status(200).json({ ok: true, configured: false });

  const link = `https://hurdlegame.app/verify?token=${encodeURIComponent(token)}`;
  const html = `
  <div style="margin:0;padding:0;background:#0c2a22;font-family:Inter,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;padding:32px 24px;color:#f4ecd8;">
      <div style="font-family:'Oswald',Arial,sans-serif;font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-size:20px;margin-bottom:18px;">
        The Ascot <span style="color:#f2b705;">Seven</span>
      </div>
      <h1 style="font-family:'Oswald',Arial,sans-serif;font-size:26px;margin:0 0 12px;">Confirm your entry</h1>
      <p style="font-size:15px;line-height:1.55;opacity:.9;margin:0 0 22px;">
        Thanks for playing The Ascot Seven. Click below to confirm your entry — only confirmed players are eligible for the festival prize (top 3 split £500).
      </p>
      <a href="${link}" style="display:inline-block;background:#f2b705;color:#1a1400;text-decoration:none;font-family:'Oswald',Arial,sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.05em;font-size:15px;padding:15px 26px;border-radius:12px;">
        Confirm my entry →
      </a>
      <p style="font-size:12px;opacity:.6;line-height:1.5;margin:24px 0 0;">
        If the button doesn't work, paste this into your browser:<br />${link}
      </p>
      <p style="font-size:11px;opacity:.5;line-height:1.6;margin:22px 0 0;">
        18+ · Free to enter, no purchase necessary · Not a betting product · The Ascot Seven, a Hurdle game.
      </p>
    </div>
  </div>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [email], subject: "Confirm your Ascot Seven entry", html }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(502).json({ ok: false, error: data });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ ok: false });
  }
}
