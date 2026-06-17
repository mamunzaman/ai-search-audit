import { cn } from "@/lib/cn";
import type { CategoryRecommendation } from "@/lib/category-detail-data";
import { CategoryRecommendationDetail } from "./CategoryRecommendationDetail";
import { reportStyles } from "./reportStyles";

type CategoryRecommendationsSectionProps = {
  recommendations: CategoryRecommendation[];
  title?: string;
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
}: CategoryRecommendationsSectionProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className={reportStyles.sectionStack}>
      <div className="border-b border-outline-variant pb-stack-md">
        <p className="text-label-md font-bold uppercase tracking-wider text-primary">
          Action Plan
        </p>
        <h3 className={reportStyles.sectionTitle}>{title}</h3>
      </div>

      <div className={cn("grid grid-cols-1 lg:grid-cols-2", reportStyles.gridGap)}>
        {recommendations.map((rec, index) => {
          const priority = getPriority(index);
          const difficulty = getDifficulty(rec.estimatedGain);

          return (
            <article key={rec.title} className={cn(reportStyles.card, "overflow-hidden")}>
              <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-stack-lg py-stack-md">
                <div className="flex items-center gap-2">
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
                ) : null}
              </div>

              <div className="space-y-3 p-stack-lg">
                <h4 className="font-bold text-primary">{rec.title}</h4>
                <CategoryRecommendationDetail
                  whyItMatters={rec.whyItMatters}
                  howToFix={rec.howToFix}
                  copyableExample={rec.copyableExample}
                  fallbackDescription={rec.description}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
