import { Icon } from "@/components/icons/Icon";
import type { ReportV2SemanticBar } from "@/lib/audit/report-v2";

type SemanticDistributionCardProps = {
  bars: ReportV2SemanticBar[];
};

export function SemanticDistributionCard({ bars }: SemanticDistributionCardProps) {
  const maxValue = Math.max(...bars.map((bar) => bar.value), 1);
  const chartHeight = 140;
  const barWidth = 20;
  const gap = 8;
  const svgWidth = bars.length * (barWidth + gap);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-outline-variant bg-white p-stack-lg card-shadow animate-fade-in">
      <div className="mb-stack-md flex h-12 shrink-0 items-center justify-between border-b border-outline-variant pb-stack-sm">
        <h3 className="line-clamp-1 text-headline-md">Semantic Distribution</h3>
        <Icon name="stacked_bar_chart" className="shrink-0 text-outline" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden">
        <svg
          aria-label="Category score distribution"
          className="mx-auto w-full max-w-full"
          height={chartHeight + 24}
          viewBox={`0 0 ${svgWidth} ${chartHeight + 24}`}
        >
          {bars.map((bar, index) => {
            const height = (bar.value / maxValue) * chartHeight;
            const x = index * (barWidth + gap);
            return (
              <g key={bar.label}>
                <rect
                  fill="#E8E7F2"
                  height={chartHeight}
                  rx="4"
                  width={barWidth}
                  x={x}
                  y={0}
                />
                <rect
                  fill="#1536B8"
                  height={height}
                  rx="4"
                  width={barWidth}
                  x={x}
                  y={chartHeight - height}
                />
                <text
                  className="fill-outline text-[7px] font-bold"
                  textAnchor="middle"
                  x={x + barWidth / 2}
                  y={chartHeight + 12}
                >
                  {bar.shortLabel}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="mt-stack-sm flex shrink-0 flex-wrap justify-center gap-x-3 gap-y-1 overflow-hidden">
          {bars.slice(0, 4).map((bar) => (
            <span
              key={bar.label}
              className="text-[10px] font-bold text-on-surface-variant"
            >
              {bar.shortLabel} {bar.value}%
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
