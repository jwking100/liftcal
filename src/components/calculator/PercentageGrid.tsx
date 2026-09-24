import { cn } from "@/lib/utils";
import type { PercentageRow } from "@/lib/percentages";

const FONT_SIZE_CLASSES = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-2xl",
} as const;

export type FontSize = keyof typeof FONT_SIZE_CLASSES;

interface PercentageGridProps {
  rows: PercentageRow[];
  fontSize: FontSize;
}

export function PercentageGrid({ rows, fontSize }: PercentageGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {rows.map((row) => (
        <div
          key={row.percentage}
          className={cn(
            "glass-card flex flex-col items-center gap-1 p-4",
            row.percentage === 100 && "border-primary/60 shadow-glow",
          )}
        >
          <span className="text-xs font-medium text-muted-foreground">{row.percentage}%</span>
          <span className={cn("font-bold tabular-nums", FONT_SIZE_CLASSES[fontSize])}>
            {row.weight} kg
          </span>
        </div>
      ))}
    </div>
  );
}
