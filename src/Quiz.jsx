import { useState } from "react";
import { subscribeNewsletter, logSignup, logSmsConsent } from "./lib/api";
import { trackBoth } from "./lib/analytics";

// "What kind of punter are you?" — 3 questions, email gate, profile result.
// Ad traffic lands here; the results page is where the VSL will live.

const QS = [
  {
    key: "pick_method",
    q: "How do you actually pick your bets?",
    opts: [
      ["gut", "Gut feel and a glance at the form"],
      ["mates", "Tips from mates or X"],
      ["tipster", "I follow a tipster"],
      ["system", "I have a proper system"],
    ],
  },
  {
    key: "up_or_down",
    q: "Be honest. Over the last 12 months, are you up or down?",
    opts: [
      ["down", "Down, and I know it"],
      ["probably_down", "Probably down, I don't track it"],
      ["even", "About even"],
      ["up", "Up, and I can prove it"],
    ],
  },
  {
    key: "pain",
    q: "What's the most annoying part?",
    opts: [
      ["time", "The time it takes to study form"],
      ["trust", "Not knowing who to trust"],
      ["discipline", "Losing discipline and chasing"],
      ["none", "Nothing, I enjoy donating to bookies"],
    ],
  },
];

const PROFILES = {
  gut: ["The Gut Puncher", "You back feelings, not form. Fun until you count it up."],
  mates: ["The Whisper Chaser", "Your strategy is other people's guesses."],
  tipster: ["The Follower", "You outsourced the thinking. Did you check the record?"],
  system: ["The Method Punter", "Rare breed. The question is whether the method holds up."],
};

// Exact SMS consent wording shown to the user; stored with each consent (PECR).
const SMS_CONSENT_TEXT = "Yes, text me tips and offers from Horse Racing Oracle. UK mobiles. Reply STOP any time.";

// BFCM offer window: shows until the end of Cyber Monday, then vanishes on its own.
const BFCM_ENDS = Date.parse("2026-12-01T00:00:00Z");

export default function Quiz() {
  const bfcmLive = Date.now() < BFCM_ENDS;
  const [step, setStep] = useState(0); // 0..2 questions, 3 email, 4 result
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [smsOk, setSmsOk] = useState(false);
  const [busy, setBusy] = useState(false);

  function pick(key, val) {
    const next = { ...answers, [key]: val };
    setAnswers(next);
    if (step === 0) trackBoth("ViewContent", { content_name: "quiz_started" });
    setStep(step + 1);
  }

  async function submit() {
    if (!email.includes("@") || busy) return;
    setBusy(true);
    await subscribeNewsletter(email, {
      quiz_pick_method: answers.pick_method || "",
      quiz_up_or_down: answers.up_or_down || "",
      quiz_pain: answers.pain || "",
    }, "quiz");
    trackBoth("CompleteRegistration", { email, content_name: "quiz" });
    trackBoth("Lead", { email, content_name: "quiz" });
    logSignup(email, "quiz");
    if (smsOk && phone.replace(/\D/g, "").length >= 10) {
      logSmsConsent(email, phone, SMS_CONSENT_TEXT, "quiz");
    }
    setBusy(false);
    setStep(4);
  }

  const profile = PROFILES[answers.pick_method] || PROFILES.gut;

  return (
    <div className="qz">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Source+Sans+3:wght@400;600&display=swap');
        .qz{min-height:100vh;background:#0d2420;color:#f4ecd8;font-family:'Source Sans 3',sans-serif;display:flex;flex-direction:column;align-items:center;padding:0 16px;}
        .qz .brand{font-family:'Oswald';font-weight:700;font-size:20px;letter-spacing:.06em;text-transform:uppercase;padding:18px 0 0;}
        .qz .brand b{color:#f2b705;}
        .qz .card{width:100%;max-width:460px;margin:9vh auto 0;background:#123029;border:1px solid rgba(244,236,216,.14);border-radius:16px;padding:26px;}
        .qz .kicker{font-size:11px;text-transform:uppercase;letter-spacing:.14em;color:#f2b705;font-weight:600;margin:0 0 10px;}
        .qz h1{font-family:'Oswald';font-size:24px;text-transform:uppercase;letter-spacing:.03em;margin:0 0 6px;line-height:1.2;}
        .qz .sub{font-size:14px;opacity:.75;margin:0 0 18px;line-height:1.5;}
        .qz .opt{display:block;width:100%;text-align:left;background:rgba(244,236,216,.06);border:1px solid rgba(244,236,216,.16);color:#f4ecd8;border-radius:11px;padding:14px;font-size:15px;margin-bottom:9px;cursor:pointer;font-family:inherit;}
        .qz .opt:hover{border-color:#f2b705;}
        .qz .prog{font-size:11px;opacity:.5;margin-bottom:12px;}
        .qz .row{display:flex;gap:8px;}
        .qz input{flex:1;min-width:0;padding:14px;border-radius:11px;border:0;font-size:15px;}
        .qz .go{background:#f2b705;color:#1a1400;border:0;border-radius:11px;padding:0 20px;font-family:'Oswald';font-weight:600;text-transform:uppercase;font-size:14px;cursor:pointer;}
        .qz .go:disabled{opacity:.4;}
        .qz .ph{width:100%;margin-top:9px;padding:14px;border-radius:11px;border:0;font-size:15px;}
        .qz .chk{display:flex;gap:9px;align-items:flex-start;font-size:12.5px;line-height:1.45;margin-top:11px;cursor:pointer;opacity:.85;}
        .qz .chk input{margin-top:2px;accent-color:#f2b705;}
        .qz .bfcm{background:linear-gradient(160deg,rgba(242,183,5,.14),rgba(242,183,5,.05));border:1px solid rgba(242,183,5,.45);border-radius:14px;padding:18px;margin-top:16px;}
        .qz .bfcm .bftag{display:inline-block;background:#f2b705;color:#1a1400;font-family:'Oswald';font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;border-radius:5px;padding:4px 10px;margin-bottom:12px;}
        .qz .price{display:flex;align-items:center;gap:14px;margin-bottom:10px;}
        .qz .big5{font-family:'Oswald';font-weight:700;font-size:54px;color:#f2b705;line-height:1;}
        .qz .pmeta{font-size:13.5px;line-height:1.45;font-weight:600;}
        .qz .pmeta s{opacity:.5;font-weight:400;}
        .qz .bfcm p{font-size:12.5px;opacity:.75;margin:0;line-height:1.5;}
        .qz .profname{font-family:'Oswald';font-size:34px;color:#f2b705;text-transform:uppercase;margin:4px 0 6px;line-height:1.1;}
        .qz .profsub{font-size:15px;font-weight:600;margin:0 0 14px;line-height:1.45;}
        .qz .divider{height:1px;background:rgba(244,236,216,.14);margin:0 0 14px;}
        .qz .how{margin:4px 0 2px;}
        .qz .hrow{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;margin-bottom:8px;line-height:1.4;}
        .qz .tick{color:#f2b705;font-weight:700;flex-shrink:0;}
        .qz .cta{display:block;text-align:center;background:#f2b705;color:#1a1400;border-radius:11px;padding:15px;font-family:'Oswald';font-weight:600;text-transform:uppercase;font-size:15px;text-decoration:none;margin-top:16px;}
        .qz .small{font-size:11px;opacity:.5;margin-top:12px;line-height:1.5;}
        .qz .foot{font-size:10.5px;opacity:.45;padding:18px;text-align:center;margin-top:auto;line-height:1.6;}
        .qz .foot a{color:inherit;}
      `}</style>

      <div className="brand">Horse Racing <b>Oracle</b></div>

      <div className="card">
        {step < 3 && (
          <>
            <p className="prog">Question {step + 1} of 3</p>
            <h1>{QS[step].q}</h1>
            {QS[step].opts.map(([val, label]) => (
              <button className="opt" key={val} onClick={() => pick(QS[step].key, val)}>{label}</button>
            ))}
          </>
        )}

        {step === 3 && (
          <>
            <p className="kicker">Your result is ready</p>
            <h1>Where do we send your punter profile?</h1>
            <p className="sub">You'll also get today's free tips from the model.</p>
            <div className="row">
              <input type="email" inputMode="email" placeholder="you@email.com" value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     onKeyDown={(e) => e.key === "Enter" && submit()} />
              <button className="go" onClick={submit} disabled={!email.includes("@") || busy}>
                {busy ? "..." : "Show me"}
              </button>
            </div>
            <input className="ph" type="tel" inputMode="tel" placeholder="Mobile (optional, for text tips)"
                   value={phone} onChange={(e) => setPhone(e.target.value)} />
            <label className="chk">
              <input type="checkbox" checked={smsOk} onChange={(e) => setSmsOk(e.target.checked)} />
              <span>{SMS_CONSENT_TEXT}</span>
            </label>
            <p className="small">By continuing you agree to receive daily tips and offers from Horse Racing Oracle by email. Free. Unsubscribe anytime. 18+ only.</p>
          </>
        )}

        {step === 4 && (
          <>
            <p className="kicker">Your punter profile</p>
            <div className="profname">{profile[0]}</div>
            <p className="profsub">{profile[1]}</p>
            <div className="divider" />
            <p className="sub">
              {answers.up_or_down === "up"
                ? "You say you're up and can prove it. Respect. See if the model beats your edge."
                : "You're not losing because you're stupid. You're losing because you're playing machines with a gut."}
            </p>
            <div className="how">
              <div className="hrow"><span className="tick">✓</span>AI model studies every race, every morning</div>
              <div className="hrow"><span className="tick">✓</span>A short card of selections daily, never a flood</div>
              <div className="hrow"><span className="tick">✓</span>Every pick stays on the record, losers included</div>
            </div>
            {bfcmLive ? (
              <>
                <div className="bfcm">
                  <span className="bftag">Black Friday · ends Monday night</span>
                  <div className="price">
                    <span className="big5">£5</span>
                    <span className="pmeta">3 full months<br /><s>£51</s> · then £17/mo</span>
                  </div>
                  <p>Every daily tip for the whole winter jumps season. The only discount we run all year.</p>
                </div>
                <a className="cta" href="https://horseracingoracleai.com/offer?utm_source=quiz&utm_medium=results&utm_campaign=bfcm26">
                  Claim 3 months for £5 →
                </a>
              </>
            ) : (
              <a className="cta" href="https://horseracingoracleai.com/?utm_source=quiz&utm_medium=results">
                See the model &amp; today's tips →
              </a>
            )}
            <p className="small">Your first tips email lands tomorrow morning.</p>
          </>
        )}
      </div>

      <div className="foot">
        18+ · <a href="https://www.gambleaware.org" target="_blank" rel="noopener">GambleAware.org</a> · Bet only what you can afford to lose
        · <a href="/privacy">Privacy</a> · Information, not financial advice
      </div>
    </div>
  );
}
