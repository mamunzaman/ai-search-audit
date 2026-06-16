import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import type { CategoryKpi } from "@/lib/category-detail-data";
import { reportStyles } from "./reportStyles";

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
    <div className={cn("grid grid-cols-2 md:grid-cols-4", reportStyles.gridGap)}>
      {kpis.map((kpi) => {
        const trend = getTrend(kpi.value);

        return (
          <div
            key={kpi.label}
            className={cn(
              reportStyles.card,
              reportStyles.cardPadding,
              "flex h-full min-h-[120px] flex-col justify-between",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className={reportStyles.subsectionLabel}>{kpi.label}</p>
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                  trendStyles[trend.direction],
                )}
              >
                <Icon name={trendIcons[trend.direction]} size={12} />
                {trend.label}
              </span>
            </div>
            <div>
              <p className="text-headline-md tabular-nums text-primary">{kpi.value}</p>
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
