import { ReportScoreRing } from "@/components/report/ScoreRing";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import { reportStyles } from "./reportStyles";

type CategoryDetailHeaderProps = {
  score: number;
  statusLabel: string;
  statusTone: "excellent" | "good" | "fair" | "poor";
  title: string;
  summary: string;
  categorySlug: string;
  strengths?: string[];
  opportunities?: string[];
};

const toneStyles = {
  excellent: {
    badge: "bg-[#E8F5E9] text-[#2E7D32]",
  },
  good: {
    badge: "bg-secondary-container text-on-secondary-container",
  },
  fair: {
    badge: "bg-[#FFF9C4] text-[#856404]",
  },
  poor: {
    badge: "bg-error-container text-on-error-container",
  },
};

export function CategoryDetailHeader({
  score,
  statusLabel,
  statusTone,
  title,
  summary,
  categorySlug,
  strengths = [],
  opportunities = [],
}: CategoryDetailHeaderProps) {
  const tone = toneStyles[statusTone];

  return (
    <section className={cn(reportStyles.heroCard, "lg:flex-row lg:items-center")}>
      <div className="flex shrink-0 flex-col items-center">
        <ReportScoreRing
          score={score}
          categorySlug={categorySlug}
          label="Score"
        />
        <div
          className={cn(
            "mt-stack-sm inline-flex items-center gap-2 rounded-full px-3 py-1",
            tone.badge,
          )}
        >
          <Icon
            name={statusTone === "poor" ? "error" : "check_circle"}
            size={18}
            filled={statusTone !== "poor"}
          />
          <span className={cn(reportStyles.statusBadge, tone.badge)}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1 space-y-stack-md">
        <div>
          <h2 className={reportStyles.pageTitle}>{title}</h2>
          <p className={reportStyles.pageSummary}>{summary}</p>
        </div>

        <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-2">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-label-md font-bold uppercase tracking-wider text-[#2E7D32]">
              <Icon name="thumb_up" size={16} />
              Top Strengths
            </p>
            {strengths.length > 0 ? (
              <ul className="space-y-1">
                {strengths.slice(0, 3).map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-1.5 text-body-sm text-on-surface-variant"
                  >
                    <Icon
                      name="check_circle"
                      size={14}
                      className="mt-0.5 shrink-0 text-[#2E7D32]"
                      filled
                    />
                    <span className="line-clamp-1">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body-sm text-outline">No optimized signals yet.</p>
            )}
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-label-md font-bold uppercase tracking-wider text-primary">
              <Icon name="trending_up" size={16} />
              Top Opportunities
            </p>
            {opportunities.length > 0 ? (
              <ul className="space-y-1">
                {opportunities.slice(0, 3).map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-1.5 text-body-sm text-on-surface-variant"
                  >
                    <Icon
                      name="arrow_forward"
                      size={14}
                      className="mt-0.5 shrink-0 text-primary"
                    />
                    <span className="line-clamp-1">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body-sm text-outline">
                Core SEO signals are in good standing.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
