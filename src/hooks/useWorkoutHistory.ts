import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Workout = Database["public"]["Tables"]["workout_history"]["Row"];

export interface WorkoutInput {
  exercise: string;
  weight: number;
  reps: number;
  performedAt: string;
  notes?: string;
}

export function useWorkoutHistory() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(Boolean(user));

  const refresh = useCallback(async () => {
    if (!user) {
      setWorkouts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from("workout_history")
      .select("*")
      .eq("user_id", user.id)
      .order("performed_at", { ascending: false })
      .order("created_at", { ascending: false });

    setWorkouts(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logWorkout = async (input: WorkoutInput) => {
    if (!user) return { error: "Sign in to log workouts" };

    const { error } = await supabase.from("workout_history").insert({
      user_id: user.id,
      exercise: input.exercise,
      weight: input.weight,
      reps: input.reps,
      performed_at: input.performedAt,
      notes: input.notes || null,
    });

    if (!error) await refresh();
    return { error: error?.message ?? null };
  };

  const updateWorkout = async (id: string, input: WorkoutInput) => {
    if (!user) return { error: "Sign in to edit workouts" };

    const { error } = await supabase
      .from("workout_history")
      .update({
        exercise: input.exercise,
        weight: input.weight,
        reps: input.reps,
        performed_at: input.performedAt,
        notes: input.notes || null,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (!error) await refresh();
    return { error: error?.message ?? null };
  };

  const deleteWorkout = async (id: string) => {
    if (!user) return { error: "Sign in to delete workouts" };

    const { error } = await supabase.from("workout_history").delete().eq("id", id).eq("user_id", user.id);
    if (!error) await refresh();
    return { error: error?.message ?? null };
  };

  return { workouts, loading, logWorkout, updateWorkout, deleteWorkout, refresh };
}
