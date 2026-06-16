# BUILD BRIEF — The Ascot Seven (for Claude Code)

## Context
I have a freshly scaffolded **Vite + React (JavaScript)** app at `~/hurdle`. I want you to turn it into the production version of a free-to-enter horse-racing prediction game called **The Ascot Seven**, launching for the Royal Ascot festival (16–20 June 2026).

I'm providing three files (in this folder or pasted below):
- `AscotSeven-MVP.jsx` — the working front-end prototype. Use it as the UI starting point. **Keep its visual identity exactly** (turf-green/gold/cream, Oswald + Inter fonts, the racecard look).
- `Ascot-Seven-Prize-Terms.md` — the prize T&Cs. Publish as a page.
- `LAUNCH.md` — the deployment plan and the Supabase SQL.

## What to build

### 1. Wire up the app
- Place the prototype as the main game component and render it from `App.jsx`.
- Keep it a single-page React app. No backend server needed beyond Supabase.

### 2. Supabase integration
- Use `@supabase/supabase-js`. Read URL + anon key from **environment variables** (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), not hardcoded. Create a `.env` and a `.env.example`.
- **Email capture:** when a player locks their card, upsert a `players` row (email, created_at) and record their entry.
- **Pick storage:** store each player's pick per race in a `picks` table (player, race_id, runner_id, event_day, locked_at). This is essential — the leaderboard must score real picks, not a single number.
- **Picks lock** before each race's start time; reject/ignore picks submitted after the off.

### 3. The daily card (festival runs 5 days: 16–20 June 2026)
- The race card changes every day. **Do not hardcode each day in the code** — store it in Supabase.
- `races` table keyed by `event_day` (date), each with its runners, start time, and the NAP runner for that day.
- Build a simple **admin-only page** (password-gated, not public) where each morning I paste that day's card, set the NAP, and — after racing — enter each race's winning runner.
- The public game **auto-loads today's card by date** from Supabase. No redeploys to change the daily card.

### 4. Results + scoring
- Add a `results` table (race_id, event_day, winning_runner_id), entered via the admin page above.
- A player scores **1 point per race where their pick matches the winning runner**.

### 5. Festival leaderboard
- Leaderboard ranks players by **total correct picks across the festival** (16–20 June 2026).
- Tie-break: earliest to reach the total.
- Top 3 shown as prize positions (£250 / £150 / £100). Read live from Supabase.

### 6. Pages
- `/` — the game.
- `/terms` — render the contents of `Ascot-Seven-Prize-Terms.md`.
- Add a lightweight router for these two routes.

### 7. Keep as-is from the prototype
- The NAP reveal (revealed only after the relevant race) and the £1.99 trial CTA.
- The shareable emoji result card.
- The footer (18+, not a betting product, BeGambleAware link).

## Do NOT
- Do NOT hardcode secrets.
- Do NOT add the points-currency, referral prize, leagues, or badges — those are a later phase.
- Do NOT change the visual design or copy tone.
- Do NOT use localStorage for anything the leaderboard depends on — that lives in Supabase.

## After building
- Run the dev server and confirm: I can pick, lock (email saved), see the board, and that entering a result updates scores.
- Then walk me through pushing to GitHub and deploying on Vercel, including setting the two environment variables in Vercel.

## I will handle (don't attempt)
- Creating the Supabase project and giving you the keys.
- Buying/connecting the domain (hurdlegame.app).
- The Meta/GA pixel + cookie-consent banner (after launch).
