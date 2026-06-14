import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import type { CategoryIssue } from "@/lib/category-detail-data";

type CategoryIssuesSectionProps = {
  issues: CategoryIssue[];
  title?: string;
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
};

export function CategoryIssueSpotlight({ issue }: CategoryIssueSpotlightProps) {
  if (!issue) {
    return (
      <section className="flex h-full flex-col items-center justify-center rounded-[24px] border border-outline-variant bg-white p-stack-lg text-center card-shadow">
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
        "rounded-[24px] border border-outline-variant border-l-4 bg-white p-5 card-shadow",
        styles.border,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className={cn("flex items-center gap-2", styles.text)}>
          <Icon name="warning" size={20} />
          <span className="text-label-md font-bold uppercase tracking-wider">
            {issue.impact} Issue
          </span>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
            Impact
          </p>
          <p className={cn("text-xl font-black tabular-nums", styles.text)}>
            {score}/10
          </p>
        </div>
      </div>

      <h4 className="mb-1 text-lg font-bold text-on-surface">{issue.title}</h4>
      <p className="mb-4 line-clamp-3 text-body-sm text-on-surface-variant">
        {issue.explanation}
      </p>

      <div className="rounded-xl bg-surface-container-low p-4">
        <p className="mb-1 text-label-md font-bold uppercase text-primary">
          Recommendation
        </p>
        <p className="text-body-sm font-semibold text-on-surface">
          {issue.recommendation ?? issue.title}
        </p>
        {issue.estimatedGain ? (
          <p className="mt-1 text-label-md text-outline">
            Estimated impact:{" "}
            <span className="font-bold text-[#2E7D32]">
              +{issue.estimatedGain} health points
            </span>
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function CategoryIssuesSection({
  issues,
  title = "Priority Issues",
}: CategoryIssuesSectionProps) {
  if (issues.length === 0) {
    return null;
  }

  return (
    <section className="space-y-stack-md">
      <h3 className="text-headline-md">{title}</h3>
      <div className="grid grid-cols-1 gap-stack-lg lg:grid-cols-2">
        {issues.map((issue) => {
          const styles = impactStyles[issue.impact];
          const score = impactScore(issue.impact);

          return (
            <article
              key={issue.title}
              className={cn(
                "rounded-[24px] border border-outline-variant border-l-4 bg-white p-5 card-shadow",
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
                  <p className="text-[10px] font-bold uppercase text-outline">Impact</p>
                  <p className={cn("text-lg font-black tabular-nums", styles.text)}>
                    {score}/10
                  </p>
                </div>
              </div>

              <h4 className="mb-1 font-bold text-on-surface">{issue.title}</h4>
              <p className="mb-3 text-body-sm text-on-surface-variant">
                {issue.explanation}
              </p>

              {issue.recommendation ? (
                <div className="rounded-xl bg-surface-container-low p-3">
                  <p className="mb-1 text-[10px] font-bold uppercase text-primary">
                    Recommended Fix
                  </p>
                  <p className="text-body-sm font-semibold">{issue.recommendation}</p>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
