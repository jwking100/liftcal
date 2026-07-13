export interface WorkoutLike {
  weight: number;
  reps: number;
  performed_at: string;
}

/** Epley formula estimated 1-rep max. */
export function estimatedOneRepMax(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}

/**
 * Given a chronological list of workouts for a single exercise, returns the
 * indices (into the original array) that represent a new all-time best
 * estimated 1RM at the time they were logged.
 */
export function findPrIndices<T extends WorkoutLike>(workouts: T[]): Set<number> {
  const sorted = workouts
    .map((workout, index) => ({ workout, index }))
    .sort((a, b) => new Date(a.workout.performed_at).getTime() - new Date(b.workout.performed_at).getTime());

  const prIndices = new Set<number>();
  let best = -Infinity;

  for (const { workout, index } of sorted) {
    const e1rm = estimatedOneRepMax(workout.weight, workout.reps);
    if (e1rm > best) {
      best = e1rm;
      prIndices.add(index);
    }
  }

  return prIndices;
}
