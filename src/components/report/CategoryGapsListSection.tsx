import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import { IssueExplanationAccordion } from "./IssueExplanationAccordion";
import { reportStyles } from "./reportStyles";

type CategoryGapsListSectionProps = {
  title: string;
  issues: string[];
  category?: string;
  compact?: boolean;
};

export function CategoryGapsListSection({
  title,
  issues,
  category,
  compact = true,
}: CategoryGapsListSectionProps) {
  if (issues.length === 0) {
    return null;
  }

  return (
    <section className={cn(reportStyles.card, "overflow-hidden")}>
      <div
        className={
          compact ? reportStyles.tableSectionHeaderCompact : reportStyles.tableSectionHeader
        }
      >
        <h3 className={reportStyles.sectionTitle}>{title}</h3>
      </div>
      <ul className={cn(compact ? "space-y-stack-sm p-stack-md" : "space-y-stack-md p-stack-lg")}>
        {issues.map((issue) => (
          <li
            key={issue}
            className={cn(
              "min-w-0 border-b border-outline-variant last:border-b-0",
              compact ? "pb-stack-sm last:pb-0" : "pb-stack-md last:pb-0",
            )}
          >
            <div className="mb-1.5 flex min-w-0 items-start gap-2 break-words text-body-sm text-on-surface-variant">
              <Icon name="error_outline" size={18} className="mt-0.5 shrink-0 text-error" />
              <span>{issue}</span>
            </div>
            <div className="pl-[26px]">
              <IssueExplanationAccordion
                title={issue}
                category={category}
                status="fail"
                recommendation={issue}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
