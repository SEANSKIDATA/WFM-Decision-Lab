// WFM Decision Lab — regression suite. No dependencies.
// Run from the repo root:  node tests/regression.test.js
// Exits non-zero on any failure.
const { analyze } = require('./load_engine');
const { BASE, VOLUMES, AHTS, SIZES, PEAKS, grid } = require('./grid');

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail = '') {
  if (cond) pass++; else { fail++; if (failures.length < 25) failures.push(name + (detail ? ' — ' + detail : '')); }
}
const pp = x => +(x * 100).toFixed(1);
const t0 = Date.now();

// ── 1. Published fixtures ─────────────────────────────────────────────────
{ // Default scenario (README, live tool defaults)
  const r = analyze({ ...BASE, volume: 1200, aht: 240, scheduledFTEs: 19, peakFactor: 1.0 });
  const L = n => r.levers.find(l => l.name.startsWith(n));
  check('default: baseline 43.5%', pp(r.baselineSL) === 43.5, pp(r.baselineSL));
  check('default: regime Mixed', r.regime.key === 'mixed', r.regime.key);
  check('default: ask +4 -> +1 FTE', r.regime.naiveFTEs === 4 && r.regime.residualFTEs === 1);
  check('default: redistribution +28.9 pp', pp(L('Schedule Redistribution').delta) === 28.9);
  check('default: redistribution result 72.3%', pp(L('Schedule Redistribution').sl) === 72.3);
  check('default: headcount +25.1 pp', pp(L('Add Headcount').delta) === 25.1);
  check('default: AHT +18.8 pp', pp(L('Reduce AHT').delta) === 18.8);
  check('default: shrinkage +18.0 pp', pp(L('Reduce Shrinkage').delta) === 18.0);
  check('default: compound +40.0 pp -> 83.5%', pp(r.combined.delta) === 40.0 && pp(r.combined.sl) === 83.5);
  check('default: 201 slots / 100.5 agent-hours', r.totalAgentSlots === 201);
  check('default: 10 under / 4 over of 16', r.under === 10 && r.over === 4);
  check('default: 21 FTE required', r.reqFTEs === 21);
}
{ // 70-FTE scenario (README / LinkedIn graphic). Inputs recovered by search:
  // unique match at 4,000 calls, 300s AHT, peakiness 1.3.
  const r = analyze({ ...BASE, volume: 4000, aht: 300, scheduledFTEs: 70, peakFactor: 1.3 });
  const red = r.levers.find(l => l.name.startsWith('Schedule Redistribution'));
  check('70-FTE: baseline 33.7%', pp(r.baselineSL) === 33.7, pp(r.baselineSL));
  check('70-FTE: redistributed 72.7%', pp(red.sl) === 72.7, pp(red.sl));
  check('70-FTE: ask +20 -> +2 FTE', r.regime.naiveFTEs === 20 && r.regime.residualFTEs === 2);
  check('70-FTE: 369.5 agent-hours', r.totalAgentSlots === 739);
  check('70-FTE: regime Mixed', r.regime.key === 'mixed', r.regime.key);
}

// ── 2. Grid: regime counts under the deployed ≥1 FTE rule ─────────────────
const results = grid.map(p => ({ p, r: analyze(p) }));
const counts = {};
for (const { r } of results) counts[r.regime.key] = (counts[r.regime.key] || 0) + 1;
check('grid: 1,470 scenarios', results.length === 1470);
check('grid: 700 target met', counts.healthy === 700, counts.healthy);
check('grid: 75 distribution', counts.distribution === 75, counts.distribution);
check('grid: 559 mixed', counts.mixed === 559, counts.mixed);
check('grid: 136 capacity', counts.capacity === 136, counts.capacity);

// ── 3. Per-scenario invariants ───────────────────────────────────────────
const sum = a => a.reduce((x, y) => x + y, 0);
for (const { p, r } of results) {
  const id = `${p.volume}/${p.aht}/${p.scheduledFTEs}/${p.peakFactor}`;
  const g = r.regime, red = r.levers.find(l => l.name.startsWith('Schedule Redistribution'));
  check('conserves agent-hours ' + id, sum(r.redistAgents) === sum(r.baseAgents) && sum(r.baseAgents) === r.totalAgentSlots);
  check('redistribution never worse ' + id, red.sl >= r.baselineSL - 1e-12);
  check('ask after <= ask before ' + id, g.residualFTEs <= g.naiveFTEs);
  const saving = g.naiveFTEs - g.residualFTEs;
  if (g.key === 'healthy') check('healthy => baseline meets target ' + id, r.baselineSL >= p.slTarget);
  if (g.key === 'distribution') check('distribution => redistribution reaches target ' + id, r.baselineSL < p.slTarget && red.sl >= p.slTarget);
  if (g.key === 'mixed') check('mixed => saving >= 1 FTE ' + id, red.sl < p.slTarget && saving >= 1);
  if (g.key === 'capacity') check('capacity => saving < 1 FTE ' + id, red.sl < p.slTarget && saving < 1);
  if (p.peakFactor === 0) {
    check('flat demand => redistribution +0.0 pp ' + id, Math.abs(red.delta) < 1e-12);
    if (r.baselineSL < p.slTarget) check('flat demand => capacity ' + id, g.key === 'capacity', g.key);
  }
}

// ── 4. Monotonicity ──────────────────────────────────────────────────────
const key = p => `${p.volume}/${p.aht}/${p.scheduledFTEs}/${p.peakFactor}`;
const byKey = new Map(results.map(x => [key(x.p), x.r]));
const get = (v, a, s, k) => byKey.get(`${v}/${a}/${s}/${k}`);
for (const v of VOLUMES) for (const a of AHTS) for (const k of PEAKS) for (let i = 1; i < SIZES.length; i++) {
  const lo = get(v, a, SIZES[i - 1], k), hi = get(v, a, SIZES[i], k);
  check(`more FTE never lowers baseline SL ${v}/${a}/${k}/${SIZES[i]}`, hi.baselineSL >= lo.baselineSL - 1e-12);
}
for (const a of AHTS) for (const s of SIZES) for (const k of PEAKS) for (let i = 1; i < VOLUMES.length; i++) {
  const lo = get(VOLUMES[i - 1], a, s, k), hi = get(VOLUMES[i], a, s, k);
  check(`more volume never raises baseline SL ${VOLUMES[i]}/${a}/${s}/${k}`, hi.baselineSL <= lo.baselineSL + 1e-12);
}
for (const v of VOLUMES) for (const s of SIZES) for (const k of PEAKS) for (let i = 1; i < AHTS.length; i++) {
  const lo = get(v, AHTS[i - 1], s, k), hi = get(v, AHTS[i], s, k);
  check(`longer AHT never raises baseline SL ${v}/${AHTS[i]}/${s}/${k}`, hi.baselineSL <= lo.baselineSL + 1e-12);
}

// ── Report ───────────────────────────────────────────────────────────────
console.log(`Regimes: ${JSON.stringify(counts)}`);
console.log(`${pass + fail} checks · ${pass} passed · ${fail} failed · ${Date.now() - t0} ms`);
if (fail) { console.log('FAILURES:\n  ' + failures.join('\n  ')); process.exit(1); }
console.log('ALL PASS');
