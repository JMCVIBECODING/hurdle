import { useEffect, useState } from "react";
import { loadTips, loadTrackRecord } from "./lib/api";

// Public, honest NAP track record. Every published tip stays, losers included.
// Numbers here are computed from the ledger — this page is the substantiation
// for any marketing claim (ASA/CAP) and the proof section of the VSL.

const BADGE = { won: ["WON", "#2e7d32"], placed: ["PLACED", "#b2881a"], lost: ["LOST", "#7a2e2e"], void: ["VOID", "#555"], pending: ["TODAY", "#20564c"] };

export default function Record() {
  const [tips, setTips] = useState(null);
  const [rec, setRec] = useState(null);

  useEffect(() => {
    loadTips(60).then(setTips);
    loadTrackRecord(90).then(setRec);
  }, []);

  const fmt = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return (
    <div className="rec">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Source+Sans+3:wght@400;600&display=swap');
        .rec{min-height:100vh;background:#0d2420;color:#f4ecd8;font-family:'Source Sans 3',sans-serif;display:flex;flex-direction:column;align-items:center;padding:0 16px;}
        .rec .brand{font-family:'Oswald';font-weight:700;font-size:20px;letter-spacing:.06em;text-transform:uppercase;padding:18px 0 6px;}
        .rec .brand b{color:#f2b705;}
        .rec h1{font-family:'Oswald';font-size:26px;text-transform:uppercase;margin:18px 0 4px;text-align:center;}
        .rec .sub{font-size:13.5px;opacity:.7;margin:0 0 18px;text-align:center;max-width:430px;line-height:1.5;}
        .rec .stats{display:flex;gap:9px;width:100%;max-width:480px;margin-bottom:18px;}
        .rec .stat{flex:1;background:#123029;border:1px solid rgba(244,236,216,.14);border-radius:12px;padding:13px 6px;text-align:center;}
        .rec .stat b{display:block;font-family:'Oswald';font-size:24px;color:#f2b705;line-height:1.1;}
        .rec .stat span{font-size:9.5px;text-transform:uppercase;letter-spacing:.07em;opacity:.6;}
        .rec .list{width:100%;max-width:480px;}
        .rec .tip{display:flex;align-items:center;gap:10px;background:#123029;border:1px solid rgba(244,236,216,.1);border-radius:11px;padding:11px 13px;margin-bottom:7px;font-size:14px;}
        .rec .d{opacity:.55;font-size:12px;width:52px;flex-shrink:0;}
        .rec .h{font-weight:600;flex:1;min-width:0;}
        .rec .m{opacity:.6;font-size:12px;}
        .rec .b{font-family:'Oswald';font-size:10.5px;letter-spacing:.08em;padding:4px 9px;border-radius:6px;flex-shrink:0;}
        .rec .cta{display:block;text-align:center;background:#f2b705;color:#1a1400;border-radius:11px;padding:15px;font-family:'Oswald';font-weight:600;text-transform:uppercase;font-size:15px;text-decoration:none;margin:14px 0 6px;width:100%;max-width:480px;}
        .rec .empty{opacity:.6;font-size:14px;padding:30px 0;text-align:center;}
        .rec .foot{font-size:10.5px;opacity:.45;padding:18px;text-align:center;margin-top:auto;line-height:1.6;}
        .rec .foot a{color:inherit;}
      `}</style>

      <div className="brand">Horse Racing <b>Oracle</b></div>
      <h1>The record. All of it.</h1>
      <p className="sub">Every tip we publish stays published — winners and losers. If a tipster won't show you his losers, he's showing you a story.</p>

      {rec && rec.tips > 0 && (
        <div className="stats">
          <div className="stat"><b>{rec.tips}</b><span>NAPs · {rec.days}d</span></div>
          <div className="stat"><b>{rec.strike_pct}%</b><span>Strike rate</span></div>
          <div className="stat"><b>{rec.pl_points > 0 ? "+" : ""}{rec.pl_points}</b><span>P/L (1pt stakes)</span></div>
        </div>
      )}

      <div className="list">
        {tips === null && <p className="empty">Loading the ledger…</p>}
        {tips && tips.length === 0 && <p className="empty">The public ledger starts this week. Every pick from here on stays on the board.</p>}
        {tips && tips.map((t) => {
          const [label, color] = BADGE[t.result] || BADGE.pending;
          return (
            <div className="tip" key={t.id}>
              <span className="d">{fmt(t.tip_date)}</span>
              <span className="h">{t.horse}<br /><span className="m">{[t.course, t.race_time, t.odds].filter(Boolean).join(" · ")}</span></span>
              <span className="b" style={{ background: color }}>{label}</span>
            </div>
          );
        })}
      </div>

      <a className="cta" href="https://horseracingoracleai.com/?utm_source=record">Get tomorrow's NAP →</a>

      <div className="foot">
        18+ · <a href="https://www.gambleaware.org" target="_blank" rel="noopener">GambleAware.org</a> · Past performance does not guarantee future results · <a href="/privacy">Privacy</a>
      </div>
    </div>
  );
}
