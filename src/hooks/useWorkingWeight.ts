import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useLocalStorage } from "./useLocalStorage";

export interface WorkingWeight {
  weight: number;
  reps: number;
}

const DEFAULT_WEIGHT: WorkingWeight = { weight: 60, reps: 5 };

/**
 * Tracks the "current working weight" for an exercise, used by the
 * Calculator and Plates tabs. Persists to Supabase for signed-in users
 * and to localStorage for guests.
 */
export function useWorkingWeight(exercise: string) {
  const { user } = useAuth();
  const [guestValues, setGuestValues] = useLocalStorage<Record<string, WorkingWeight>>(
    "liftcal:guest:lifts",
    {},
  );
  const [value, setValue] = useState<WorkingWeight>(guestValues[exercise] ?? DEFAULT_WEIGHT);
  const [loading, setLoading] = useState(Boolean(user));

  useEffect(() => {
    if (!user) {
      setValue(guestValues[exercise] ?? DEFAULT_WEIGHT);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    supabase
      .from("lifts")
      .select("weight, reps")
      .eq("user_id", user.id)
      .eq("exercise", exercise)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setValue(data ? { weight: Number(data.weight), reps: data.reps } : DEFAULT_WEIGHT);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, exercise]);

  const update = async (next: WorkingWeight) => {
    setValue(next);

    if (!user) {
      setGuestValues((prev) => ({ ...prev, [exercise]: next }));
      return;
    }

    await supabase.from("lifts").upsert(
      {
        user_id: user.id,
        exercise,
        weight: next.weight,
        reps: next.reps,
      },
      { onConflict: "user_id,exercise" },
    );
  };

  return { value, update, loading };
}
