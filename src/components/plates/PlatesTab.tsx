import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExerciseSelect } from "@/components/ExerciseSelect";
import { useCustomExercises } from "@/hooks/useCustomExercises";
import { useWorkingWeight } from "@/hooks/useWorkingWeight";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { calculatePlates } from "@/lib/plates";
import { BARBELL_WEIGHT_KG } from "@/lib/constants";
import { BarbellVisual } from "./BarbellVisual";

export function PlatesTab() {
  const { allExercises } = useCustomExercises();
  const [exercise, setExercise] = useState(allExercises[0]);
  const { value, update } = useWorkingWeight(exercise);
  const [barWeight, setBarWeight] = useState(BARBELL_WEIGHT_KG);
  const vibrate = useHapticFeedback();
  const lastKeyRef = useRef<string>("");

  useEffect(() => {
    if (!exercise && allExercises.length > 0) setExercise(allExercises[0]);
  }, [allExercises, exercise]);

  const breakdown = calculatePlates(value.weight, barWeight);
  const breakdownKey = breakdown.perSide.join(",");

  useEffect(() => {
    if (breakdownKey !== lastKeyRef.current) {
      lastKeyRef.current = breakdownKey;
      vibrate(12);
    }
  }, [breakdownKey, vibrate]);

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Plates</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="plates-exercise">Exercise</Label>
            <ExerciseSelect
              id="plates-exercise"
              exercises={allExercises}
              value={exercise}
              onChange={setExercise}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plates-weight">Total weight (kg)</Label>
            <Input
              id="plates-weight"
              type="number"
              inputMode="decimal"
              min={0}
              max={10000}
              value={value.weight}
              onChange={(e) => update({ ...value, weight: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bar-weight">Bar weight (kg)</Label>
            <Input
              id="bar-weight"
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              value={barWeight}
              onChange={(e) => setBarWeight(Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="space-y-4 pt-6">
          <BarbellVisual perSide={breakdown.perSide} />

          <div className="flex flex-wrap items-center justify-center gap-2">
            {breakdown.perSide.length === 0 ? (
              <span className="text-sm text-muted-foreground">No plates needed — bar only</span>
            ) : (
              breakdown.perSide.map((plate, index) => (
                <span
                  key={index}
                  className="rounded-full border border-border/60 bg-secondary px-3 py-1 text-sm font-medium tabular-nums"
                >
                  {plate} kg
                </span>
              ))
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Total loaded: {breakdown.loadedWeight} kg
            {breakdown.remainder > 0 && ` (${breakdown.remainder} kg short of target per side)`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
