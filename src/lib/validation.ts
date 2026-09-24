import { z } from "zod";
import { MAX_NAME_LENGTH, MAX_REPS, MAX_WEIGHT_KG } from "./constants";

export const weightSchema = z
  .number({ error: "Weight is required" })
  .min(0, "Weight cannot be negative")
  .max(MAX_WEIGHT_KG, `Weight cannot exceed ${MAX_WEIGHT_KG.toLocaleString()} kg`);

export const repsSchema = z
  .number({ error: "Reps is required" })
  .int("Reps must be a whole number")
  .min(0, "Reps cannot be negative")
  .max(MAX_REPS, `Reps cannot exceed ${MAX_REPS.toLocaleString()}`);

export const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(MAX_NAME_LENGTH, `Name cannot exceed ${MAX_NAME_LENGTH} characters`);

function isNotFutureDate(value: string) {
  const date = new Date(value);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return date <= endOfToday;
}

export const dateSchema = z
  .string()
  .min(1, "Date is required")
  .refine(isNotFutureDate, "Date cannot be in the future");

export const notesSchema = z.string().trim().max(1000, "Notes cannot exceed 1000 characters").optional();

export const workoutLogSchema = z.object({
  exercise: nameSchema,
  weight: weightSchema,
  reps: repsSchema,
  performedAt: dateSchema,
  notes: notesSchema,
});

export type WorkoutLogInput = z.infer<typeof workoutLogSchema>;

export const customExerciseSchema = z.object({
  name: nameSchema,
});

export const prOverrideSchema = z.object({
  exercise: nameSchema,
  weight: weightSchema,
  reps: repsSchema,
  achievedAt: dateSchema,
});

export type PrOverrideInput = z.infer<typeof prOverrideSchema>;

export const reportIssueSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(MAX_NAME_LENGTH, "Title is too long"),
  description: z.string().trim().max(2000, "Description is too long").optional(),
  priority: z.enum(["low", "medium", "high"]),
});

export type ReportIssueInput = z.infer<typeof reportIssueSchema>;

export const calculatorInputSchema = z.object({
  exercise: nameSchema,
  weight: weightSchema,
  reps: repsSchema,
});
