"use client";

import { ScoreRing } from "@/components/ui/ScoreRing";

export const REPORT_SCORE_RING_CLASS = "h-44 w-44 md:h-52 md:w-52";

type ReportScoreRingProps = {
  score: number;
  categorySlug: string;
  label?: string;
  className?: string;
};

export function ReportScoreRing({
  score,
  categorySlug,
  label = "Score",
  className,
}: ReportScoreRingProps) {
  return (
    <ScoreRing
      key={`${categorySlug}-${score}`}
      score={score}
      size="md"
      label={label}
      animated
      strokeWidth={8}
      trackClassName="text-gray-200"
      indicatorClassName="text-primary-blue"
      scoreClassName="text-primary"
      className={className ?? REPORT_SCORE_RING_CLASS}
    />
  );
}
