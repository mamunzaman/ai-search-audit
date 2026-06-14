import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import type { CategoryRecommendation } from "@/lib/category-detail-data";

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
    <section className="space-y-stack-md">
      <div className="border-b border-outline-variant pb-3">
        <p className="text-label-md font-bold uppercase tracking-wider text-primary">
          Action Plan
        </p>
        <h3 className="text-headline-md">{title}</h3>
      </div>

      <div className="grid grid-cols-1 gap-stack-lg lg:grid-cols-2">
        {recommendations.map((rec, index) => {
          const priority = getPriority(index);
          const difficulty = getDifficulty(rec.estimatedGain);

          return (
            <article
              key={rec.title}
              className="overflow-hidden rounded-[24px] border border-outline-variant bg-white card-shadow"
            >
              <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-[11px] font-black text-on-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                      priorityStyles[priority],
                    )}
                  >
                    {priority}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-outline">
                    {difficulty}
                  </span>
                </div>
                {rec.estimatedGain ? (
                  <span className="text-body-sm font-bold text-[#2E7D32]">
                    +{rec.estimatedGain} pts
                  </span>
                ) : null}
              </div>

              <div className="space-y-3 p-5">
                <h4 className="font-bold text-primary">{rec.title}</h4>
                <p className="text-body-sm leading-relaxed text-on-surface-variant">
                  {rec.description}
                </p>
                <div className="flex items-start gap-2 rounded-lg bg-surface-container-low p-3">
                  <Icon name="build" size={16} className="mt-0.5 text-outline" />
                  <div>
                    <p className="text-[10px] font-bold uppercase text-outline">
                      Fix Summary
                    </p>
                    <p className="text-body-sm font-medium text-on-surface">
                      {rec.description}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
