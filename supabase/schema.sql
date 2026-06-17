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
  verified boolean not null default false,
  verify_token text,
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
  second_runner_id text,
  third_runner_id text,
  created_at timestamptz not null default now(),
  primary key (event_day, race_id)
);

-- 2. LEADERBOARD VIEW -------------------------------------------------------
-- Points: win 5, second 3, third 1.
create or replace view public.leaderboard as
select p.email,
       coalesce(pl.name, split_part(p.email,'@',1)) as name,
       sum(case when p.runner_id = r.winning_runner_id then 5
                when p.runner_id = r.second_runner_id then 3
                when p.runner_id = r.third_runner_id  then 1
                else 0 end)::int as points,
       max(p.locked_at) as reached_at
from public.picks p
join public.results r on r.event_day = p.event_day and r.race_id = p.race_id
join public.players pl on pl.email = p.email and pl.verified = true
group by p.email, coalesce(pl.name, split_part(p.email,'@',1))
having sum(case when p.runner_id = r.winning_runner_id then 5
                when p.runner_id = r.second_runner_id then 3
                when p.runner_id = r.third_runner_id  then 1
                else 0 end) > 0
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
-- Fun racing codename for the public leaderboard (no email exposed).
create or replace function public.gen_codename()
returns text language sql volatile set search_path = public as $$
  select (array['Gallop','Silk','Turf','Furlong','Stable','Paddock','Steeple','Derby','Sprint','Photo','Maiden','Going','Ascot','Epsom','Aintree'])[floor(random()*15)+1]
      || (array['Hawk','Rail','King','Ghost','Bolt','Ace','Fox','Colt','Dash','Pulse','Rider','Oracle','Tipster','Jockey','Flyer'])[floor(random()*15)+1]
      || floor(random()*900+100)::text;
$$;

-- Returns { token, verified } so the app can email an unconfirmed player.
create or replace function public.lock_entry(p_email text, p_picks jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare rec jsonb; v_token text; v_verified boolean; v_name text;
begin
  insert into players (email, name, verify_token, verified)
  values (p_email, public.gen_codename(), gen_random_uuid()::text, false)
  on conflict (email) do update set email = excluded.email   -- keep existing codename/token/verified
  returning verify_token, verified, name into v_token, v_verified, v_name;

  for rec in select * from jsonb_array_elements(coalesce(p_picks, '[]'::jsonb))
  loop
    insert into picks (email, event_day, race_id, runner_id, locked_at)
    values (p_email, (rec->>'event_day')::date, rec->>'race_id', rec->>'runner_id', now())
    on conflict (email, event_day, race_id)
      do update set runner_id = excluded.runner_id, locked_at = now();
  end loop;

  return jsonb_build_object('token', v_token, 'verified', coalesce(v_verified, false), 'name', v_name);
end; $$;
revoke all on function public.lock_entry(text, jsonb) from public;
grant execute on function public.lock_entry(text, jsonb) to anon, authenticated;

-- Admin-only: list unverified players (email + token) to re-send confirm links.
create or replace function public.pending_confirmations()
returns table(email text, token text)
language sql security definer set search_path = public stable as $$
  select email, verify_token from players where verified = false and verify_token is not null;
$$;
revoke all on function public.pending_confirmations() from public, anon;
grant execute on function public.pending_confirmations() to authenticated;

-- Public live player count for social proof.
create or replace function public.player_count()
returns int language sql security definer set search_path = public stable as $$
  select count(*)::int from players;
$$;
grant execute on function public.player_count() to anon, authenticated;

-- Confirm a player's email (makes them prize-eligible). Returns their codename.
create or replace function public.verify_email(p_token text)
returns text language plpgsql security definer set search_path = public as $$
declare v_name text;
begin
  if p_token is null then return null; end if;
  update players set verified = true where verify_token = p_token
    returning name into v_name;
  return v_name;
end; $$;
revoke all on function public.verify_email(text) from public;
grant execute on function public.verify_email(text) to anon, authenticated;

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
    insert into results (event_day, race_id, winning_runner_id, second_runner_id, third_runner_id)
    values (p_event_day, rec->>'race_id', rec->>'winning_runner_id', rec->>'second_runner_id', rec->>'third_runner_id')
    on conflict (event_day, race_id)
      do update set winning_runner_id = excluded.winning_runner_id,
                    second_runner_id = excluded.second_runner_id,
                    third_runner_id = excluded.third_runner_id;
  end loop;
end; $$;
revoke all on function public.save_results(date, jsonb) from public, anon;
grant execute on function public.save_results(date, jsonb) to authenticated;
