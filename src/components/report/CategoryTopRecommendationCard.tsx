import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import type { DetailPageRecommendation } from "@/types/audit";
import { CategoryRecommendationDetail } from "./CategoryRecommendationDetail";
import { reportStyles } from "./reportStyles";

export type TopRecommendation = DetailPageRecommendation;

type CategoryTopRecommendationCardProps = {
  title?: string;
  recommendation: TopRecommendation;
};

export function CategoryTopRecommendationCard({
  title = "Top Recommendation",
  recommendation,
}: CategoryTopRecommendationCardProps) {
  return (
    <section className={cn(reportStyles.card, "overflow-hidden")}>
      <div className={reportStyles.tableSectionHeader}>
        <h3 className={reportStyles.sectionTitle}>{title}</h3>
      </div>
      <div className="p-stack-lg">
        <div className="flex min-w-0 flex-col items-start gap-4 rounded-r-lg border-l-4 border-primary bg-primary/5 p-stack-md sm:flex-row sm:items-start">
          <div className="shrink-0 rounded-lg bg-primary-container p-2 text-on-primary">
            <Icon name="lightbulb" size={24} filled />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h4 className="break-words text-body-md font-bold text-on-surface">
                {recommendation.title}
              </h4>
              <span
                className={cn(
                  reportStyles.tableBadge,
                  "bg-[#E8F5E9] text-[#2E7D32]",
                )}
              >
                {recommendation.impactGain}
              </span>
            </div>
            <CategoryRecommendationDetail
              whyItMatters={recommendation.whyItMatters}
              howToFix={recommendation.howToFix}
              copyableExample={recommendation.copyableExample}
              fallbackDescription={recommendation.description}
            />
            <div className="flex flex-wrap items-center gap-4">
              <span className="rounded bg-primary/10 px-2 py-1 text-label-md font-medium text-primary">
                Priority: {recommendation.priority}
              </span>
              <span className="text-label-md font-medium text-on-surface-variant">
                Effort: {recommendation.effort}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
