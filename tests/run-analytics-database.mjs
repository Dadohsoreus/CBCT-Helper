import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PGlite } from '../.analytics-check/node_modules/@electric-sql/pglite/dist/index.js';
const db=new PGlite();
try {
await db.exec(`create role anon; create role authenticated; create role service_role;
create schema auth; create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
create function auth.jwt() returns jsonb language sql as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
grant usage on schema auth to authenticated; grant execute on all functions in schema auth to authenticated;`);
const sql=(await readFile('analytics/schema.sql','utf8')).split('-- Enable pg_cron')[0];
await db.exec(sql);
let checks=0;
async function test(name,fn){await fn();checks++;console.log('PASS '+name);}
const admin=randomUUID(), other=randomUUID();
await db.query('insert into auth.users values($1),($2)',[admin,other]);
await db.query('insert into analytics_private.admins values($1)',[admin]);
const visit=randomUUID();
async function ingest(id,ms=10000,actions={case_requested:1}){await db.query(`select public.analytics_ingest($1,'desktop','US','TX',$2,$3,$4)`,[id,JSON.stringify({clinical:ms}),JSON.stringify({clinical:1}),JSON.stringify(actions)]);}
async function auth(user,aal){await db.query("select set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claims',$2,false)",[user,JSON.stringify({aal})]);await db.exec('set role authenticated');}
async function reset(){await db.exec('reset role');}
await test('Anonymous clients cannot ingest, read private visits, or request reports',async()=>{
  await db.exec('set role anon'); await assert.rejects(()=>ingest(visit)); await assert.rejects(()=>db.query('select * from analytics_private.sessions')); await assert.rejects(()=>db.query('select public.analytics_report(30)')); await reset();
});
await test('Ingestion is callable by collector service role and idempotent for out-of-order snapshots',async()=>{
  await db.exec('set role service_role'); await ingest(visit,20000); await ingest(visit,35000); await ingest(visit,10000); await reset();
  const row=(await db.query('select durations,actions from analytics_private.sessions')).rows[0];assert.equal(row.durations.clinical,35000);assert.equal(row.actions.case_requested,1);
});
await test('A signed-in nonadmin and password-only admin cannot read reports',async()=>{
  await auth(other,'aal2');await assert.rejects(()=>db.query('select public.analytics_report(30)'));await reset();await auth(admin,'aal1');await assert.rejects(()=>db.query('select public.analytics_report(30)'));await reset();
});
await test('Verified administrator receives aggregates only, correct averages and medians',async()=>{
  await ingest(randomUUID(),65000);const id=randomUUID();await db.query(`select public.analytics_ingest($1,'mobile','CA',null,'{}','{"home":1}','{}')`,[id]);
  await auth(admin,'aal2');const report=(await db.query('select public.analytics_report(30) report')).rows[0].report;await reset();
  assert.equal(report.visits,3);assert.equal(report.toolVisits,2);const section=report.sections.find(s=>s.id==='clinical');assert.equal(section.visits,2);assert.equal(section.avgMs,50000);assert.equal(section.medianMs,50000);assert.equal(section.usedVisits,2);assert.equal(report.daily.length,30);assert.ok(!JSON.stringify(report).includes(visit));
});
await test('Database independently rejects unknown counters and invalid reporting ranges',async()=>{
  await assert.rejects(()=>db.query(`select public.analytics_ingest($1,'desktop','US','TX','{"patient":10}','{"clinical":1}','{}')`,[randomUUID()]));await auth(admin,'aal2');await assert.rejects(()=>db.query('select public.analytics_report(1000)'));await reset();
});
await test('Retention preserves completed aggregate totals and removes expired visits/summaries',async()=>{
  await db.query(`insert into analytics_private.daily_totals values((now() at time zone 'America/Chicago')::date-90,12,8),((now() at time zone 'America/Chicago')::date-400,5,3)`);
  await db.query(`insert into analytics_private.sessions(session_id,created_at,device,views) values($1,now()-interval '91 days','desktop','{"home":1}')`,[randomUUID()]);
  await db.exec('select analytics_private.maintain();');assert.equal((await db.query("select count(*)::int n from analytics_private.sessions where created_at < now()-interval '90 days'")).rows[0].n,0);
  const totals=(await db.query('select visits from analytics_private.daily_totals order by day')).rows;assert.deepEqual(totals.map(x=>Number(x.visits)),[12]);
});
await test('Unauthorized roles cannot invoke retention or access administrator allowlist',async()=>{await auth(admin,'aal2');await assert.rejects(()=>db.query('select analytics_private.maintain()'));await assert.rejects(()=>db.query('select * from analytics_private.admins'));await reset();});
console.log(`Database: ${checks}/${checks} checks passed.`);
} catch(error) { console.error('Database check failed: '+error.message); process.exitCode=1; }
finally { await db.close(); }
