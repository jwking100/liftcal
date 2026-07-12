import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { nameSchema } from "@/lib/validation";

export function ProfileSection() {
  const { firstName, updateFirstName } = useProfile();
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue(firstName ?? "");
  }, [firstName]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const result = nameSchema.safeParse(value);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    setSaving(true);
    const { error } = await updateFirstName(result.data);
    setSaving(false);

    if (error) toast.error(error);
    else toast.success("Profile updated");
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-base">Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1 space-y-2">
            <Label htmlFor="first-name">First name</Label>
            <Input
              id="first-name"
              value={value}
              maxLength={100}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
