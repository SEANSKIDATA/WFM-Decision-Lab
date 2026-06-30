# Workforce Management Decision Lab

## Business Question

When service level declines, leadership often debates hiring, Average Handle Time reduction, overtime, coaching, or shrinkage reduction.

But which operational lever actually moves service level the most?

This project models five common workforce management strategies against the same interval-level call center dataset to compare their operational impact.

## Key Finding

**Schedule redistribution improved service level by +20.2%.**

That improvement was achieved with:

- No additional hiring
- No Average Handle Time coaching initiative
- No shrinkage reduction program
- No new staffing budget

The core issue was not total staffing volume.

**The staffing was already there. It just was not in the right intervals.**

## Executive Summary

Many workforce plans look acceptable at the daily level but fail at the interval level. This creates a common operating trap: total staffing appears sufficient, while customers still experience poor service levels during peak intervals.

The Decision Lab tests common operational responses and compares their impact:

| Scenario | Description | Service Level Impact | Business Interpretation |
|---|---|---:|---|
| Baseline | Current staffing distribution | 0.0% | Starting point |
| AHT Reduction | Reduce Average Handle Time | +5.1% | Helpful, but limited impact |
| Shrinkage Reduction | Improve productive availability | +6.8% | Moderate improvement |
| Add Headcount | Increase staffed capacity | +11.4% | Stronger impact, higher cost |
| Schedule Redistribution | Move existing staffing into demand peaks | **+20.2%** | Highest-impact lever |
| Combined Strategy | Apply multiple improvements | +24.6% | Best result, but more complex |

## Business Recommendation

Before approving additional hiring or launching costly AHT improvement initiatives, leaders should first evaluate interval-level schedule distribution.

If total staffing is close to required staffing, schedule redistribution may produce greater service-level improvement than more expensive interventions.

## Why This Matters

A contact center can have the right number of people scheduled for the day and still miss service level throughout the day.

The problem is often not the daily headcount total.

The problem is the distribution of that headcount across the day.

This project demonstrates how workforce analytics can move beyond reporting and support better operational decisions.

## Methodology

The model uses interval-level workforce management logic:

1. Load interval-level call volume, AHT, staffing, and shrinkage assumptions.
2. Estimate required staffing using Erlang C logic.
3. Compare required staffing to scheduled staffing by interval.
4. Model alternative operational scenarios.
5. Measure service-level impact for each scenario.
6. Rank levers by operational value and implementation cost.

Full methodology is available in [`docs/methodology.md`](docs/methodology.md).

## Repository Structure

```text
WFM-Decision-Lab/
├── README.md
├── decision_lab.py
├── requirements.txt
├── data/
│   └── sample_interval_data.csv
├── docs/
│   └── methodology.md
└── images/
    └── lever_comparison.png
```

## Skills Demonstrated

- Workforce Management
- Capacity Planning
- Service Level Analysis
- Erlang C Staffing Logic
- Scenario Modeling
- Operational Decision Support
- Python
- Pandas
- Matplotlib
- Executive Communication
- Business Case Development

## How to Run

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the model:

```bash
python decision_lab.py
```

The script reads the sample interval dataset, calculates scenario results, and exports the lever comparison chart.

## Portfolio Context

This project is part of Sean Codner's Workforce Management and Operations Analytics portfolio.

The purpose is to demonstrate how analytics can help leaders choose the right operational lever instead of defaulting to the most familiar one.

## Author

**Sean Codner**  
Workforce Management & Operations Analyst  
WFM Forecasting | Erlang C | Intraday Staffing | ATM Network Operations | SQL | Python | Fintech
