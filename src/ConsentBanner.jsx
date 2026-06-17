import { useState, useEffect } from "react";
import { loadPixel, hasPixel } from "./lib/analytics";

// Minimal cookie-consent banner. Loads the Meta Pixel only on Accept.
export default function ConsentBanner() {
  const [choice, setChoice] = useState(() => {
    try { return localStorage.getItem("a7_consent"); } catch { return null; }
  });

  useEffect(() => { if (choice === "yes") loadPixel(); }, [choice]);

  function decide(v) {
    try { localStorage.setItem("a7_consent", v); } catch { /* ignore */ }
    setChoice(v);
  }

  if (!hasPixel || choice) return null;

  return (
    <div style={S.wrap}>
      <span style={S.text}>
        We use cookies for analytics and ads measurement. See our <a style={S.link} href="/terms">terms</a>.
      </span>
      <span style={S.btns}>
        <button style={S.decline} onClick={() => decide("no")}>Decline</button>
        <button style={S.accept} onClick={() => decide("yes")}>Accept</button>
      </span>
    </div>
  );
}

const S = {
  wrap: { position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, background: "#0e2c23", borderTop: "1px solid rgba(244,236,216,.16)", color: "#f4ecd8", padding: "12px 16px", display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "center", fontFamily: "Inter, system-ui, sans-serif", fontSize: 12.5 },
  text: { opacity: .85, maxWidth: 520 },
  link: { color: "#f2b705" },
  btns: { display: "flex", gap: 8 },
  decline: { background: "rgba(244,236,216,.1)", color: "#f4ecd8", border: 0, borderRadius: 8, padding: "8px 14px", fontSize: 12.5, cursor: "pointer" },
  accept: { background: "#f2b705", color: "#1a1400", border: 0, borderRadius: 8, padding: "8px 16px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" },
};
