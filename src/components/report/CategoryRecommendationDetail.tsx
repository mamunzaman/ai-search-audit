import type { EnrichedRecommendationFields } from "@/types/audit";
import { CategoryCopyableExample } from "./CategoryCopyableExample";
import { reportStyles } from "./reportStyles";

type CategoryRecommendationDetailProps = EnrichedRecommendationFields & {
  fallbackDescription?: string;
};

export function CategoryRecommendationDetail({
  whyItMatters,
  howToFix,
  copyableExample,
  fallbackDescription,
}: CategoryRecommendationDetailProps) {
  const why = whyItMatters ?? fallbackDescription;
  const fix = howToFix ?? fallbackDescription;

  if (!why && !fix && !copyableExample) {
    return null;
  }

  return (
    <div className="space-y-3">
      {why && why !== fix ? (
        <div>
          <p className={reportStyles.subsectionLabel}>Why it matters</p>
          <p className="text-body-sm leading-relaxed text-on-surface-variant">{why}</p>
        </div>
      ) : null}
      {fix ? (
        <div>
          <p className={reportStyles.subsectionLabel}>How to fix</p>
          <p className="text-body-sm leading-relaxed text-on-surface">{fix}</p>
        </div>
      ) : null}
      {copyableExample ? (
        <CategoryCopyableExample code={copyableExample} label="Copyable example" />
      ) : null}
    </div>
  );
}
