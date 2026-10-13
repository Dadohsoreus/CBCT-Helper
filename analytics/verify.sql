-- Hosted verification only. All synthetic users/visits are rolled back.
begin;
do $checks$
declare aid uuid := gen_random_uuid(); sid uuid := gen_random_uuid(); other_sid uuid := gen_random_uuid(); report jsonb;
begin
  insert into auth.users(id) values(aid);
  insert into analytics_private.admins(user_id) values(aid);
  perform public.analytics_ingest(sid,'desktop','US','TX','{"clinical":20000}','{"clinical":1}','{"case_requested":1}');
  perform public.analytics_ingest(sid,'desktop','US','TX','{"clinical":35000}','{"clinical":2}','{"case_requested":1}');
  perform public.analytics_ingest(sid,'desktop','US','TX','{"clinical":10000}','{"clinical":1}','{"case_requested":1}');
  perform public.analytics_ingest(other_sid,'mobile','CA',null,'{"home":5000}','{"home":1}','{}');
  perform set_config('request.jwt.claim.sub',aid::text,true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',aid,'aal','aal2')::text,true);
  execute 'set local role authenticated';
  report := public.analytics_report(30);
  if (report->>'visits')::integer <> 2 or (report->>'toolVisits')::integer <> 1
    or (select (s->>'avgMs')::numeric from jsonb_array_elements(report->'sections') s where s->>'id'='clinical') <> 35000
    then raise exception 'Hosted reporting check failed'; end if;
  perform set_config('request.jwt.claims',jsonb_build_object('sub',aid,'aal','aal1')::text,true);
  begin perform public.analytics_report(30); raise exception 'Password-only access unexpectedly succeeded'; exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
  perform set_config('request.jwt.claims','{"aal":"aal2"}',true);
  begin perform public.analytics_report(30); raise exception 'Nonadmin access unexpectedly succeeded'; exception when insufficient_privilege then null; end;
  execute 'reset role';
end $checks$;
rollback;
select 'Hosted timing, retry, admin allowlist, and MFA checks passed; fixtures rolled back.' as result;
