-- Run once in a NEW, dedicated analytics project. No patient data belongs here.
begin;
create schema if not exists analytics_private;
revoke all on schema analytics_private from public, anon, authenticated;

create table analytics_private.admins (user_id uuid primary key references auth.users(id) on delete cascade);
create table analytics_private.sessions (
  session_id uuid primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  device text not null check (device in ('mobile','tablet','desktop')),
  country text check (country ~ '^[A-Z]{2}$'),
  state text check (state is null or (state ~ '^[A-Z]{2}$' and country = 'US')),
  durations jsonb not null default '{}',
  views jsonb not null default '{}',
  actions jsonb not null default '{}'
);
create index sessions_created_at on analytics_private.sessions(created_at);
create table analytics_private.daily_totals (
  day date primary key,
  visits bigint not null,
  tool_visits bigint not null
);
alter table analytics_private.admins enable row level security;
alter table analytics_private.sessions enable row level security;
alter table analytics_private.daily_totals enable row level security;
create policy no_direct_browser_access on analytics_private.admins for all to anon, authenticated using (false) with check (false);
create policy no_direct_browser_access on analytics_private.sessions for all to anon, authenticated using (false) with check (false);
create policy no_direct_browser_access on analytics_private.daily_totals for all to anon, authenticated using (false) with check (false);
revoke all on all tables in schema analytics_private from public, anon, authenticated;

create function analytics_private.merge_counters(a jsonb, b jsonb) returns jsonb
language sql immutable set search_path = '' as $$
  select coalesce(jsonb_object_agg(k, greatest(coalesce((a->>k)::bigint,0),coalesce((b->>k)::bigint,0))), '{}')
  from (select jsonb_object_keys(a) k union select jsonb_object_keys(b) k) keys;
$$;

create function public.analytics_ingest(p_session uuid, p_device text, p_country text, p_state text, p_durations jsonb, p_views jsonb, p_actions jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare item record; total_ms bigint := 0;
begin
  if p_device not in ('mobile','tablet','desktop') or p_device is null
    or p_durations is null or p_views is null or p_actions is null
    or jsonb_typeof(p_durations) <> 'object' or jsonb_typeof(p_views) <> 'object' or jsonb_typeof(p_actions) <> 'object'
    then raise exception 'Invalid measurement'; end if;
  for item in select * from jsonb_each_text(p_durations) loop
    if item.key <> all(array['home','clinical','guides','estimator','fov-resolution','navigation','artifacts','cdt','citations'])
      or item.value !~ '^[0-9]{1,8}$' or item.value::bigint > 86400000
      or coalesce((p_views->>item.key)::integer,0) < 1 then raise exception 'Invalid duration'; end if;
    total_ms := total_ms + item.value::bigint;
  end loop;
  if total_ms > 86400000 then raise exception 'Invalid duration total'; end if;
  for item in select * from jsonb_each_text(p_views) loop
    if item.key <> all(array['home','clinical','guides','estimator','fov-resolution','navigation','artifacts','cdt','citations'])
      or item.value !~ '^[0-9]{1,3}$' or item.value::integer > 200 then raise exception 'Invalid section count'; end if;
  end loop;
  for item in select * from jsonb_each_text(p_actions) loop
    if item.key <> all(array['case_requested','planner_used','artifact_opened','source_opened'])
      or item.value !~ '^[0-9]{1,4}$' or item.value::integer > 2000 then raise exception 'Invalid action count'; end if;
  end loop;
  -- Starter cap: at most 1,000 new visits daily. Updates to existing visits continue.
  -- Serialize the cap check so concurrent requests cannot exceed it.
  perform pg_advisory_xact_lock(71012026);
  if not exists(select 1 from analytics_private.sessions where session_id = p_session)
    and (select count(*) from analytics_private.sessions where created_at >= date_trunc('day', now())) >= 1000
    then return; end if;
  insert into analytics_private.sessions as s(session_id,device,country,state,durations,views,actions)
    values(p_session,p_device,p_country,p_state,p_durations,p_views,p_actions)
  on conflict(session_id) do update set
    updated_at = now(), durations = analytics_private.merge_counters(s.durations,excluded.durations),
    views = analytics_private.merge_counters(s.views,excluded.views), actions = analytics_private.merge_counters(s.actions,excluded.actions);
end;
$$;
revoke all on function public.analytics_ingest(uuid,text,text,text,jsonb,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.analytics_ingest(uuid,text,text,text,jsonb,jsonb,jsonb) to service_role;

create function analytics_private.analytics_report(p_days integer default 30) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare result jsonb; today date := (now() at time zone 'America/Chicago')::date;
begin
  if auth.uid() is null or not exists(select 1 from analytics_private.admins where user_id = auth.uid())
    or coalesce(auth.jwt()->>'aal','') <> 'aal2' then raise exception 'Administrator verification required' using errcode = '42501'; end if;
  if p_days not in (7,30,90) or p_days is null then raise exception 'Invalid reporting period'; end if;
  with selected as (
    select *, (created_at at time zone 'America/Chicago')::date as day,
      coalesce((actions->>'case_requested')::integer,0)>0 or coalesce((actions->>'planner_used')::integer,0)>0 or coalesce((actions->>'artifact_opened')::integer,0)>0 as used_tool
    from analytics_private.sessions where created_at >= ((today-p_days+1)::timestamp at time zone 'America/Chicago')
  ), section_names as (
    select * from (values ('home',null),('clinical','case_requested'),('guides',null),('estimator','planner_used'),('fov-resolution',null),('navigation',null),('artifacts','artifact_opened'),('cdt',null),('citations',null)) n(id,action)
  ), section_stats as (
    select n.id, count(s.session_id) as visits, coalesce(avg(coalesce((s.durations->>n.id)::bigint,0)),0) as avg_ms,
      coalesce(percentile_cont(0.5) within group(order by coalesce((s.durations->>n.id)::bigint,0)),0) as median_ms,
      case when n.action is null then null else count(s.session_id) filter(where coalesce((s.actions->>n.action)::integer,0)>0) end as used_visits
    from section_names n left join selected s on coalesce((s.views->>n.id)::integer,0)>0 group by n.id,n.action
  ) select jsonb_build_object(
    'visits',(select count(*) from selected), 'toolVisits',(select count(*) from selected where used_tool), 'updatedAt',now(),
    'sections',(select jsonb_agg(jsonb_build_object('id',id,'visits',visits,'avgMs',avg_ms,'medianMs',median_ms,'usedVisits',used_visits)) from section_stats),
    'daily',(select jsonb_agg(jsonb_build_object('day',d.day,'visits',(select count(*) from selected s where s.day=d.day)) order by d.day) from (select today-i as day from generate_series(0,p_days-1) i) d),
    'devices',coalesce((select jsonb_agg(jsonb_build_object('name',name,'visits',visits) order by visits desc) from (select device name,count(*) visits from selected group by device) x),'[]'::jsonb),
    'countries',coalesce((select jsonb_agg(jsonb_build_object('name',name,'visits',visits) order by visits desc) from (select coalesce(country,'Unknown') name,count(*) visits from selected group by country) x),'[]'::jsonb),
    'states',coalesce((select jsonb_agg(jsonb_build_object('name',name,'visits',visits) order by visits desc) from (select coalesce(state,'Unknown') name,count(*) visits from selected group by state) x),'[]'::jsonb)
  ) into result;
  return result;
end;
$$;
create function public.analytics_report(p_days integer default 30) returns jsonb
language sql security invoker set search_path = '' as $$
  select analytics_private.analytics_report(p_days);
$$;
revoke all on function public.analytics_report(integer) from public, anon;
grant execute on function public.analytics_report(integer) to authenticated;

create function analytics_private.maintain() returns void
language plpgsql security definer set search_path = '' as $$
begin
  -- Summarize completed visit-start dates before removing expired visit records.
  insert into analytics_private.daily_totals(day,visits,tool_visits)
  select (created_at at time zone 'America/Chicago')::date, count(*), count(*) filter(where
    coalesce((actions->>'case_requested')::integer,0)>0 or coalesce((actions->>'planner_used')::integer,0)>0 or coalesce((actions->>'artifact_opened')::integer,0)>0)
  from analytics_private.sessions
  where (created_at at time zone 'America/Chicago')::date < (now() at time zone 'America/Chicago')::date
    and (created_at at time zone 'America/Chicago')::date >= (now() at time zone 'America/Chicago')::date-89
  group by (created_at at time zone 'America/Chicago')::date
  on conflict(day) do update set visits=excluded.visits,tool_visits=excluded.tool_visits;
  delete from analytics_private.sessions where created_at < (((now() at time zone 'America/Chicago')::date-89)::timestamp at time zone 'America/Chicago');
  delete from analytics_private.daily_totals where day < (now() at time zone 'America/Chicago')::date-interval '12 months';
end;
$$;
revoke all on all functions in schema analytics_private from public, anon, authenticated;
-- The public RPC is an invoker wrapper; its private helper enforces admin + MFA.
-- Schema usage does not grant table access or expose this schema to the Data API.
grant usage on schema analytics_private to authenticated;
grant execute on function analytics_private.analytics_report(integer) to authenticated;
commit;

-- Enable pg_cron in Supabase before running the next two statements.
create extension if not exists pg_cron;
select cron.schedule('cbct-analytics-retention','10 9 * * *','select analytics_private.maintain();');

-- After creating your administrator in Authentication > Users, run separately:
-- insert into analytics_private.admins(user_id) values ('YOUR_AUTH_USER_UUID');
