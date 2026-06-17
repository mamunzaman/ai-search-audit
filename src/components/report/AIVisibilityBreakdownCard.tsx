import type { AIVisibilityBreakdownItem } from "@/types/audit";
import { cn } from "@/lib/cn";
import { reportStyles } from "./reportStyles";

type AIVisibilityBreakdownCardProps = {
  data: AIVisibilityBreakdownItem[];
};

function scoreStatus(score: number): { label: string; className: string; barClassName: string } {
  if (score >= 80) {
    return {
      label: "Strong",
      className: "text-[#2E7D32]",
      barClassName: "bg-primary",
    };
  }

  if (score >= 60) {
    return {
      label: "Needs work",
      className: "text-[#856404]",
      barClassName: "bg-primary-container",
    };
  }

  return {
    label: "Weak",
    className: "text-[#FF5A4F]",
    barClassName: "bg-[#FF5A4F]",
  };
}

export function AIVisibilityBreakdownCard({ data }: AIVisibilityBreakdownCardProps) {
  return (
    <article className={`${reportStyles.card} ${reportStyles.cardPadding} min-w-0`}>
      <h3 className={`${reportStyles.sectionTitle} mb-1 text-primary`}>
        AI Visibility Breakdown
      </h3>
      <p className="mb-stack-md text-body-sm text-on-surface-variant">
        How key AI search categories contribute to your visibility score.
      </p>
      <div className="space-y-3">
        {data.map((item) => {
          const status = scoreStatus(item.score);
          const widthPercent = Math.min(100, Math.max(0, item.score));

          return (
            <div
              key={item.label}
              className="grid min-w-0 grid-cols-1 items-center gap-2 rounded-lg px-2 py-1.5 sm:grid-cols-[minmax(0,7.5rem)_1fr_auto] sm:gap-3"
            >
              <div className="min-w-0">
                <span className="block text-body-sm font-medium text-on-surface">
                  {item.label}
                </span>
                <span className={cn("text-label-md font-bold uppercase", status.className)}>
                  {status.label}
                </span>
              </div>
              <div className="h-3 min-w-0 overflow-hidden rounded-full bg-surface-container sm:col-span-1">
                <div
                  className={cn("h-full rounded-full", status.barClassName)}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
              <span className="shrink-0 text-right tabular-nums text-data-mono font-semibold text-primary sm:min-w-[2.5rem]">
                {item.score}%
              </span>
            </div>
          );
        })}
      </div>
    </article>
  );
}
