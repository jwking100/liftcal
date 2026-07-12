import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CORE_EXERCISES } from "@/lib/constants";

export function useCustomExercises() {
  const { user } = useAuth();
  const [customExercises, setCustomExercises] = useState<string[]>([]);
  const [loading, setLoading] = useState(Boolean(user));

  const refresh = useCallback(async () => {
    if (!user) {
      setCustomExercises([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from("custom_exercises")
      .select("name")
      .eq("user_id", user.id)
      .order("name");

    setCustomExercises(data?.map((row) => row.name) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addExercise = async (name: string) => {
    if (!user) return { error: "Sign in to add custom exercises" };

    const { error } = await supabase.from("custom_exercises").insert({ user_id: user.id, name });
    if (!error) await refresh();
    return { error: error?.message ?? null };
  };

  const removeExercise = async (name: string) => {
    if (!user) return { error: "Sign in to manage custom exercises" };

    const { error } = await supabase
      .from("custom_exercises")
      .delete()
      .eq("user_id", user.id)
      .eq("name", name);
    if (!error) await refresh();
    return { error: error?.message ?? null };
  };

  const allExercises = [...CORE_EXERCISES, ...customExercises];

  return { customExercises, allExercises, loading, addExercise, removeExercise };
}
