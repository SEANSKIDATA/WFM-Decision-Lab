// Action threshold vs operation size. Savings measured at 0.1 FTE resolution.
// Fixed: Mixed if saving >= t FTE. Proportional: Mixed if saving > 0 and saving >= pct × scheduled FTE.
// EXPERIMENTAL — the deployed tool uses a fixed 1 FTE threshold at whole-FTE resolution.
// Run from repo root: node analysis/sweep_thresholds.js
const fs = require('fs');
const { analyze } = require('../tests/load_engine'); const { grid, SIZES } = require('../tests/grid');
const saving = require('./saving');
const ins = grid.filter(p => !['healthy', 'distribution'].includes(analyze(p).regime.key)).map(p => ({ ...p, s: saving(p, 0.1) }));
const rows = ['scheduledFTEs,volume,aht,peakFactor,saving_fte_0.1', ...ins.map(r => [r.scheduledFTEs, r.volume, r.aht, r.peakFactor, r.s].join(','))];
fs.writeFileSync(__dirname + '/results/in_scope_695_savings.csv', rows.join('\n') + '\n');
function table(tests) {
  const out = [['threshold', ...SIZES.map(s => s + '_FTE'), 'spread_pts'].join(',')];
  for (const [label, fn] of tests) {
    const pct = SIZES.map(s => { const g = ins.filter(r => r.scheduledFTEs === s); return Math.round(100 * g.filter(fn).length / g.length); });
    out.push([label, ...pct.map(x => x + '%'), Math.max(...pct) - Math.min(...pct)].join(','));
  }
  return out.join('\n') + '\n';
}
const fixed = table([0.5, 1, 2].map(t => [t + ' FTE', r => r.s >= t]));
const prop = table([0.01, 0.025, 0.05, 0.10].map(t => [(t * 100) + '%', r => r.s > 0 && r.s >= t * r.scheduledFTEs]));
fs.writeFileSync(__dirname + '/results/threshold_fixed.csv', fixed);
fs.writeFileSync(__dirname + '/results/threshold_proportional.csv', prop);
const band = ins.filter(r => r.s > 0 && r.s < 1);
console.log(`In scope: ${ins.length} · any saving: ${ins.filter(r => r.s > 0).length} · sub-1-FTE band: ${band.length} ` +
  JSON.stringify(Object.fromEntries(SIZES.map(s => [s, band.filter(r => r.scheduledFTEs === s).length]))));
console.log('\nFIXED (share classified Mixed)\n' + fixed + '\nPROPORTIONAL\n' + prop);
