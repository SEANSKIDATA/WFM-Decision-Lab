// Mechanism check: how closely does each operation's interval STAFFING requirement follow
// its DEMAND curve? Ratio = (requirement max÷mean) ÷ (demand max÷mean). 1.0 = requirement
// is as peaky as demand; below 1 = Erlang C safety staffing flattens it.
// Same load-matched grid as sweep_scale.js. Run from repo root.
const fs = require('fs');
const { analyze } = require('../tests/load_engine');
const BASE = { shrinkage: 0.34, slTarget: 0.80, answerSec: 20, maxOcc: 0.90, intervals: 16, ahtCut: 0.08, headAdd: 0.10, shrCut: 0.05 };
const SIZES = [8, 12, 19, 30, 45, 70, 100, 200, 500];
const rowsCsv = fs.readFileSync(__dirname + '/results/scale_sweep.csv', 'utf8').trim().split('\n').slice(1).map(l => l.split(','));
const out = ['size,requirement_vs_demand_peakiness,sub_1_FTE_band'];
console.log('size  req/demand peakiness  scenarios saving >0 but <1 FTE');
for (const F of SIZES) {
  const ratios = [];
  for (const u of [0.85, 0.95, 1.05]) for (const aht of [180, 240, 300]) for (const peakFactor of [0.8, 1.2, 1.6]) {
    const volume = Math.round(u * F * (1 - BASE.shrinkage) * 8 * 3600 / aht);
    const r = analyze({ ...BASE, scheduledFTEs: F, aht, peakFactor, volume });
    const pk = a => Math.max(...a) / (a.reduce((x, y) => x + y, 0) / a.length);
    ratios.push(pk(r.reqAgentsPer) / pk(r.calls));
  }
  const m = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  const band = rowsCsv.filter(r => +r[0] === F && r[8] !== '' && +r[8] > 0 && +r[8] < 1).length;
  out.push([F, m.toFixed(3), band].join(','));
  console.log(`${String(F).padStart(4)}  ${m.toFixed(2).padStart(21)}  ${String(band).padStart(31)}`);
}
fs.writeFileSync(__dirname + '/results/scale_mechanism.csv', out.join('\n') + '\n');
