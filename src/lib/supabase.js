import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If keys are missing the app still runs (local demo mode). Components check
// `hasSupabase` before touching the network.
export const hasSupabase = Boolean(url && key);

export const supabase = hasSupabase ? createClient(url, key) : null;
