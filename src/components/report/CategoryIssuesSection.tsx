import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import type { CategoryIssue } from "@/lib/category-detail-data";
import { IssueExplanationAccordion } from "./IssueExplanationAccordion";
import { reportStyles } from "./reportStyles";

type CategoryIssuesSectionProps = {
  issues: CategoryIssue[];
  title?: string;
  category?: string;
};

const impactStyles: Record<
  CategoryIssue["impact"],
  { badge: string; text: string; border: string }
> = {
  Critical: {
    badge: "bg-error-container text-on-error-container",
    text: "text-error",
    border: "border-l-error",
  },
  High: {
    badge: "bg-[#FF5A4F]/10 text-[#FF5A4F]",
    text: "text-[#FF5A4F]",
    border: "border-l-[#FF5A4F]",
  },
  Medium: {
    badge: "bg-[#FFF9C4] text-[#856404]",
    text: "text-[#856404]",
    border: "border-l-[#FFC107]",
  },
};

function impactScore(impact: CategoryIssue["impact"]): number {
  if (impact === "Critical") {
    return 9;
  }

  if (impact === "High") {
    return 7;
  }

  return 5;
}

type CategoryIssueSpotlightProps = {
  issue?: CategoryIssue;
  category?: string;
};

export function CategoryIssueSpotlight({ issue, category }: CategoryIssueSpotlightProps) {
  if (!issue) {
    return (
      <section
        className={cn(
          reportStyles.card,
          reportStyles.cardPadding,
          "flex h-full flex-col items-center justify-center text-center",
        )}
      >
        <Icon name="check_circle" size={32} className="mb-2 text-[#2E7D32]" filled />
        <p className="font-semibold text-on-surface">No critical issues</p>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Core SEO signals are performing well.
        </p>
      </section>
    );
  }

  const styles = impactStyles[issue.impact];
  const score = impactScore(issue.impact);

  return (
    <section
      className={cn(
        reportStyles.card,
        reportStyles.cardPadding,
        "border-l-4",
        styles.border,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className={cn("flex items-center gap-2", styles.text)}>
          <Icon name="warning" size={20} />
          <span className={reportStyles.subsectionLabel}>{issue.impact} Issue</span>
        </div>
        <div className="text-right">
          <p className={reportStyles.subsectionLabel}>Impact</p>
          <p className={cn("text-headline-md tabular-nums", styles.text)}>{score}/10</p>
        </div>
      </div>

      <h4 className="mb-1 text-body-md font-bold text-on-surface">{issue.title}</h4>
      <p className="mb-4 line-clamp-3 text-body-sm text-on-surface-variant">
        {issue.explanation}
      </p>

      <IssueExplanationAccordion
        title={issue.title}
        category={category}
        severity={issue.impact}
        recommendation={issue.recommendation ?? issue.explanation}
      />
    </section>
  );
}

export function CategoryIssuesSection({
  issues,
  title = "Priority Issues",
  category,
}: CategoryIssuesSectionProps) {
  if (issues.length === 0) {
    return null;
  }

  return (
    <section className={reportStyles.sectionStack}>
      <h3 className={reportStyles.sectionTitle}>{title}</h3>
      <div className={cn("grid grid-cols-1 lg:grid-cols-2", reportStyles.gridGap)}>
        {issues.map((issue) => {
          const styles = impactStyles[issue.impact];
          const score = impactScore(issue.impact);

          return (
            <article
              key={issue.title}
              className={cn(
                reportStyles.card,
                reportStyles.cardPadding,
                "border-l-4",
                styles.border,
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                    styles.badge,
                  )}
                >
                  <Icon name="warning" size={14} />
                  {issue.impact}
                </span>
                <div className="text-right">
                  <p className={reportStyles.subsectionLabel}>Impact</p>
                  <p className={cn("text-headline-md tabular-nums", styles.text)}>
                    {score}/10
                  </p>
                </div>
              </div>

              <h4 className="mb-1 text-body-md font-bold text-on-surface">{issue.title}</h4>
              <p className="mb-3 text-body-sm text-on-surface-variant">{issue.explanation}</p>

              <IssueExplanationAccordion
                title={issue.title}
                category={category}
                severity={issue.impact}
                recommendation={issue.recommendation ?? issue.explanation}
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}
