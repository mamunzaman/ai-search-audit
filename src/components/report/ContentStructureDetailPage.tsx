"use client";

import { ReportBreadcrumb } from "@/components/report/ReportBreadcrumb";
import { ReportSidebar } from "@/components/report/ReportSidebar";
import { ReportTopNav } from "@/components/report/ReportTopNav";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import {
  getContentStructureFallbackView,
  loadContentStructureDetailView,
  type ContentFinding,
  type ContentStructureDetailView,
  type DensityBar,
} from "@/data/report/contentStructureData";
import { useEffect, useState } from "react";

type ContentStructureDetailPageProps = {
  domain: string;
};

const STRUCTURE_RING_RADIUS = 54;
const STRUCTURE_RING_CIRCUMFERENCE = 2 * Math.PI * STRUCTURE_RING_RADIUS;

const BAR_HEIGHT_CLASS: Record<number, string> = {
  24: "h-6",
  32: "h-8",
  40: "h-10",
  48: "h-12",
  56: "h-14",
  64: "h-16",
  72: "h-[72px]",
  80: "h-20",
  96: "h-24",
  128: "h-32",
  160: "h-40",
  192: "h-48",
  224: "h-56",
};

function barHeightClass(px: number): string {
  return BAR_HEIGHT_CLASS[px] ?? "h-24";
}

function StructureScoreRing({ score }: { score: number }) {
  const targetOffset =
    STRUCTURE_RING_CIRCUMFERENCE - (STRUCTURE_RING_CIRCUMFERENCE * score) / 100;
  const [strokeOffset, setStrokeOffset] = useState(STRUCTURE_RING_CIRCUMFERENCE);

  useEffect(() => {
    const timer = window.setTimeout(() => setStrokeOffset(targetOffset), 100);
    return () => window.clearTimeout(timer);
  }, [targetOffset]);

  return (
    <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
      <svg
        className="h-full w-full -rotate-90"
        viewBox="0 0 128 128"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="64"
          cy="64"
          fill="transparent"
          r={STRUCTURE_RING_RADIUS}
          stroke="currentColor"
          strokeWidth="8"
          className="text-surface-container-highest"
        />
        <circle
          cx="64"
          cy="64"
          fill="transparent"
          r={STRUCTURE_RING_RADIUS}
          stroke="currentColor"
          strokeDasharray={STRUCTURE_RING_CIRCUMFERENCE}
          strokeDashoffset={strokeOffset}
          strokeLinecap="round"
          strokeWidth="8"
          className="text-primary"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-headline-md font-bold text-on-surface">{score}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          Score
        </span>
      </div>
    </div>
  );
}

function HeaderSection({ data }: { data: ContentStructureDetailView }) {
  return (
    <div className="mb-gutter grid min-w-0 grid-cols-1 items-start gap-stack-lg lg:grid-cols-12">
      <div className="flex min-w-0 flex-col items-start gap-stack-lg rounded-[24px] border border-outline-variant bg-white p-stack-lg card-shadow sm:flex-row sm:items-center lg:col-span-8">
        <StructureScoreRing score={data.score} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-3 py-1 font-label-md",
                data.statusClassName,
              )}
            >
              {data.statusLabel}
            </span>
            <h1 className="break-words text-headline-lg text-on-surface">{data.title}</h1>
          </div>
          <p className="max-w-2xl break-words text-body-md text-on-surface-variant">
            {data.summary}
          </p>
        </div>
      </div>

      <div className="min-w-0 rounded-[24px] border border-outline-variant bg-white p-stack-lg card-shadow lg:col-span-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-headline-md text-primary">Top Opportunity</h3>
          <Icon name="error" size={24} className="shrink-0 text-[#FF5A4F]" />
        </div>
        <div className="rounded-xl border-l-4 border-[#FF5A4F] bg-surface-container p-3">
          <div className="mb-1 flex items-start justify-between gap-2">
            <span className="break-words font-label-md font-bold text-on-surface">
              {data.topOpportunity.title}
            </span>
            <span className="shrink-0 font-bold text-[#FF5A4F]">
              {data.topOpportunity.gain}
            </span>
          </div>
          <p className="mb-3 break-words text-body-sm text-on-surface-variant">
            {data.topOpportunity.description}
          </p>
          <button
            type="button"
            className="w-full rounded-lg bg-[#FF5A4F] py-2 font-label-md font-bold text-white transition-opacity hover:opacity-90"
          >
            View Recommendation
          </button>
        </div>
      </div>
    </div>
  );
}

function KpiStrip({ data }: { data: ContentStructureDetailView }) {
  return (
    <div className="mb-gutter grid min-w-0 grid-cols-1 gap-stack-lg sm:grid-cols-2 xl:grid-cols-4">
      {data.kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="min-w-0 rounded-[24px] border border-outline-variant bg-white p-stack-md text-center card-shadow"
        >
          <span className="mb-1 block font-label-md text-on-surface-variant">
            {kpi.label.toUpperCase()}
          </span>
          <span className="block text-headline-md text-primary">{kpi.value}</span>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.min(100, kpi.progress)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DensityBarChart({ bars }: { bars: DensityBar[] }) {
  return (
    <div className="flex h-64 min-w-0 items-end justify-between gap-2 px-2 sm:gap-4 sm:px-4">
      {bars.map((bar) => (
        <div key={bar.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div className="flex w-full min-w-0 items-end gap-1">
            <div
              className={cn(
                "w-full rounded-t-sm bg-primary-container",
                barHeightClass(bar.contentHeight),
                bar.contentOpacity === "light" && "opacity-20",
                bar.contentOpacity === "medium" && "opacity-60",
              )}
            />
            <div
              className={cn(
                "w-full rounded-t-sm bg-[#FF5A4F]",
                barHeightClass(bar.headingHeight),
              )}
            />
          </div>
          <span className="max-w-full truncate text-center text-[10px] font-label-md">
            {bar.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function ReadabilityBenchmark({ data }: { data: ContentStructureDetailView }) {
  return (
    <div className="min-w-0 rounded-[24px] border border-outline-variant bg-white p-stack-lg card-shadow">
      <h3 className="mb-stack-md text-headline-md">Readability Benchmark</h3>
      <div className="space-y-6">
        {data.benchmarkItems.map((item) => (
          <div key={item.label} className="relative min-w-0 pt-6">
            <span
              className={cn(
                "absolute right-0 top-0 tabular-nums",
                item.valueClassName,
              )}
            >
              {item.value}
            </span>
            <span className="mb-2 block font-label-md text-on-surface-variant">
              {item.label}
            </span>
            <div className="h-4 w-full overflow-hidden rounded-full bg-surface-container">
              <div
                className={cn("h-full rounded-full", item.barClassName)}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
        <p className="mt-4 border-t border-outline-variant pt-4 text-body-sm italic text-on-surface-variant">
          {data.benchmarkInsight}
        </p>
      </div>
    </div>
  );
}

function FindingRow({ finding }: { finding: ContentFinding }) {
  return (
    <tr className="cursor-default transition-colors hover:bg-primary-fixed-dim">
      <td className="p-4">
        <div className="flex min-w-0 items-center gap-3">
          <Icon name={finding.icon} size={24} className="shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="break-words font-bold text-on-surface">{finding.title}</p>
            <p className="break-words text-xs text-on-surface-variant">{finding.subtitle}</p>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap p-4">
        <span className={finding.statusClassName}>{finding.statusLabel}</span>
      </td>
      <td className="whitespace-nowrap p-4 text-right font-data-mono">{finding.rawData}</td>
      <td className={cn("whitespace-nowrap p-4 text-right", finding.impactClassName)}>
        {finding.impact}
      </td>
    </tr>
  );
}

function DetailedFindingsTable({ data }: { data: ContentStructureDetailView }) {
  return (
    <div className="mb-gutter min-w-0 overflow-hidden rounded-[24px] border border-outline-variant bg-white card-shadow">
      <div className="border-b border-outline-variant p-stack-lg">
        <h3 className="text-headline-md">Detailed Findings</h3>
      </div>
      <div className="min-w-0 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead className="border-b border-outline-variant bg-surface-container-low">
            <tr>
              <th className="p-4 font-label-md uppercase tracking-wider text-on-surface-variant">
                Metric Component
              </th>
              <th className="p-4 font-label-md uppercase tracking-wider text-on-surface-variant">
                Status
              </th>
              <th className="p-4 text-right font-label-md uppercase tracking-wider text-on-surface-variant">
                Raw Data
              </th>
              <th className="p-4 text-right font-label-md uppercase tracking-wider text-on-surface-variant">
                Impact
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {data.findings.map((finding) => (
              <FindingRow key={finding.title} finding={finding} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MissingStructureSection({ items }: { items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mb-gutter min-w-0 rounded-[24px] border border-outline-variant bg-white p-stack-lg card-shadow">
      <div className="mb-4 flex items-center gap-2">
        <Icon name="warning" size={24} className="shrink-0 text-[#FF5A4F]" />
        <h3 className="text-headline-md">Missing Structure Elements</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex min-w-0 items-start gap-2 break-words text-body-sm text-on-surface-variant"
          >
            <Icon name="remove" size={16} className="mt-0.5 shrink-0 text-[#FF5A4F]" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ImplementationSection({ data }: { data: ContentStructureDetailView }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-w-0 rounded-[24px] border border-dashed border-outline bg-surface-dim p-stack-lg">
      <div className="mb-4 flex min-w-0 flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h4 className="flex min-w-0 items-center gap-2 text-headline-md">
          <Icon name="terminal" size={24} className="shrink-0" />
          <span className="break-words">Technical Structure Implementation</span>
        </h4>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex shrink-0 items-center gap-1 font-label-md font-bold text-primary"
        >
          Toggle Snippet
          <Icon
            name="expand_more"
            size={24}
            className={cn("transition-transform", open && "rotate-180")}
          />
        </button>
      </div>
      {open ? (
        <div className="min-w-0">
          <p className="mb-4 break-words text-body-sm text-on-surface-variant">
            Ensure your CMS renders semantic HTML5 landmarks to assist LLM parsers in
            identifying core content blocks.
          </p>
          <div className="min-w-0 overflow-x-auto rounded-xl border border-outline bg-on-surface p-4 shadow-inner sm:p-6">
            <pre className="font-data-mono text-sm text-surface-container">
              <code className="block min-w-max whitespace-pre">{data.implementationCode}</code>
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ContentStructureDetailPage({ domain }: ContentStructureDetailPageProps) {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(() => getContentStructureFallbackView(domain));

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    queueMicrotask(() => setData(loadContentStructureDetailView(domain)));
  }, [mounted, domain]);

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-canvas text-on-surface">
      <ReportSidebar
        domain={data.domain}
        activeNav="Content Structure"
        auditDate={data.auditDate}
      />

      <div className="flex min-h-screen min-w-0 flex-col md:ml-64">
        <ReportTopNav domain={data.domain} />
        <main className="min-w-0 flex-1 overflow-x-hidden p-margin-desktop md:max-w-[1440px]">
          <ReportBreadcrumb domain={data.domain} currentLabel="Content Structure" />

        <HeaderSection data={data} />
        <KpiStrip data={data} />

        <div className="mb-gutter grid min-w-0 grid-cols-1 gap-stack-lg lg:grid-cols-3">
          <div className="min-w-0 overflow-hidden rounded-[24px] border border-outline-variant bg-white p-stack-lg card-shadow lg:col-span-2">
            <div className="mb-stack-lg flex min-w-0 flex-col gap-3 border-b border-outline-variant pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h3 className="break-words text-headline-md">Heading vs Content Density</h3>
                <p className="break-words text-body-sm text-on-surface-variant">
                  Distribution of semantic information across content blocks
                </p>
              </div>
              <div className="flex shrink-0 gap-3">
                <div className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-full bg-primary" />
                  <span className="text-[10px] font-bold">Content</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-full bg-[#FF5A4F]" />
                  <span className="text-[10px] font-bold">Heads</span>
                </div>
              </div>
            </div>
            <DensityBarChart bars={data.densityBars} />
          </div>
          <ReadabilityBenchmark data={data} />
        </div>

        <DetailedFindingsTable data={data} />
        <MissingStructureSection items={data.missingStructureElements} />
        <ImplementationSection data={data} />
        </main>
      </div>
    </div>
  );
}
