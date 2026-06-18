import { cn } from "@/lib/cn";
import type { CategoryRecommendation } from "@/lib/category-detail-data";
import { getIssueExplanation } from "@/lib/report/issueExplanations";
import { CategoryRecommendationDetail } from "./CategoryRecommendationDetail";
import { ReportFadeIn } from "./ReportMotion";
import { reportStyles } from "./reportStyles";

type CategoryRecommendationsSectionProps = {
  recommendations: CategoryRecommendation[];
  title?: string;
  category?: string;
};

function getPriority(index: number): "High" | "Medium" | "Low" {
  if (index === 0) {
    return "High";
  }

  if (index <= 2) {
    return "Medium";
  }

  return "Low";
}

function getDifficulty(gain?: number): "Easy" | "Moderate" | "Advanced" {
  if (!gain || gain >= 5) {
    return "Easy";
  }

  if (gain >= 3) {
    return "Moderate";
  }

  return "Advanced";
}

const priorityStyles = {
  High: "bg-error-container text-on-error-container",
  Medium: "bg-[#FFF9C4] text-[#856404]",
  Low: "bg-secondary-container text-on-secondary-container",
};

export function CategoryRecommendationsSection({
  recommendations,
  title = "Strategic Recommendations",
  category,
}: CategoryRecommendationsSectionProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <ReportFadeIn>
      <section className={reportStyles.sectionStack}>
      <div className="border-b border-outline-variant pb-stack-md">
        <p className="text-label-md font-bold uppercase tracking-wider text-primary">
          Action Plan
        </p>
        <h3 className={reportStyles.sectionTitle}>{title}</h3>
      </div>

      <div className={cn(reportStyles.detailGrid2)}>
        {recommendations.map((rec, index) => {
          const priority = getPriority(index);
          const difficulty = getDifficulty(rec.estimatedGain);
          const enriched = getIssueExplanation({
            title: rec.title,
            category,
            recommendation: rec.description,
          });

          return (
            <article key={rec.title} className={cn(reportStyles.card, "overflow-hidden")}>
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 border-b border-outline-variant bg-surface-container-low px-stack-md py-stack-sm md:px-stack-lg md:py-stack-md">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-label-md font-bold text-on-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(reportStyles.tableBadge, priorityStyles[priority])}
                  >
                    {priority}
                  </span>
                  <span className={reportStyles.subsectionLabel}>{difficulty}</span>
                </div>
                {rec.estimatedGain ? (
                  <span className="text-body-sm font-bold text-[#2E7D32]">
                    +{rec.estimatedGain} pts
                  </span>
                ) : enriched.expectedGain ? (
                  <span className="text-body-sm font-bold text-[#2E7D32]">
                    +{enriched.expectedGain} pts
                  </span>
                ) : null}
              </div>

              <div className="space-y-3 p-stack-md md:p-stack-lg">
                <h4 className={cn("font-bold text-primary", reportStyles.breakSafe)}>{rec.title}</h4>
                <CategoryRecommendationDetail
                  whyItMatters={rec.whyItMatters ?? enriched.whyItMatters}
                  howToFix={rec.howToFix ?? enriched.howToFix}
                  copyableExample={rec.copyableExample ?? enriched.copyableExample}
                  fallbackDescription={rec.description}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
    </ReportFadeIn>
  );
}
