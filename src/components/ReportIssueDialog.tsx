import { useState, type FormEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Bug } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { reportIssueSchema, type ReportIssueInput } from "@/lib/validation";

export function ReportIssueDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReportIssueInput>({
    resolver: zodResolver(reportIssueSchema),
    defaultValues: { title: "", description: "", priority: "medium" },
  });

  const priority = watch("priority");

  const onSubmit = async (values: ReportIssueInput) => {
    if (!user) {
      toast.error("Sign in to report an issue");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("reported_issues").insert({
      user_id: user.id,
      title: values.title,
      description: values.description || null,
      priority: values.priority,
    });
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Thanks! Your issue has been reported.");
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Report an issue">
          <Bug className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card">
        <DialogHeader>
          <DialogTitle>Report an issue</DialogTitle>
          <DialogDescription>Found a bug or have feedback? Let us know.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit) as (e: FormEvent) => void} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="issue-title">Title</Label>
            <Input id="issue-title" {...register("title")} maxLength={100} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="issue-description">Description</Label>
            <Textarea id="issue-description" rows={4} {...register("description")} />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(value) => setValue("priority", value as ReportIssueInput["priority"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
