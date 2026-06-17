import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase, hasSupabase } from "./lib/supabase";
import { SAMPLE_RACES, SAMPLE_NAP } from "./lib/sampleCard";
import { todayDay } from "./lib/festival";

const TEMPLATE = JSON.stringify(SAMPLE_RACES, null, 2);

export default function Admin() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr, setLoginErr] = useState("");

  const [day, setDay] = useState(todayDay());
  const [cardText, setCardText] = useState(TEMPLATE);
  const [napRaceId, setNapRaceId] = useState(SAMPLE_NAP.raceId);
  const [napRunnerId, setNapRunnerId] = useState(SAMPLE_NAP.runnerId);
  const [winners, setWinners] = useState({}); // raceId -> runnerId
  const [msg, setMsg] = useState("");
  const [confMsg, setConfMsg] = useState("");

  async function sendConfirmations() {
    setConfMsg("Loading unverified players…");
    const { data, error } = await supabase.rpc("pending_confirmations");
    if (error) { setConfMsg("Error: " + error.message); return; }
    if (!data || !data.length) { setConfMsg("No unverified players to email."); return; }
    let sent = 0, failed = 0;
    for (const row of data) {
      try {
        const r = await fetch("/api/send-verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: row.email, token: row.token }) });
        const j = await r.json().catch(() => ({}));
        j.ok ? sent++ : failed++;
      } catch { failed++; }
      setConfMsg(`Sending… ${sent} sent${failed ? `, ${failed} failed` : ""}`);
      await new Promise((res) => setTimeout(res, 600));
    }
    setConfMsg(`Done — ${sent} confirmation email(s) sent${failed ? `, ${failed} failed (check Resend is Verified)` : ""}.`);
  }

  useEffect(() => {
    if (!hasSupabase) { setAuthReady(true); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Once logged in, auto-load today's saved card so the Results dropdowns show
  // the real runners (not the sample template).
  useEffect(() => { if (session && hasSupabase) loadDay(); /* eslint-disable-next-line */ }, [session]);

  async function login(e) {
    e.preventDefault();
    setLoginErr("");
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPass });
    if (error) setLoginErr(error.message);
  }

  function parsedCard() {
    try {
      const v = JSON.parse(cardText);
      if (!Array.isArray(v)) throw new Error("Card must be a JSON array of races.");
      return v;
    } catch (e) { setMsg("Card JSON error: " + e.message); return null; }
  }

  async function loadDay() {
    setMsg("Loading...");
    const { data: r } = await supabase.from("races").select("card, nap_race_id, nap_runner_id").eq("event_day", day).maybeSingle();
    if (r) {
      setCardText(JSON.stringify(r.card, null, 2));
      setNapRaceId(r.nap_race_id || "");
      setNapRunnerId(r.nap_runner_id || "");
    } else {
      setMsg(`No card saved for ${day} yet. Paste one below and save.`);
    }
    const { data: res } = await supabase.from("results").select("race_id, winning_runner_id, second_runner_id, third_runner_id").eq("event_day", day);
    const w = {}; (res || []).forEach((x) => { w[x.race_id] = { win: x.winning_runner_id, second: x.second_runner_id, third: x.third_runner_id }; });
    setWinners(w);
    if (r) setMsg(`Loaded ${day}.`);
  }

  async function saveCard() {
    const card = parsedCard();
    if (!card) return;
    setMsg("Saving card...");
    const { error } = await supabase.rpc("save_card", {
      p_event_day: day, p_card: card,
      p_nap_race_id: napRaceId || null, p_nap_runner_id: napRunnerId || null,
    });
    setMsg(error ? "Save failed: " + error.message : `Card saved for ${day}. The public game will load it by date.`);
  }

  async function saveResults() {
    const card = parsedCard();
    if (!card) return;
    const rows = card.filter((r) => winners[r.id]?.win).map((r) => ({
      race_id: r.id,
      winning_runner_id: winners[r.id].win,
      second_runner_id: winners[r.id].second || null,
      third_runner_id: winners[r.id].third || null,
    }));
    if (!rows.length) { setMsg("Set at least one winner first."); return; }
    setMsg("Saving results...");
    const { error } = await supabase.rpc("save_results", { p_event_day: day, p_results: rows });
    setMsg(error ? "Save failed: " + error.message : `Saved ${rows.length} result(s). Leaderboard will recompute.`);
  }

  const card = (() => { try { const v = JSON.parse(cardText); return Array.isArray(v) ? v : []; } catch { return []; } })();

  const S = {
    root: { minHeight: "100vh", background: "#0c2a22", color: "#f4ecd8", fontFamily: "Inter, system-ui, sans-serif", padding: 24 },
    wrap: { maxWidth: 720, margin: "0 auto" },
    h: { fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: ".04em" },
    card: { background: "rgba(244,236,216,.05)", border: "1px solid rgba(244,236,216,.14)", borderRadius: 12, padding: 16, marginBottom: 14 },
    input: { width: "100%", padding: "10px 12px", borderRadius: 8, border: 0, fontSize: 13, marginBottom: 8 },
    ta: { width: "100%", minHeight: 220, padding: 12, borderRadius: 8, border: 0, fontFamily: "monospace", fontSize: 12 },
    btn: { fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: ".05em", border: 0, borderRadius: 9, padding: "11px 16px", fontSize: 13, background: "#f2b705", color: "#1a1400", cursor: "pointer", marginRight: 8 },
    ghost: { background: "rgba(244,236,216,.12)", color: "#f4ecd8" },
    row: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(244,236,216,.12)" },
    sel: { padding: "8px 10px", borderRadius: 8, border: 0, fontSize: 13 },
  };

  if (!hasSupabase) {
    return <div style={S.root}><div style={S.wrap}><h1 style={S.h}>Admin</h1><p>Supabase is not configured. Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env</code>, then restart the dev server.</p><Link to="/" style={{ color: "#f2b705" }}>← Game</Link></div></div>;
  }
  if (!authReady) return <div style={S.root}><div style={S.wrap}>Loading…</div></div>;

  if (!session) {
    return (
      <div style={S.root}><div style={{ ...S.wrap, maxWidth: 360 }}>
        <h1 style={S.h}>Admin login</h1>
        <p style={{ fontSize: 13, opacity: .8 }}>Sign in with the Supabase user you created (Authentication → Users).</p>
        <form onSubmit={login} style={S.card}>
          <input style={S.input} type="email" placeholder="admin email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
          <input style={S.input} type="password" placeholder="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} />
          <button style={S.btn} type="submit">Sign in</button>
          {loginErr && <p style={{ color: "#d6336c", fontSize: 13 }}>{loginErr}</p>}
        </form>
        <Link to="/" style={{ color: "#f2b705" }}>← Game</Link>
      </div></div>
    );
  }

  return (
    <div style={S.root}><div style={S.wrap}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={S.h}>Ascot Seven · Admin</h1>
        <button style={{ ...S.btn, ...S.ghost }} onClick={() => supabase.auth.signOut()}>Sign out</button>
      </div>

      <div style={S.card}>
        <label style={{ fontSize: 12, opacity: .8 }}>Event day</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
          <input style={{ ...S.input, marginBottom: 0, width: "auto" }} type="date" value={day} onChange={(e) => setDay(e.target.value)} />
          <button style={{ ...S.btn, ...S.ghost }} onClick={loadDay}>Load this day</button>
        </div>
      </div>

      <div style={S.card}>
        <h2 style={{ ...S.h, fontSize: 16, color: "#f2b705" }}>1 · Daily card</h2>
        <p style={{ fontSize: 12, opacity: .8 }}>Paste the day's racecard as JSON: an array of {`{ id, time, name, runners:[{id,name}] }`}. Times are 24h UK ("14:30").</p>
        <textarea style={S.ta} value={cardText} onChange={(e) => setCardText(e.target.value)} />
        <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
          <div><label style={{ fontSize: 12, opacity: .8 }}>NAP race id</label>
            <select style={S.sel} value={napRaceId} onChange={(e) => setNapRaceId(e.target.value)}>
              <option value="">—</option>
              {card.map((r) => <option key={r.id} value={r.id}>{r.id} · {r.name}</option>)}
            </select></div>
          <div><label style={{ fontSize: 12, opacity: .8 }}>NAP runner id</label>
            <select style={S.sel} value={napRunnerId} onChange={(e) => setNapRunnerId(e.target.value)}>
              <option value="">—</option>
              {(card.find((r) => r.id === napRaceId)?.runners || []).map((rn) => <option key={rn.id} value={rn.id}>{rn.id} · {rn.name}</option>)}
            </select></div>
        </div>
        <div style={{ marginTop: 12 }}><button style={S.btn} onClick={saveCard}>Save card + NAP</button></div>
      </div>

      <div style={S.card}>
        <h2 style={{ ...S.h, fontSize: 16, color: "#f2b705" }}>2 · Results (after each race)</h2>
        <p style={{ fontSize: 12, opacity: .8 }}>Set 1st / 2nd / 3rd for each race. Players score 5 / 3 / 1 points. 2nd and 3rd are optional but recommended. Recompute is automatic.</p>
        {card.length === 0 && <p style={{ fontSize: 13, opacity: .7 }}>Load or paste a card first.</p>}
        {card.map((r) => {
          const w = winners[r.id] || {};
          const set = (k, v) => setWinners((prev) => ({ ...prev, [r.id]: { ...prev[r.id], [k]: v } }));
          return (
            <div style={{ ...S.row, flexWrap: "wrap", gap: 6 }} key={r.id}>
              <span style={{ fontSize: 13, flex: "1 1 100%", marginBottom: 4 }}>{r.name} <span style={{ opacity: .6 }}>({r.time})</span></span>
              {[["win", "1st"], ["second", "2nd"], ["third", "3rd"]].map(([k, lab]) => (
                <select key={k} style={{ ...S.sel, flex: 1 }} value={w[k] || ""} onChange={(e) => set(k, e.target.value)}>
                  <option value="">{lab}…</option>
                  {r.runners.map((rn) => <option key={rn.id} value={rn.id}>{rn.name}</option>)}
                </select>
              ))}
            </div>
          );
        })}
        {card.length > 0 && <div style={{ marginTop: 12 }}><button style={S.btn} onClick={saveResults}>Save results</button></div>}
      </div>

      <div style={S.card}>
        <h2 style={{ ...S.h, fontSize: 16, color: "#f2b705" }}>3 · Confirm sign-ups</h2>
        <p style={{ fontSize: 12, opacity: .8 }}>Email every unverified player a confirm-entry link (catches sign-ups from before email verification went live). Run once Resend shows Verified.</p>
        <button style={S.btn} onClick={sendConfirmations}>Email unverified players</button>
        {confMsg && <p style={{ color: "#f2b705", fontSize: 13, marginTop: 8 }}>{confMsg}</p>}
      </div>

      {msg && <p style={{ color: "#f2b705", fontSize: 13 }}>{msg}</p>}
      <Link to="/" style={{ color: "#f2b705" }}>← Game</Link>
    </div></div>
  );
}
