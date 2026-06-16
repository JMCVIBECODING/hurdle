import React, { useState, useEffect, useMemo } from "react";

/*
  THE ASCOT SEVEN — LEAN MVP (launch build).
  In:  pick 7, lock with email, share emoji card, monthly leaderboard (top 3 win
       £500), NAP revealed after racing, £1.99 trial CTA.
  Out (fast-follow): points currency, referral £100 + tracking, leagues, badges.

  ── GO LIVE (≈1 hour) ──────────────────────────────────────────────
  1. Push to GitHub → import to Vercel → live on a temp URL.
  2. Create a Supabase project. Run this SQL:

       create table scores (
         id bigint generated always as identity primary key,
         email text not null,
         name text,
         hits int not null default 0,
         played_on date not null default current_date,
         created_at timestamptz default now()
       );
       alter table scores enable row level security;
       create policy "insert" on scores for insert to anon with check (true);
       create policy "read"   on scores for select to anon using (true);

  3. Paste your Supabase URL + anon key below. Leaderboard + email capture go live.
     (Left blank, the app still runs and shows a seeded demo board.)
  4. Each morning: replace RACES runners with the official racecard; set NAP.
  5. Publish the prize T&Cs at /terms before advertising the £500.
  ────────────────────────────────────────────────────────────────────
*/

const SUPABASE_URL = ""; // e.g. "https://xxxx.supabase.co"
const SUPABASE_KEY = ""; // anon public key

async function submitScore(email, hits){
  if(!SUPABASE_URL) return;
  try{
    await fetch(`${SUPABASE_URL}/rest/v1/scores`, {
      method:"POST",
      headers:{ "Content-Type":"application/json", apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ email, hits }),
    });
  }catch(e){ /* fail quietly */ }
}
async function fetchBoard(){
  if(!SUPABASE_URL) return null;
  try{
    const month = new Date().toISOString().slice(0,7); // YYYY-MM
    const r = await fetch(`${SUPABASE_URL}/rest/v1/scores?select=name,hits,played_on&played_on=gte.${month}-01`, {
      headers:{ apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}` },
    });
    const rows = await r.json();
    const totals = {};
    rows.forEach(x => { totals[x.name||"Player"] = (totals[x.name||"Player"]||0) + x.hits; });
    return Object.entries(totals).map(([name,hits])=>[name,hits]).sort((a,b)=>b[1]-a[1]).slice(0,10);
  }catch(e){ return null; }
}

const RACES = [
  { id:"r1", time:"14:30", name:"Queen Anne Stakes", runners:[
    {id:"a",name:"Field Marshal"},{id:"b",name:"Silver Cascade"},{id:"c",name:"Berkshire Blue"},{id:"d",name:"Lunar Crest"},{id:"e",name:"Tidewater"}] },
  { id:"r2", time:"15:05", name:"Coventry Stakes", runners:[
    {id:"a",name:"Quick Sixpence"},{id:"b",name:"Gold Standard"},{id:"c",name:"Morning Drum"},{id:"d",name:"Vanguard Lad"}] },
  { id:"r3", time:"15:40", name:"King Charles III Stakes", runners:[
    {id:"a",name:"Crown Imperial"},{id:"b",name:"Flash Harry"},{id:"c",name:"Ostend"},{id:"d",name:"Saffron King"},{id:"e",name:"Dauntless"}] },
  { id:"r4", time:"16:20", name:"St James's Palace Stakes", runners:[
    {id:"a",name:"Palace Guard"},{id:"b",name:"Inisfree"},{id:"c",name:"Northern Light"},{id:"d",name:"Composer"}] },
  { id:"r5", time:"16:55", name:"Ascot Stakes (Handicap)", runners:[
    {id:"a",name:"Stayer's Pride"},{id:"b",name:"Long Acre"},{id:"c",name:"Galway Mist"},{id:"d",name:"Endurance"},{id:"e",name:"Two Mile Tom"},{id:"f",name:"Marathon Man"}] },
  { id:"r6", time:"17:30", name:"Wolferton Stakes (Listed)", runners:[
    {id:"a",name:"Royal Standard"},{id:"b",name:"Windsor Knot"},{id:"c",name:"Berkshire Boy"},{id:"d",name:"Sandringham"}] },
  { id:"r7", time:"18:05", name:"Copper Horse Stakes (Handicap)", runners:[
    {id:"a",name:"Copper Beech"},{id:"b",name:"Last Hurrah"},{id:"c",name:"Twilight Run"},{id:"d",name:"Closing Time"},{id:"e",name:"Sundowner"}] },
];

const NAP = { raceId:"r3", runnerId:"b" }; // set from your tool each morning; keep server-side in prod
const SEED_BOARD = [["TrackHawk",5],["AnneMarie",4],["theRailbird",4],["GallopGav",3],["SilkRoad",3]];
const napRace = RACES.find(r => r.id === NAP.raceId);
const napName = napRace.runners.find(r => r.id === NAP.runnerId)?.name;

export default function AscotSeven(){
  const [picks, setPicks] = useState({});
  const [email, setEmail] = useState("");
  const [locked, setLocked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState({});
  const [streak] = useState(2); // PROD: persist via localStorage or Supabase
  const [copied, setCopied] = useState(false);
  const [board, setBoard] = useState(SEED_BOARD);

  useEffect(() => { fetchBoard().then(b => { if(b && b.length) setBoard(b); }); }, []);

  const made = Object.keys(picks).length;
  const allPicked = made === RACES.length;
  function choose(raceId, runnerId){ if(!locked) setPicks(p => ({...p, [raceId]: runnerId})); }
  function lock(){ if(allPicked && email.includes("@")){ setLocked(true); /* score submitted on reveal */ } }
  function reveal(){
    const res = {};
    RACES.forEach(r => { res[r.id] = r.runners[Math.floor(Math.random()*r.runners.length)].id; });
    setResults(res); setRevealed(true);
    const hits = RACES.filter(r => picks[r.id] === res[r.id]).length;
    submitScore(email, hits); // PROD: submit at each race off-time instead
  }

  const youHits = revealed ? RACES.filter(r => picks[r.id] === results[r.id]).length : 0;
  const napWon = revealed ? results[NAP.raceId] === NAP.runnerId : false;
  const backedNap = picks[NAP.raceId] === NAP.runnerId;

  const shareText = useMemo(() => {
    if(!revealed) return "";
    const grid = RACES.map(r => picks[r.id]===results[r.id] ? "🟩" : "⬛").join("");
    return `THE ASCOT SEVEN 🏇\nMe ${youHits}/7\n${grid}\n🤖 HRO's NAP: ${napWon ? "✅ landed" : "❌ no joy"}\n${streak}🔥 streak · play → hurdlegame.app`;
  }, [revealed, picks, results, youHits, napWon, streak]);
  function copyShare(){ navigator.clipboard?.writeText(shareText).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),1600); }); }

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
        .race{background:rgba(244,236,216,.05);border:1px solid var(--line);border-radius:13px;padding:12px;margin-bottom:9px;}
        .rhead{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:9px;}
        .rhead .nm{font-family:'Oswald';font-weight:600;font-size:14px;}
        .rhead .tm{font-family:'Oswald';color:var(--gold);font-size:13px;}
        .runners{display:flex;flex-wrap:wrap;gap:6px;}
        .chip{border:1.5px solid var(--line);background:rgba(244,236,216,.04);color:var(--card);border-radius:9px;padding:8px 11px;font-size:13px;font-weight:500;cursor:pointer;}
        .chip.sel{background:var(--gold);color:#1a1400;border-color:var(--gold);font-weight:600;}
        .chip.win{outline:2px solid var(--hit);}
        .chip .nb{font-size:10px;color:var(--magenta);font-weight:700;margin-left:5px;}
        .gate{background:#16201b;border-radius:13px;padding:15px;margin:13px 0;}
        .gate p{margin:0 0 9px;font-size:12.5px;opacity:.85;line-height:1.4;}
        .ctaRow{display:flex;gap:7px;flex-wrap:wrap;}
        .gate input{flex:1;min-width:150px;padding:11px 13px;border-radius:9px;border:0;font-size:13px;}
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

        {RACES.map((r, i) => {
          const isNapRace = r.id === NAP.raceId;
          return (
            <div className="race" key={r.id}>
              <div className="rhead"><span className="nm">{i+1}. {r.name}</span><span className="tm">{r.time}</span></div>
              <div className="runners">
                {r.runners.map(run => {
                  const sel = picks[r.id] === run.id;
                  const isWin = revealed && results[r.id] === run.id;
                  const isNap = revealed && isNapRace && run.id === NAP.runnerId;
                  return (
                    <button key={run.id} className={`chip ${sel?"sel":""} ${isWin?"win":""}`} onClick={()=>choose(r.id, run.id)}>
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
              <input placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} />
              <button className="btn btn-gold" disabled={made < 1 || !email.includes("@")} onClick={lock}>Lock my picks</button>
            </div>
          </div>
        )}

        {locked && !revealed && (
          <div className="gate">
            <p>Locked in. Your picks score as each race runs, and the NAP is revealed after racing. Peek now with a demo result?</p>
            <button className="btn btn-gold" onClick={reveal}>Reveal result (demo)</button>
          </div>
        )}

        {revealed && (
          <div className="result">
            <div className="scoreline"><div className="big">{youHits}/7</div><small>Winners found</small></div>
            <div className="napbox">🤖 Today's HRO <b>NAP</b> was <b>{napName}</b> in the {napRace.time} — it <b>{napWon ? "WON ✅" : "didn't land ❌"}</b>. {backedNap ? "You were on it — nice." : "You didn't have it."}</div>
            <div className="funnel">
              <p>That NAP was published <b>before</b> the race, with the form behind it. Want <b>tomorrow's NAP before it runs</b>, every day of the festival?</p>
              <button className="btn btn-gold">Start £1.99 trial</button>
            </div>
          </div>
        )}

        {locked && (
          <div className="panel" style={{display:"flex",gap:9,flexWrap:"wrap"}}>
            <button className="btn btn-ghost" onClick={copyShare}>{copied?"Copied!":"Share my card 📲"}</button>
          </div>
        )}

        <div className="panel">
          <h3>🏆 Royal Ascot leaderboard</h3>
          <p className="lbnote">Top 3 over the festival split <b>£500</b> — £250 / £150 / £100.</p>
          {board.map(([n,s],i)=>(<div className={`lbrow ${i<3?"prize":""}`} key={n+i}><span>{i<3?"🏆 ":""}{i+1}. {n}</span><span>{s}</span></div>))}
          <div className="lbrow"><span className="you">{revealed?"— You":"— You (lock to enter)"}</span><span className="you">{revealed?`${youHits}`:"—"}</span></div>
        </div>

        <div className="foot">
          Sample card · swap in the official racecard each morning · 18+ · Free game for entertainment, not a betting product · <a href="/terms">Prize terms</a><br/>
          If gambling affects you, support is available at <a href="https://www.begambleaware.org">BeGambleAware.org</a>.
        </div>
      </div>
    </div>
  );
}
