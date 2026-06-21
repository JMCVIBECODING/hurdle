import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { hasSupabase } from "./lib/supabase";
import { loadCard, loadResults, loadBoard, lockEntry, subscribeNewsletter, pickPoints, loadPlayerCount } from "./lib/api";
import { SAMPLE_RACES, SAMPLE_NAP, SEED_BOARD } from "./lib/sampleCard";
import { todayDay, hasStarted } from "./lib/festival";
import { trackBoth } from "./lib/analytics";

export default function Game() {
  const day = todayDay();
  const [races, setRaces] = useState(SAMPLE_RACES);
  const [nap, setNap] = useState(SAMPLE_NAP);
  const [results, setResults] = useState({});
  const [board, setBoard] = useState(hasSupabase ? [] : SEED_BOARD);
  const [now, setNow] = useState(new Date());

  const [step, setStep] = useState("intro");   // 'intro' | race index | 'email' | 'done'
  const [picks, setPicks] = useState({});
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [locked, setLocked] = useState(false);
  const [verified, setVerified] = useState(false);
  const [myName, setMyName] = useState("");
  const [busy, setBusy] = useState(false);
  const [showBoard, setShowBoard] = useState(false);
  const [copied, setCopied] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const [cardLoaded, setCardLoaded] = useState(null); // null=loading, true=card, false=no game
  const [overMsg, setOverMsg] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!hasSupabase) return;
    loadCard(day).then((c) => {
      if (c && c.races?.length) { setRaces(c.races); setNap(c.nap); setCardLoaded(true); }
      else { setRaces([]); setCardLoaded(false); }   // no card today = festival over / between games
    });
    loadResults(day).then(setResults);
    loadBoard().then((b) => { if (b && b.length) setBoard(b); });
    loadPlayerCount().then(setPlayerCount);
  }, [day]);

  // Only races that haven't started are pickable in the funnel.
  const openRaces = useMemo(() => races.filter((r) => !hasStarted(day, r.time, now)), [races, day, now]);
  const racingOver = openRaces.length === 0;
  const firstLock = openRaces[0]?.time;
  const noGame = hasSupabase && cardLoaded === false; // no card posted = festival over / between games

  async function notify() {
    if (!email.includes("@")) return;
    await subscribeNewsletter(email);
    trackBoth("Lead", { email, content_name: "ascot_notify" });
    setOverMsg("You're on the list. We'll email you the moment the next game drops.");
  }

  const made = Object.keys(picks).length;
  const napRace = races.find((r) => r.id === nap.raceId);
  const napName = napRace?.runners.find((r) => r.id === nap.runnerId)?.name;
  const napStarted = napRace ? hasStarted(day, napRace.time, now) : false;
  const settled = Object.keys(results).length > 0;
  const youPoints = races.reduce((sum, r) => sum + pickPoints(results[r.id], picks[r.id]), 0);
  const napWon = results[nap.raceId]?.win === nap.runnerId;

  function pick(raceId, runnerId, idx) {
    setPicks((p) => ({ ...p, [raceId]: runnerId }));
    setTimeout(() => advance(idx), 240);
  }
  function advance(idx) { idx + 1 < openRaces.length ? setStep(idx + 1) : setStep("email"); }
  function back(idx) { idx === 0 ? setStep("intro") : setStep(idx - 1); }

  async function submit() {
    if (!email.includes("@")) return;
    setBusy(true);
    const res = await lockEntry(email, day, picks, races);
    if (optIn) subscribeNewsletter(email);
    setBusy(false);
    if (!res.ok) return;
    trackBoth("Lead", { email, content_name: "ascot_seven_entry" });
    if (optIn) trackBoth("CompleteRegistration", { email, content_name: "newsletter" });
    setVerified(res.verified);
    setMyName(res.name || "");
    setLocked(true);
    setStep("done");
  }

  const shareText = useMemo(() => {
    if (!settled) {
      // Before any race runs — a challenge, not a 0/7 score.
      return `I've locked my 7 for Royal Ascot 🏇\nGoing for the £500 on The Ascot Seven by Horse Racing Oracle.\nThink you can beat me? Free to play 👇\nhttps://hurdlegame.app/ascot`;
    }
    const grid = races.map((r) => {
      const pts = pickPoints(results[r.id], picks[r.id]);
      return pts === 5 ? "🟩" : pts > 0 ? "🟨" : "⬛";
    }).join("");
    const napLine = napStarted && napName ? `\n🤖 HRO's NAP: ${napWon ? "✅ landed" : "❌ no joy"}` : "";
    return `THE ASCOT SEVEN 🏇 ${youPoints} pts\n${grid}${napLine}\n\n🟩 win · 🟨 placed · Free, top 3 split £500 → https://hurdlegame.app/ascot`;
  }, [settled, races, results, picks, youPoints, napStarted, napName, napWon]);
  const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  async function copyShare() {
    if (navigator.share) {
      try { await navigator.share({ title: "The Ascot Seven", text: shareText, url: "https://hurdlegame.app/ascot" }); return; } catch { /* cancelled or unsupported */ }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true); setTimeout(() => setCopied(false), 1600);
    } catch {
      // last resort: select-and-copy via a temp textarea
      const ta = document.createElement("textarea");
      ta.value = shareText; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* noop */ }
      ta.remove();
    }
  }

  const pct = step === "intro" ? 0 : step === "email" || step === "done" ? 100 : Math.round(((step + 1) / (openRaces.length + 1)) * 100);

  return (
    <div className="afn">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .afn{--bg:#0a221b;--bg2:#0e2c23;--card:#13362b;--cream:#f4ecd8;--gold:#f2b705;--green:#22c08a;--magenta:#d6336c;--line:rgba(244,236,216,.12);
          font-family:'Inter',system-ui,sans-serif;color:var(--cream);min-height:100svh;box-sizing:border-box;
          background:radial-gradient(130% 80% at 50% -20%,var(--bg2),var(--bg));display:flex;flex-direction:column;}
        .afn *{box-sizing:border-box;}
        .afn button{font-family:inherit;}
        .bar{height:5px;background:rgba(244,236,216,.1);}
        .bar i{display:block;height:100%;background:var(--gold);transition:width .4s cubic-bezier(.4,0,.2,1);}
        .nav{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;max-width:480px;margin:0 auto;width:100%;}
        .brand{font-family:'Oswald';font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-size:16px;}
        .brand b{color:var(--gold);}
        .nlink{background:none;border:0;color:var(--cream);opacity:.6;font-size:12px;cursor:pointer;text-transform:uppercase;letter-spacing:.05em;}
        .stage{flex:1;display:flex;flex-direction:column;justify-content:flex-start;max-width:480px;margin:0 auto;width:100%;padding:18px 18px 36px;}
        .screen{animation:rise .35s cubic-bezier(.2,.7,.3,1);}
        @keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        .kick{font-family:'Oswald';text-transform:uppercase;letter-spacing:.14em;font-size:11px;color:var(--gold);margin:0 0 14px;}
        .huge{font-family:'Oswald';font-weight:700;font-size:64px;line-height:.92;margin:0;letter-spacing:-.01em;}
        .huge .u{color:var(--gold);}
        .h1{font-family:'Oswald';font-weight:700;font-size:30px;line-height:1.05;margin:0 0 8px;letter-spacing:.01em;}
        .lead{font-size:15px;line-height:1.5;opacity:.82;margin:0 0 22px;}
        .lead b{color:var(--gold);}
        .stats{display:flex;gap:10px;margin:22px 0 14px;}
        .todayprize{text-align:center;background:rgba(242,183,5,.12);border:1px solid rgba(242,183,5,.35);border-radius:11px;padding:11px;margin:0 0 18px;font-size:13.5px;}
        .todayprize b{color:var(--gold);font-family:'Oswald';font-size:16px;}
        .stats div{flex:1;text-align:center;background:rgba(244,236,216,.04);border:1px solid var(--line);border-radius:12px;padding:13px 6px;}
        .stats b{display:block;font-family:'Oswald';font-size:24px;color:var(--gold);line-height:1;}
        .stats span{display:block;font-size:9.5px;text-transform:uppercase;letter-spacing:.06em;opacity:.6;margin-top:5px;}
        .cta{width:100%;font-family:'Oswald';font-weight:600;text-transform:uppercase;letter-spacing:.06em;font-size:16px;
          background:var(--gold);color:#1a1400;border:0;border-radius:14px;padding:17px;cursor:pointer;transition:transform .1s,filter .15s;}
        .cta:active{transform:scale(.985);}
        .cta:disabled{opacity:.35;cursor:not-allowed;}
        .ghost{background:none;border:0;color:var(--cream);opacity:.6;font-size:13px;cursor:pointer;padding:12px;width:100%;margin-top:6px;}
        .trust{font-size:11px;opacity:.5;text-align:center;margin:16px 0 0;line-height:1.5;}
        .lockline{text-align:center;font-size:12px;color:var(--gold);margin:10px 0 0;font-family:'Oswald';letter-spacing:.03em;}
        .social{display:flex;align-items:center;justify-content:center;gap:7px;font-size:12.5px;opacity:.85;margin:0 0 11px;}
        .social .dot{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 0 3px rgba(34,192,138,.2);}
        .sec{border-top:1px solid var(--line);margin-top:36px;padding-top:28px;}
        .sech{font-family:'Oswald';font-weight:600;text-transform:uppercase;letter-spacing:.05em;font-size:15px;margin:0 0 10px;}
        .secp{font-size:14px;line-height:1.55;opacity:.85;margin:0 0 14px;}
        .secp b{color:var(--gold);}
        .soon{font-family:'Inter';font-size:9.5px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;background:rgba(242,183,5,.16);color:var(--gold);padding:2px 7px;border-radius:10px;vertical-align:middle;margin-left:6px;}
        .steps{margin:0;padding:0;list-style:none;counter-reset:s;}
        .steps li{counter-increment:s;position:relative;padding:0 0 12px 34px;font-size:14px;line-height:1.5;opacity:.9;}
        .steps li:before{content:counter(s);position:absolute;left:0;top:-1px;width:24px;height:24px;border-radius:8px;background:var(--gold);color:#1a1400;font-family:'Oswald';font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;}
        .steps li b{color:var(--cream);}
        .sec.hro{background:rgba(214,51,108,.06);border:1px solid rgba(214,51,108,.25);border-radius:14px;padding:18px;margin-top:36px;}
        .sec.hro .cta{display:block;text-align:center;text-decoration:none;}
        .qhead{display:flex;align-items:baseline;justify-content:space-between;margin:0 0 4px;}
        .qno{font-family:'Oswald';color:var(--gold);font-size:13px;letter-spacing:.05em;}
        .qtime{font-family:'Oswald';font-size:13px;opacity:.6;}
        .qname{font-family:'Oswald';font-weight:700;font-size:26px;line-height:1.08;margin:0 0 18px;}
        .opts{display:flex;flex-direction:column;gap:9px;max-height:58vh;overflow:auto;padding:2px;}
        .opt{display:flex;align-items:center;gap:12px;text-align:left;background:var(--card);border:1.5px solid var(--line);border-radius:13px;
          padding:15px 16px;font-size:16px;font-weight:500;color:var(--cream);cursor:pointer;transition:border-color .12s,background .12s,transform .08s;}
        .opt:active{transform:scale(.99);}
        .opt:hover{border-color:rgba(242,183,5,.5);}
        .opt.on{background:var(--gold);color:#1a1400;border-color:var(--gold);font-weight:700;}
        .opt .dot{flex:0 0 22px;height:22px;border-radius:50%;border:2px solid rgba(244,236,216,.25);background:transparent;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;}
        .opt.on .dot{border-color:#1a1400;background:#1a1400;color:var(--gold);}
        .rowbtns{display:flex;gap:10px;margin-top:16px;}
        .rowbtns .b{flex:1;background:rgba(244,236,216,.06);border:1px solid var(--line);color:var(--cream);border-radius:12px;padding:13px;font-size:13px;cursor:pointer;
          font-family:'Oswald';text-transform:uppercase;letter-spacing:.05em;}
        .field{width:100%;padding:16px;border-radius:13px;border:1.5px solid var(--line);background:rgba(244,236,216,.04);color:var(--cream);font-size:16px;margin-bottom:12px;}
        .field::placeholder{color:rgba(244,236,216,.4);}
        .field:focus{outline:none;border-color:var(--gold);}
        .check{display:flex;gap:11px;align-items:flex-start;font-size:12.5px;opacity:.8;line-height:1.45;cursor:pointer;margin-bottom:18px;}
        .check input{width:20px;height:20px;flex:0 0 auto;accent-color:var(--gold);margin:0;cursor:pointer;}
        .tick{width:64px;height:64px;border-radius:50%;background:rgba(34,192,138,.15);border:2px solid var(--green);display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 0 18px;}
        .confirm{background:rgba(242,183,5,.1);border:1px solid rgba(242,183,5,.3);border-radius:12px;padding:13px;font-size:13px;line-height:1.45;margin:0 0 4px;}
        .confirm b{color:var(--gold);}
        .sharelab{font-family:'Oswald';text-transform:uppercase;letter-spacing:.08em;font-size:11px;opacity:.6;margin:22px 0 9px;}
        .sharerow{display:flex;gap:8px;}
        .sbtn{flex:1;text-align:center;text-decoration:none;font-family:'Oswald';font-weight:600;text-transform:uppercase;letter-spacing:.04em;font-size:13px;
          border-radius:12px;padding:14px 6px;cursor:pointer;border:1px solid var(--line);color:#fff;}
        .sbtn.wa{background:#1faf54;border-color:#1faf54;color:#fff;}
        .sbtn.x{background:#111;border-color:#111;color:#fff;}
        .sbtn.cp{background:rgba(244,236,216,.06);color:var(--cream);}
        .upsell{background:rgba(214,51,108,.08);border:1px solid rgba(214,51,108,.3);border-radius:14px;padding:16px;margin:18px 0 6px;}
        .upsell .ut{font-family:'Oswald';font-size:18px;margin:0 0 6px;}
        .upsell .ut b{color:var(--magenta);}
        .upsell .ud{font-size:12.5px;opacity:.8;line-height:1.45;margin:0 0 13px;}
        .upsell .cta{display:block;text-align:center;text-decoration:none;}
        .board{background:rgba(244,236,216,.04);border:1px solid var(--line);border-radius:14px;padding:16px;margin-top:18px;}
        .board h3{font-family:'Oswald';text-transform:uppercase;font-size:13px;letter-spacing:.06em;margin:0 0 3px;}
        .board .note{font-size:11.5px;opacity:.6;margin:0 0 12px;}
        .lr{display:flex;justify-content:space-between;font-size:14px;padding:9px 0;border-bottom:1px solid var(--line);}
        .lr:last-child{border:0;}
        .lr.top span:first-child{color:var(--gold);font-weight:600;}
        .lr.mine{background:rgba(242,183,5,.1);margin:0 -8px;padding-left:8px;padding-right:8px;border-radius:8px;}
        .lr.mine span{color:var(--gold);font-weight:700;}
        .youare{font-size:13px;opacity:.9;margin:-6px 0 14px;}
        .youare b{color:var(--gold);}
        .foot{text-align:center;font-size:10.5px;opacity:.45;padding:18px;line-height:1.6;max-width:480px;margin:0 auto;}
        .foot a{color:inherit;}
        @media(max-width:380px){.huge{font-size:52px}.qname{font-size:23px}}
      `}</style>

      <div className="bar"><i style={{ width: `${pct}%` }} /></div>
      <div className="nav">
        <span className="brand" onClick={() => setStep("intro")} style={{ cursor: "pointer" }}>The Ascot <b>Seven</b></span>
        {!locked && <button className="nlink" onClick={() => { setShowBoard(true); setStep("done"); }}>Leaderboard</button>}
      </div>

      <div className="stage">
        {/* NO LIVE GAME — festival over / between games */}
        {noGame && (
          <div className="screen">
            <p className="kick">Royal Ascot 2026 · Finished</p>
            <h1 className="huge">That's a <span className="u">wrap</span>.</h1>
            <p className="lead" style={{ marginTop: 16 }}>The Ascot Seven festival is done and the £500 winners have been announced. Our next free prediction game is coming soon — drop your email and you'll be first to know.</p>
            {!overMsg ? (
              <>
                <input className="field" type="email" inputMode="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                <label className="check"><input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} /><span>Also send me Horse Racing Oracle's free daily NAP. Unsubscribe anytime.</span></label>
                <button className="cta" disabled={!email.includes("@")} onClick={notify}>Notify me about the next game</button>
              </>
            ) : <p className="lead" style={{ color: "var(--gold)" }}>{overMsg}</p>}
            <Link className="cta" to="/" style={{ display: "block", textAlign: "center", textDecoration: "none", background: "rgba(244,236,216,.1)", color: "var(--cream)", marginTop: 10 }}>Play Hurdle, the daily racing word game →</Link>
            <div className="sec hro" style={{ marginTop: 28 }}>
              <p className="sech">Want winners every day?</p>
              <p className="secp"><b>1,800+ players</b> get Horse Racing Oracle's free daily NAP — 71% win, 89% place.</p>
              <a className="cta" href="https://horseracingoracleai.com/" target="_blank" rel="noopener">Get today's free pick →</a>
            </div>
            {board.length > 0 && <div style={{ marginTop: 22 }}><BoardList board={board} /></div>}
            <p className="trust" style={{ marginTop: 18 }}>18+ · Free to enter, no purchase necessary · Not a betting product</p>
          </div>
        )}
        {/* INTRO */}
        {!noGame && step === "intro" && (
          <div className="screen">
            <p className="kick">Royal Ascot · 16–20 June · Free to play</p>
            <h1 className="huge">Can you call all<br /><span className="u">seven</span> races?</h1>
            <p className="lead" style={{ marginTop: 16 }}>The free Royal Ascot prediction game. Pick the winner of all 7 races and prove you're the sharpest tipster in your group. No betting — just bragging rights.</p>
            <div className="stats">
              <div><b>7</b><span>Races a day</span></div>
              <div><b>Leagues</b><span>Beat your mates</span></div>
              <div><b>Free</b><span>To play</span></div>
            </div>
            <p className="todayprize">🏆 Today only: <b>£50</b> to the day's top scorer</p>
            {racingOver ? (
              <>
                <p className="lead">Today's racing has finished. Drop your email and we'll send you tomorrow's card and the daily NAP.</p>
                <button className="cta" onClick={() => setStep("email")}>Get tomorrow's card →</button>
              </>
            ) : (
              <>
                {playerCount >= 10 && <p className="social"><span className="dot" />{Math.floor(playerCount / 10) * 10}+ players already picking</p>}
                <button className="cta" onClick={() => setStep(0)}>Start picking →</button>
                {firstLock && <p className="lockline">Today's card locks at {firstLock}</p>}
              </>
            )}
            <p className="trust">18+ · Free to enter, no purchase necessary · Not a betting product</p>

            <div className="sec">
              <p className="sech">How it works</p>
              <ol className="steps">
                <li><b>Pick your winners</b> — one tap per race. Lock in before the off.</li>
                <li><b>Score by how right you were</b> — nail the winner for 5, nearly there for 3, close for 1.</li>
                <li><b>Climb the board</b> — top the festival leaderboard, all week.</li>
              </ol>
            </div>
            <div className="sec">
              <p className="sech">Top the board, win real cash</p>
              <p className="secp">Points build all week. The top 3 over the festival split <b>£500</b> — £250 / £150 / £100. Free to enter, no purchase necessary.</p>
            </div>
            <div className="sec">
              <p className="sech">Play with your mates <span className="soon">soon</span></p>
              <p className="secp">Private leagues are coming — create one, share the code, and settle who actually knows their racing. Lock your entry now to be first in line.</p>
            </div>
            <div className="sec hro">
              <p className="sech">Want the inside track?</p>
              <p className="secp">Each morning, Horse Racing Oracle publishes its NAP of the day — its single strongest pick of the card, with the form study behind it. <b>1,800+ players</b> already get it. Get tomorrow's NAP before it runs.</p>
              <a className="cta" href="https://horseracingoracleai.com/" target="_blank" rel="noopener">Start your £1.99 trial →</a>
            </div>
            {!racingOver && <button className="cta" style={{ marginTop: 28 }} onClick={() => setStep(0)}>Start picking →</button>}
          </div>
        )}

        {/* RACE STEPS */}
        {typeof step === "number" && openRaces[step] && (() => {
          const r = openRaces[step];
          const overall = races.findIndex((x) => x.id === r.id) + 1;
          return (
            <div className="screen" key={r.id}>
              <div className="qhead">
                <span className="qno">Race {overall} of {races.length}</span>
                <span className="qtime">{r.time}</span>
              </div>
              <h2 className="qname">{r.name}</h2>
              <div className="opts">
                {r.runners.map((run, i) => (
                  <button key={run.id} className={`opt ${picks[r.id] === run.id ? "on" : ""}`} onClick={() => pick(r.id, run.id, step)}>
                    <span className="dot">{picks[r.id] === run.id ? "✓" : ""}</span>{run.name}
                  </button>
                ))}
              </div>
              <div className="rowbtns">
                <button className="b" onClick={() => back(step)}>← Back</button>
                <button className="b" onClick={() => advance(step)}>Skip →</button>
              </div>
            </div>
          );
        })()}

        {/* EMAIL */}
        {step === "email" && (
          <div className="screen">
            <p className="kick">{made > 0 ? `${made} pick${made > 1 ? "s" : ""} locked` : "Almost there"}</p>
            <h2 className="h1">Where do we send your leaderboard spot?</h2>
            <p className="lead">Enter your email to lock your picks and join the festival board. Winners are contacted by email, so use a real one.</p>
            <input className="field" type="email" inputMode="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <label className="check">
              <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} />
              <span>Send me Horse Racing Oracle's <b>free daily NAP</b> (71% win, 89% place) + updates. Optional, confirm by email, unsubscribe anytime.</span>
            </label>
            <button className="cta" disabled={busy || !email.includes("@")} onClick={submit}>{busy ? "Locking..." : "Lock my entry"}</button>
            <button className="ghost" onClick={() => setStep(racingOver ? "intro" : openRaces.length - 1)}>← Back</button>
            <p className="trust">Free to enter, no purchase necessary. We never sell your email.</p>
          </div>
        )}

        {/* DONE / RESULTS / BOARD */}
        {step === "done" && (
          <div className="screen">
            {locked && (
              <>
                <div className="tick">✓</div>
                <h2 className="h1">You're in.</h2>
                {myName && <p className="youare">You're on the board as <b>{myName}</b></p>}
                <p className="lead">
                  {made} pick{made !== 1 ? "s" : ""} locked for today.{" "}
                  {settled ? `You've scored ${youPoints} point${youPoints !== 1 ? "s" : ""} so far.` : "Your picks score on how right your call was — 5 for nailing it, 3 for nearly, 1 for close."}
                </p>
                {!verified && (
                  <p className="confirm">📧 Check your email and tap the link to <b>confirm your entry</b> — only confirmed players are eligible for the £500.</p>
                )}
                {napStarted && napName && (
                  <p className="lead" style={{ color: "var(--cream)" }}>🤖 Today's HRO <b>NAP</b> was <b>{napName}</b> — it {napWon ? "landed ✅" : "didn't land ❌"}.</p>
                )}

                <p className="sharelab">{settled ? "Share your result" : "Challenge your mates"}</p>
                <div className="sharerow">
                  <a className="sbtn wa" href={waUrl} target="_blank" rel="noopener">WhatsApp</a>
                  <a className="sbtn x" href={xUrl} target="_blank" rel="noopener">X / Twitter</a>
                  <button className="sbtn cp" onClick={copyShare}>{copied ? "Copied ✓" : "Copy"}</button>
                </div>

                <div className="upsell">
                  <p className="ut">Want a <b>winner every day</b>?</p>
                  <p className="ud"><b>1,800+ players</b> already get Horse Racing Oracle's free daily pick — 71% win, 89% place. Premium tips come with a 14-day money-back guarantee: no winning tip in 14 days, your money back.</p>
                  <a className="cta" href="https://horseracingoracleai.com/" target="_blank" rel="noopener">Get today's free pick →</a>
                </div>

                <button className="ghost" onClick={() => setShowBoard((s) => !s)}>{showBoard ? "Hide leaderboard" : "View leaderboard"}</button>
              </>
            )}
            {!locked && (
              <>
                <h2 className="h1">Royal Ascot leaderboard</h2>
                <p className="lead">Top 3 over the festival split <b>£500</b> — £250 / £150 / £100.</p>
                <button className="cta" onClick={() => setStep("intro")}>Play today's card →</button>
                <div style={{ height: 8 }} />
                <BoardList board={board} />
              </>
            )}
            {locked && showBoard && <div style={{ marginTop: 16 }}><BoardList board={board} me={myName} you={settled ? youPoints : null} /></div>}
          </div>
        )}
      </div>

      <div className="foot">
        The Ascot Seven — a Hurdle game, powered by <a href="https://horseracingoracleai.com/" target="_blank" rel="noopener">Horse Racing Oracle</a><br />
        18+ · Free to enter, no purchase necessary · GB · Not a betting product · <Link to="/terms">Prize terms</Link> · <Link to="/privacy">Privacy</Link><br />
        If gambling affects you, support is available at <a href="https://www.begambleaware.org">BeGambleAware.org</a><br />
        © 2026 Hurdle
      </div>
    </div>
  );
}

function BoardList({ board, you, me }) {
  const onBoard = me && board.some((r) => r.name === me);
  return (
    <div className="board">
      <h3>🏆 Festival leaderboard</h3>
      <p className="note">Top 3 split £500 — £250 / £150 / £100.</p>
      {board.length === 0 && <p className="note">No scores yet. Be the first on the board.</p>}
      {board.map((row, i) => (
        <div className={`lr ${i < 3 ? "top" : ""} ${row.name === me ? "mine" : ""}`} key={(row.name || "p") + i}>
          <span>{i < 3 ? "🏆 " : ""}{i + 1}. {row.name}{row.name === me ? " (you)" : ""}</span><span>{row.points}</span>
        </div>
      ))}
      {you != null && !onBoard && <div className="lr mine"><span>— You{me ? ` (${me})` : ""}</span><span>{you}</span></div>}
    </div>
  );
}
