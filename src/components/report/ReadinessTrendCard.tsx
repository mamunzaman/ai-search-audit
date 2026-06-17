import { Icon } from "@/components/icons/Icon";

type ReadinessTrendCardProps = {
  points: number[];
};

function buildTrendPath(
  points: number[],
  width: number,
  height: number,
  padding: number,
): string {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(1, max - min);
  const stepX = (width - padding * 2) / (points.length - 1);

  return points
    .map((value, index) => {
      const x = padding + index * stepX;
      const normalized = (value - min) / range;
      const y = height - padding - normalized * (height - padding * 2);
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

function getTrendY(
  value: number,
  points: number[],
  height: number,
  padding: number,
): number {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(1, max - min);
  const normalized = (value - min) / range;
  return height - padding - normalized * (height - padding * 2);
}

export function ReadinessTrendCard({ points }: ReadinessTrendCardProps) {
  const width = 400;
  const height = 200;
  const padding = 20;
  const linePath = buildTrendPath(points, width, height, padding);
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;
  const midIndex = Math.floor(points.length / 2);
  const midPoint = points[midIndex] ?? points[0] ?? 0;
  const lastPoint = points[points.length - 1] ?? 0;
  const midX = padding + midIndex * ((width - padding * 2) / (points.length - 1));
  const endX = width - padding;

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-[24px] border border-outline-variant bg-white p-stack-lg card-shadow"
      style={{ animationDelay: "0.5s" }}
    >
      <div className="mb-stack-md flex h-12 shrink-0 items-center justify-between border-b border-outline-variant pb-stack-sm">
        <div className="min-w-0">
          <h3 className="line-clamp-1 text-headline-md">Readiness Trend</h3>
          <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
            Projected trend
          </p>
        </div>
        <Icon name="trending_up" className="shrink-0 text-outline" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <svg
          className="min-h-0 w-full flex-1"
          preserveAspectRatio="none"
          viewBox={`0 0 ${width} ${height}`}
        >
          <defs>
            <linearGradient id="area-gradient-trend" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#1536B8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#1536B8" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[50, 100, 150].map((y) => (
            <line
              key={y}
              stroke="#F1F5F9"
              strokeWidth="1"
              x1="0"
              x2={width}
              y1={y}
              y2={y}
            />
          ))}
          <path d={areaPath} fill="url(#area-gradient-trend)" />
          <path
            d={linePath}
            fill="none"
            stroke="#1536B8"
            strokeWidth="3"
          />
          <circle
            cx={midX}
            cy={getTrendY(midPoint, points, height, padding)}
            fill="#1536B8"
            r="5"
          />
          <circle
            cx={endX}
            cy={getTrendY(lastPoint, points, height, padding)}
            fill="#1536B8"
            r="5"
          />
        </svg>
        <div className="flex shrink-0 justify-between px-1 pt-2 text-[10px] font-bold text-outline">
          <span>Start</span>
          <span>Mid</span>
          <span>Projected</span>
        </div>
      </div>
    </div>
  );
}
