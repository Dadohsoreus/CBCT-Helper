# CBCT Helper usage analytics

Status: dashboard and privacy page published at `https://cbcthelper.com/admin.html` and
`https://cbcthelper.com/privacy.html`. Collection is enabled for the allowed public hosts.
Localhost previews, administration pages, and excluded browsers send no measurements.
The user has connected Supabase and created a Cloudflare account.
The collector build passes Wrangler's dry run. The user created `CBCT Helper Analytics`
in Geppetto's Workshop, project ref `ygemdjqukltfzyfaieyy`, region `us-east-1`.
The hosted schema, private reporting helper, explicit browser-denial policies, and
daily retention are installed. Hosted timing/retry/admin/MFA checks pass, all synthetic
fixtures were rolled back, and the security advisor reports no findings. The local
public URL/key configuration is connected.

Wrangler is authenticated using encrypted local credentials. The user approved both
Workers and Worker Scripts write permissions. The collector `cbct-helper-usage` is
deployed at `https://cbct-helper-usage.odex---------ecision--enter.workers.dev`, and its
private rate-limit salt is installed. No secret value has been written to source files.

The collector's Supabase secret is installed privately in Cloudflare. A deployed
synthetic visit returned HTTP 204; its section timing, action counts, and Cloudflare-derived
country/state were verified in the database and that exact fixture was removed.
The owner-created dashboard account is allowlisted. An anonymous report request returns
HTTP 401. Public signups are saved as disabled and verified through the live Auth API.
A real-browser synthetic visit recorded 33,252 ms in Clinical Cases and 5,052 ms in the
Practice Planner; stored values matched the final payload. The browser stopped sending
after exclusion. Both deployed probe fixtures were removed by their exact UUIDs.
The owner completed authenticator enrollment and opened the protected live report.
No measured visits were stored before activation. The owner's Chrome and in-app browsers
are excluded on the public site's origin.

The activation release updates the public configuration cache version. Run the live
browser probe after GitHub Pages completes deployment and remove only its printed
synthetic UUID after verifying the stored counters. Set exclusion separately on any
additional owner browsers/devices. Never re-run the initial schema on the already
provisioned project.

## Preview

Serve the repository and open `/admin.html?demo=1`. The preview uses generated sample data,
does not load Supabase, and never sends usage measurements from the administration page.
Reports show visits, tool adoption, average/median section duration, devices, countries,
and U.S. states. CSV files are explicitly marked as sample data in preview mode.

## Account setup

1. Create a free project at https://supabase.com/dashboard. Use a dedicated project named
   `CBCT Helper Analytics`. Enter and retain the database password yourself. No database
   password or privileged key should be pasted into chat or committed to GitHub.
2. In Authentication settings, disable new public user signups. Create your administrator
   under Authentication > Users using your email and a password you enter yourself.
3. In SQL Editor, run `schema.sql`. The script creates a private schema and aggregate-only
   reporting RPC, then schedules daily retention with pg_cron. Verify the cron job exists.
4. Copy the administrator's Auth user UUID into the final commented INSERT statement and
   run that statement separately. This server-side allowlist controls dashboard access.
5. Copy the project URL and PUBLIC publishable key into `analytics-config.js`. These two
   values can be shared for setup. Keep `enabled: false` and `endpoint: ''` at this stage.
6. Create a free Cloudflare account at https://dash.cloudflare.com/sign-up. No hosting or
   DNS migration is required. The collector can run on its own `workers.dev` address.
7. Set your project URL in `wrangler.jsonc`. Deploy `collector.mjs` with the Wrangler config.
   Store a project secret key (`sb_secret_...`) as the Worker secret `SUPABASE_SECRET_KEY`.
   Enter it directly in Cloudflare; never paste it in chat or put it in public files.
   The collector uses modern keys in `apikey` only, never as a Bearer JWT. Legacy
   service-role JWTs remain compatible under `SUPABASE_SERVICE_ROLE_KEY` if needed.
   Store a separate randomly generated secret as `RATE_SALT` via the deployment tool.
8. Sign in at `/admin.html`, enroll an authenticator app, and verify its code. The database
   requires BOTH the administrator allowlist and an `aal2` token. The public HTML is not
   a security boundary. A signed-in nonadministrator cannot read reports.
9. Enable "Exclude this browser" on every browser/device you use before activating the
   tracker. Admin authentication also enables exclusion automatically. Local previews,
   admin pages, browser privacy signals, and excluded browsers do not send measurements.

## Activation checks

- Confirm unauthenticated requests and a normal authenticated nonadmin cannot read reports.
- Confirm an allowlisted admin with only a password (aal1) cannot read reports, then verify
  two-factor authentication grants access. Do not disable the database MFA check to test.
- Verify a synthetic test visit through the deployed collector from the intended origin.
  Check that its stored country/state come from Cloudflare, not the submitted JSON.
- Test a 30-second section visit, switch away, return, and revisit the section. Verify
  cumulative timing and no double counting when the same snapshot is retried or reordered.
- Verify clearing a case, initial planner calculations, and scripted clicks are not counted
  as deliberate tool use. Changing a planner input counts once per visit; no input values
  are transmitted. Opening an example case counts as a case-guidance action.
- Inspect requests: six allowed top-level fields only, named numeric counters only. No
  case text, generated topics, planner values, URLs, query strings, full user agent, or IP.
- Inspect privacy text and the opt-out control. Browser storage is used for the temporary
  visit and exclusion preference; do not describe this implementation as storage-free.
  Resolve any audience-specific consent requirements before activation.
- Verify pg_cron retention and check Supabase database/egress usage. The starter ingestion
  cap is 1,000 new visits per UTC day. At the cap further new visits are omitted. Review it
  if genuine traffic approaches the cap; do not silently raise it without a storage budget.
- Fill in the HTTPS Worker `/collect` URL, set `enabled: true`, and deploy the reviewed
  website files. Check an included browser sends requests and an excluded browser does not.
  Analytics failures must never affect clinical guidance or planner operation.

## Definitions and limitations

- A visit is a browser-tab session with a random ID, retained in sessionStorage and expired
  after 30 minutes without a trusted pointer, keyboard, or scroll interaction. It is not
  a unique person. Separate tabs may be separate visits; supported BroadcastChannel
  separates copied sessionStorage when a duplicate tab is opened.
- Duration measures visible, focused section time with performance.now(). Intervals over
  45 seconds are discarded to avoid counting computer sleep/stalls. A focused screen is
  not evidence of attention. No activity for 30 minutes pauses timing until interaction.
- Periodic snapshots are cumulative. Database upserts use greatest per counter, so retries
  and delayed older snapshots cannot add the same time twice or subtract measured time.
- Average and median use one total per visit/section, including visits with zero measured
  time; visits that never opened the section are excluded. Tool-use visits are separate
  from section visits. The dashboard does not claim successful clinical tasks.
- Reporting uses America/Chicago calendar dates; a visit is attributed to its start date.
  Very recent visits remain in progress. Raw visits cover the last 90 calendar dates.
  Daily total/adoption summaries are retained for 12 months; historical section medians
  are not reconstructed from averages. The current dashboard covers 7/30/90-day reports.
- Broad device detection is approximate. Country/state are approximate network locations;
  missing metadata is Unknown, and non-U.S. visits have no U.S. state.
- The collector is public. Origin validation/CORS alone cannot prevent forged requests.
  Bounded fields, a Cloudflare rate limiter, and a database cap reduce abuse. The limiter
  uses a rotating salted IP digest only as an ephemeral key; it is not stored with visits.
  Do not turn on request-body logging. Providers still process connection metadata.
- Exclusion applies to future requests, not deletion of already recorded visits. Private
  browsing and clearing localStorage remove the preference. Unsupported storage fails
  closed. Do Not Track and Global Privacy Control disable tracking.
- Free Supabase projects can pause after inactivity; the site continues working if the
  analytics backend pauses. There are no automatic plan upgrades in this implementation.

## Files and validation

Public site: `analytics-config.js`, `analytics-client.js`, `privacy.html`, modified
`index.html`/`script.js`. Administration: `admin.html`, `admin.css`, `admin.js`,
`admin-mobile.css`, `analytics/dashboard-model.js`. Backend: `analytics/collector.mjs`, `schema.sql`,
`wrangler.jsonc`. No backend secret belongs in a browser asset.

Run `node tests/run-analytics.js` plus existing clinical/evidence/stage1 tests.
Run `tests/check-collector-browser.cjs` with `CBCT_ANALYTICS_LIVE=1` for an explicit
published-site probe; it records a synthetic visit that must be removed by its printed
UUID after verification. It never enters administrator credentials.
Database access, monotonic updates, reporting, and retention are tested with
`tests/run-analytics-database.mjs` against a local PGlite instance. That test requires
`@electric-sql/pglite` in `.analytics-check/node_modules`; it is a development dependency
only and is not part of the published site. Hosted Supabase and Cloudflare checks remain
required before activating the production tracker.
