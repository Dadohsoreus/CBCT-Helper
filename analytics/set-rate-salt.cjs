// One-time setup: generate the rate-limit salt in memory and send it directly to
// Wrangler's secret input. No value is printed or written to a local file.
const { spawn } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const path = require('node:path');
const child = spawn(process.execPath, [path.resolve('.analytics-check/node_modules/wrangler/bin/wrangler.js'), 'secret', 'put', 'RATE_SALT', '--config', 'analytics/wrangler.jsonc'], {
  env: { ...process.env, WRANGLER_SEND_METRICS: 'false' }, stdio: ['pipe', 'inherit', 'inherit']
});
child.on('error', error => { console.error('Salt setup failed: ' + error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
child.stdin.end(randomBytes(32).toString('hex'));
