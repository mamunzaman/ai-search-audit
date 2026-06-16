import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import { reportStyles } from "./reportStyles";

type CategoryGapsListSectionProps = {
  title: string;
  issues: string[];
};

export function CategoryGapsListSection({ title, issues }: CategoryGapsListSectionProps) {
  if (issues.length === 0) {
    return null;
  }

  return (
    <section className={cn(reportStyles.card, "overflow-hidden")}>
      <div className={reportStyles.tableSectionHeader}>
        <h3 className={reportStyles.sectionTitle}>{title}</h3>
      </div>
      <ul className="space-y-2 p-stack-lg">
        {issues.map((issue) => (
          <li
            key={issue}
            className="flex min-w-0 items-start gap-2 break-words text-body-sm text-on-surface-variant"
          >
            <Icon name="error_outline" size={18} className="mt-0.5 shrink-0 text-error" />
            <span>{issue}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
