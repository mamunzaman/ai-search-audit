import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import type { HeadingOutlineItem } from "@/lib/audit/types";
import { reportStyles } from "@/components/report/reportStyles";

export type HeadingCounts = {
  h1: number;
  h2: number;
  h3: number;
  h4: number;
  h5: number;
  h6: number;
};

type HeadingHierarchyVisualProps = {
  counts: HeadingCounts;
  outline: HeadingOutlineItem[];
  issues: string[];
};

const LEVEL_KEYS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const LEVEL_BADGE_CLASS: Record<number, string> = {
  1: "bg-primary text-on-primary",
  2: "bg-primary-container text-on-primary-container",
  3: "bg-secondary-container text-on-secondary-container",
  4: "bg-surface-container-high text-on-surface-variant",
  5: "bg-surface-container-high text-on-surface-variant",
  6: "bg-surface-container-high text-on-surface-variant",
};

const LEVEL_INDENT: Record<number, string> = {
  1: "pl-0",
  2: "pl-4",
  3: "pl-8",
  4: "pl-12",
  5: "pl-16",
  6: "pl-20",
};

const MAX_VISIBLE_ROWS = 10;

const BENEFITS = [
  {
    icon: "psychology" as const,
    title: "Easy for AI to scan",
    description: "Clear hierarchy helps AI understand structure quickly.",
  },
  {
    icon: "view_agenda" as const,
    title: "Clear section meaning",
    description: "Well-defined sections improve relevance and context.",
  },
  {
    icon: "help" as const,
    title: "Question headings help answers",
    description: "FAQ-style headings increase your chances of being cited.",
  },
];

function HeadingLevelBadge({ level }: { level: number }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[2rem] shrink-0 items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        LEVEL_BADGE_CLASS[level],
      )}
    >
      H{level}
    </span>
  );
}

function getVisibleOutline(outline: HeadingOutlineItem[]) {
  if (outline.length === 0) {
    return {
      rows: [{ level: 1 as const, text: "No headings detected" }],
      truncated: false,
    };
  }

  if (outline.length <= MAX_VISIBLE_ROWS) {
    return { rows: outline, truncated: false };
  }

  return { rows: outline.slice(0, MAX_VISIBLE_ROWS - 1), truncated: true };
}

function countDuplicateLabels(outline: HeadingOutlineItem[]) {
  const map = new Map<string, number>();

  outline.forEach((item) => {
    const key = `${item.level}:${item.text.toLowerCase()}`;
    map.set(key, (map.get(key) ?? 0) + 1);
  });

  return map;
}

function CurrentPageOutlinePanel({
  outline,
  counts,
  issues,
}: {
  outline: HeadingOutlineItem[];
  counts: HeadingCounts;
  issues: string[];
}) {
  const { rows, truncated } = getVisibleOutline(outline);
  const duplicateMap = countDuplicateLabels(outline);
  const needsImprovement = issues.length > 0;

  return (
    <div className="flex h-full min-w-0 flex-col rounded-[24px] border border-accent-coral/25 bg-error-container/10 p-stack-md">
      <div className="mb-stack-md flex flex-wrap items-start justify-between gap-stack-sm">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-error-container text-accent-coral">
              <Icon name="warning" size={18} />
            </span>
            <h4 className="min-w-0 text-body-md font-semibold text-on-surface">Current page outline</h4>
          </div>
          <p className="text-body-sm text-text-secondary">
            How headings are structured on this page
          </p>
        </div>
        <span
          className={cn(
            reportStyles.statusBadge,
            "shrink-0",
            needsImprovement
              ? "bg-error-container text-on-error-container"
              : "bg-green-100 text-green-700",
          )}
        >
          {needsImprovement ? "Needs improvement" : "Healthy"}
        </span>
      </div>

      <div className="mb-stack-md grid min-w-0 flex-1 grid-cols-1 gap-stack-md rounded-2xl border border-outline-variant bg-white p-stack-md card-shadow 2xl:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0 w-full space-y-1">
          {rows.map((item, index) => {
            const duplicateKey = `${item.level}:${item.text.toLowerCase()}`;
            const duplicateCount = duplicateMap.get(duplicateKey) ?? 1;

            return (
              <div
                key={`${item.level}-${item.text}-${index}`}
                className={cn(
                  "relative flex min-w-0 items-center gap-2 py-1",
                  LEVEL_INDENT[item.level],
                )}
              >
                {item.level > 1 ? (
                  <span
                    aria-hidden
                    className="absolute bottom-1/2 left-0 top-0 w-px bg-outline-variant"
                    style={{ left: `${(item.level - 2) * 16 + 8}px` }}
                  />
                ) : null}
                <HeadingLevelBadge level={item.level} />
                <span className="min-w-0 flex-1 truncate text-body-sm font-medium text-on-surface">
                  {item.text}
                </span>
                {duplicateCount > 1 ? (
                  <span className="ml-auto shrink-0 font-data-mono text-label-md text-text-secondary">
                    {duplicateCount}
                  </span>
                ) : null}
              </div>
            );
          })}
          {truncated ? (
            <p className="pt-1 text-body-sm text-text-secondary">...</p>
          ) : null}
        </div>

        <div className="grid min-w-0 w-full shrink-0 grid-cols-3 gap-x-3 gap-y-2 border-t border-outline-variant pt-stack-md sm:grid-cols-6 2xl:grid-cols-1 2xl:gap-y-2 2xl:border-l 2xl:border-t-0 2xl:pl-stack-md 2xl:pt-0">
          {LEVEL_KEYS.map((key, index) => (
            <div key={key} className="flex min-w-0 items-center justify-between gap-2 2xl:justify-between 2xl:gap-3">
              <HeadingLevelBadge level={index + 1} />
              <span className="font-data-mono text-body-sm font-semibold tabular-nums text-on-surface">
                {counts[key]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {issues.length > 0 ? (
        <div className="rounded-2xl border border-accent-coral/20 bg-error-container/20 p-stack-md">
          <ul className="space-y-2">
            {issues.map((issue) => (
              <li
                key={issue}
                className="flex items-start gap-2 text-body-sm text-on-surface"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-coral" />
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function IdealHierarchyDiagram() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-3">
        <div className="mb-1 flex min-w-0 flex-wrap items-center gap-2">
          <HeadingLevelBadge level={1} />
          <span className="min-w-0 text-body-sm font-semibold text-on-surface">Page Topic</span>
        </div>
        <p className="text-body-sm text-text-secondary">One clear H1 that describes the page</p>
      </div>

      <div className="flex justify-center">
        <Icon name="expand_more" size={18} className="text-outline" />
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-3">
        <div className="mb-1 flex min-w-0 flex-wrap items-center gap-2">
          <HeadingLevelBadge level={2} />
          <span className="min-w-0 text-body-sm font-semibold text-on-surface">Main Section</span>
        </div>
        <p className="text-body-sm text-text-secondary">Top-level sections of the page</p>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
          <div className="mb-1 flex min-w-0 flex-wrap items-center gap-2">
            <HeadingLevelBadge level={3} />
            <span className="min-w-0 text-body-sm font-semibold text-on-surface">Supporting Topic</span>
          </div>
          <p className="text-body-sm text-text-secondary">Question / subtopic</p>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
          <div className="mb-1 flex min-w-0 flex-wrap items-center gap-2">
            <HeadingLevelBadge level={4} />
            <span className="min-w-0 text-body-sm font-semibold text-on-surface">Details</span>
          </div>
          <p className="text-body-sm text-text-secondary">Sub details when needed</p>
        </div>
      </div>

      <div className="rounded-xl border border-primary/15 bg-primary-fixed/40 p-3">
        <div className="mb-1 flex min-w-0 flex-wrap items-center gap-2">
          <Icon name="auto_awesome" size={16} className="shrink-0 text-primary" />
          <span className="min-w-0 text-body-sm font-semibold text-on-surface">FAQ / Answer Blocks</span>
        </div>
        <p className="text-body-sm text-text-secondary">
          Add question-style headings for AI answers
        </p>
      </div>
    </div>
  );
}

function AiFriendlyStructurePanel() {
  return (
    <div className="flex h-full min-w-0 flex-col rounded-[24px] border border-[#2E7D32]/20 bg-green-100/50 p-stack-md">
      <div className="mb-stack-md flex flex-wrap items-start justify-between gap-stack-sm">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-[#2E7D32]">
              <Icon name="check_circle" size={18} filled />
            </span>
            <h4 className="min-w-0 text-body-md font-semibold text-on-surface">AI-friendly structure</h4>
          </div>
          <p className="text-body-sm text-text-secondary">
            Recommended heading hierarchy for clarity
          </p>
        </div>
        <span className={cn(reportStyles.statusBadge, "shrink-0 bg-green-100 text-green-700")}>
          Good example
        </span>
      </div>

      <div className="mb-stack-md grid min-w-0 flex-1 grid-cols-1 gap-stack-md rounded-2xl border border-outline-variant bg-white p-stack-md card-shadow 2xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <IdealHierarchyDiagram />
        <div className="min-w-0 w-full space-y-stack-md border-t border-outline-variant pt-stack-md 2xl:border-l 2xl:border-t-0 2xl:pl-stack-md 2xl:pt-0">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className="flex min-w-0 items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-[#2E7D32]">
                <Icon name={benefit.icon} size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-body-sm font-semibold text-on-surface">{benefit.title}</p>
                <p className="mt-0.5 text-body-sm text-text-secondary">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WhyThisMattersCard() {
  return (
    <div className="rounded-2xl border border-primary/15 bg-primary-fixed/35 p-stack-md">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
          <Icon name="info" size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-body-sm font-semibold text-on-surface">Why this matters</p>
          <p className="mt-1 text-body-sm text-text-secondary">
            AI systems use headings like a table of contents. Clear H1 → H2 → H3 order helps them
            extract answers, generate summaries, and cite your content.
          </p>
        </div>
      </div>
    </div>
  );
}

function DetectedHeadingsSummary({ counts }: { counts: HeadingCounts }) {
  const items = [
    { label: "H1", value: counts.h1 },
    { label: "H2", value: counts.h2 },
    { label: "H3", value: counts.h3 },
    { label: "H4", value: counts.h4 },
    { label: "H5", value: counts.h5 },
    { label: "H6", value: counts.h6 },
  ];

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-low px-stack-md py-stack-sm">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-stack-md">
        <p className={cn(reportStyles.subsectionLabel, "shrink-0")}>Detected on this page:</p>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {items.map((item, index) => (
            <div key={item.label} className="flex items-center gap-2">
              {index > 0 ? (
                <span aria-hidden className="hidden h-4 w-px bg-outline-variant sm:block" />
              ) : null}
              <span className={cn(reportStyles.countBadge, "gap-2 tabular-nums")}>
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                    LEVEL_BADGE_CLASS[index + 1],
                  )}
                >
                  {item.label}
                </span>
                <span className="font-semibold text-on-surface">{item.value}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HeadingHierarchyVisual({
  counts,
  outline,
  issues,
}: HeadingHierarchyVisualProps) {
  return (
    <section className={cn(reportStyles.card, reportStyles.cardPadding, "min-w-0")}>
      <div className="mb-stack-md border-b border-outline-variant pb-stack-sm">
        <h3 className={reportStyles.sectionTitle}>Heading Hierarchy</h3>
        <p className="mt-1 text-body-sm text-text-secondary">
          Clear heading order helps users, Google, and AI systems understand page structure.
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-1 items-stretch gap-gutter 2xl:grid-cols-2">
        <CurrentPageOutlinePanel outline={outline} counts={counts} issues={issues} />
        <AiFriendlyStructurePanel />
      </div>

      <div className="mt-stack-md space-y-stack-md">
        <WhyThisMattersCard />
        <DetectedHeadingsSummary counts={counts} />
      </div>
    </section>
  );
}
