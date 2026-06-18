import Link from "next/link";
import { cn } from "@/lib/cn";
import type { ReportV2ViewData } from "@/lib/audit/report-v2";

type StrategicOverviewCardProps = {
  data: ReportV2ViewData["strategicOverview"];
  domain?: string;
};

function KpiMiniBars({ value }: { value: number }) {
  const barHeights = [
    Math.max(4, Math.round(value * 0.45)),
    Math.max(6, Math.round(value * 0.6)),
    Math.max(8, Math.round(value * 0.75)),
    Math.max(10, Math.round(value * 0.9)),
  ];
  const maxHeight = 20;

  return (
    <svg aria-hidden className="shrink-0" height="24" viewBox="0 0 32 24" width="32">
      {barHeights.map((height, index) => {
        const scaled = (height / 100) * maxHeight;
        const isHighlight = index === 3 && value >= 75;
        return (
          <rect
            key={index}
            fill={isHighlight ? "#22C55E" : "#1536B8"}
            height={scaled}
            rx="1"
            width="4"
            x={index * 8 + 2}
            y={24 - scaled}
          />
        );
      })}
    </svg>
  );
}

type KpiItemProps = {
  label: string;
  value: number;
  showDivider?: boolean;
  href?: string;
};

function KpiItem({ label, value, showDivider, href }: KpiItemProps) {
  const content = (
    <>
      <div className="min-w-0">
        <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-outline">
          {label}
        </span>
        <span className="text-headline-md text-primary">{value}%</span>
      </div>
      <KpiMiniBars value={value} />
    </>
  );

  const itemClassName = showDivider
    ? "flex min-w-0 flex-1 items-center justify-between gap-stack-sm border-outline-variant px-stack-sm py-2 sm:border-r sm:px-stack-md sm:py-0 last:border-r-0"
    : "flex min-w-0 flex-1 items-center justify-between gap-stack-sm px-stack-sm py-2 sm:px-stack-md sm:py-0";

  if (href) {
    return (
      <Link
        href={href}
        className={cn(itemClassName, "transition-colors hover:bg-surface-container-low")}
      >
        {content}
      </Link>
    );
  }

  return <div className={itemClassName}>{content}</div>;
}

export function StrategicOverviewCard({ data, domain }: StrategicOverviewCardProps) {
  const aiVisibilityHref = domain
    ? `/report/ai-visibility?domain=${encodeURIComponent(domain)}`
    : undefined;
  const schemaMarkupHref = domain
    ? `/report/schema-markup?domain=${encodeURIComponent(domain)}`
    : undefined;

  return (
    <div
      className="flex h-full min-h-[280px] w-full flex-col rounded-[24px] border border-outline-variant bg-white p-stack-lg card-shadow md:p-stack-xl xl:col-span-8"
      style={{ animationDelay: "0.2s" }}
    >
      <h2 className="mb-stack-md text-headline-lg text-primary">Audit Summary</h2>
      <p className="mb-stack-lg max-w-3xl break-words text-body-md leading-relaxed text-on-surface-variant md:mb-stack-xl">
        {data.summary}
      </p>
      <div className="mt-auto grid grid-cols-1 gap-stack-sm border-t border-outline-variant pt-stack-lg sm:grid-cols-3 sm:gap-0">
        <KpiItem label="Indexability" showDivider value={data.indexability} />
        <KpiItem
          label="Schema Health"
          href={schemaMarkupHref}
          showDivider
          value={data.schemaHealth}
        />
        <KpiItem label="AI Visibility" href={aiVisibilityHref} value={data.aiVisibility} />
      </div>
    </div>
  );
}
