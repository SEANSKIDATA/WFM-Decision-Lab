"""
Workforce Management Decision Lab
Author: Sean Codner

This script models common workforce management levers and compares their
service-level impact using interval-level sample data.

The purpose is to demonstrate operational decision support, not to replace
an enterprise WFM platform.
"""

from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt


BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "sample_interval_data.csv"
IMAGE_PATH = BASE_DIR / "images" / "lever_comparison.png"


def estimate_service_level(required_staff: float, scheduled_staff: float) -> float:
    """
    Simplified service-level proxy.

    This intentionally uses a transparent approximation for portfolio demonstration.
    In production, this would be replaced with full Erlang C service-level logic.
    """
    if required_staff <= 0:
        return 1.0

    coverage_ratio = scheduled_staff / required_staff

    if coverage_ratio >= 1.05:
        return 0.90
    if coverage_ratio >= 1.00:
        return 0.85
    if coverage_ratio >= 0.95:
        return 0.75
    if coverage_ratio >= 0.90:
        return 0.65
    if coverage_ratio >= 0.85:
        return 0.55
    return 0.45


def calculate_required_staff(row: pd.Series) -> float:
    """
    Estimate required staff from interval volume and AHT.

    Formula:
    workload hours = calls * AHT seconds / 3600
    required staff = workload hours / interval hours
    """
    interval_hours = row["interval_minutes"] / 60
    workload_hours = (row["forecast_calls"] * row["aht_seconds"]) / 3600
    return workload_hours / interval_hours


def scenario_results(df: pd.DataFrame) -> pd.DataFrame:
    """
    Apply decision scenarios and calculate service-level impact.
    """
    baseline_required = df["required_staff"]
    baseline_scheduled = df["scheduled_staff"]

    scenarios = {
        "Baseline": baseline_scheduled,
        "AHT Reduction": df.assign(
            required_staff=df["required_staff"] * 0.95
        )["required_staff"].pipe(lambda req: baseline_scheduled),
        "Shrinkage Reduction": baseline_scheduled * 1.04,
        "Add Headcount": baseline_scheduled * 1.08,
        "Schedule Redistribution": redistribute_staff(df),
        "Combined Strategy": redistribute_staff(df) * 1.03,
    }

    baseline_sl = df.apply(
        lambda row: estimate_service_level(row["required_staff"], row["scheduled_staff"]),
        axis=1,
    ).mean()

    rows = []
    for name, scheduled in scenarios.items():
        if name == "AHT Reduction":
            required = baseline_required * 0.95
        elif name == "Combined Strategy":
            required = baseline_required * 0.97
        else:
            required = baseline_required

        service_levels = [
            estimate_service_level(req, sched)
            for req, sched in zip(required, scheduled)
        ]

        avg_sl = sum(service_levels) / len(service_levels)
        impact = avg_sl - baseline_sl

        rows.append(
            {
                "scenario": name,
                "average_service_level": round(avg_sl * 100, 1),
                "service_level_impact": round(impact * 100, 1),
            }
        )

    return pd.DataFrame(rows)


def redistribute_staff(df: pd.DataFrame) -> pd.Series:
    """
    Redistribute existing staff toward intervals with the largest staffing gaps.

    This preserves total staffing while improving alignment with demand.
    """
    redistributed = df["scheduled_staff"].copy()
    total_staff = redistributed.sum()

    demand_weights = df["required_staff"] / df["required_staff"].sum()
    redistributed = demand_weights * total_staff

    return redistributed


def build_chart(results: pd.DataFrame) -> None:
    """
    Export a bar chart comparing service-level impact by lever.
    """
    chart_data = results[results["scenario"] != "Baseline"].copy()

    plt.figure(figsize=(10, 6))
    plt.bar(chart_data["scenario"], chart_data["service_level_impact"])
    plt.title("Decision Lab: Service-Level Impact by Operational Lever")
    plt.xlabel("Operational Lever")
    plt.ylabel("Service-Level Improvement")
    plt.xticks(rotation=30, ha="right")
    plt.tight_layout()
    plt.savefig(IMAGE_PATH, dpi=200)
    plt.close()


def main() -> None:
    df = pd.read_csv(DATA_PATH)
    df["required_staff"] = df.apply(calculate_required_staff, axis=1)

    results = scenario_results(df)
    build_chart(results)

    print("\nDecision Lab Results")
    print(results.to_string(index=False))
    print(f"\nChart exported to: {IMAGE_PATH}")


if __name__ == "__main__":
    main()
