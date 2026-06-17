import { ReportScoreRing } from "@/components/report/ScoreRing";
import { cn } from "@/lib/cn";
import { ReportFadeIn } from "./ReportMotion";
import { reportStyles } from "./reportStyles";

type CategoryHeroCardProps = {
  score: number;
  categorySlug: string;
  title: string;
  summary: string;
  statusLabel: string;
  statusClassName: string;
  scoreLabel?: string;
  className?: string;
};

export function CategoryHeroCard({
  score,
  categorySlug,
  title,
  summary,
  statusLabel,
  statusClassName,
  scoreLabel = "Score",
  className,
}: CategoryHeroCardProps) {
  return (
    <ReportFadeIn>
      <section className={cn(reportStyles.heroCard, className)}>
      <ReportScoreRing
        score={score}
        categorySlug={categorySlug}
        label={scoreLabel}
      />
      <div className="min-w-0 flex-1 space-y-2 text-center md:text-left">
        <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
          <h1 className={reportStyles.pageTitle}>{title}</h1>
          <span className={cn(reportStyles.statusBadge, statusClassName)}>
            {statusLabel}
          </span>
        </div>
        <p className={reportStyles.pageSummary}>{summary}</p>
      </div>
    </section>
    </ReportFadeIn>
  );
}
