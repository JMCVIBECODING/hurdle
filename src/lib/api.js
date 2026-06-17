import { supabase, hasSupabase } from "./supabase";
import { hasStarted } from "./festival";

// --- Public game reads -----------------------------------------------------

// Today's card from Supabase: { races: [...], nap: {raceId, runnerId} } | null
export async function loadCard(day) {
  if (!hasSupabase) return null;
  const { data, error } = await supabase
    .from("races")
    .select("card, nap_race_id, nap_runner_id")
    .eq("event_day", day)
    .maybeSingle();
  if (error || !data) return null;
  return {
    races: data.card || [],
    nap: { raceId: data.nap_race_id, runnerId: data.nap_runner_id },
  };
}

// Recorded placings for a day: { [raceId]: { win, second, third } }
export async function loadResults(day) {
  if (!hasSupabase) return {};
  const { data, error } = await supabase
    .from("results")
    .select("race_id, winning_runner_id, second_runner_id, third_runner_id")
    .eq("event_day", day);
  if (error || !data) return {};
  const out = {};
  data.forEach((r) => { out[r.race_id] = { win: r.winning_runner_id, second: r.second_runner_id, third: r.third_runner_id }; });
  return out;
}

// Points for a pick given a race's result. Win 5, 2nd 3, 3rd 1.
export function pickPoints(result, runnerId) {
  if (!result || !runnerId) return 0;
  if (runnerId === result.win) return 5;
  if (runnerId === result.second) return 3;
  if (runnerId === result.third) return 1;
  return 0;
}

// Festival leaderboard: [{ name, points }], best first.
export async function loadBoard() {
  if (!hasSupabase) return null;
  const { data, error } = await supabase
    .from("leaderboard")
    .select("name, points")
    .order("points", { ascending: false })
    .order("reached_at", { ascending: true })
    .limit(50);
  if (error || !data) return null;
  return data;
}

// --- Email capture + pick storage -----------------------------------------

// Capture the email and store one pick per race that has not yet started, via
// the lock_entry SECURITY DEFINER function (writes run as the table owner, so
// the public never touches the tables directly). Picks at/after the off are
// dropped client-side. Returns { ok, stored }.
export async function lockEntry(email, day, picks, races) {
  if (!hasSupabase) return { ok: true, stored: 0, offline: true };

  const now = new Date();
  const rows = races
    .filter((r) => picks[r.id] && !hasStarted(day, r.time, now))
    .map((r) => ({ event_day: day, race_id: r.id, runner_id: picks[r.id] }));

  const { data, error } = await supabase.rpc("lock_entry", { p_email: email, p_picks: rows });
  if (error) return { ok: false, error: error.message };

  const verified = Boolean(data?.verified);
  // New / unconfirmed player: fire the confirm-entry email (Resend).
  if (!verified && data?.token) {
    try {
      await fetch("/api/send-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: data.token }),
      });
    } catch { /* ignore */ }
  }
  return { ok: true, stored: rows.length, verified };
}

// Live player count for social proof (real, via SECURITY DEFINER count fn).
export async function loadPlayerCount() {
  if (!hasSupabase) return 0;
  const { data, error } = await supabase.rpc("player_count");
  return error ? 0 : (data || 0);
}

// Optional newsletter opt-in. Posts to the Vercel function, which forces Beehiiv
// double opt-in. Fire-and-forget: never blocks or fails the lock (and 404s
// harmlessly in local dev where serverless functions don't run).
export async function subscribeNewsletter(email) {
  try {
    const r = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return await r.json().catch(() => ({ ok: r.ok }));
  } catch {
    return { ok: false };
  }
}
