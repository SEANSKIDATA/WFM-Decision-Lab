# Workforce Management Decision Lab

## The finding that changes the budget conversation

When service level drops, the instinct is to hire or to launch an AHT reduction
programme. Modelled against interval-level demand, neither is the highest-impact
standalone move.

**Reshaping the existing schedule to match interval demand — without adding a single
productive agent-hour — outperformed a 10% headcount increase.**

The staffing was already there. It just wasn't in the intervals where demand landed.

![Lever Comparison](lever_comparison.png)

---

## Try the interactive version

**[→ Run the WFM Decision Lab in your browser](https://seanskidata.github.io/WFM-Decision-Lab)**

Enter your own call volume, AHT, shrinkage and FTE count. The model runs Erlang C
per 30-minute interval across a simulated day and ranks four standalone levers by
service-level impact. No install — it runs entirely in the browser.

---

## Why the two models report different numbers

This repository contains **two separate models**, and they do not produce identical
figures. That is intentional, and worth stating plainly:

| | Python notebook (`decision_lab.py`) | Interactive tool (`index.html`) |
|---|---|---|
| Demand | Fixed sample interval dataset | Simulated curve from a peakiness setting |
| Schedule | Fixed baseline in the dataset | Evenly distributed baseline |
| Inputs | Set in code | Adjustable by the user |
| Purpose | A single documented case study | A what-if explorer |

Both use Erlang C at the interval level and both reach the same conclusion —
redistribution is the highest-impact standalone lever — but the magnitudes differ
because the demand pattern and baseline schedule differ. Neither is analysing an
organisation's real forecast.

---

## Results — Python notebook case study

Service level moves from a **62.4% baseline** against an 80/20 target.

| Scenario | SL Lift (pp) | Resulting SL | Interpretation |
|---|---:|---:|---|
| Baseline | — | 62.4% | Starting point |
| Reduce Shrinkage | +4.8 pp | 67.2% | Moderate improvement |
| Reduce AHT | +5.5 pp | 67.9% | Helpful, but limited |
| Add Headcount | +8.1 pp | 70.5% | Stronger, higher cost |
| **Schedule Redistribution** | **+20.2 pp** | **82.6%** | **Highest-impact standalone lever** |
| Redistribution + other levers | +24.6 pp | 87.0% | Best result, most complex |

> **A note on units.** These are **percentage points**, not percentages. Moving from
> 62.4% to 82.6% is a gain of 20.2 percentage points — in relative terms roughly a
> 32% improvement. Earlier versions of this README reported these as "%", which
> overstated the claim. Corrected.

---

## Results — interactive tool, default scenario

1,200 calls · 240s AHT · 34% shrinkage · 19 scheduled FTEs · typical double-hump demand

Baseline delivers **43.5%** service level against an 80/20 target. 21 FTEs are
required; 19 are scheduled. **10 of 16 intervals are understaffed and 4 are
overstaffed.**

| Scenario | SL Lift (pp) | Resulting SL | Cost |
|---|---:|---:|---|
| **Schedule Redistribution** | **+28.9 pp** | **72.3%** | **No additional headcount assumed** |
| Add Headcount (+10%) | +25.1 pp | 68.5% | High |
| Reduce AHT (−8%) | +18.8 pp | 62.3% | High |
| Reduce Shrinkage (−5pts) | +18.0 pp | 61.5% | Medium |

Reported separately, because it is two levers rather than one:

| Compound scenario | SL Lift (pp) | Resulting SL |
|---|---:|---:|
| Redistribution + Shrinkage Reduction | +40.0 pp | 83.5% — clears the 80% target |

Redistribution holds **100.5 productive agent-hours** (201 half-hour agent intervals)
completely constant. It adds no capacity; it only moves existing capacity between
intervals.

---

## Why this matters

A contact centre can schedule the right number of people for the day and still miss
service level all day long. Daily and weekly rollups hide this — they average away the
intervals where customers actually experience the queue.

Before approving headcount or funding an AHT programme, the interval-level distribution
of the existing schedule is worth checking first. It is the cheapest lever to test and,
under these models, the highest-impact one.

---

## Methodology

Both models follow the same workforce-management logic:

1. Distribute call volume across 30-minute intervals.
2. Convert volume and AHT into offered load (Erlangs).
3. Size required agents per interval using Erlang C, under an occupancy ceiling.
4. Apply a shrinkage build-up to convert on-phone agents into scheduled FTEs.
5. Compare scheduled coverage against the interval requirement.
6. Model each lever and measure the change in call-weighted service level.

Full detail in [`methodology.md`](methodology.md).

### Model assumptions

Both models assume Poisson call arrivals, exponential handle times, **no abandonment**
(Erlang C rather than Erlang A), a single homogeneous agent skill, no transfers or
retries, and steady-state behaviour within each interval. Redistributed staffing is
assumed to be operationally movable, with no shift-length, labour-rule, skill or
break-placement constraints applied.

These assumptions are standard for planning-stage capacity work and are the same ones
underlying commercial WFM platforms. They are not a substitute for a scheduling engine
that respects real shift rules.

### What a production build would add

Abandonment-aware queueing (Erlang A) so that caller patience is modelled rather than
assumed infinite. Multi-skill and blended workload, since most real operations are not
a single queue. Shift-constrained optimisation, so a recommended redistribution is
actually rosterable under labour rules. Intraday re-forecasting, because the plan
changes once the day starts. And import of real interval forecasts and schedules in
place of the generated demand curve.

---

## Repository structure

```
WFM-Decision-Lab/
├── README.md
├── index.html              interactive tool (GitHub Pages)
├── decision_lab.py         Python case-study model
├── methodology.md          full methodology
├── requirements.txt
├── sample_interval_data.csv
└── lever_comparison.png
```

## Running the Python model

```bash
pip install -r requirements.txt
python decision_lab.py
```

Reads the sample interval dataset, calculates scenario results, and exports the lever
comparison chart.

---

## Author

**Sean Codner** — Workforce Management & Operations Analyst

WFM Forecasting · Erlang C · Intraday Staffing · ATM Network Operations · SQL · Python

Part of a workforce-management and operations analytics portfolio:
[github.com/SEANSKIDATA](https://github.com/SEANSKIDATA)
