import type { HeadingStructureInsight } from "@/types/audit";
import { cn } from "@/lib/cn";
import { reportStyles } from "./reportStyles";

type HeadingStructureCardProps = {
  data: HeadingStructureInsight;
};

const HEADING_LEVELS: { key: keyof HeadingStructureInsight; label: string }[] = [
  { key: "h1", label: "H1" },
  { key: "h2", label: "H2" },
  { key: "h3", label: "H3" },
  { key: "h4", label: "H4" },
  { key: "h5", label: "H5" },
  { key: "h6", label: "H6" },
];

function maxHeadingCount(data: HeadingStructureInsight): number {
  return Math.max(
    data.h1,
    data.h2,
    data.h3,
    data.h4,
    data.h5,
    data.h6,
    1,
  );
}

export function HeadingStructureCard({ data }: HeadingStructureCardProps) {
  const maxCount = maxHeadingCount(data);

  return (
    <article className={`${reportStyles.card} ${reportStyles.cardPadding} min-w-0`}>
      <h3 className={`${reportStyles.sectionTitle} mb-1 text-primary`}>
        Heading Structure
      </h3>
      <p className="mb-stack-md text-body-sm text-on-surface-variant">
        Distribution of headings found on the audited page.
      </p>
      <div className="space-y-3">
        {HEADING_LEVELS.map(({ key, label }) => {
          const count = data[key];
          const widthPercent = Math.round((count / maxCount) * 100);
          const isH1 = key === "h1";

          return (
            <div
              key={key}
              className={cn(
                "grid min-w-0 grid-cols-[2.5rem_1fr_auto] items-center gap-2 rounded-lg px-2 py-1.5 sm:grid-cols-[3rem_1fr_auto] sm:gap-3",
                isH1 && "bg-surface-container-low",
              )}
            >
              <span
                className={cn(
                  "text-label-md font-bold uppercase",
                  isH1 ? "text-primary" : "text-on-surface-variant",
                )}
              >
                {label}
              </span>
              <div className="h-3 min-w-0 overflow-hidden rounded-full bg-surface-container">
                <div
                  className={cn(
                    "h-full rounded-full",
                    isH1 ? "bg-primary" : "bg-primary-container",
                  )}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
              <span
                className={cn(
                  "min-w-[1.5rem] text-right tabular-nums text-data-mono",
                  isH1 ? "font-semibold text-primary" : "text-on-surface-variant",
                )}
              >
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </article>
  );
}
