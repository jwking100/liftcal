import { PERCENTAGE_STEPS } from "./constants";

export interface PercentageRow {
  percentage: number;
  weight: number;
}

export function calculatePercentageBreakdown(workingWeight: number): PercentageRow[] {
  return PERCENTAGE_STEPS.map((percentage) => ({
    percentage,
    weight: Math.round(workingWeight * (percentage / 100) * 4) / 4,
  }));
}
