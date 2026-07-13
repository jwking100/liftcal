import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type PersonalRecord = Database["public"]["Tables"]["personal_records"]["Row"];

export function usePersonalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(Boolean(user));

  const refresh = useCallback(async () => {
    if (!user) {
      setRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await supabase.from("personal_records").select("*").eq("user_id", user.id);
    setRecords(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setOverride = async (exercise: string, weight: number, reps: number, achievedAt: string) => {
    if (!user) return { error: "Sign in to set a personal record" };

    const { error } = await supabase.from("personal_records").upsert(
      {
        user_id: user.id,
        exercise,
        weight,
        reps,
        achieved_at: achievedAt,
        manual_override: true,
      },
      { onConflict: "user_id,exercise" },
    );

    if (!error) await refresh();
    return { error: error?.message ?? null };
  };

  const clearOverride = async (exercise: string) => {
    if (!user) return { error: "Sign in to manage personal records" };

    const { error } = await supabase
      .from("personal_records")
      .update({ manual_override: false })
      .eq("user_id", user.id)
      .eq("exercise", exercise);

    if (!error) await refresh();
    return { error: error?.message ?? null };
  };

  const getRecord = (exercise: string) => records.find((r) => r.exercise === exercise) ?? null;

  return { records, loading, setOverride, clearOverride, getRecord, refresh };
}
