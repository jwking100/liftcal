import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Workout } from "@/hooks/useWorkoutHistory";
import { findPrIndices } from "@/lib/pr";

interface ProgressChartProps {
  workouts: Workout[];
}

const LINE_COLOR = "hsl(174 72% 45%)";
const PR_COLOR = "hsl(38 92% 60%)";
const SURFACE_COLOR = "hsl(222 40% 10%)";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ProgressChart({ workouts }: ProgressChartProps) {
  const ascending = [...workouts].sort(
    (a, b) => new Date(a.performed_at).getTime() - new Date(b.performed_at).getTime(),
  );
  const prIndices = findPrIndices(ascending);

  const data = ascending.map((workout, index) => ({
    date: workout.performed_at,
    weight: Number(workout.weight),
    reps: workout.reps,
    isPr: prIndices.has(index),
  }));

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No workouts logged for this exercise yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 12, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="hsl(222 25% 20%)" strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="hsl(215 20% 65%)"
            tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "hsl(222 25% 20%)" }}
          />
          <YAxis
            width={44}
            stroke="hsl(215 20% 65%)"
            tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            unit="kg"
          />
          <Tooltip
            contentStyle={{
              background: "hsl(222 44% 8%)",
              border: "1px solid hsl(222 25% 20%)",
              borderRadius: 8,
              color: "hsl(210 40% 96%)",
            }}
            labelFormatter={(value) => formatDate(value as string)}
            formatter={(value, _name, item) => [
              `${value} kg × ${item.payload.reps} reps${item.payload.isPr ? "  ★ PR" : ""}`,
              "Logged",
            ]}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke={LINE_COLOR}
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload, index } = props;
              const isPr = payload.isPr;
              return (
                <circle
                  key={`dot-${index}`}
                  cx={cx}
                  cy={cy}
                  r={isPr ? 6 : 4}
                  fill={isPr ? PR_COLOR : LINE_COLOR}
                  stroke={SURFACE_COLOR}
                  strokeWidth={2}
                />
              );
            }}
            activeDot={{ r: 7, stroke: SURFACE_COLOR, strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: LINE_COLOR }} />
          Logged
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: PR_COLOR }} />
          Personal record
        </span>
      </div>
    </div>
  );
}
