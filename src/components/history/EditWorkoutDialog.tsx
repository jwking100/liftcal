import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Workout } from "@/hooks/useWorkoutHistory";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { workoutLogSchema, type WorkoutLogInput } from "@/lib/validation";
import { todayIsoDate } from "@/lib/image";

interface EditWorkoutDialogProps {
  workout: Workout | null;
  onOpenChange: (open: boolean) => void;
}

export function EditWorkoutDialog({ workout, onOpenChange }: EditWorkoutDialogProps) {
  const { updateWorkout } = useWorkoutHistory();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WorkoutLogInput>({
    resolver: zodResolver(workoutLogSchema),
    values: workout
      ? {
          exercise: workout.exercise,
          weight: Number(workout.weight),
          reps: workout.reps,
          performedAt: workout.performed_at,
          notes: workout.notes ?? "",
        }
      : undefined,
  });

  if (!workout) return null;

  const onSubmit = async (values: WorkoutLogInput) => {
    const { error } = await updateWorkout(workout.id, {
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

    toast.success("Workout updated");
    onOpenChange(false);
  };

  return (
    <Dialog open={Boolean(workout)} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card">
        <DialogHeader>
          <DialogTitle>Edit workout</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-exercise">Exercise</Label>
              <Input id="edit-exercise" maxLength={100} {...register("exercise")} />
              {errors.exercise && <p className="text-sm text-destructive">{errors.exercise.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input id="edit-date" type="date" max={todayIsoDate()} {...register("performedAt")} />
              {errors.performedAt && (
                <p className="text-sm text-destructive">{errors.performedAt.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-weight">Weight (kg)</Label>
              <Input
                id="edit-weight"
                type="number"
                min={0}
                max={10000}
                {...register("weight", { valueAsNumber: true })}
              />
              {errors.weight && <p className="text-sm text-destructive">{errors.weight.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-reps">Reps</Label>
              <Input
                id="edit-reps"
                type="number"
                min={0}
                max={1000}
                {...register("reps", { valueAsNumber: true })}
              />
              {errors.reps && <p className="text-sm text-destructive">{errors.reps.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea id="edit-notes" rows={3} {...register("notes")} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
