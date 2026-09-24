export const CORE_EXERCISES = ["Deadlift", "Bench Press", "Squat", "Strict Press"] as const;

export const MAX_WEIGHT_KG = 10000;
export const MAX_REPS = 1000;
export const MAX_NAME_LENGTH = 100;

export const PERCENTAGE_STEPS = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100] as const;

/** Standard olympic plate weights available in kg, heaviest first. */
export const PLATE_WEIGHTS_KG = [25, 20, 15, 10, 5, 2.5, 1.25] as const;

export const BARBELL_WEIGHT_KG = 20;

/** IPF-standard plate colors, keyed by weight (kg). */
export const PLATE_COLORS: Record<number, string> = {
  25: "#dc2626",
  20: "#2563eb",
  15: "#eab308",
  10: "#16a34a",
  5: "#e5e7eb",
  2.5: "#9ca3af",
  1.25: "#6b7280",
};

/** Relative plate diameter (px) for the barbell visualization, keyed by weight (kg). */
export const PLATE_DIAMETERS: Record<number, number> = {
  25: 96,
  20: 86,
  15: 78,
  10: 70,
  5: 58,
  2.5: 46,
  1.25: 38,
};

/** Plate thickness (px) for the barbell visualization, keyed by weight (kg). */
export const PLATE_THICKNESS: Record<number, number> = {
  25: 16,
  20: 14,
  15: 13,
  10: 11,
  5: 9,
  2.5: 7,
  1.25: 6,
};
