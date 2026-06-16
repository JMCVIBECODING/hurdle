# The Ascot Seven

Free-to-enter Royal Ascot prediction game (16–20 June 2026). Pick the winner of
as many of the day's 7 races as you like, lock with your email, and climb the
festival leaderboard — top 3 split £500. No betting.

Built with Vite + React, Supabase for data, deployed on Vercel.

## Routes
- `/` — the game
- `/terms` — prize competition terms (rendered from `Ascot-Seven-Prize-Terms.md`)
- `/admin` — password-gated card + results console (Supabase Auth login)

## Local dev
```
npm install
npm run dev
```
With no Supabase keys set, the app runs in **local demo mode**: it plays, shows a
seeded leaderboard, and the "Reveal result (demo)" button fakes winners. No email
is saved. Add keys (below) to go live.

## Supabase setup
1. Create a project at supabase.com.
2. SQL Editor → New query → paste and run `supabase/schema.sql`.
   (Creates `players`, `races`, `picks`, `results`, the `leaderboard` view, and RLS.)
3. Settings → API → copy the **Project URL** and **anon public** key.
4. Put them in `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
5. Authentication → Users → Add user → create your admin login (email + password).
   That account is what signs in at `/admin`. (Disable public sign-ups under
   Authentication → Providers if you only want this one admin.)
6. Restart `npm run dev`.

## Daily routine (admin, no redeploys)
Each morning at `/admin`:
1. Sign in.
2. Pick the **event day** (defaults to today). "Load this day" to edit an existing card.
3. Paste the day's racecard JSON, set the **NAP** race + runner, **Save card + NAP**.
4. After each race, set winners under **Results** and **Save results** —
   the leaderboard recomputes from real picks automatically.

Card JSON shape (the textarea is pre-filled with a template):
```json
[
  { "id": "r1", "time": "14:30", "name": "Queen Anne Stakes",
    "runners": [ { "id": "a", "name": "Field Marshal" }, { "id": "b", "name": "Silver Cascade" } ] }
]
```
Times are 24h UK (BST). Picks lock automatically at each race's advertised off.

## Deploy (Vercel)
Push to GitHub, import in Vercel, set the two `VITE_SUPABASE_*` env vars, deploy.
`vercel.json` routes `/terms` and `/admin` correctly. See the walkthrough in chat.

## Before advertising the £500
Publish `/terms` (fill the bracketed placeholders: legal entity, company number,
registered address, privacy-policy link) and have the scoring wired (admin results).
