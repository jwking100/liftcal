import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCustomExercises } from "@/hooks/useCustomExercises";
import { customExerciseSchema } from "@/lib/validation";

export function CustomExercisesSection() {
  const { customExercises, addExercise, removeExercise } = useCustomExercises();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const result = customExerciseSchema.safeParse({ name });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    setSaving(true);
    const { error } = await addExercise(result.data.name);
    setSaving(false);

    if (error) {
      toast.error(error);
      return;
    }

    setName("");
    toast.success("Exercise added");
  };

  const handleRemove = async (exerciseName: string) => {
    const { error } = await removeExercise(exerciseName);
    if (error) toast.error(error);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-base">Custom exercises</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1 space-y-2">
            <Input
              placeholder="e.g. Incline Bench Press"
              value={name}
              maxLength={100}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={saving}>
            Add
          </Button>
        </form>

        {customExercises.length === 0 ? (
          <p className="text-sm text-muted-foreground">No custom exercises yet.</p>
        ) : (
          <ul className="space-y-2">
            {customExercises.map((exercise) => (
              <li
                key={exercise}
                className="flex items-center justify-between rounded-md border border-border/60 bg-secondary/40 px-3 py-2"
              >
                <span>{exercise}</span>
                <Button variant="ghost" size="icon" onClick={() => handleRemove(exercise)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
