import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ExerciseSelect } from "@/components/ExerciseSelect";
import { useCustomExercises } from "@/hooks/useCustomExercises";
import { useWorkoutHistory, type Workout } from "@/hooks/useWorkoutHistory";
import { findPrIndices } from "@/lib/pr";
import { ProgressChart } from "./ProgressChart";
import { EditWorkoutDialog } from "./EditWorkoutDialog";

export function HistoryTab() {
  const { allExercises } = useCustomExercises();
  const { workouts, deleteWorkout } = useWorkoutHistory();
  const [exercise, setExercise] = useState(allExercises[0]);
  const [editing, setEditing] = useState<Workout | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!exercise && allExercises.length > 0) setExercise(allExercises[0]);
  }, [allExercises, exercise]);

  const filtered = useMemo(
    () => workouts.filter((w) => w.exercise === exercise),
    [workouts, exercise],
  );

  const prIndices = useMemo(() => findPrIndices(filtered), [filtered]);

  const handleDelete = async () => {
    if (!deletingId) return;
    const { error } = await deleteWorkout(deletingId);
    if (error) toast.error(error);
    else toast.success("Workout deleted");
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="max-w-xs space-y-2">
            <Label htmlFor="history-exercise">Exercise</Label>
            <ExerciseSelect
              id="history-exercise"
              exercises={allExercises}
              value={exercise}
              onChange={setExercise}
            />
          </div>

          <ProgressChart workouts={filtered} />
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80 pr-4">
            <div className="space-y-2">
              {filtered.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">No workouts yet.</p>
              )}
              {filtered.map((workout, index) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-secondary/40 p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium tabular-nums">
                        {Number(workout.weight)} kg × {workout.reps}
                      </span>
                      {prIndices.has(index) && (
                        <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                          <Trophy className="h-3 w-3" /> PR
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(workout.performed_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      {workout.notes && ` · ${workout.notes}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(workout)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeletingId(workout.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <EditWorkoutDialog workout={editing} onOpenChange={(open) => !open && setEditing(null)} />

      <AlertDialog open={Boolean(deletingId)} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this workout?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
