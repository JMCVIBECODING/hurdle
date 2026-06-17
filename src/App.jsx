import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Game from "./Game";
import Terms from "./Terms";
import Admin from "./Admin";
import Verify from "./Verify";
import ConsentBanner from "./ConsentBanner";
import { loadPixel, declined } from "./lib/analytics";

export default function App() {
  // Fire the pixel on load for everyone except explicit opt-outs.
  useEffect(() => { if (!declined()) loadPixel(); }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Game />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/verify" element={<Verify />} />
      </Routes>
      <ConsentBanner />
    </BrowserRouter>
  );
}
