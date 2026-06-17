import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";

export type HomeMetric = {
  icon: string;
  title: string;
  score: number;
  critical?: boolean;
};

type MetricCardProps = {
  metric: HomeMetric;
};

export function MetricCard({ metric }: MetricCardProps) {
  const { icon, title, score, critical } = metric;

  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-outline-variant bg-white p-6 card-shadow">
      <div className="flex items-start justify-between gap-3">
        <Icon name={icon} className="shrink-0 text-primary" size={28} />
        <span
          className={cn(
            "text-right font-headline-md text-headline-md font-bold tabular-nums tracking-tight",
            critical ? "text-accent-coral" : "text-primary",
          )}
        >
          {score}
          <small className="ml-0.5 font-label-md text-label-md font-semibold text-text-secondary">
            /100
          </small>
        </span>
      </div>
      <h4 className="font-body-md text-body-md font-semibold text-on-surface">{title}</h4>
      <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
        <div
          className={cn(
            "h-full",
            critical ? "bg-accent-coral" : "bg-primary",
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
