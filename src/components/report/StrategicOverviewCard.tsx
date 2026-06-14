import Link from "next/link";
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
      <div>
        <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-outline">
          {label}
        </span>
        <span className="text-headline-md text-primary">{value}%</span>
      </div>
      <KpiMiniBars value={value} />
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={
          showDivider
            ? "flex flex-1 items-center justify-between gap-stack-sm border-r border-outline-variant px-stack-md transition-colors last:border-r-0 hover:bg-surface-container-low"
            : "flex flex-1 items-center justify-between gap-stack-sm px-stack-md transition-colors hover:bg-surface-container-low"
        }
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={
        showDivider
          ? "flex flex-1 items-center justify-between gap-stack-sm border-r border-outline-variant px-stack-md last:border-r-0"
          : "flex flex-1 items-center justify-between gap-stack-sm px-stack-md"
      }
    >
      {content}
    </div>
  );
}

export function StrategicOverviewCard({ data, domain }: StrategicOverviewCardProps) {
  const aiVisibilityHref = domain
    ? `/report/ai-visibility?domain=${encodeURIComponent(domain)}`
    : undefined;

  return (
    <div
      className="flex animate-fade-in flex-col rounded-[24px] border border-outline-variant bg-white p-stack-xl card-shadow lg:col-span-8"
      style={{ animationDelay: "0.2s" }}
    >
      <h2 className="mb-stack-md text-headline-lg text-primary">Audit Summary</h2>
      <p className="mb-stack-xl max-w-3xl text-body-md leading-relaxed text-on-surface-variant">
        {data.summary}
      </p>
      <div className="mt-auto flex flex-col gap-stack-md border-t border-outline-variant pt-stack-lg sm:flex-row">
        <KpiItem label="Indexability" showDivider value={data.indexability} />
        <KpiItem label="Schema Health" showDivider value={data.schemaHealth} />
        <KpiItem label="AI Visibility" href={aiVisibilityHref} value={data.aiVisibility} />
      </div>
    </div>
  );
}
