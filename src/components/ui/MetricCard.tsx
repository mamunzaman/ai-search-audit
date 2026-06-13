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
    <div className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-white p-6 soft-elevation">
      <div className="flex items-start justify-between">
        <Icon name={icon} className="text-primary" size={32} />
        <span
          className={cn(
            "font-headline-md text-headline-md",
            critical ? "text-accent-coral" : "text-primary",
          )}
        >
          {score}
          <small className="font-label-md text-label-md text-on-surface-variant">/100</small>
        </span>
      </div>
      <h4 className="font-body-md text-body-md font-bold text-on-surface">{title}</h4>
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
