# The Ascot Seven — Launch Guide (zero to live)

You're launching: the free pick-7 game, email capture, shareable card, the NAP reveal + £1.99 trial CTA, and the Royal Ascot leaderboard (top 3 split £500). The game file is **AscotSeven-MVP.jsx**.

Everything below is free. Total time ≈ 1 hour.

---

## 0. Create three free accounts (5 min)
- **GitHub** (github.com)
- **Vercel** (vercel.com) — sign in *with* GitHub, saves a step
- **Supabase** (supabase.com)
- Check Node is installed: open a terminal, run `node -v`. No version? Install the LTS from nodejs.org.

## 1. Scaffold the app (10 min)
In a terminal:
```
npm create vite@latest hurdle -- --template react
cd hurdle
npm install
```
- Save **AscotSeven-MVP.jsx** into the `src/` folder, renamed `Game.jsx`.
- Replace the contents of `src/App.jsx` with:
```jsx
import Game from "./Game";
export default function App(){ return <Game />; }
```
- Run `npm run dev`, open the localhost link it prints, and check the game loads and plays.

*(Using Next.js instead of Vite? Same steps, but add `"use client";` as the first line of `Game.jsx`.)*

## 2. Supabase — email capture + leaderboard (15 min)
- In Supabase, create a new project.
- Open the **SQL Editor** and run the SQL block from the top comment of `Game.jsx` (creates the `scores` table + access policies).
- Go to **Settings → API**, copy the **Project URL** and the **anon public** key.
- Paste them into the two constants at the top of `Game.jsx`:
  ```js
  const SUPABASE_URL = "https://xxxx.supabase.co";
  const SUPABASE_KEY = "your-anon-public-key";
  ```
  (The anon key is designed to be public — the table policies are what protect the data.)
- Re-run `npm run dev`, play a test entry, then check **Table Editor → scores** in Supabase — your row should appear.

## 3. Terms page (5 min)
- Create `public/terms.html`, paste in the prize terms (from **Ascot-Seven-Prize-Terms.md**, wrapped in basic HTML).
- Fill the bracketed placeholders: legal entity name, company number, registered address, privacy-policy link.
- The game footer links to `/terms` — point it at `/terms.html`.

## 4. Load today's real card (20 min)
- In `Game.jsx`, replace the placeholder `RACES` runners with the **official Day-1 racecard** (Ascot.com / Racing Post).
- Set `NAP = { raceId, runnerId }` to your tool's NAP for the day. Keep it discreet — don't advertise which race.

## 5. Deploy to Vercel (15 min)
```
git init
git add -A
git commit -m "launch the ascot seven"
```
- Create a new repo on GitHub and push to it.
- In Vercel: **New Project → Import** your repo → **Deploy**. You're live on a `*.vercel.app` URL within a minute or two. **This URL is already shareable.**

## 6. Point the domain (DNS can lag a bit)
- Vercel → your project → **Settings → Domains** → add `hurdlegame.app`.
- Vercel shows the DNS records to set; add them at your domain registrar.
- Until DNS propagates, keep using the `*.vercel.app` URL — don't wait on this to start sharing.

## 7. After it's live (same day — don't let these block launch)
- Add the **Meta Pixel + GA4** (easiest via Google Tag Manager) so the Ascot traffic warms a retargeting audience for paid ads after the festival.
- Add a **cookie-consent banner** that blocks those tags until the visitor accepts (UK PECR — required).
- Seed the **share card** into racing X and the big racing Facebook groups before the 2:30 Queen Anne.

---

## Honest note on the leaderboard
The MVP, live, captures emails and runs the game, share card, and funnel CTA today — that's a real launch. For the **scored** festival leaderboard you still need two things beyond hour-one:
1. Store each player's **picks** (not just a score) when they lock.
2. Enter the **actual winners** after each race so scores compute (by hand each evening, or via a results API).

So: get the game live and capturing emails first. Wire the real scoring next — it's the immediate follow-up, not a launch blocker. Don't advertise the £500 until the terms are published and the scoring is wired.
