import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mock, test } from 'node:test';
import worker from '../forms/worker.mjs';

const origin = 'https://cbcthelper.com';
const env = { FORMSUBMIT_ALIAS: '0123456789abcdef0123456789abcdef', FORM_LIMITER: { limit: async () => ({ success: true }) } };
const feedback = { email: 'tester@example.org', message: 'Please add an example.\nThank you!', name: 'Test Person', phone: '555-0100' };
const lead = { ...feedback, state: 'MN', practice: 'Test Practice' };
function submit(path, body, country = 'US', bindings = env, from = origin) {
  const req = new Request('https://forms.example/' + path, { method: 'POST',
    headers: { Origin: from, 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.1' },
    body: JSON.stringify(body) });
  req.cf = { country };
  return worker.fetch(req, bindings);
}

test('Eligible submissions receive complete, distinguishable emails addressed to the configured form alias', async () => {
    const fb = await (await submit('feedback', feedback, 'CA')).json();
    const request = await (await submit('lead', lead)).json();
    assert.equal(fb.alias, env.FORMSUBMIT_ALIAS);
    assert.equal(request.alias, env.FORMSUBMIT_ALIAS);
    assert.deepEqual(fb.mail, { _subject: 'CBCT Helper feedback', _url: origin + '/', email: feedback.email,
      Name: feedback.name, Phone: feedback.phone, Message: feedback.message });
    assert.equal(request.mail.Practice, lead.practice);
    assert.equal(request.mail.Location, 'Minnesota, United States');
    assert.equal(request.mail.Message, lead.message);
    assert.equal(request.mail.email, lead.email);
    assert.notEqual(fb.mail._subject, request.mail._subject);
    assert.equal((await submit('lead', { email: lead.email, name: 'Test', state: 'PR' }, 'PR')).status, 200);
    assert.equal((await submit('feedback', { message: 'Just feedback', email: feedback.email })).status, 200);
});

test('Ineligible, invalid and excessive requests never reach the email service', async () => {
  const transport = mock.method(globalThis, 'fetch', () => { throw new Error('Unexpected email'); });
  try {
    for (const country of ['CA', 'GB', 'XX', '']) assert.equal((await submit('lead', lead, country)).status, 422);
    for (const value of [{ ...lead, state: 'outside' }, { ...lead, state: 'ZZ' }, { ...lead, name: ' ' },
      { ...lead, _cc: 'other@example.org' }, { ...lead, website: 'spam' }]) {
      assert.equal((await submit('lead', value)).status, 400);
    }
    for (const value of [null, [], { ...feedback, email: '' }, { ...feedback, email: 'bad' },
      { ...feedback, email: 'a@example.org\nBcc:other' }, { ...feedback, message: ' ' }, { ...feedback, message: 'a'.repeat(4001) }]) {
      assert.equal((await submit('feedback', value)).status, 400);
    }
    assert.equal((await submit('feedback', { ...feedback, message: 'x'.repeat(31000) })).status, 413);
    assert.equal((await submit('feedback', feedback, 'US', env, 'https://other.example')).status, 403);
    assert.equal((await submit('feedback', feedback, 'US', { ...env, FORM_LIMITER: { limit: async () => ({ success: false }) } })).status, 429);
    assert.equal((await submit('feedback', feedback, 'US', { ...env, FORMSUBMIT_ALIAS: '' })).status, 503);
    assert.equal(transport.mock.callCount(), 0);
  } finally { transport.mock.restore(); }
});

test('A caller cannot choose the notification type, recipient or reply headers independently of the validated fields', async () => {
  for (const key of ['alias', '_subject', '_replyto', 'mail', 'Location']) {
    const response = await submit('feedback', { ...feedback, [key]: 'override' });
    assert.equal(response.status, 400);
    assert.equal(await response.text(), '');
  }
});

test('Time on the new pages is excluded from the previous clinical or planner section', () => {
  const { createMeter, newSession } = createRequire(import.meta.url)('../analytics-client.js');
  let time = 0;
  const meter = createMeter(newSession(crypto.randomUUID(), 0), () => time);
  meter.section('clinical'); meter.visible(true); time += 3000; meter.section('feedback');
  time += 9000; meter.section('contact'); time += 2000; meter.section('resources');
  time += 5000; meter.section('clinical'); time += 1000;
  assert.deepEqual(meter.payload('desktop').durations, { clinical: 4000 });
});
