// Capacity-request saving from reallocating first, measured at `step` FTE resolution:
// (FTE needed to hit target on the current flat schedule) − (FTE needed after redistribution).
// This is the same search the engine runs, with a configurable step instead of whole FTE.
const { demandShape, allocateInt, evaluateDay, redistribute } = require('../tests/load_engine');
module.exports = function saving(p, step) {
  const { volume, aht, shrinkage, scheduledFTEs, slTarget, answerSec, maxOcc, intervals, peakFactor } = p;
  const calls = demandShape(peakFactor).map(s => volume * s);
  const flat = s => allocateInt(s, Array(intervals).fill(1));
  const slots = f => Math.round(f * (1 - shrinkage) * intervals);
  const slB = f => evaluateDay(calls, flat(slots(f)), aht, answerSec, 1800).sl;
  const slR = f => evaluateDay(calls, redistribute(calls, flat(slots(f)), aht, answerSec, slTarget, maxOcc), aht, answerSec, 1800).sl;
  const ask = sl => {
    if (sl(scheduledFTEs) >= slTarget) return 0;
    let f = scheduledFTEs;
    while (f < scheduledFTEs + 500) { f = +(f + step).toFixed(4); if (sl(f) >= slTarget) break; }
    return +(f - scheduledFTEs).toFixed(4);
  };
  return +Math.max(0, ask(slB) - ask(slR)).toFixed(4);
};
