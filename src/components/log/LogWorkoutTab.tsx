import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCustomExercises } from "@/hooks/useCustomExercises";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { workoutLogSchema, type WorkoutLogInput } from "@/lib/validation";
import { todayIsoDate } from "@/lib/image";
import { PhotoScanner } from "./PhotoScanner";

export function LogWorkoutTab() {
  const { allExercises } = useCustomExercises();
  const { logWorkout } = useWorkoutHistory();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WorkoutLogInput>({
    resolver: zodResolver(workoutLogSchema),
    defaultValues: {
      exercise: "",
      weight: 0,
      reps: 0,
      performedAt: todayIsoDate(),
      notes: "",
    },
  });

  const onSubmit = async (values: WorkoutLogInput) => {
    const { error } = await logWorkout({
      exercise: values.exercise,
      weight: values.weight,
      reps: values.reps,
      performedAt: values.performedAt,
      notes: values.notes,
    });

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Workout logged!");
    reset({ exercise: values.exercise, weight: 0, reps: 0, performedAt: todayIsoDate(), notes: "" });
  };

  return (
    <div className="space-y-6">
      <PhotoScanner
        onScanned={(result) => {
          setValue("exercise", result.exercise, { shouldValidate: true });
          setValue("weight", result.weight, { shouldValidate: true });
          setValue("reps", result.reps, { shouldValidate: true });
        }}
      />

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Log Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="log-exercise">Exercise</Label>
                <Input id="log-exercise" list="exercise-options" maxLength={100} {...register("exercise")} />
                <datalist id="exercise-options">
                  {allExercises.map((exercise) => (
                    <option key={exercise} value={exercise} />
                  ))}
                </datalist>
                {errors.exercise && <p className="text-sm text-destructive">{errors.exercise.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="log-date">Date</Label>
                <Input
                  id="log-date"
                  type="date"
                  max={todayIsoDate()}
                  {...register("performedAt")}
                />
                {errors.performedAt && (
                  <p className="text-sm text-destructive">{errors.performedAt.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="log-weight">Weight (kg)</Label>
                <Input
                  id="log-weight"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={10000}
                  {...register("weight", { valueAsNumber: true })}
                />
                {errors.weight && <p className="text-sm text-destructive">{errors.weight.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="log-reps">Reps</Label>
                <Input
                  id="log-reps"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={1000}
                  {...register("reps", { valueAsNumber: true })}
                />
                {errors.reps && <p className="text-sm text-destructive">{errors.reps.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="log-notes">Notes</Label>
              <Textarea id="log-notes" rows={3} {...register("notes")} />
              {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save workout"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
