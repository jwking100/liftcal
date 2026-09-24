import { PLATE_COLORS, PLATE_DIAMETERS, PLATE_THICKNESS } from "@/lib/constants";

interface BarbellVisualProps {
  perSide: number[];
}

const VIEW_HEIGHT = 140;
const CENTER_Y = VIEW_HEIGHT / 2;
const BAR_HALF_WIDTH = 90;
const COLLAR_WIDTH = 8;
const GAP = 1.5;

function platesWidth(perSide: number[]) {
  return perSide.reduce((sum, plate) => sum + (PLATE_THICKNESS[plate] ?? 10) + GAP, 0);
}

export function BarbellVisual({ perSide }: BarbellVisualProps) {
  const sleeveWidth = platesWidth(perSide) + COLLAR_WIDTH + 10;
  const centerX = BAR_HALF_WIDTH + sleeveWidth;
  const totalWidth = centerX * 2;

  // Right side: innermost plate first (closest to bar), building outward.
  let xRight = centerX + BAR_HALF_WIDTH;
  const rightPlates = perSide.map((plate, index) => {
    const width = PLATE_THICKNESS[plate] ?? 10;
    const height = PLATE_DIAMETERS[plate] ?? 60;
    const el = (
      <rect
        key={`r-${plate}-${index}`}
        x={xRight}
        y={CENTER_Y - height / 2}
        width={width}
        height={height}
        rx={3}
        fill={PLATE_COLORS[plate] ?? "#9ca3af"}
        stroke="hsl(222 47% 6%)"
        strokeWidth={1.5}
      />
    );
    xRight += width + GAP;
    return el;
  });
  const rightCollarX = xRight;

  // Left side mirrors the right side.
  let xLeft = centerX - BAR_HALF_WIDTH;
  const leftPlates = perSide.map((plate, index) => {
    const width = PLATE_THICKNESS[plate] ?? 10;
    const height = PLATE_DIAMETERS[plate] ?? 60;
    xLeft -= width + GAP;
    return (
      <rect
        key={`l-${plate}-${index}`}
        x={xLeft + GAP}
        y={CENTER_Y - height / 2}
        width={width}
        height={height}
        rx={3}
        fill={PLATE_COLORS[plate] ?? "#9ca3af"}
        stroke="hsl(222 47% 6%)"
        strokeWidth={1.5}
      />
    );
  });
  const leftCollarX = xLeft - COLLAR_WIDTH;

  return (
    <div className="h-40 w-full sm:h-48">
      <svg
        viewBox={`0 0 ${totalWidth} ${VIEW_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
        role="img"
        aria-label={`Barbell loaded with ${perSide.length} plate${perSide.length === 1 ? "" : "s"} per side`}
      >
        {/* bar */}
        <rect x={0} y={CENTER_Y - 5} width={totalWidth} height={10} rx={3} fill="hsl(215 20% 55%)" />
        {/* center knurling marker */}
        <rect x={centerX - 1} y={CENTER_Y - 5} width={2} height={10} fill="hsl(222 47% 6%)" />

        {leftPlates}
        <rect x={leftCollarX} y={CENTER_Y - 13} width={COLLAR_WIDTH} height={26} rx={2} fill="hsl(174 72% 45%)" />

        {rightPlates}
        <rect x={rightCollarX} y={CENTER_Y - 13} width={COLLAR_WIDTH} height={26} rx={2} fill="hsl(174 72% 45%)" />
      </svg>
    </div>
  );
}
