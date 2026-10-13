// Synthetic, nonclinical connection check. Use its ID to inspect/remove only this
// test fixture in the analytics database after a successful response.
const { randomUUID } = require('node:crypto');
const config = require('node:fs').readFileSync('analytics-config.js', 'utf8');
const endpoint = config.match(/endpoint:\s*'([^']+)'/)?.[1];
if (!endpoint) throw new Error('Collector endpoint is not configured');
const sessionId = randomUUID();
const payload = { version: 1, sessionId, device: 'desktop', durations: { clinical: 35000, estimator: 10000 }, views: { clinical: 2, estimator: 1 }, actions: { case_requested: 1, planner_used: 1 } };
fetch(endpoint, { method: 'POST', headers: { Origin: 'https://cbcthelper.com', 'Content-Type': 'text/plain' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(15000) })
  .then(response => { console.log(JSON.stringify({ status: response.status, sessionId })); })
  .catch(error => { console.error('Collector connection check failed: ' + error.message + (error.cause?.code ? ' (' + error.cause.code + ')' : '')); process.exitCode = 1; });
