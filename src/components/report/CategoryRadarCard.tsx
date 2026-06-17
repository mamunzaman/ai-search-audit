import { Icon } from "@/components/icons/Icon";
import type { ReportV2RadarPoint } from "@/lib/audit/report-v2";

type CategoryRadarCardProps = {
  points: ReportV2RadarPoint[];
};

const CENTER = 100;
const MAX_RADIUS = 80;

function polarToCartesian(angleIndex: number, radius: number): { x: number; y: number } {
  const angle = (-Math.PI / 2) + (angleIndex * 2 * Math.PI) / 8;
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  };
}

function buildPolygonPoints(
  points: ReportV2RadarPoint[],
  radiusScale: number,
): string {
  return points
    .map((point, index) => {
      const radius = (point.score / 100) * MAX_RADIUS * radiusScale;
      const { x, y } = polarToCartesian(index, radius);
      return `${x},${y}`;
    })
    .join(" ");
}

function buildGridPolygon(scale: number): string {
  return Array.from({ length: 8 }, (_, index) => {
    const { x, y } = polarToCartesian(index, MAX_RADIUS * scale);
    return `${x},${y}`;
  }).join(" ");
}

export function CategoryRadarCard({ points }: CategoryRadarCardProps) {
  const dataPolygon = buildPolygonPoints(points, 1);

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-[24px] border border-outline-variant bg-white p-stack-lg card-shadow"
      style={{ animationDelay: "0.3s" }}
    >
      <div className="mb-stack-md flex h-12 shrink-0 items-center justify-between border-b border-outline-variant pb-stack-sm">
        <h3 className="text-headline-md">Category Radar</h3>
        <Icon name="hub" className="text-outline" />
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-2">
        <svg className="h-full w-full max-h-full max-w-[240px]" viewBox="0 0 200 200">
          {[1, 0.75, 0.5, 0.25].map((scale) => (
            <polygon
              key={scale}
              fill="none"
              points={buildGridPolygon(scale)}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}
          {Array.from({ length: 4 }, (_, index) => {
            const start = polarToCartesian(index * 2, MAX_RADIUS);
            const end = polarToCartesian(index * 2 + 4, MAX_RADIUS);
            return (
              <line
                key={index}
                stroke="#E5E7EB"
                strokeWidth="1"
                x1={start.x}
                x2={end.x}
                y1={start.y}
                y2={end.y}
              />
            );
          })}
          <polygon
            className="fill-primary-blue/10 stroke-primary-blue"
            points={dataPolygon}
            strokeWidth="2"
          />
          {points.map((point, index) => {
            const labelPos = polarToCartesian(index, MAX_RADIUS + 14);
            return (
              <text
                key={point.label}
                className="fill-outline text-[8px] font-bold"
                textAnchor="middle"
                x={labelPos.x}
                y={labelPos.y}
              >
                {point.shortLabel}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
