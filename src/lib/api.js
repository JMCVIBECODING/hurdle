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

// Recorded winners for a day: { [raceId]: winningRunnerId }
export async function loadResults(day) {
  if (!hasSupabase) return {};
  const { data, error } = await supabase
    .from("results")
    .select("race_id, winning_runner_id")
    .eq("event_day", day);
  if (error || !data) return {};
  const out = {};
  data.forEach((r) => { out[r.race_id] = r.winning_runner_id; });
  return out;
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

  const { error } = await supabase.rpc("lock_entry", { p_email: email, p_picks: rows });
  if (error) return { ok: false, error: error.message };
  return { ok: true, stored: rows.length };
}
