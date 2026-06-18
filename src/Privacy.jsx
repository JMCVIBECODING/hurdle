import React from "react";
import { Link } from "react-router-dom";
import { marked } from "marked";
import privacyMd from "../Privacy-Policy.md?raw";

const html = marked.parse(privacyMd);

export default function Privacy() {
  return (
    <div className="troot">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        .troot{--field:#0c2a22;--field2:#0f3329;--card:#f4ecd8;--gold:#f2b705;
          font-family:'Inter',system-ui,sans-serif;color:var(--card);min-height:100%;
          background:radial-gradient(120% 90% at 50% -10%,var(--field2),var(--field));padding:24px 16px 48px;}
        .tdoc{max-width:680px;margin:0 auto;}
        .tback{display:inline-block;font-family:'Oswald';text-transform:uppercase;letter-spacing:.05em;
          font-size:12px;color:var(--gold);text-decoration:none;margin-bottom:18px;}
        .tdoc h1{font-family:'Oswald';text-transform:uppercase;letter-spacing:.03em;font-size:26px;line-height:1.15;margin:0 0 14px;}
        .tdoc h2{font-family:'Oswald';text-transform:uppercase;letter-spacing:.04em;font-size:16px;color:var(--gold);margin:26px 0 8px;}
        .tdoc p,.tdoc li{font-size:14px;line-height:1.6;opacity:.9;}
        .tdoc ul{padding-left:20px;margin:6px 0;}
        .tdoc li{margin:4px 0;}
        .tdoc strong{color:#fff;}
        .tdoc em{opacity:.7;}
        .tdoc hr{border:0;border-top:1px solid rgba(244,236,216,.18);margin:28px 0;}
        .tdoc a{color:var(--gold);}
      `}</style>
      <div className="tdoc">
        <Link className="tback" to="/">← Back to the game</Link>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
