(function (root) {
  'use strict';
  const SECTIONS = ['home', 'clinical', 'guides', 'estimator', 'fov-resolution', 'navigation', 'artifacts', 'cdt', 'citations'];
  const ACTIONS = ['case_requested', 'planner_used', 'artifact_opened', 'source_opened'];
  const EXCLUSION = 'cbct.analytics.excluded';
  const SESSION = 'cbct.analytics.session.v1';
  const IDLE = 30 * 60 * 1000;
  const GAP = 45000;
  function newSession(id, now) {
    return { id, lastActivity: now, durations: {}, views: {}, actions: {} };
  }
  function restoreSession(value, now) {
    if (!value || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.id || '') || !Number.isFinite(value.lastActivity) || value.lastActivity > now || now - value.lastActivity >= IDLE) return null;
    const state = newSession(value.id, value.lastActivity);
    for (const [field, allowed, limit] of [['durations', SECTIONS, 86400000], ['views', SECTIONS, 200], ['actions', ACTIONS, 2000]]) {
      for (const key of allowed) { const n = value[field]?.[key]; if (Number.isFinite(n) && n >= 0 && n <= limit) state[field][key] = Math.floor(n); }
    }
    return state;
  }
  // Elapsed intervals are measured with a monotonic clock, not timer tick counts.
  function createMeter(state, clock) {
    let current = null, running = false, previous = clock();
    function settle() {
      const now = clock(), delta = now - previous;
      if (running && current && delta >= 0 && delta <= GAP) state.durations[current] = (state.durations[current] || 0) + delta;
      previous = now;
    }
    return {
      settle,
      visible(value) { settle(); running = value; },
      section(name) {
        if (!SECTIONS.includes(name)) return;
        settle();
        if (name !== current) { current = name; state.views[name] = Math.min(200, (state.views[name] || 0) + 1); }
      },
      action(name) { if (ACTIONS.includes(name)) state.actions[name] = Math.min(2000, (state.actions[name] || 0) + 1); },
      payload(device) {
        settle();
        return { version: 1, sessionId: state.id, device,
          durations: Object.fromEntries(Object.entries(state.durations).map(([k, v]) => [k, Math.round(v)])),
          views: { ...state.views }, actions: { ...state.actions } };
      }
    };
  }
  const api = { SECTIONS, ACTIONS, createMeter, newSession, restoreSession, EXCLUSION, SESSION };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (!root || !root.document) return;
  const doc = root.document, config = root.CBCT_ANALYTICS_CONFIG || {}, sitePage = Boolean(doc.querySelector('[data-tab-panel]'));
  let optedOut = true, storageAvailable = true;
  try { optedOut = root.localStorage.getItem(EXCLUSION) === '1'; } catch (_) { storageAvailable = false; }
  const privacySignal = root.navigator.globalPrivacyControl === true || root.navigator.doNotTrack === '1';
  let active = false, state, meter, interval, lastPosted = '', currentSection = null;
  const device = root.matchMedia('(pointer: coarse)').matches ? (Math.min(root.screen.width, root.screen.height) < 600 ? 'mobile' : 'tablet') : 'desktop';
  const canStart = () => sitePage && config.enabled === true && config.allowedHosts?.includes(root.location.hostname) && /^https:\/\//.test(config.endpoint || '') && !optedOut && !privacySignal && storageAvailable;
  function save() { try { root.sessionStorage.setItem(SESSION, JSON.stringify(state)); } catch (_) {} }
  function reset() {
    state = newSession(root.crypto.randomUUID(), Date.now());
    meter = createMeter(state, () => root.performance.now());
    if (currentSection) meter.section(currentSection);
    lastPosted = '';
  }
  function flush() {
    if (!active || !canStart()) return;
    const payload = JSON.stringify(meter.payload(device));
    save();
    if (payload === lastPosted) return;
    lastPosted = payload;
    // No DOM text, URLs, form values, result topics, or error messages enter the payload.
    root.fetch(config.endpoint, { method: 'POST', body: payload, headers: { 'Content-Type': 'text/plain' },
      credentials: 'omit', keepalive: true, referrerPolicy: 'no-referrer' })
      .then(response => { if (!response.ok && lastPosted === payload) lastPosted = ''; })
      .catch(() => { if (lastPosted === payload) lastPosted = ''; });
  }
  function syncVisibility() {
    if (!active) return;
    meter.visible(doc.visibilityState === 'visible' && doc.hasFocus() && Date.now() - state.lastActivity < IDLE);
  }
  function stop() {
    active = false;
    root.clearInterval(interval);
    if (meter) meter.visible(false);
    try { root.sessionStorage.removeItem(SESSION); } catch (_) {}
  }
  function start() {
    if (active || !canStart()) return;
    active = true;
    let restored;
    try { restored = JSON.parse(root.sessionStorage.getItem(SESSION)); } catch (_) {}
    restored = restoreSession(restored, Date.now());
    if (restored) {
      state = restored;
      meter = createMeter(state, () => root.performance.now());
      if (currentSection) meter.section(currentSection);
    } else reset();
    syncVisibility(); flush();
    interval = root.setInterval(() => { syncVisibility(); flush(); }, 15000);
  }
  function activity(event) {
    if (!active || !event.isTrusted) return;
    if (Date.now() - state.lastActivity >= IDLE) { flush(); reset(); }
    state.lastActivity = Date.now(); syncVisibility();
  }
  root.CBCTAnalytics = {
    section(name) {
      if (!SECTIONS.includes(name)) return;
      currentSection = name;
      if (active) { meter.section(name); syncVisibility(); flush(); }
    },
    action(name) { if (active && ACTIONS.includes(name)) { meter.action(name); flush(); } },
    exclude(value) {
      optedOut = Boolean(value);
      try { root.localStorage.setItem(EXCLUSION, optedOut ? '1' : '0'); } catch (_) { storageAvailable = false; }
      if (optedOut) stop(); else start();
      updateControls();
    },
    status() { return { active, excluded: optedOut, privacySignal, configured: config.enabled === true }; }
  };
  function updateControls() {
    const status = doc.getElementById('analyticsPreferenceStatus');
    const button = doc.getElementById('analyticsPreference');
    if (status) status.textContent = !config.enabled ? 'Usage measurement is not active.' : privacySignal ? 'Usage measurement is disabled by your browser privacy preference.' : optedOut ? 'This browser is excluded from usage measurement.' : 'Usage measurement is enabled for this browser.';
    if (button) { button.textContent = optedOut ? 'Allow usage measurement in this browser' : 'Exclude this browser from usage measurement'; button.disabled = !config.enabled || privacySignal || !storageAvailable; }
  }
  doc.addEventListener('visibilitychange', () => { syncVisibility(); flush(); });
  root.addEventListener('blur', () => { syncVisibility(); flush(); });
  root.addEventListener('focus', syncVisibility);
  root.addEventListener('pagehide', () => { if (active) { meter.visible(false); flush(); } });
  root.addEventListener('pageshow', syncVisibility);
  root.addEventListener('storage', event => { if (event.key === EXCLUSION) { optedOut = event.newValue === '1'; if (optedOut) stop(); else start(); updateControls(); } });
  ['pointerdown', 'keydown', 'scroll'].forEach(name => doc.addEventListener(name, activity, { passive: true }));
  doc.addEventListener('click', event => {
    if (!event.isTrusted) return;
    if (event.target.closest('#analyticsPreference')) root.CBCTAnalytics.exclude(!optedOut);
    if (event.target.closest('#analyzeScenario') && doc.getElementById('scenarioInput')?.value.trim()) root.CBCTAnalytics.action('case_requested');
    if (event.target.closest('[data-scenario-example]')) root.CBCTAnalytics.action('case_requested');
    if (event.target.closest('.artifact-thumb')) root.CBCTAnalytics.action('artifact_opened');
    if (event.target.closest('.citation-list a, #alignmentDetails a')) root.CBCTAnalytics.action('source_opened');
  });
  doc.addEventListener('input', event => {
    if (!event.isTrusted || !event.target.closest('#calculatorForm') || !active) return;
    if (!state.actions.planner_used) root.CBCTAnalytics.action('planner_used');
  });
  // Copied tabs can inherit sessionStorage; separate concurrently open visits.
  if (typeof root.BroadcastChannel === 'function') {
    const channel = new root.BroadcastChannel('cbct-analytics-sessions'), instance = root.crypto.randomUUID();
    channel.onmessage = event => {
      const message = event.data;
      if (!active || !message || message.instance === instance || message.id !== state.id) return;
      if (message.type === 'hello') channel.postMessage({ type: 'duplicate', instance, target: message.instance, id: state.id });
      else if (message.type === 'duplicate' && message.target === instance) { reset(); syncVisibility(); flush(); }
    };
    start();
    if (active) channel.postMessage({ type: 'hello', instance, id: state.id });
  } else start();
  doc.addEventListener('DOMContentLoaded', updateControls);
})(typeof window === 'undefined' ? null : window);
