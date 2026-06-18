import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { hasSupabase } from "./lib/supabase";
import { loadHurdle, subscribeNewsletter } from "./lib/api";
import { MAX_GUESSES, evaluate, keyStates, autoWord } from "./lib/hurdle";
import { todayDay } from "./lib/festival";
import { trackBoth } from "./lib/analytics";

const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

export default function Hurdle() {
  const day = todayDay();
  const [word, setWord] = useState(() => autoWord(todayDay()));
  const answer = (word.answer || "").toUpperCase();
  const len = answer.length;

  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState("");
  const [status, setStatus] = useState("playing"); // playing | won | lost
  const [shake, setShake] = useState(false);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [joinMsg, setJoinMsg] = useState("");
  const [clueShown, setClueShown] = useState(false);
  const [how, setHow] = useState(false);

  // Load today's word + restore any in-progress game for this day.
  useEffect(() => {
    let live = true;
    (async () => {
      const w = hasSupabase ? await loadHurdle(day) : null;
      const chosen = w && w.answer ? w : autoWord(day);
      if (!live) return;
      setWord(chosen);
      try {
        const saved = JSON.parse(localStorage.getItem(`hurdle_${day}`) || "null");
        if (saved && saved.answer === chosen.answer.toUpperCase()) {
          setGuesses(saved.guesses || []);
          setStatus(saved.status || "playing");
        }
      } catch { /* ignore */ }
    })();
    return () => { live = false; };
  }, [day]);

  const persist = useCallback((g, s) => {
    try { localStorage.setItem(`hurdle_${day}`, JSON.stringify({ answer, guesses: g, status: s })); } catch { /* ignore */ }
  }, [day, answer]);

  const submit = useCallback(() => {
    if (status !== "playing") return;
    if (current.length !== len) { setShake(true); setTimeout(() => setShake(false), 420); return; }
    const g = [...guesses, current];
    const won = current === answer;
    const s = won ? "won" : g.length >= MAX_GUESSES ? "lost" : "playing";
    setGuesses(g); setCurrent(""); setStatus(s); persist(g, s);
    if (s !== "playing") trackBoth("ViewContent", { content_name: won ? "hurdle_won" : "hurdle_lost" });
  }, [status, current, len, guesses, answer, persist]);

  const onKey = useCallback((k) => {
    if (status !== "playing") return;
    if (k === "ENTER") return submit();
    if (k === "DEL") return setCurrent((c) => c.slice(0, -1));
    if (/^[A-Z]$/.test(k)) setCurrent((c) => (c.length < len ? c + k : c));
  }, [status, submit, len]);

  useEffect(() => {
    const h = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key === "Backspace" ? "DEL" : e.key === "Enter" ? "ENTER" : e.key.toUpperCase();
      if (k === "ENTER" || k === "DEL" || /^[A-Z]$/.test(k)) { e.preventDefault(); onKey(k); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onKey]);

  const kbd = useMemo(() => keyStates(guesses, answer), [guesses, answer]);
  const done = status !== "playing";

  const shareText = useMemo(() => {
    const grid = guesses.map((g) => evaluate(g, answer).map((r) => (r === "correct" ? "🟩" : r === "present" ? "🟨" : "⬛")).join("")).join("\n");
    const score = status === "won" ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
    return `HURDLE 🏇 ${word.category} · ${score}\n${grid}\n\nDaily racing word game → https://hurdlegame.app`;
  }, [guesses, answer, status, word.category]);

  async function share() {
    if (navigator.share) { try { await navigator.share({ title: "Hurdle", text: shareText, url: "https://hurdlegame.app" }); return; } catch { /* */ } }
    try { await navigator.clipboard.writeText(shareText); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* */ }
  }

  async function join() {
    if (!email.includes("@")) return;
    await subscribeNewsletter(email);
    trackBoth("Lead", { email, content_name: "hurdle_newsletter" });
    setEmail(""); setJoinMsg("Check your inbox to confirm. New Hurdle every day.");
  }

  return (
    <div className="hdl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .hdl{--bg:#0a221b;--bg2:#0e2c23;--cell:#13362b;--cream:#f4ecd8;--gold:#f2b705;--green:#2f9e5c;--amber:#c79a3a;--line:rgba(244,236,216,.14);
          font-family:'Inter',system-ui,sans-serif;color:var(--cream);min-height:100svh;display:flex;flex-direction:column;
          background:radial-gradient(130% 80% at 50% -20%,var(--bg2),var(--bg));}
        .hdl *{box-sizing:border-box;}
        .hnav{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;max-width:520px;margin:0 auto;width:100%;}
        .hbrand{font-family:'Oswald';font-weight:700;letter-spacing:.05em;text-transform:uppercase;font-size:18px;}
        .hbrand b{color:var(--gold);}
        .htab{font-family:'Oswald';text-transform:uppercase;letter-spacing:.04em;font-size:11.5px;color:#1a1400;background:var(--gold);padding:7px 11px;border-radius:20px;text-decoration:none;}
        .hwrap{flex:1;display:flex;flex-direction:column;align-items:center;max-width:520px;margin:0 auto;width:100%;padding:6px 14px 26px;}
        .clue{text-align:center;margin:6px 0 16px;}
        .clue .cat{font-family:'Oswald';text-transform:uppercase;letter-spacing:.12em;font-size:12px;color:var(--gold);}
        .clue .txt{font-size:14px;opacity:.85;margin-top:5px;line-height:1.4;}
        .clue .meta{font-size:11px;opacity:.6;margin-top:5px;letter-spacing:.04em;}
        .clue .link{background:none;border:0;color:var(--gold);font-size:11px;cursor:pointer;text-decoration:underline;padding:0;letter-spacing:.04em;}
        .howto{font-size:12px;opacity:.8;line-height:1.5;margin:10px auto 0;max-width:340px;background:rgba(244,236,216,.05);border:1px solid var(--line);border-radius:10px;padding:10px 12px;}
        .reveal{margin-top:10px;background:rgba(242,183,5,.14);color:var(--gold);border:1px solid rgba(242,183,5,.4);border-radius:9px;padding:7px 14px;font-size:12px;font-family:'Oswald';text-transform:uppercase;letter-spacing:.05em;cursor:pointer;}
        .upsell b{color:var(--gold);}
        .grid{display:grid;gap:6px;margin:4px 0 14px;}
        .grow{display:grid;gap:6px;}
        .grow.shake{animation:sh .42s;}
        @keyframes sh{10%,90%{transform:translateX(-2px)}30%,70%{transform:translateX(4px)}50%{transform:translateX(-6px)}}
        .tile{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-family:'Oswald';font-weight:700;font-size:24px;text-transform:uppercase;
          border:2px solid var(--line);border-radius:8px;background:rgba(244,236,216,.03);min-height:0;}
        .tile.filled{border-color:rgba(244,236,216,.4);}
        .tile.correct{background:var(--green);border-color:var(--green);color:#fff;}
        .tile.present{background:var(--amber);border-color:var(--amber);color:#1a1400;}
        .tile.absent{background:#16201b;border-color:#16201b;opacity:.7;}
        .kbd{width:100%;max-width:500px;margin-top:auto;display:flex;flex-direction:column;gap:7px;}
        .krow{display:flex;gap:5px;justify-content:center;}
        .key{flex:1;min-width:0;height:50px;border:0;border-radius:8px;background:rgba(244,236,216,.14);color:var(--cream);font-family:'Oswald';font-weight:600;font-size:15px;text-transform:uppercase;cursor:pointer;}
        .key.wide{flex:1.5;font-size:11px;}
        .key.correct{background:var(--green);color:#fff;}
        .key.present{background:var(--amber);color:#1a1400;}
        .key.absent{background:#16201b;opacity:.55;}
        .result{background:rgba(244,236,216,.05);border:1px solid var(--line);border-radius:14px;padding:18px;margin:14px 0 0;width:100%;text-align:center;}
        .result h2{font-family:'Oswald';font-size:24px;margin:0 0 4px;}
        .result p{font-size:14px;opacity:.85;margin:0 0 12px;line-height:1.45;}
        .result .ans{color:var(--gold);font-weight:700;}
        .btn{font-family:'Oswald';font-weight:600;text-transform:uppercase;letter-spacing:.05em;border:0;border-radius:11px;padding:14px 18px;font-size:14px;cursor:pointer;background:var(--gold);color:#1a1400;width:100%;text-decoration:none;display:block;text-align:center;}
        .btn.ghost{background:rgba(244,236,216,.1);color:var(--cream);margin-top:8px;}
        .join{display:flex;gap:7px;margin-top:12px;}
        .join input{flex:1;min-width:0;padding:13px;border-radius:10px;border:0;font-size:14px;}
        .upsell{background:rgba(214,51,108,.07);border:1px solid rgba(214,51,108,.25);border-radius:12px;padding:13px;margin-top:12px;font-size:13px;line-height:1.45;}
        .upsell a{color:var(--gold);font-weight:600;}
        .foot{text-align:center;font-size:10.5px;opacity:.45;padding:16px;line-height:1.6;}
        .foot a{color:inherit;}
      `}</style>

      <div className="hnav">
        <span className="hbrand">Hur<b>dle</b></span>
        <Link className="htab" to="/ascot">The Ascot Seven · £500 →</Link>
      </div>

      <div className="hwrap">
        <div className="clue">
          <div className="cat">Today's Hurdle · {word.category}</div>
          <div className="meta">{len} letters · {MAX_GUESSES} guesses · <button className="link" onClick={() => setHow((h) => !h)}>{how ? "hide" : "how to play"}</button></div>
          {how && <div className="howto">Guess today's racing name. After each guess: 🟩 right letter, right spot · 🟨 in the name, wrong spot · ⬛ not in it. The category above is your hint — reveal the clue if you're stuck.</div>}
          {clueShown ? <div className="txt">{word.clue}</div> : !done && <button className="reveal" onClick={() => setClueShown(true)}>Reveal clue</button>}
        </div>

        <div className="grid" style={{ gridTemplateRows: `repeat(${MAX_GUESSES}, 1fr)`, width: `min(92vw, ${len * 62}px)` }}>
          {Array.from({ length: MAX_GUESSES }).map((_, r) => {
            const guess = guesses[r];
            const isCurrent = r === guesses.length && status === "playing";
            const ev = guess ? evaluate(guess, answer) : null;
            return (
              <div className={`grow ${isCurrent && shake ? "shake" : ""}`} key={r} style={{ gridTemplateColumns: `repeat(${len}, 1fr)` }}>
                {Array.from({ length: len }).map((_, c) => {
                  const ch = guess ? guess[c] : isCurrent ? current[c] : "";
                  const cls = ev ? ev[c] : ch ? "filled" : "";
                  return <div className={`tile ${cls}`} key={c}>{ch || ""}</div>;
                })}
              </div>
            );
          })}
        </div>

        {!done && (
          <div className="kbd">
            {ROWS.map((row, i) => (
              <div className="krow" key={i}>
                {i === 2 && <button className="key wide" onClick={() => onKey("ENTER")}>Enter</button>}
                {row.split("").map((k) => (
                  <button key={k} className={`key ${kbd[k] || ""}`} onClick={() => onKey(k)}>{k}</button>
                ))}
                {i === 2 && <button className="key wide" onClick={() => onKey("DEL")}>Del</button>}
              </div>
            ))}
          </div>
        )}

        {done && (
          <div className="result">
            <h2>{status === "won" ? "Got it 🏇" : "So close"}</h2>
            <p>{status === "won" ? `Solved in ${guesses.length}/${MAX_GUESSES}.` : <>Today's word was <span className="ans">{answer}</span>.</>} Come back tomorrow for a new one.</p>
            <button className="btn" onClick={share}>{copied ? "Copied!" : "Share result 📲"}</button>
            <Link className="btn ghost" to="/ascot">Play The Ascot Seven · win £500 →</Link>
            <div className="upsell"><b>1,800+ players</b> already get the daily NAP from Horse Racing Oracle. <a href="https://horseracingoracleai.com/" target="_blank" rel="noopener">Get today's free pick →</a></div>
            {!joinMsg ? (
              <div className="join">
                <input type="email" inputMode="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button className="btn" style={{ width: "auto" }} onClick={join} disabled={!email.includes("@")}>Get it daily</button>
              </div>
            ) : <p style={{ marginTop: 12, fontSize: 13, color: "var(--gold)" }}>{joinMsg}</p>}
          </div>
        )}
      </div>

      <div className="foot">
        Hurdle — a free daily racing word game · <Link to="/ascot">The Ascot Seven</Link> · <Link to="/terms">Terms</Link><br />
        18+ · Not a betting product · If gambling affects you, support is at <a href="https://www.begambleaware.org">BeGambleAware.org</a>
      </div>
    </div>
  );
}
