import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mock, test } from 'node:test';
import worker from '../forms/worker.mjs';

const origin = 'https://cbcthelper.com';
const env = { NOTIFICATION_EMAIL: 'owner@example.org', FORM_LIMITER: { limit: async () => ({ success: true }) } };
const feedback = { email: 'tester@example.org', message: 'Please add an example.\nThank you!', name: 'Test Person', phone: '555-0100' };
const lead = { ...feedback, state: 'MN', practice: 'Test Practice' };
function submit(path, body, country = 'US', bindings = env, from = origin) {
  const req = new Request('https://forms.example/' + path, { method: 'POST',
    headers: { Origin: from, 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.1' },
    body: JSON.stringify(body) });
  req.cf = { country };
  return worker.fetch(req, bindings);
}

test('Feedback from abroad and a U.S. lead send complete, distinguishable emails to the fixed recipient', async () => {
  const sent = [];
  const transport = mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(decodeURIComponent(url), 'https://formsubmit.co/ajax/owner@example.org');
    sent.push(JSON.parse(options.body));
    return Response.json({ success: 'true' });
  });
  try {
    assert.equal((await submit('feedback', feedback, 'CA')).status, 204);
    assert.equal((await submit('lead', lead)).status, 204);
    assert.deepEqual(sent[0], { _subject: 'CBCT Helper feedback', _url: origin + '/', email: feedback.email,
      Name: feedback.name, Phone: feedback.phone, Message: feedback.message });
    assert.equal(sent[1].Practice, lead.practice);
    assert.equal(sent[1].Location, 'Minnesota, United States');
    assert.equal(sent[1].Message, lead.message);
    assert.equal(sent[1].email, lead.email);
    assert.notEqual(sent[0]._subject, sent[1]._subject);
    assert.equal((await submit('lead', { email: lead.email, name: 'Test', state: 'PR' }, 'PR')).status, 204);
    assert.equal((await submit('feedback', { message: 'Just feedback', email: feedback.email })).status, 204);
  } finally { transport.mock.restore(); }
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
    assert.equal((await submit('feedback', feedback, 'US', { ...env, NOTIFICATION_EMAIL: '' })).status, 503);
    assert.equal(transport.mock.callCount(), 0);
  } finally { transport.mock.restore(); }
});

test('Provider failures and pending activation do not produce success receipts', async () => {
  for (const response of [Response.json({ success: 'false', message: 'Needs activation' }),
    Response.json({ success: false }), Response.json({}), new Response('', { status: 502 })]) {
    const transport = mock.method(globalThis, 'fetch', async () => response);
    try { assert.equal((await submit('feedback', feedback)).status, 503); }
    finally { transport.mock.restore(); }
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
