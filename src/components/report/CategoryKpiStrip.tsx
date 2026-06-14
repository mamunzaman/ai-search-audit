import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import type { CategoryKpi } from "@/lib/category-detail-data";

type CategoryKpiStripProps = {
  kpis: CategoryKpi[];
};

function parsePercent(value: string): number {
  return Number.parseInt(value.replace(/[^\d]/g, ""), 10) || 0;
}

function getTrend(value: string): {
  direction: "up" | "down" | "neutral";
  label: string;
} {
  const num = parsePercent(value);

  if (num >= 85) {
    return { direction: "up", label: "Strong" };
  }

  if (num >= 65) {
    return { direction: "neutral", label: "Stable" };
  }

  return { direction: "down", label: "At risk" };
}

const trendStyles = {
  up: "text-[#2E7D32] bg-[#E8F5E9]",
  down: "text-on-error-container bg-error-container",
  neutral: "text-on-secondary-container bg-secondary-container",
};

const trendIcons = {
  up: "trending_up",
  down: "trending_down",
  neutral: "trending_flat",
};

export function CategoryKpiStrip({ kpis }: CategoryKpiStripProps) {
  return (
    <div className="grid grid-cols-2 gap-stack-lg md:grid-cols-4">
      {kpis.map((kpi) => {
        const trend = getTrend(kpi.value);

        return (
          <div
            key={kpi.label}
            className="flex h-full min-h-[120px] flex-col justify-between rounded-[24px] border border-outline-variant bg-white p-5 card-shadow"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-label-md font-bold uppercase tracking-wider text-outline">
                {kpi.label}
              </p>
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase",
                  trendStyles[trend.direction],
                )}
              >
                <Icon name={trendIcons[trend.direction]} size={12} />
                {trend.label}
              </span>
            </div>
            <div>
              <p className="text-[32px] font-black leading-none tabular-nums text-on-surface">
                {kpi.value}
              </p>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-surface-container-high">
                <div
                  className={cn(
                    "h-full rounded-full",
                    trend.direction === "up"
                      ? "bg-primary"
                      : trend.direction === "down"
                        ? "bg-error"
                        : "bg-secondary",
                  )}
                  style={{ width: kpi.value }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
