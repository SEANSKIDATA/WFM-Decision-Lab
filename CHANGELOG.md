# Changelog

## 2026-09-28 — Scale test for proportional thresholds (analysis only)

Added `analysis/sweep_scale.js` and `analysis/sweep_scale_mechanism.js`. The fixed-volume
grid had only 12 in-scope scenarios at 100 FTE and none above, so it could not show how
thresholds behave for large operations. The new grid scales call volume with size (equal
utilization, 8 to 500 FTE). Results are in the README's Experimental section. No change to
the deployed tool.

## 2026-09-24 — FTE-based regime rule, regression suite, reproducible claims

**Regime rule.** Mixed vs Capacity is now decided by whether reallocating first reduces the
capacity request by at least 1 FTE (`ACTION_FTE` in `index.html`). The former rule classified
Mixed when reallocation recovered at least 2.0 pp of service level at current staffing. On the
1,470-scenario grid the two rules disagree in 514 of 695 in-scope scenarios, 507 of them in one
direction: the old rule called Capacity where reallocation cut the hiring request. Regime counts
change from 59 Mixed / 636 Capacity to 559 Mixed / 136 Capacity. The default scenario remains
Mixed. The "Why this regime" panel now shows the capacity-ask test.

**Tests.** Added `tests/regression.test.js` (about 10,000 checks, no dependencies). It runs
against the engine inside `index.html`. It replaces an unverifiable "validated" comment in the
engine header, whose test script had not been kept.

**Analysis.** Added the sweep scripts and CSV outputs behind every published sweep result
(`analysis/`). Fractional resolution and proportional thresholds remain analysis only.

**Claims corrected.**
- "Redistribution beats a 10% headcount add in 38% of scenarios (44 of 116)" could not be
  reproduced; the scenario set behind it was not saved. Replaced with the reproducible
  result on the published grid: 103 of 391 movable missed-target scenarios (26%), 103 of 770
  including collapsed queues (13%).
- The 70-FTE example now states its inputs (4,000 calls, 300s AHT, peakiness 1.3) and is
  covered by the tests.

**Removed.** `decision_lab.py`, its sample data, chart, and `requirements.txt`. That was the
first prototype: a stepped coverage-ratio proxy rather than Erlang C, with file paths that no
longer matched the repository. The README had described it as sharing the Erlang C method,
which was incorrect. It remains in git history.
