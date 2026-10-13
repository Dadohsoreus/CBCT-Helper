(async function () {
  'use strict';
  const $ = id => document.getElementById(id), config = window.CBCT_ANALYTICS_CONFIG || {}, model = window.CBCTDashboardModel;
  const EXCLUSION = 'cbct.analytics.excluded';
  let client, demo = false, report, factor, loading = false, generation = 0;
  const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  function message(text, error = false) { $('message').textContent = text; $('message').classList.toggle('error', error); }
  function exclusion() {
    try {
      const excluded = localStorage.getItem(EXCLUSION) === '1';
      $('exclusionStatus').textContent = excluded ? 'This browser is excluded from usage measurement.' : 'This browser is not excluded from public-site usage measurement.';
      $('excludeBrowser').textContent = excluded ? 'Allow measurement in this browser' : 'Exclude this browser';
    } catch (_) { $('exclusionStatus').textContent = 'Browser storage is unavailable. Exclusion cannot be saved.'; $('excludeBrowser').disabled = true; }
  }
  function exclude(value) { try { localStorage.setItem(EXCLUSION, value ? '1' : '0'); } catch (_) {} exclusion(); }
  exclusion();
  $('excludeBrowser').addEventListener('click', () => exclude(localStorage.getItem(EXCLUSION) !== '1'));
  window.addEventListener('storage', exclusion);
  const number = value => new Intl.NumberFormat('en-US').format(value || 0);
  const duration = value => { const seconds = Math.round((value || 0) / 1000); return seconds < 60 ? seconds + ' sec' : Math.floor(seconds / 60) + ' min ' + seconds % 60 + ' sec'; };
  function cell(value, row) { const td = document.createElement('td'); td.textContent = value; row.append(td); }
  function render(data) {
    report = data; $('reports').hidden = false; $('loginPanel').hidden = true; $('mfaPanel').hidden = true; $('rangeControl').hidden = false;
    $('visits').textContent = number(data.visits); $('toolVisits').textContent = number(data.toolVisits); $('adoption').textContent = data.visits ? Math.round(100 * data.toolVisits / data.visits) + '%' : '—';
    $('dataStatus').textContent = demo ? 'Sample data · not actual website activity' : 'Updated ' + new Date(data.updatedAt).toLocaleString('en-US', { timeZone: 'America/Chicago' }) + ' Central Time';
    $('sections').replaceChildren(); $('sectionCards').replaceChildren();
    for (const section of data.sections) {
      const tr = document.createElement('tr');
      [model.labels[section.id], number(section.visits), section.visits ? duration(section.avgMs) : '—', section.visits ? duration(section.medianMs) : '—', section.usedVisits === null ? '—' : number(section.usedVisits)].forEach(value => cell(value, tr));
      $('sections').append(tr);
      const card = document.createElement('article'); card.className = 'section-time-card';
      const heading = document.createElement('h3'); heading.textContent = model.labels[section.id]; card.append(heading);
      const details = document.createElement('dl');
      for (const [label, value] of [['Visits', number(section.visits)], ['Visits using tool', section.usedVisits === null ? '—' : number(section.usedVisits)], ['Average time', section.visits ? duration(section.avgMs) : '—'], ['Median time', section.visits ? duration(section.medianMs) : '—']]) {
        const group = document.createElement('div'), term = document.createElement('dt'), definition = document.createElement('dd');
        term.textContent = label; definition.textContent = value; group.append(term, definition); details.append(group);
      }
      card.append(details); $('sectionCards').append(card);
    }
    $('chart').replaceChildren();
    const max = Math.max(1, ...data.daily.map(day => day.visits));
    for (const day of data.daily) {
      const bar = document.createElement('div'); bar.className = 'bar'; bar.style.setProperty('--height', (day.visits / max * 100) + '%'); bar.title = day.day + ': ' + number(day.visits) + ' visits'; bar.setAttribute('aria-label', bar.title); $('chart').append(bar);
    }
    let dates = document.querySelector('.chart-labels');
    if (!dates) { dates = document.createElement('div'); dates.className = 'chart-labels'; $('chart').after(dates); }
    dates.replaceChildren();
    [data.daily[0]?.day || '', data.daily.at(-1)?.day || ''].forEach(day => { const span = document.createElement('span'); span.textContent = day; dates.append(span); });
    for (const key of ['devices', 'countries', 'states']) {
      $(key).replaceChildren();
      if (!data[key].length) { const p = document.createElement('p'); p.className = 'empty'; p.textContent = 'No visits in this period.'; $(key).append(p); }
      for (const item of data[key]) {
        const row = document.createElement('div'); row.className = 'breakdown-row';
        const label = document.createElement('span'), value = document.createElement('strong');
        let name = item.name;
        if (key === 'countries' && name !== 'Unknown') { try { name = new Intl.DisplayNames(['en'], { type: 'region' }).of(name); } catch (_) {} }
        label.textContent = name === 'Unknown' && key === 'states' ? 'Unknown / outside U.S.' : name.charAt(0).toUpperCase() + name.slice(1);
        value.textContent = number(item.visits); row.append(label, value); $(key).append(row);
      }
    }
    $('leavePreview').hidden = !demo;
  }
  async function load() {
    const request = ++generation;
    if (demo) { render(model.summarize(model.demoRows(today()), Number($('range').value), today())); message('Preview only. These figures are sample data; no visitor activity is being collected by this preview.'); return; }
    if (!client) return;
    $('refresh').disabled = true;
    try {
      const { data, error } = await client.rpc('analytics_report', { p_days: Number($('range').value) });
      if (request !== generation) return;
      if (error) throw error;
      render(data); message(data.visits ? '' : 'No measured visits in this period.');
    } catch (_) {
      if (request !== generation) return;
      $('reports').hidden = true; message('The report could not be loaded. Check your sign-in and project connection, then try again.', true);
      $('loginPanel').hidden = false;
    } finally { $('refresh').disabled = false; }
  }
  async function authenticate() {
    $('reports').hidden = true;
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) { $('loginPanel').hidden = false; $('mfaPanel').hidden = true; $('signOut').hidden = true; return; }
    // Successful admin authentication excludes this browser before returning to the public site.
    exclude(true); $('signOut').hidden = false;
    const assurance = await client.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assurance.error) throw assurance.error;
    if (assurance.data.currentLevel === 'aal2') { await load(); return; }
    const factors = await client.auth.mfa.listFactors();
    if (factors.error) throw factors.error;
    factor = factors.data.totp.find(item => item.status === 'verified');
    $('loginPanel').hidden = true; $('mfaPanel').hidden = false; $('mfaQr').hidden = true; $('mfaSecret').hidden = true;
    if (!factor) {
      // Remove interrupted enrollments before starting a fresh QR enrollment.
      for (const pending of factors.data.all.filter(item => item.status === 'unverified')) await client.auth.mfa.unenroll({ factorId: pending.id });
      const enrollment = await client.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'CBCT Helper administration' });
      if (enrollment.error) throw enrollment.error;
      factor = enrollment.data;
      $('mfaTitle').textContent = 'Set up two-factor authentication'; $('mfaInstructions').textContent = 'Scan this code with your authenticator app, then enter its six-digit code. Keep access to your Supabase account for administrator recovery.';
      // Supabase returns an SVG; display it as an image rather than injecting markup.
      const qr = factor.totp.qr_code;
      $('mfaQr').src = qr.startsWith('data:image/') ? qr : 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(qr);
      $('mfaQr').hidden = false; $('mfaSecret').textContent = 'Manual setup key: ' + factor.totp.secret; $('mfaSecret').hidden = false;
    } else { $('mfaTitle').textContent = 'Verify your sign-in'; $('mfaInstructions').textContent = 'Enter the six-digit code from your authenticator app.'; }
  }
  $('previewButton').addEventListener('click', () => { demo = true; load(); });
  $('leavePreview').addEventListener('click', async () => { demo = false; generation++; $('reports').hidden = true; $('rangeControl').hidden = true; message(''); if (client) await authenticate(); else { $('loginPanel').hidden = false; await connect(); } });
  $('range').addEventListener('change', load); $('refresh').addEventListener('click', load);
  $('export').addEventListener('click', () => {
    if (!report) return;
    const quote = value => '"' + String(value).replaceAll('"', '""') + '"';
    const rows = [['Data', demo ? 'Sample data' : 'Measured website usage'], ['Period', 'Last ' + $('range').value + ' days'], ['Visits', report.visits], ['Tool visits', report.toolVisits], [], ['Section', 'Visits', 'Average seconds', 'Median seconds', 'Visits using tool'], ...report.sections.map(s => [model.labels[s.id], s.visits, (s.avgMs / 1000).toFixed(1), (s.medianMs / 1000).toFixed(1), s.usedVisits ?? ''])];
    const url = URL.createObjectURL(new Blob([rows.map(row => row.map(quote).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = (demo ? 'sample-' : '') + 'cbct-usage-' + today() + '.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  $('loginForm').addEventListener('submit', async event => {
    event.preventDefault(); if (loading || !client) return; loading = true; message('Signing in…');
    try { const { error } = await client.auth.signInWithPassword({ email: $('email').value.trim(), password: $('password').value }); $('password').value = ''; if (error) throw error; await authenticate(); if (!$('reports').hidden) message(''); else message('Complete two-factor verification to view reports.'); }
    catch (_) { message('Sign-in failed. Check your details and administrator access.', true); }
    finally { loading = false; }
  });
  $('mfaForm').addEventListener('submit', async event => {
    event.preventDefault(); if (loading || !client || !factor) return; loading = true;
    try { const { error } = await client.auth.mfa.challengeAndVerify({ factorId: factor.id, code: $('mfaCode').value }); $('mfaCode').value = ''; if (error) throw error; $('mfaQr').removeAttribute('src'); $('mfaSecret').textContent = ''; await authenticate(); }
    catch (_) { message('Verification failed. Enter the current authenticator code and try again.', true); }
    finally { loading = false; }
  });
  $('signOut').addEventListener('click', async () => { generation++; demo = false; report = null; if (client) await client.auth.signOut(); $('reports').hidden = true; $('mfaPanel').hidden = true; $('rangeControl').hidden = true; $('signOut').hidden = true; $('loginPanel').hidden = false; $('mfaSecret').textContent = ''; $('mfaQr').removeAttribute('src'); message('Signed out. This browser remains excluded.'); });
  if (new URLSearchParams(location.search).get('demo') === '1') { demo = true; await load(); }
  async function connect() {
  if (config.supabaseUrl && config.supabasePublishableKey && !client) {
    try {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.117.3');
      client = createClient(config.supabaseUrl, config.supabasePublishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storage: sessionStorage } });
      $('setupNote').textContent = 'Sign in with your administrator account. Two-factor verification is required to view reports.'; $('loginForm').hidden = false;
      // Keep callbacks synchronous; Supabase auth callbacks must not await other auth calls.
      client.auth.onAuthStateChange(event => { if (event === 'SIGNED_OUT') { generation++; report = null; if (!demo) { $('reports').hidden = true; $('mfaPanel').hidden = true; $('loginPanel').hidden = false; } } });
      if (!demo) await authenticate();
    } catch (_) { message('Administrator connection is unavailable. The public website continues to work.', true); }
  }
  }
  if (!demo) await connect();
})();
