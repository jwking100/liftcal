import { useEffect, useState } from "react";
import { ALargeSmall } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ExerciseSelect } from "@/components/ExerciseSelect";
import { useCustomExercises } from "@/hooks/useCustomExercises";
import { useWorkingWeight } from "@/hooks/useWorkingWeight";
import { calculatePercentageBreakdown } from "@/lib/percentages";
import { cn } from "@/lib/utils";
import { PercentageGrid, type FontSize } from "./PercentageGrid";

const FONT_SIZES: FontSize[] = ["sm", "md", "lg"];

export function CalculatorTab() {
  const { allExercises } = useCustomExercises();
  const [exercise, setExercise] = useState(allExercises[0]);
  const { value, update } = useWorkingWeight(exercise);
  const [fontSize, setFontSize] = useState<FontSize>("md");

  useEffect(() => {
    if (!exercise && allExercises.length > 0) setExercise(allExercises[0]);
  }, [allExercises, exercise]);

  const rows = calculatePercentageBreakdown(value.weight);

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Calculator</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="exercise">Exercise</Label>
            <ExerciseSelect id="exercise" exercises={allExercises} value={exercise} onChange={setExercise} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              inputMode="decimal"
              min={0}
              max={10000}
              value={value.weight}
              onChange={(e) => update({ ...value, weight: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reps">Reps</Label>
            <Input
              id="reps"
              type="number"
              inputMode="numeric"
              min={0}
              max={1000}
              value={value.reps}
              onChange={(e) => update({ ...value, reps: Number(e.target.value) })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Percentage breakdown</h2>
        <div className="flex items-center gap-1 rounded-md border border-border/60 p-1">
          <ALargeSmall className="ml-1 h-4 w-4 text-muted-foreground" />
          {FONT_SIZES.map((size) => (
            <Button
              key={size}
              size="sm"
              variant={fontSize === size ? "default" : "ghost"}
              className={cn("h-7 px-2", size === "sm" && "text-xs", size === "lg" && "text-base")}
              onClick={() => setFontSize(size)}
            >
              {size.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      <PercentageGrid rows={rows} fontSize={fontSize} />
    </div>
  );
}
