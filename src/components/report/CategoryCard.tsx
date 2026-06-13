import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import type { ReportCategory } from "@/lib/report-data";

type CategoryCardProps = {
  category: ReportCategory;
};

export function CategoryCard({ category }: CategoryCardProps) {
  const { icon, title, score, critical, summary, issueCount } = category;

  return (
    <div className="group cursor-default rounded-[24px] border border-gray-100 bg-white p-stack-lg card-shadow transition-colors hover:border-primary-blue">
      <div className="mb-4 flex items-start justify-between">
        <Icon
          name={icon}
          className={cn(
            "rounded-xl p-3",
            critical
              ? "bg-red-50 text-accent-coral"
              : "bg-blue-50 text-primary-blue",
          )}
        />
        <span
          className={cn(
            "text-headline-md",
            critical ? "text-accent-coral" : "text-primary-blue",
          )}
        >
          {score}
        </span>
      </div>
      <h4 className="mb-2 text-label-md uppercase text-on-surface-variant">
        {title}
      </h4>
      {summary ? (
        <p className="mb-2 line-clamp-2 text-body-sm text-on-surface-variant">
          {summary}
        </p>
      ) : null}
      {issueCount && issueCount > 0 ? (
        <p className="mb-2 text-label-md text-accent-coral">
          {issueCount} issue{issueCount === 1 ? "" : "s"}
        </p>
      ) : null}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn(
            "h-full rounded-full",
            critical ? "bg-accent-coral" : "bg-primary-blue",
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
