import { BrowserRouter, Routes, Route } from "react-router-dom";
import Game from "./Game";
import Terms from "./Terms";
import Admin from "./Admin";
import Verify from "./Verify";
import ConsentBanner from "./ConsentBanner";

export default function App() {
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
