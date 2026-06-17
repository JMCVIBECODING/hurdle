import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { hasSupabase } from "./lib/supabase";
import { loadCard, loadResults, loadBoard, lockEntry, subscribeNewsletter } from "./lib/api";
import { SAMPLE_RACES, SAMPLE_NAP, SEED_BOARD } from "./lib/sampleCard";
import { todayDay, hasStarted } from "./lib/festival";

// Cosmetic day-streak (not part of scoring, so localStorage is fine here).
function bumpStreak() {
  try {
    const today = todayDay();
    const raw = JSON.parse(localStorage.getItem("a7_streak") || "null");
    if (raw && raw.day === today) return raw.count;
    const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    const count = raw && raw.day === y ? raw.count + 1 : 1;
    localStorage.setItem("a7_streak", JSON.stringify({ day: today, count }));
    return count;
  } catch { return 1; }
}
function readStreak() {
  try { return JSON.parse(localStorage.getItem("a7_streak") || "null")?.count || 1; }
  catch { return 1; }
}

export default function Game() {
  const day = todayDay();
  const [races, setRaces] = useState(SAMPLE_RACES);
  const [nap, setNap] = useState(SAMPLE_NAP);
  const [picks, setPicks] = useState({});
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lockMsg, setLockMsg] = useState("");
  const [results, setResults] = useState({});
  const [demo, setDemo] = useState(false); // local-mode demo reveal
  const [streak, setStreak] = useState(readStreak());
  const [copied, setCopied] = useState(false);
  // Live board comes from Supabase; the demo seed only shows in local mode.
  const [board, setBoard] = useState(hasSupabase ? [] : SEED_BOARD);
  const [now, setNow] = useState(new Date());
  const [joinEmail, setJoinEmail] = useState("");
  const [joinMsg, setJoinMsg] = useState("");
  const [joining, setJoining] = useState(false);

  // Tick every 30s so races lock at their off time without a refresh.
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!hasSupabase) return;
    loadCard(day).then((c) => {
      if (c && c.races?.length) { setRaces(c.races); setNap(c.nap); }
    });
    loadResults(day).then(setResults);
    loadBoard().then((b) => { if (b) setBoard(b); });
  }, [day]);

  const napRace = races.find((r) => r.id === nap.raceId);
  const napName = napRace?.runners.find((r) => r.id === nap.runnerId)?.name;
  const napStarted = demo || (napRace ? hasStarted(day, napRace.time, now) : false);
  const settled = demo || Object.keys(results).length > 0;
  const napSettled = Boolean(results[nap.raceId]);

  const made = Object.keys(picks).length;

  function choose(raceId, runnerId) {
    const race = races.find((r) => r.id === raceId);
    if (locked || (race && hasStarted(day, race.time, now))) return;
    setPicks((p) => ({ ...p, [raceId]: runnerId }));
  }

  async function lock() {
    if (made < 1 || !email.includes("@")) return;
    setLockMsg("Locking...");
    const res = await lockEntry(email, day, picks, races);
    if (!res.ok) { setLockMsg("Could not save, try again."); return; }
    if (optIn) subscribeNewsletter(email);
    setLocked(true);
    setStreak(bumpStreak());
    setLockMsg(
      res.offline
        ? "Locked in (local demo, no email saved)."
        : res.stored
          ? "Locked in. Your picks are saved."
          : "All of today's races have started, nothing left to lock."
    );
  }

  // Local-mode only: fabricate a result so the win state can be demoed.
  function revealDemo() {
    const res = {};
    races.forEach((r) => { res[r.id] = r.runners[Math.floor(Math.random() * r.runners.length)].id; });
    setResults(res); setDemo(true);
  }

  const settledRaces = races.filter((r) => results[r.id]);
  const youHits = races.filter((r) => results[r.id] && picks[r.id] === results[r.id]).length;
  const napWon = napSettled ? results[nap.raceId] === nap.runnerId : false;
  const backedNap = picks[nap.raceId] === nap.runnerId;

  const shareText = useMemo(() => {
    if (!settled) return "";
    const grid = races.map((r) => (results[r.id] && picks[r.id] === results[r.id]) ? "🟩" : "⬛").join("");
    return `THE ASCOT SEVEN 🏇\nMe ${youHits}/7\n${grid}\n🤖 HRO's NAP: ${napWon ? "✅ landed" : napSettled ? "❌ no joy" : "running"}\n${streak}🔥 streak · play → hurdlegame.app`;
  }, [settled, races, results, picks, youHits, napWon, napSettled, streak]);

  function copyShare() {
    navigator.clipboard?.writeText(shareText).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); });
  }

  async function joinNewsletter() {
    if (!joinEmail.includes("@")) return;
    setJoining(true);
    await subscribeNewsletter(joinEmail);
    setJoining(false);
    setJoinEmail("");
    setJoinMsg("Check your inbox and click the link to confirm. See you on the board.");
  }

  // Scroll the racecard into view from the hero CTA.
  function scrollToCard() {
    document.getElementById("card")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        .root{--field:#0c2a22;--field2:#0f3329;--card:#f4ecd8;--ink:#16201b;--gold:#f2b705;--magenta:#d6336c;--hit:#2f9e5c;--line:rgba(244,236,216,.14);
          font-family:'Inter',system-ui,sans-serif;color:var(--card);min-height:100%;box-sizing:border-box;
          background:radial-gradient(120% 90% at 50% -10%,var(--field2),var(--field));padding:16px 13px 30px;}
        .root *{box-sizing:border-box;}
        .wrap{max-width:440px;margin:0 auto;}
        .checker{height:7px;border-radius:4px;margin-bottom:13px;background:repeating-linear-gradient(90deg,#0a0a0a 0 13px,var(--card) 13px 26px);opacity:.85;}
        .top{display:flex;align-items:center;justify-content:space-between;}
        .title{font-family:'Oswald';font-weight:700;letter-spacing:.05em;font-size:25px;text-transform:uppercase;margin:0;line-height:1;}
        .title b{color:var(--gold);}
        .pill{font-family:'Oswald';font-size:12px;letter-spacing:.04em;background:rgba(242,183,5,.16);color:var(--gold);padding:5px 9px;border-radius:20px;}
        .sub{font-size:12px;opacity:.72;margin:7px 0 15px;line-height:1.4;}
        .sub b{color:var(--gold);}
        .hero{background:linear-gradient(135deg,#11362a,#0c2a22);border:1px solid var(--line);border-radius:14px;padding:16px;margin-bottom:14px;}
        .herostats{display:flex;gap:8px;margin-bottom:13px;}
        .herostats div{flex:1;text-align:center;background:rgba(244,236,216,.05);border:1px solid var(--line);border-radius:10px;padding:9px 4px;}
        .herostats b{display:block;font-family:'Oswald';font-size:21px;color:var(--gold);line-height:1;}
        .herostats span{display:block;font-size:9.5px;text-transform:uppercase;letter-spacing:.05em;opacity:.6;margin-top:4px;}
        .herolead{font-size:13px;line-height:1.45;margin:0 0 10px;}
        .herolead b{color:var(--gold);}
        .herofine{font-size:10.5px;opacity:.6;margin:8px 0 0;line-height:1.4;}
        .herabtn{width:100%;margin-top:12px;}
        .race{background:rgba(244,236,216,.05);border:1px solid var(--line);border-radius:13px;padding:12px;margin-bottom:9px;}
        .race.off{opacity:.7;}
        .rhead{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:9px;}
        .rhead .nm{font-family:'Oswald';font-weight:600;font-size:14px;}
        .rhead .tm{font-family:'Oswald';color:var(--gold);font-size:13px;}
        .rhead .tm.shut{color:var(--card);opacity:.5;}
        .runners{display:flex;flex-wrap:wrap;gap:6px;}
        .chip{border:1.5px solid var(--line);background:rgba(244,236,216,.04);color:var(--card);border-radius:9px;padding:8px 11px;font-size:13px;font-weight:500;cursor:pointer;}
        .chip.sel{background:var(--gold);color:#1a1400;border-color:var(--gold);font-weight:600;}
        .chip.win{outline:2px solid var(--hit);}
        .chip:disabled{cursor:not-allowed;}
        .race.off .chip:not(.sel):not(.win){opacity:.45;}
        .race.off .chip.win{opacity:1;}
        .chip .nb{font-size:10px;color:var(--magenta);font-weight:700;margin-left:5px;}
        .gate{background:#16201b;border-radius:13px;padding:15px;margin:13px 0;}
        .gate p{margin:0 0 9px;font-size:12.5px;opacity:.85;line-height:1.4;}
        .ctaRow{display:flex;gap:7px;flex-wrap:wrap;}
        .gate input{flex:1;min-width:150px;padding:11px 13px;border-radius:9px;border:0;font-size:13px;}
        .optin{display:flex;gap:8px;align-items:flex-start;margin-top:10px;font-size:11.5px;opacity:.8;line-height:1.4;cursor:pointer;}
        .optin input{flex:0 0 auto;width:16px;height:16px;margin:1px 0 0;min-width:0;accent-color:var(--gold);cursor:pointer;}
        .btn{font-family:'Oswald';font-weight:600;text-transform:uppercase;letter-spacing:.05em;border:0;border-radius:10px;padding:12px 17px;font-size:13px;cursor:pointer;}
        .btn-gold{background:var(--gold);color:#1a1400;}
        .btn-gold:disabled{opacity:.4;cursor:not-allowed;}
        .btn-ghost{background:rgba(244,236,216,.1);color:var(--card);}
        .panel{background:rgba(244,236,216,.05);border:1px solid var(--line);border-radius:13px;padding:14px;margin-bottom:10px;}
        .panel h3{font-family:'Oswald';text-transform:uppercase;font-size:13px;letter-spacing:.06em;margin:0 0 4px;opacity:.85;}
        .lbnote{font-size:12px;opacity:.7;margin:0 0 10px;}
        .lbnote b{color:var(--gold);}
        .lbrow{display:flex;justify-content:space-between;font-size:13px;padding:6px 0;border-bottom:1px solid var(--line);}
        .lbrow:last-child{border-bottom:0;}
        .lbrow.prize span{color:var(--gold);font-weight:600;}
        .lbrow .you{color:var(--gold);font-weight:600;}
        .result{background:var(--card);color:var(--ink);border-radius:16px;padding:18px;margin-bottom:11px;box-shadow:0 18px 44px rgba(0,0,0,.32);}
        .scoreline{text-align:center;margin-bottom:10px;}
        .scoreline .big{font-family:'Oswald';font-weight:700;font-size:34px;line-height:1;}
        .scoreline small{font-size:11px;text-transform:uppercase;letter-spacing:.05em;opacity:.6;display:block;margin-top:3px;}
        .napbox{background:rgba(214,51,108,.08);border:1px solid rgba(214,51,108,.3);border-radius:11px;padding:12px;margin-bottom:12px;font-size:13px;line-height:1.45;}
        .napbox b{color:var(--magenta);}
        .funnel{background:linear-gradient(135deg,#11362a,#0c2a22);border-radius:12px;padding:14px;color:var(--card);}
        .funnel p{margin:0 0 10px;font-size:13px;line-height:1.45;}
        .funnel p b{color:var(--gold);}
        .foot{text-align:center;font-size:10.5px;opacity:.5;margin-top:16px;line-height:1.6;}
        .foot a{color:inherit;}
      `}</style>

      <div className="wrap">
        <div className="checker" />
        <div className="top">
          <h1 className="title">The Ascot <b>Seven</b></h1>
          <span className="pill">{streak}🔥</span>
        </div>
        <p className="sub">Pick the winner of as many of today's <b>7 races</b> as you like — every pick is a shot at points. Climb the <b>Royal Ascot leaderboard</b>; top 3 over the festival split <b>£500</b>. One runner is HRO's <b>AI-verified NAP</b>, revealed after racing. No betting. Just bragging rights.</p>

        <div className="hero">
          <div className="herostats">
            <div><b>£500</b><span>Prize pool</span></div>
            <div><b>7</b><span>Races a day</span></div>
            <div><b>Free</b><span>To enter</span></div>
          </div>
          {!joinMsg ? (
            <>
              <p className="herolead">Get the daily <b>NAP</b> and your spot on the leaderboard. One email a day, festival week only.</p>
              <div className="ctaRow">
                <input placeholder="you@email.com" value={joinEmail} onChange={(e) => setJoinEmail(e.target.value)} />
                <button className="btn btn-gold" disabled={joining || !joinEmail.includes("@")} onClick={joinNewsletter}>{joining ? "..." : "Get the daily NAP"}</button>
              </div>
              <p className="herofine">Free. Confirm by clicking the link we email you. Unsubscribe anytime. No betting.</p>
            </>
          ) : (
            <p className="herolead" style={{ margin: 0 }}>{joinMsg}</p>
          )}
          <button className="btn btn-ghost herabtn" onClick={scrollToCard}>Play today's card ↓</button>
        </div>

        <div id="card" />
        {races.map((r, i) => {
          const off = hasStarted(day, r.time, now);
          const showNapBadge = r.id === nap.raceId && napStarted;
          return (
            <div className={`race ${off ? "off" : ""}`} key={r.id}>
              <div className="rhead">
                <span className="nm">{i + 1}. {r.name}</span>
                <span className={`tm ${off ? "shut" : ""}`}>{off ? "OFF" : r.time}</span>
              </div>
              <div className="runners">
                {r.runners.map((run) => {
                  const sel = picks[r.id] === run.id;
                  const isWin = results[r.id] === run.id;
                  const isNap = showNapBadge && run.id === nap.runnerId;
                  return (
                    <button
                      key={run.id}
                      className={`chip ${sel ? "sel" : ""} ${isWin ? "win" : ""}`}
                      disabled={locked || off}
                      onClick={() => choose(r.id, run.id)}
                    >
                      {run.name}{isNap && <span className="nb">🤖 NAP</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {!locked && (
          <div className="gate">
            <p>{made}/7 picked — lock whenever you like; races you skip just don't score. Enter your email to join the festival leaderboard — <b>top 3 split £500</b> (free to enter, no purchase necessary).</p>
            <div className="ctaRow">
              <input placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button className="btn btn-gold" disabled={made < 1 || !email.includes("@")} onClick={lock}>Lock my picks</button>
            </div>
            <label className="optin">
              <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} />
              <span>Email me the daily NAP and updates. Optional, confirm by clicking the link we send. Unsubscribe anytime.</span>
            </label>
            {lockMsg && <p style={{ margin: "9px 0 0", color: "var(--gold)" }}>{lockMsg}</p>}
          </div>
        )}

        {locked && !settled && (
          <div className="gate">
            <p>{lockMsg || "Locked in."} Your picks score as each race runs, and the NAP is revealed after racing.</p>
            {!hasSupabase && <button className="btn btn-gold" onClick={revealDemo}>Reveal result (demo)</button>}
          </div>
        )}

        {settled && (
          <div className="result">
            <div className="scoreline"><div className="big">{youHits}/7</div><small>Winners found{settledRaces.length < races.length ? ` · ${settledRaces.length} of 7 settled` : ""}</small></div>
            {napStarted && (
              <div className="napbox">🤖 Today's HRO <b>NAP</b> was <b>{napName}</b> in the {napRace.time} — it <b>{napSettled ? (napWon ? "WON ✅" : "didn't land ❌") : "is running"}</b>. {backedNap ? "You were on it — nice." : "You didn't have it."}</div>
            )}
            <div className="funnel">
              <p>That NAP was published <b>before</b> the race, with the form behind it. Want <b>tomorrow's NAP before it runs</b>, every day of the festival?</p>
              <button className="btn btn-gold">Start £1.99 trial</button>
            </div>
          </div>
        )}

        {locked && (
          <div className="panel" style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <button className="btn btn-ghost" onClick={copyShare} disabled={!settled}>{copied ? "Copied!" : "Share my card 📲"}</button>
          </div>
        )}

        <div className="panel">
          <h3>🏆 Royal Ascot leaderboard</h3>
          <p className="lbnote">Top 3 over the festival split <b>£500</b> — £250 / £150 / £100.</p>
          {board.length === 0 && (
            <p className="lbnote" style={{ opacity: .85 }}>No scores yet. Lock your picks and be the first on the board.</p>
          )}
          {board.map((row, i) => (
            <div className={`lbrow ${i < 3 ? "prize" : ""}`} key={(row.name || "p") + i}>
              <span>{i < 3 ? "🏆 " : ""}{i + 1}. {row.name}</span><span>{row.points}</span>
            </div>
          ))}
          <div className="lbrow"><span className="you">{settled ? "— You" : "— You (lock to enter)"}</span><span className="you">{settled ? `${youHits}` : "—"}</span></div>
        </div>

        <div className="foot">
          {hasSupabase ? "Official racecard" : "Sample card · connect Supabase to go live"} · 18+ · Free game for entertainment, not a betting product · <Link to="/terms">Prize terms</Link><br />
          If gambling affects you, support is available at <a href="https://www.begambleaware.org">BeGambleAware.org</a>.
        </div>
      </div>
    </div>
  );
}
