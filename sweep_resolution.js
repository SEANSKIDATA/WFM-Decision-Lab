// Former 2.0 pp rule vs the FTE rule, at 1.0 / 0.5 / 0.25 / 0.1 FTE measurement resolution.
// 2pp rule: Mixed if redistribution recovers >= 2.0 pp of service level at CURRENT staffing.
// FTE rule: Mixed if reallocating first reduces the capacity request by any amount at that resolution.
// Run from repo root: node analysis/sweep_resolution.js
const fs = require('fs');
const { analyze } = require('../tests/load_engine'); const { grid } = require('../tests/grid');
const saving = require('./saving');
const ins = grid.map(p => ({ p, r: analyze(p) })).filter(x => !['healthy', 'distribution'].includes(x.r.regime.key));
const out = ['step_fte,disagreements,pct_of_in_scope,fte_mixed_2pp_capacity,fte_capacity_2pp_mixed'];
for (const step of [1, 0.5, 0.25, 0.1]) {
  let a = 0, b = 0;
  for (const { p, r } of ins) { const fte = saving(p, step) > 0, pp2 = r.regime.redistDelta >= 0.02; if (fte && !pp2) a++; if (!fte && pp2) b++; }
  out.push([step, a + b, Math.round(100 * (a + b) / ins.length) + '%', a, b].join(','));
}
console.log(`In scope: ${ins.length}\n` + out.join('\n'));
fs.writeFileSync(__dirname + '/results/resolution_sweep.csv', out.join('\n') + '\n');
