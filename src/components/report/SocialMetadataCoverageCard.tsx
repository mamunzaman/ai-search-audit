import type { SocialMetadataCoverage, SocialMetadataCoverageBlock } from "@/types/audit";
import { cn } from "@/lib/cn";
import { reportStyles } from "./reportStyles";

type SocialMetadataCoverageCardProps = {
  data: SocialMetadataCoverage;
};

function scoreBarClassName(score: number): string {
  if (score >= 80) {
    return "bg-primary";
  }

  if (score >= 60) {
    return "bg-primary-container";
  }

  return "bg-[#FF5A4F]";
}

function CoverageRow({
  label,
  block,
}: {
  label: string;
  block: SocialMetadataCoverageBlock;
}) {
  const widthPercent = Math.min(100, Math.max(0, block.score));

  return (
    <div className="space-y-2 rounded-lg px-2 py-1.5">
      <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-2">
        <span className="text-body-sm font-medium text-on-surface">{label}</span>
        <div className="flex shrink-0 items-baseline gap-2 tabular-nums">
          <span className="text-data-mono font-semibold text-primary">{block.score}%</span>
          <span className="text-body-sm text-on-surface-variant">
            {block.present}/{block.total}
          </span>
        </div>
      </div>
      <div className="h-3 min-w-0 overflow-hidden rounded-full bg-surface-container">
        <div
          className={cn("h-full rounded-full", scoreBarClassName(block.score))}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
    </div>
  );
}

export function SocialMetadataCoverageCard({ data }: SocialMetadataCoverageCardProps) {
  return (
    <article className={`${reportStyles.card} ${reportStyles.cardPadding} min-w-0`}>
      <h3 className={`${reportStyles.sectionTitle} mb-1 text-primary`}>
        Social Metadata Coverage
      </h3>
      <p className="mb-stack-md text-body-sm text-on-surface-variant">
        Open Graph and Twitter Card tag coverage on the audited page.
      </p>
      <div className="space-y-3">
        <CoverageRow label="Open Graph" block={data.openGraph} />
        <CoverageRow label="Twitter Card" block={data.twitterCard} />
      </div>
      <p className="mt-stack-md border-t border-outline-variant pt-stack-md text-body-sm text-on-surface-variant">
        Social metadata improves previews in social platforms and gives AI systems cleaner
        page summaries.
      </p>
    </article>
  );
}
