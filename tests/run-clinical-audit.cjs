const fs = require('node:fs');
const path = require('node:path');
const { analyzeScenarioText } = require('../script.js');
const { version, reasons, sources } = require('../clinical-guidance.js');
const { cases, safe } = require('./clinical-audit-cases.cjs');
const baseline = process.argv.includes('--record-baseline');
const results = [];
const digest = r => ({ status:r.status, rule:r.rule, topic:r.topic?.id || null, title:r.title, questions:r.questions, trace:r.trace });
function inspect(c, text=c.text, reason=c.reason, suffix='', expect=c.expect) {
  const result = analyzeScenarioText(text, reason ? {reason} : {}).guidance;
  const errors = [];
  if (expect.statuses && !expect.statuses.includes(result.status)) errors.push(`Expected ${expect.statuses.join('/')}; got ${result.status}`);
  if (expect.topic && result.topic?.id !== expect.topic) errors.push(`Expected topic ${expect.topic}; got ${result.topic?.id || 'none'}`);
  if (expect.rule && result.rule !== expect.rule) errors.push(`Expected rule ${expect.rule}; got ${result.rule}`);
  if (expect.notRules?.includes(result.rule)) errors.push(`Forbidden rule ${result.rule}`);
  if (result.status === 'supported' && (!result.topic || !result.sourceKeys.length || result.questions.length)) errors.push('Support without topic/source or with unanswered questions');
  if (result.sourceKeys.some(key=>!sources[key])) errors.push('Unknown citation key');
  if (!result.title || !result.explanation || !result.trace) errors.push('Incomplete result');
  if (JSON.stringify(result)!==JSON.stringify(analyzeScenarioText(text,reason ? {reason}:{}).guidance)) errors.push('Nondeterministic result');
  results.push({id:c.id+suffix, group:c.group, text, reason, expect, errors, result:digest(result)});
  return result;
}
for (const c of cases) {
  const original = inspect(c);
  if (c.text.length > 0 && c.text.length < 5500) {
    // Clinically equivalent presentation changes. No inference should depend on casing/formatting.
    const invariant = { statuses:[original.status], topic:original.topic?.id, rule:original.rule };
    inspect(c,c.text.toUpperCase(),c.reason,'/uppercase',invariant);
    inspect(c,c.text.replace(/ /g,'  '),c.reason,'/spacing',invariant);
    inspect(c,c.text.replace(/\. /g,';\n'),c.reason,'/linebreaks',invariant);
  }
  // All purpose choices must retain major safety boundaries. This tests the production UI API only.
  const negativeBoundary = !c.expect.purposeDependent && c.expect.statuses?.every(status=>safe.includes(status)) && !c.expect.statuses.includes('supported');
  if (negativeBoundary && c.text.trim() && c.text.length <= 6000) {
    for (const reason of Object.keys(reasons)) inspect(c,c.text,reason,'/purpose-'+reason,{statuses:safe});
  }
}
const failed = results.filter(r=>r.errors.length);
const output = { date:'2026-10-14', version, synthetic:true, independentlyClinicallyValidated:false, authoredCases:cases.length, checks:results.length, passed:results.length-failed.length, failed:failed.length, results };
fs.mkdirSync(path.resolve(__dirname,'../out'),{recursive:true});
fs.writeFileSync(path.resolve(__dirname,baseline ? '../out/clinical-audit-baseline.json' : '../out/clinical-audit-results.json'),JSON.stringify(output,null,2)+'\n');
console.log(`${cases.length} authored cases; ${results.length} checks; ${output.passed} passed; ${failed.length} failed; version ${version}`);
const originals = failed.filter(r=>!r.id.includes('/'));
console.log('Original case failures:');
for (const r of originals) console.log(`${r.id}: ${r.errors.join('; ')} [${r.result.rule}]`);
const variants = failed.filter(r=>r.id.includes('/'));
const groups = {};
for (const r of variants) { const kind=r.id.split('/')[1].replace(/purpose-.*/,'purpose'); (groups[kind]??=[]).push(r.id); }
for (const [kind,ids] of Object.entries(groups)) console.log(`${kind}: ${ids.length} failures (${ids.slice(0,8).join(', ')}${ids.length>8?', ...':''})`);
if (failed.length && !baseline) process.exitCode=1;
