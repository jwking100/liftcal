import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ExerciseSelect } from "@/components/ExerciseSelect";
import { useCustomExercises } from "@/hooks/useCustomExercises";
import { usePersonalRecords } from "@/hooks/usePersonalRecords";
import { prOverrideSchema, type PrOverrideInput } from "@/lib/validation";
import { todayIsoDate } from "@/lib/image";

export function PersonalRecordsSection() {
  const { allExercises } = useCustomExercises();
  const { getRecord, setOverride, clearOverride } = usePersonalRecords();
  const [exercise, setExercise] = useState(allExercises[0] ?? "");
  const record = getRecord(exercise);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PrOverrideInput>({
    resolver: zodResolver(prOverrideSchema),
    values: {
      exercise,
      weight: record ? Number(record.weight) : 0,
      reps: record ? record.reps : 0,
      achievedAt: record?.achieved_at ?? todayIsoDate(),
    },
  });

  const onSubmit = async (values: PrOverrideInput) => {
    const { error } = await setOverride(values.exercise, values.weight, values.reps, values.achievedAt);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Personal record updated");
  };

  const handleClear = async () => {
    if (!exercise) return;
    const { error } = await clearOverride(exercise);
    if (error) toast.error(error);
    else {
      toast.success("Reverted to auto-detected PR");
      reset();
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-base">Personal record overrides</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-w-xs space-y-2">
          <Label htmlFor="pr-exercise">Exercise</Label>
          <ExerciseSelect id="pr-exercise" exercises={allExercises} value={exercise} onChange={setExercise} />
        </div>

        {record && (
          <p className="text-sm text-muted-foreground">
            Current: {Number(record.weight)} kg × {record.reps} reps on{" "}
            {new Date(record.achieved_at).toLocaleDateString()}
            {record.manual_override ? " (manually set)" : " (auto-detected)"}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="pr-weight">Weight (kg)</Label>
            <Input
              id="pr-weight"
              type="number"
              min={0}
              max={10000}
              {...register("weight", { valueAsNumber: true })}
            />
            {errors.weight && <p className="text-sm text-destructive">{errors.weight.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pr-reps">Reps</Label>
            <Input
              id="pr-reps"
              type="number"
              min={0}
              max={1000}
              {...register("reps", { valueAsNumber: true })}
            />
            {errors.reps && <p className="text-sm text-destructive">{errors.reps.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pr-date">Date achieved</Label>
            <Input id="pr-date" type="date" max={todayIsoDate()} {...register("achievedAt")} />
            {errors.achievedAt && <p className="text-sm text-destructive">{errors.achievedAt.message}</p>}
          </div>

          <div className="flex gap-2 sm:col-span-3">
            <Button type="submit" disabled={isSubmitting}>
              Set as PR
            </Button>
            {record?.manual_override && (
              <Button type="button" variant="secondary" onClick={handleClear}>
                Revert to auto-detected
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
