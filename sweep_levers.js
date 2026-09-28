// Redistribution vs a 10% headcount add, across scenarios that miss target.
// "Collapsed" = neither lever moves service level by >= 0.1 pp (queue too far over capacity).
// Run from repo root: node analysis/sweep_levers.js
const fs = require('fs');
const { analyze } = require('../tests/load_engine'); const { grid } = require('../tests/grid');
let missed = 0, collapsed = 0, movable = 0, wins = 0;
for (const p of grid) {
  const r = analyze(p); if (r.baselineSL >= p.slTarget) continue; missed++;
  const d = n => r.levers.find(l => l.name.startsWith(n)).delta;
  const R = d('Schedule Redistribution'), H = d('Add Headcount');
  if (Math.max(R, H) < 0.001) { collapsed++; continue; }
  movable++; if (R > H) wins++;
}
const out = `missed_target,collapsed,movable,redistribution_wins,wins_pct_of_missed,wins_pct_of_movable\n${missed},${collapsed},${movable},${wins},${(100*wins/missed).toFixed(1)}%,${(100*wins/movable).toFixed(1)}%\n`;
fs.writeFileSync(__dirname + '/results/lever_comparison.csv', out); console.log(out);
