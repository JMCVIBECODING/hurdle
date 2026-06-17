import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase, hasSupabase } from "./lib/supabase";

export default function Verify() {
  const [sp] = useSearchParams();
  const [state, setState] = useState("checking"); // checking | ok | fail
  const [name, setName] = useState("");

  useEffect(() => {
    const token = sp.get("token");
    if (!hasSupabase || !token) { setState("fail"); return; }
    supabase.rpc("verify_email", { p_token: token })
      .then(({ data, error }) => { if (!error && data) { setName(data); setState("ok"); } else setState("fail"); })
      .catch(() => setState("fail"));
  }, [sp]);

  return (
    <div style={S.root}>
      <div style={S.card}>
        {state === "checking" && <p style={S.lead}>Confirming…</p>}
        {state === "ok" && (
          <>
            <div style={S.tick}>✓</div>
            <h1 style={S.h1}>Entry confirmed</h1>
            {name && <p style={S.lead}>You're <b style={{ color: "#f2b705" }}>{name}</b> on the leaderboard.</p>}
            <p style={S.lead}>You're eligible for the festival prize. Points build all week — top 3 split £500. Good luck.</p>
            <Link style={S.cta} to="/">Back to the game →</Link>
          </>
        )}
        {state === "fail" && (
          <>
            <h1 style={S.h1}>Link expired or invalid</h1>
            <p style={S.lead}>This confirmation link didn't work. Lock a fresh entry and we'll send a new one.</p>
            <Link style={S.cta} to="/">Back to the game →</Link>
          </>
        )}
      </div>
    </div>
  );
}

const S = {
  root: { minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "radial-gradient(130% 80% at 50% -20%,#0e2c23,#0a221b)", fontFamily: "Inter, system-ui, sans-serif", color: "#f4ecd8" },
  card: { maxWidth: 380, textAlign: "center" },
  tick: { width: 64, height: 64, borderRadius: "50%", background: "rgba(34,192,138,.15)", border: "2px solid #22c08a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 18px" },
  h1: { fontFamily: "Oswald, sans-serif", fontSize: 28, margin: "0 0 10px" },
  lead: { fontSize: 15, lineHeight: 1.5, opacity: .85, margin: "0 0 22px" },
  cta: { display: "inline-block", background: "#f2b705", color: "#1a1400", textDecoration: "none", fontFamily: "Oswald, sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", fontSize: 14, padding: "13px 22px", borderRadius: 12 },
};
