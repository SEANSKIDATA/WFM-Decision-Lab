// The 1,470-scenario grid used by every published sweep.
const BASE = { shrinkage: 0.34, slTarget: 0.80, answerSec: 20, maxOcc: 0.90, intervals: 16,
               ahtCut: 0.08, headAdd: 0.10, shrCut: 0.05 };
const VOLUMES = [400, 800, 1200, 2000, 3000, 4000, 6000];
const AHTS = [120, 180, 240, 300, 360];
const SIZES = [8, 12, 19, 30, 45, 70, 100];
const PEAKS = [0, 0.4, 0.8, 1.2, 1.6, 2];
const grid = [];
for (const volume of VOLUMES) for (const aht of AHTS) for (const scheduledFTEs of SIZES)
  for (const peakFactor of PEAKS) grid.push({ ...BASE, volume, aht, scheduledFTEs, peakFactor });
module.exports = { BASE, VOLUMES, AHTS, SIZES, PEAKS, grid };
