import { BARBELL_WEIGHT_KG, PLATE_WEIGHTS_KG } from "./constants";

export interface PlateBreakdown {
  perSide: number[];
  barWeight: number;
  loadedWeight: number;
  remainder: number;
}

/** Greedy-fills one side of the bar with the largest plates available. */
export function calculatePlates(totalWeight: number, barWeight: number = BARBELL_WEIGHT_KG): PlateBreakdown {
  const weightPerSide = Math.max(0, (totalWeight - barWeight) / 2);
  const perSide: number[] = [];
  let remaining = weightPerSide;

  for (const plate of PLATE_WEIGHTS_KG) {
    while (remaining + 1e-9 >= plate) {
      perSide.push(plate);
      remaining -= plate;
    }
  }

  const loadedWeight = barWeight + perSide.reduce((sum, p) => sum + p, 0) * 2;

  return {
    perSide,
    barWeight,
    loadedWeight,
    remainder: Math.max(0, Math.round(remaining * 100) / 100),
  };
}
