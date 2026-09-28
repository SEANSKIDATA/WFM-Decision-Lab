// Does the capacity-ask saving scale with operation size?
// Load-matched grid: call volume scales with size so every operation carries the same
// utilization (offered workload ÷ productive hours), 8 → 500 FTE.
// Saving measured at 0.1 FTE resolution (bracket at 1 FTE, then refine at 0.1).
// Run from repo root: node analysis/sweep_scale.js
const fs = require('fs');
const { analyze, demandShape, allocateInt, evaluateDay, redistribute } = require('../tests/load_engine');
const BASE = { shrinkage: 0.34, slTarget: 0.80, answerSec: 20, maxOcc: 0.90, intervals: 16, ahtCut: 0.08, headAdd: 0.10, shrCut: 0.05 };
const SIZES = [8, 12, 19, 30, 45, 70, 100, 200, 500];
const UTIL = [0.70, 0.75, 0.80, 0.85, 0.90, 0.95, 1.00, 1.05, 1.10];
const AHTS = [180, 240, 300];
const PEAKS = [0.4, 0.8, 1.2, 1.6, 2.0];

function saving(p) {
  const { volume, aht, shrinkage, scheduledFTEs: F, slTarget, answerSec, maxOcc, intervals, peakFactor } = p;
  const calls = demandShape(peakFactor).map(s => volume * s);
  const flat = f => allocateInt(Math.round(f * (1 - shrinkage) * intervals), Array(intervals).fill(1));
  const slB = f => evaluateDay(calls, flat(f), aht, answerSec, 1800).sl;
  const slR = f => evaluateDay(calls, redistribute(calls, flat(f), aht, answerSec, slTarget, maxOcc), aht, answerSec, 1800).sl;
  const ask = sl => {
    if (sl(F) >= slTarget) return 0;
    let hi = F; while (sl(hi) < slTarget && hi < F + 2000) hi += 1;          // bracket in whole FTE
    let f = hi - 1; while (f < hi) { f = +(f + 0.1).toFixed(4); if (sl(f) >= slTarget) break; }  // refine at 0.1
    return +(f - F).toFixed(4);
  };
  return { naive: ask(slB), residual: ask(slR) };
}

const rows = [];
const t0 = Date.now();
for (const F of SIZES) for (const u of UTIL) for (const aht of AHTS) for (const peakFactor of PEAKS) {
  const volume = Math.round(u * F * (1 - BASE.shrinkage) * 8 * 3600 / aht);
  const p = { ...BASE, scheduledFTEs: F, aht, peakFactor, volume };
  const r = analyze(p);
  if (r.regime.key === 'healthy' || r.regime.key === 'distribution') { rows.push({ F, u, aht, peakFactor, volume, regime: r.regime.key }); continue; }
  const { naive, residual } = saving(p);
  rows.push({ F, u, aht, peakFactor, volume, regime: r.regime.key, naive, residual, save: +(naive - residual).toFixed(4) });
}
const cols = ['F', 'u', 'aht', 'peakFactor', 'volume', 'regime', 'naive', 'residual', 'save'];
fs.writeFileSync(__dirname + '/results/scale_sweep.csv', [cols.join(','), ...rows.map(r => cols.map(c => r[c] ?? '').join(','))].join('\n') + '\n');

const q = (a, p) => { const s = [...a].sort((x, y) => x - y); const i = (s.length - 1) * p; return s[Math.floor(i)] + (s[Math.ceil(i)] - s[Math.floor(i)]) * (i % 1); };
console.log(`${rows.length} scenarios, ${((Date.now() - t0) / 1000).toFixed(0)}s\n`);
console.log('size  in-scope  any-saving  median%  p25%  p75%  medianFTE  mixed@1FTE  mixed@5%  mixed@10%');
for (const F of SIZES) {
  const ins = rows.filter(r => r.F === F && r.save !== undefined);
  const pos = ins.filter(r => r.save > 0).map(r => 100 * r.save / F);
  const pct = x => (100 * x / ins.length).toFixed(0).padStart(3) + '%';
  console.log(`${String(F).padStart(4)}  ${String(ins.length).padStart(8)}  ${pct(pos.length).padStart(10)}  ${q(pos, .5).toFixed(1).padStart(7)}  ${q(pos, .25).toFixed(1).padStart(4)}  ${q(pos, .75).toFixed(1).padStart(4)}  ${q(ins.filter(r=>r.save>0).map(r=>r.save), .5).toFixed(1).padStart(9)}  ${pct(ins.filter(r => r.save >= 1).length).padStart(10)}  ${pct(ins.filter(r => r.save > 0 && r.save >= 0.05 * F).length).padStart(8)}  ${pct(ins.filter(r => r.save > 0 && r.save >= 0.10 * F).length).padStart(9)}`);
}
