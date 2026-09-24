import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExerciseSelectProps {
  exercises: string[];
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

export function ExerciseSelect({ exercises, value, onChange, id }: ExerciseSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id}>
        <SelectValue placeholder="Select an exercise" />
      </SelectTrigger>
      <SelectContent>
        {exercises.map((exercise) => (
          <SelectItem key={exercise} value={exercise}>
            {exercise}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
