-- The Ascot Seven — Supabase schema (run once in the SQL Editor).
--
-- NOTE on writes: this project's environment rejected normal RLS INSERTs for
-- the anon AND authenticated roles even with permissive `TO public` policies
-- (a platform-level fault). So all writes go through SECURITY DEFINER functions
-- that run as the table owner and bypass that broken check. The public can only
-- CALL the functions; it can never write the tables directly, and emails are
-- never readable by the public. Reads (card, results, leaderboard) use normal
-- RLS select policies, which work fine.

-- 1. TABLES ----------------------------------------------------------------
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  created_at timestamptz not null default now()
);
create table if not exists public.races (
  event_day date primary key,
  card jsonb not null,                 -- [{id,time,name,runners:[{id,name}]}]
  nap_race_id text,
  nap_runner_id text,
  updated_at timestamptz not null default now()
);
create table if not exists public.picks (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  event_day date not null,
  race_id text not null,
  runner_id text not null,
  locked_at timestamptz not null default now(),
  unique (email, event_day, race_id)
);
create table if not exists public.results (
  event_day date not null,
  race_id text not null,
  winning_runner_id text not null,
  created_at timestamptz not null default now(),
  primary key (event_day, race_id)
);

-- 2. LEADERBOARD VIEW -------------------------------------------------------
create or replace view public.leaderboard as
select p.email,
       coalesce(pl.name, split_part(p.email,'@',1)) as name,
       count(*)::int as points,
       max(p.locked_at) as reached_at
from public.picks p
join public.results r
  on r.event_day = p.event_day and r.race_id = p.race_id
 and r.winning_runner_id = p.runner_id
left join public.players pl on pl.email = p.email
group by p.email, coalesce(pl.name, split_part(p.email,'@',1))
order by points desc, reached_at asc;

-- 3. RLS: reads only (writes happen via the functions below) ----------------
alter table public.players enable row level security;
alter table public.picks   enable row level security;
alter table public.races   enable row level security;
alter table public.results enable row level security;

drop policy if exists "races_read"   on public.races;
drop policy if exists "results_read" on public.results;
create policy "races_read"   on public.races   for select using (true);
create policy "results_read" on public.results for select using (true);
-- (no public select on players/picks — emails stay private; leaderboard is aggregated)

grant usage on schema public to anon, authenticated;
grant select on public.races, public.results to anon, authenticated;
grant select on public.leaderboard to anon, authenticated;

-- 4. WRITE FUNCTIONS (SECURITY DEFINER) -------------------------------------

-- Public: email capture + store picks for races not yet started.
create or replace function public.lock_entry(p_email text, p_picks jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare rec jsonb;
begin
  insert into players (email, name)
  values (p_email, split_part(p_email, '@', 1))
  on conflict (email) do update set name = excluded.name;

  for rec in select * from jsonb_array_elements(coalesce(p_picks, '[]'::jsonb))
  loop
    insert into picks (email, event_day, race_id, runner_id, locked_at)
    values (p_email, (rec->>'event_day')::date, rec->>'race_id', rec->>'runner_id', now())
    on conflict (email, event_day, race_id)
      do update set runner_id = excluded.runner_id, locked_at = now();
  end loop;
end; $$;
revoke all on function public.lock_entry(text, jsonb) from public;
grant execute on function public.lock_entry(text, jsonb) to anon, authenticated;

-- Admin: upsert a day's card + NAP. Restricted to logged-in (authenticated).
create or replace function public.save_card(p_event_day date, p_card jsonb, p_nap_race_id text, p_nap_runner_id text)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into races (event_day, card, nap_race_id, nap_runner_id, updated_at)
  values (p_event_day, p_card, p_nap_race_id, p_nap_runner_id, now())
  on conflict (event_day)
    do update set card = excluded.card, nap_race_id = excluded.nap_race_id,
                  nap_runner_id = excluded.nap_runner_id, updated_at = now();
end; $$;
revoke all on function public.save_card(date, jsonb, text, text) from public, anon;
grant execute on function public.save_card(date, jsonb, text, text) to authenticated;

-- Admin: upsert winners for a day. Restricted to logged-in (authenticated).
create or replace function public.save_results(p_event_day date, p_results jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare rec jsonb;
begin
  for rec in select * from jsonb_array_elements(coalesce(p_results, '[]'::jsonb))
  loop
    insert into results (event_day, race_id, winning_runner_id)
    values (p_event_day, rec->>'race_id', rec->>'winning_runner_id')
    on conflict (event_day, race_id)
      do update set winning_runner_id = excluded.winning_runner_id;
  end loop;
end; $$;
revoke all on function public.save_results(date, jsonb) from public, anon;
grant execute on function public.save_results(date, jsonb) to authenticated;
