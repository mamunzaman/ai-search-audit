import type { FixPlan } from "@/types/audit";
import { reportStyles } from "./reportStyles";

type FixPlanCardProps = {
  data: FixPlan;
};

export function FixPlanCard({ data }: FixPlanCardProps) {
  if (data.actions.length === 0) {
    return null;
  }

  return (
    <section
      className={`${reportStyles.card} ${reportStyles.cardPaddingXl}`}
      style={{ animationDelay: "0.35s" }}
    >
      <h2 className={`${reportStyles.sectionTitle} mb-stack-lg text-primary`}>
        Your 3-Step Fix Plan
      </h2>
      <ol className="space-y-stack-md">
        {data.actions.map((action, index) => (
          <li
            key={action.title}
            className="flex min-w-0 gap-stack-md border-b border-outline-variant pb-stack-md last:border-b-0 last:pb-0"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-label-md font-bold text-on-primary">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                <p className="min-w-0 break-words font-bold text-on-surface">
                  {action.title}
                </p>
                <span className="shrink-0 text-body-sm font-bold tabular-nums text-[#2E7D32]">
                  +{action.estimatedGain} pts
                </span>
              </div>
              <p className="mt-1 text-label-md uppercase text-on-surface-variant">
                {action.category}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-stack-lg flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant pt-stack-md">
        <span className={reportStyles.subsectionLabel}>Estimated Improvement</span>
        <span className="text-headline-md tabular-nums text-primary">
          +{data.totalPotentialGain} points
        </span>
      </div>
    </section>
  );
}
