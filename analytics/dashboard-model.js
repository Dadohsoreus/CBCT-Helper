(function (root) {
  'use strict';
  const labels = { home: 'Home', clinical: 'Clinical cases', guides: 'Scan guides', estimator: 'Practice planner', 'fov-resolution': 'Field of view & resolution', navigation: 'Image review', artifacts: 'Artifact examples', cdt: 'CDT reference', citations: 'About & references' };
  function median(values) {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b), mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }
  function summarize(rows, days, today = new Date().toISOString().slice(0, 10)) {
    const dates = Array.from({ length: days }, (_, i) => new Date(Date.parse(today + 'T12:00:00Z') - (days - 1 - i) * 86400000).toISOString().slice(0, 10));
    rows = rows.filter(row => dates.includes(row.day));
    const tool = row => ['case_requested', 'planner_used', 'artifact_opened'].some(action => (row.actions[action] || 0) > 0);
    const group = key => Object.entries(rows.reduce((counts, row) => { const value = row[key] || 'Unknown'; counts[value] = (counts[value] || 0) + 1; return counts; }, {})).map(([name, visits]) => ({ name, visits })).sort((a, b) => b.visits - a.visits);
    return { visits: rows.length, toolVisits: rows.filter(tool).length, updatedAt: new Date().toISOString(),
      daily: dates.map(day => ({ day, visits: rows.filter(row => row.day === day).length })),
      sections: Object.entries(labels).map(([id, label]) => {
        const visited = rows.filter(row => (row.views[id] || 0) > 0), durations = visited.map(row => row.durations[id] || 0);
        const action = { clinical: 'case_requested', estimator: 'planner_used', artifacts: 'artifact_opened' }[id];
        return { id, label, visits: visited.length, avgMs: visited.length ? durations.reduce((sum, value) => sum + value, 0) / visited.length : 0, medianMs: median(durations), usedVisits: action ? visited.filter(row => row.actions[action] > 0).length : null };
      }), devices: group('device'), countries: group('country'), states: group('state') };
  }
  function demoRows(today) {
    const rows = [];
    for (let day = 0; day < 90; day++) {
      const date = new Date(Date.parse(today + 'T12:00:00Z') - day * 86400000).toISOString().slice(0, 10);
      const n = 7 + ((day * 11 + 3) % 19);
      for (let i = 0; i < n; i++) {
        const sections = ['home', i % 3 === 0 ? 'clinical' : i % 3 === 1 ? 'estimator' : 'artifacts'];
        if (i % 4 === 0) sections.push('guides', 'navigation');
        if (i % 5 === 0) sections.push('fov-resolution');
        if (i % 7 === 0) sections.push('citations', 'cdt');
        const views = Object.fromEntries(sections.map(id => [id, 1])), durations = Object.fromEntries(sections.map(id => [id, id === 'home' ? 8000 + i * 500 : 35000 + ((i * 17 + day * 7) % 190) * 1000]));
        const actions = {};
        if (i % 4 !== 0) actions[{ clinical: 'case_requested', estimator: 'planner_used', artifacts: 'artifact_opened' }[sections[1]]] = 1;
        rows.push({ day: date, device: i % 5 === 0 ? 'tablet' : i % 3 === 0 ? 'mobile' : 'desktop', country: i % 8 === 0 ? 'CA' : 'US', state: i % 8 === 0 ? null : ['TX', 'IL', 'CA', 'FL', 'NY'][i % 5], views, durations, actions });
      }
    }
    return rows;
  }
  const model = { labels, median, summarize, demoRows };
  if (typeof module !== 'undefined' && module.exports) module.exports = model;
  else root.CBCTDashboardModel = model;
})(typeof window === 'undefined' ? null : window);
