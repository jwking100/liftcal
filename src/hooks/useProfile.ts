import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useProfile() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(user));

  useEffect(() => {
    if (!user) {
      setFirstName(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    supabase
      .from("profiles")
      .select("first_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setFirstName(data?.first_name ?? null);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const updateFirstName = async (name: string) => {
    if (!user) return { error: "Not signed in" };
    const { error } = await supabase.from("profiles").update({ first_name: name }).eq("id", user.id);
    if (!error) setFirstName(name);
    return { error: error?.message ?? null };
  };

  return { firstName, loading, updateFirstName };
}
