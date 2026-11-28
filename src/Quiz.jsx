import { useEffect, useState } from "react";
import { subscribeNewsletter, logSignup, logSmsConsent } from "./lib/api";
import { trackBoth } from "./lib/analytics";

// "What kind of punter are you?" — 6 questions, email gate, scored assessment.
// Ad traffic lands here. The result is a genuine mini-audit: three scored
// dimensions, a verdict per dimension keyed off their answers, and one
// concrete fix. All scores derive from their own answers, nothing invented.

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
    key: "bets_week",
    q: "How often are you betting?",
    opts: [
      ["big_days", "Big meetings only"],
      ["couple", "A couple of times a week"],
      ["most_days", "Most days"],
      ["daily_multis", "Every day, usually multis"],
    ],
  },
  {
    key: "stakes",
    q: "Be honest about your stakes.",
    opts: [
      ["level", "Same stake every bet"],
      ["confidence", "Bigger when I fancy it"],
      ["balance", "Whatever's in the account"],
      ["chase", "They grow when I'm chasing"],
    ],
  },
  {
    key: "tracking",
    q: "Do you track your bets?",
    opts: [
      ["spreadsheet", "Yes, spreadsheet or app, every bet"],
      ["head", "Roughly, in my head"],
      ["bookie", "Only what the bookie app shows me"],
      ["none", "No. Next question."],
    ],
  },
  {
    key: "up_or_down",
    q: "Over the last 12 months, are you up or down?",
    opts: [
      ["up", "Up, and I can prove it"],
      ["even", "About even"],
      ["probably_down", "Probably down, I don't track it"],
      ["down", "Down, and I know it"],
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

// --- Scoring ---------------------------------------------------------------
// Three dimensions, each 0-100, each from specific answers.
const SCORE = {
  selection: { gut: 25, mates: 20, tipster: 45, system: 80 },
  staking: { level: 85, confidence: 50, balance: 25, chase: 10 },
  tracking: { spreadsheet: 90, head: 40, bookie: 30, none: 10 },
};
const FREQ_ADJ = { big_days: 10, couple: 5, most_days: -5, daily_multis: -15 }; // applies to staking
const RESULT_ADJ = { up: 10, even: 5, probably_down: -10, down: 0 }; // applies to tracking honesty: "down and I know it" at least means he counts

const VERDICT = {
  selection: {
    gut: "You're backing feelings against people with models and data feeds. Fun, but it's not an edge, and over a season the market taxes it.",
    mates: "Your method is other people's guesses, with no record attached. If a mate's tips were genuinely profitable, he'd have a spreadsheet to show you.",
    tipster: "Outsourcing the thinking can work, but only if the tipster publishes a full record, losers included. Most don't. Have you actually seen it?",
    system: "A real method puts you ahead of 90% of punters. The only question left is whether the record backs it up over a proper sample.",
  },
  staking: {
    level: "Level stakes is the single most professional habit in betting. Whatever else needs work, keep this.",
    confidence: "Staking by confidence feels smart but most punters' 'confident' bets perform no better than the rest. It mostly adds variance, not profit.",
    balance: "Betting whatever's in the account means your stake is set by payday, not by logic. That's how decent picks still lose money.",
    chase: "Chasing is the leak that empties the tank. One bad Saturday wipes a month of good ones. This is the first thing to fix, nothing else matters until it is.",
  },
  tracking: {
    spreadsheet: "You track every bet. Rare. You're one of the few who actually knows their number.",
    head: "Tracking 'in your head' means remembering the winners and rounding the losers down. Everyone does it. That's why everyone thinks they're about even.",
    bookie: "The bookie's history shows you bets, not a P/L you can judge a method on. They're not keen on you seeing that number clearly.",
    none: "No record means every decision you make is based on a feeling about how it's going. You can't fix what you don't measure.",
  },
};

const FIX = {
  selection: {
    title: "Fix your selection method first",
    text: "Pick one source of selections with a published, complete record and follow it for 30 days on paper or minimum stakes. Judge it on the number at the end, not on any single day. Stop mixing in gut bets during the test, they contaminate the sample.",
  },
  staking: {
    title: "Fix your staking first",
    text: "Level stakes, 30 days, no exceptions: 1 point on every bet, no doubling after losses, no 'confidence' bumps. Decide the point size now, when you're calm, at 1-2% of what you can afford to lose. Most punters' picks are better than their results. Staking is the gap.",
  },
  tracking: {
    title: "Fix your record keeping first",
    text: "From today, log every bet: date, selection, odds, stake, result. A notes app works. Do it for 30 days and you'll know your real number for the first time. Most punters who start tracking cut their worst bets within a fortnight, purely because they'd have to write them down.",
  },
};

const PROFILES = {
  gut: ["The Gut Puncher", "You back feelings, not form."],
  mates: ["The Whisper Chaser", "Your strategy is other people's guesses."],
  tipster: ["The Follower", "You outsourced the thinking. Did you check the record?"],
  system: ["The Method Punter", "Rare breed. Does the record hold up?"],
};

const clamp = (n) => Math.max(5, Math.min(98, Math.round(n)));

function assess(a) {
  const selection = clamp(SCORE.selection[a.pick_method] ?? 30);
  const staking = clamp((SCORE.staking[a.stakes] ?? 40) + (FREQ_ADJ[a.bets_week] ?? 0));
  const tracking = clamp((SCORE.tracking[a.tracking] ?? 30) + (RESULT_ADJ[a.up_or_down] ?? 0));
  const avg = (selection + staking + tracking) / 3;
  const grade = avg >= 75 ? "A" : avg >= 60 ? "B" : avg >= 45 ? "C" : avg >= 32 ? "D" : "E";
  const dims = [
    ["selection", "Selection method", selection, VERDICT.selection[a.pick_method]],
    ["staking", "Staking discipline", staking, VERDICT.staking[a.stakes]],
    ["tracking", "Record keeping", tracking, VERDICT.tracking[a.tracking]],
  ];
  const weakest = dims.reduce((m, d) => (d[2] < m[2] ? d : m), dims[0]);
  return { dims, grade, avg: Math.round(avg), fix: FIX[weakest[0]], profile: PROFILES[a.pick_method] || PROFILES.gut };
}

// Exact SMS consent wording shown to the user; stored with each consent (PECR).
const SMS_CONSENT_TEXT = "Yes, text me tips and offers from Horse Racing Oracle. UK mobiles. Reply STOP any time.";

// BFCM offer window: shows until the end of Cyber Monday, then vanishes on its own.
const BFCM_ENDS = Date.parse("2026-12-01T00:00:00Z");

export default function Quiz() {
  const bfcmLive = Date.now() < BFCM_ENDS;
  const [step, setStep] = useState(0); // 0..5 questions, 6 email, 7 result
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [smsOk, setSmsOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [grow, setGrow] = useState(false); // bar animation trigger

  const N = QS.length;

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
      quiz_bets_week: answers.bets_week || "",
      quiz_stakes: answers.stakes || "",
      quiz_tracking: answers.tracking || "",
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
    setStep(N + 1);
  }

  useEffect(() => {
    if (step === N + 1) { const t = setTimeout(() => setGrow(true), 150); return () => clearTimeout(t); }
  }, [step, N]);

  const r = step === N + 1 ? assess(answers) : null;

  return (
    <div className="qz">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Source+Sans+3:wght@400;600&display=swap');
        .qz{min-height:100vh;background:#0d2420;color:#f4ecd8;font-family:'Source Sans 3',sans-serif;display:flex;flex-direction:column;align-items:center;padding:0 16px;}
        .qz .brand{font-family:'Oswald';font-weight:700;font-size:20px;letter-spacing:.06em;text-transform:uppercase;padding:18px 0 0;}
        .qz .brand b{color:#f2b705;}
        .qz .card{width:100%;max-width:480px;margin:7vh auto 0;background:#123029;border:1px solid rgba(244,236,216,.14);border-radius:16px;padding:26px;}
        .qz .kicker{font-size:11px;text-transform:uppercase;letter-spacing:.14em;color:#f2b705;font-weight:600;margin:0 0 10px;}
        .qz h1{font-family:'Oswald';font-size:24px;text-transform:uppercase;letter-spacing:.03em;margin:0 0 6px;line-height:1.2;}
        .qz .sub{font-size:14px;opacity:.75;margin:0 0 18px;line-height:1.5;}
        .qz .opt{display:block;width:100%;text-align:left;background:rgba(244,236,216,.06);border:1px solid rgba(244,236,216,.16);color:#f4ecd8;border-radius:11px;padding:14px;font-size:15px;margin-bottom:9px;cursor:pointer;font-family:inherit;}
        .qz .opt:hover{border-color:#f2b705;}
        .qz .prog{font-size:11px;opacity:.5;margin-bottom:6px;}
        .qz .pbar{height:3px;background:rgba(244,236,216,.12);border-radius:2px;margin-bottom:16px;overflow:hidden;}
        .qz .pbar i{display:block;height:100%;background:#f2b705;border-radius:2px;transition:width .3s ease;}
        .qz .row{display:flex;gap:8px;}
        .qz input{flex:1;min-width:0;padding:14px;border-radius:11px;border:0;font-size:15px;}
        .qz .go{background:#f2b705;color:#1a1400;border:0;border-radius:11px;padding:0 20px;font-family:'Oswald';font-weight:600;text-transform:uppercase;font-size:14px;cursor:pointer;}
        .qz .go:disabled{opacity:.4;}
        .qz .ph{width:100%;margin-top:9px;padding:14px;border-radius:11px;border:0;font-size:15px;}
        .qz .chk{display:flex;gap:9px;align-items:flex-start;font-size:12.5px;line-height:1.45;margin-top:11px;cursor:pointer;opacity:.85;}
        .qz .chk input{margin-top:2px;accent-color:#f2b705;flex:none;width:auto;}
        /* result */
        .qz .rhead{display:flex;align-items:center;gap:16px;margin:2px 0 16px;}
        .qz .gradec{flex:none;width:76px;height:76px;border-radius:50%;border:3px solid #f2b705;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(242,183,5,.08);}
        .qz .gradec b{font-family:'Oswald';font-size:34px;color:#f2b705;line-height:1;}
        .qz .gradec span{font-size:8.5px;text-transform:uppercase;letter-spacing:.1em;opacity:.6;margin-top:2px;}
        .qz .profname{font-family:'Oswald';font-size:27px;color:#f2b705;text-transform:uppercase;margin:0;line-height:1.1;}
        .qz .profsub{font-size:13.5px;opacity:.8;margin:5px 0 0;line-height:1.4;}
        .qz .dim{margin-bottom:15px;}
        .qz .dtop{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:5px;}
        .qz .dname{font-family:'Oswald';font-size:13px;letter-spacing:.08em;text-transform:uppercase;}
        .qz .dscore{font-family:'Oswald';font-size:13px;color:#f2b705;}
        .qz .dbar{height:7px;background:rgba(244,236,216,.1);border-radius:4px;overflow:hidden;margin-bottom:6px;}
        .qz .dbar i{display:block;height:100%;border-radius:4px;transition:width .9s cubic-bezier(.2,.7,.3,1);}
        .qz .dtext{font-size:12.5px;line-height:1.5;opacity:.8;margin:0;}
        .qz .fixbox{background:rgba(242,183,5,.07);border:1px solid rgba(242,183,5,.3);border-radius:12px;padding:15px;margin:17px 0 0;}
        .qz .fixk{font-family:'Oswald';font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#f2b705;margin:0 0 7px;}
        .qz .fixt{font-size:13px;line-height:1.55;margin:0;opacity:.9;}
        .qz .divider{height:1px;background:rgba(244,236,216,.14);margin:18px 0 14px;}
        .qz .how{margin:4px 0 2px;}
        .qz .hrow{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;margin-bottom:8px;line-height:1.4;}
        .qz .tick{color:#f2b705;font-weight:700;flex-shrink:0;}
        .qz .bfcm{background:linear-gradient(160deg,rgba(242,183,5,.14),rgba(242,183,5,.05));border:1px solid rgba(242,183,5,.45);border-radius:14px;padding:18px;margin-top:16px;}
        .qz .bfcm .bftag{display:inline-block;background:#f2b705;color:#1a1400;font-family:'Oswald';font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;border-radius:5px;padding:4px 10px;margin-bottom:12px;}
        .qz .price{display:flex;align-items:center;gap:14px;margin-bottom:10px;}
        .qz .big5{font-family:'Oswald';font-weight:700;font-size:54px;color:#f2b705;line-height:1;}
        .qz .pmeta{font-size:13.5px;line-height:1.45;font-weight:600;}
        .qz .pmeta s{opacity:.5;font-weight:400;}
        .qz .bfcm p{font-size:12.5px;opacity:.75;margin:0;line-height:1.5;}
        .qz .cta{display:block;text-align:center;background:#f2b705;color:#1a1400;border-radius:11px;padding:15px;font-family:'Oswald';font-weight:600;text-transform:uppercase;font-size:15px;text-decoration:none;margin-top:16px;}
        .qz .small{font-size:11px;opacity:.5;margin-top:12px;line-height:1.5;}
        .qz .foot{font-size:10.5px;opacity:.45;padding:18px;text-align:center;margin-top:auto;line-height:1.6;}
        .qz .foot a{color:inherit;}
      `}</style>

      <div className="brand">Horse Racing <b>Oracle</b></div>

      <div className="card">
        {step < N && (
          <>
            <p className="prog">Question {step + 1} of {N}</p>
            <div className="pbar"><i style={{ width: `${(step / N) * 100}%` }} /></div>
            <h1>{QS[step].q}</h1>
            {QS[step].opts.map(([val, label]) => (
              <button className="opt" key={val} onClick={() => pick(QS[step].key, val)}>{label}</button>
            ))}
          </>
        )}

        {step === N && (
          <>
            <p className="kicker">Your assessment is ready</p>
            <h1>Where do we send your punter report?</h1>
            <p className="sub">Your grade, your three scores, and the one thing to fix first. You'll also get today's free tips from the model.</p>
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

        {r && (
          <>
            <p className="kicker">Your punter report</p>
            <div className="rhead">
              <div className="gradec"><b>{r.grade}</b><span>grade</span></div>
              <div>
                <h2 className="profname">{r.profile[0]}</h2>
                <p className="profsub">{r.profile[1]}</p>
              </div>
            </div>

            {r.dims.map(([key, name, score, verdict]) => (
              <div className="dim" key={key}>
                <div className="dtop">
                  <span className="dname">{name}</span>
                  <span className="dscore">{score}/100</span>
                </div>
                <div className="dbar">
                  <i style={{ width: grow ? `${score}%` : "0%", background: score >= 65 ? "#4e9b6f" : score >= 40 ? "#f2b705" : "#c0564e" }} />
                </div>
                <p className="dtext">{verdict}</p>
              </div>
            ))}

            <div className="fixbox">
              <p className="fixk">{r.fix.title}</p>
              <p className="fixt">{r.fix.text}</p>
            </div>

            <div className="divider" />
            <p className="sub" style={{ marginBottom: 12 }}>
              {answers.up_or_down === "up"
                ? "You say you're up and can prove it. Respect. See if the model beats your edge."
                : "None of this means you're bad at this. It means you're doing it on gut and memory against a market priced by machines. The model closes that gap."}
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
                    <span className="big5">£5<span style={{ fontSize: 22 }}>/mo</span></span>
                    <span className="pmeta">first 3 months<br /><s>£17/mo</s> · then £17/mo</span>
                  </div>
                  <p>5 tips a day, every racing morning. Cancel any time. The only discount we run all year.</p>
                </div>
                <a className="cta" href="https://horseracingoracleai.com/offer?utm_source=quiz&utm_medium=results&utm_campaign=bfcm26">
                  Get 5 tips a day for £5 →
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
