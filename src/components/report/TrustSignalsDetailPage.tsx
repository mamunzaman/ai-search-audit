"use client";

import { CategoryDetailLayout } from "@/components/report/CategoryDetailLayout";
import { ReportScoreRing } from "@/components/report/ScoreRing";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import {
  getTrustSignalsFallbackView,
  loadTrustSignalsDetailView,
  type TrustChecklistItem,
  type TrustSignalsDetailView,
  type TrustStatusTone,
} from "@/data/report/trustSignalsData";
import { useEffect, useState } from "react";

type TrustSignalsDetailPageProps = {
  domain: string;
};

function EntityRelationMappingVisual() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 280 180"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <line
        x1="140"
        y1="78"
        x2="72"
        y2="48"
        stroke="currentColor"
        className="text-outline-variant"
        strokeWidth="2"
      />
      <line
        x1="140"
        y1="78"
        x2="72"
        y2="108"
        stroke="currentColor"
        className="text-outline-variant"
        strokeWidth="2"
      />
      <line
        x1="140"
        y1="78"
        x2="208"
        y2="78"
        stroke="currentColor"
        className="text-outline-variant"
        strokeWidth="2"
      />

      <circle cx="72" cy="48" r="26" fill="currentColor" className="text-surface-container" />
      <circle
        cx="72"
        cy="48"
        r="26"
        fill="transparent"
        stroke="currentColor"
        className="text-primary-container"
        strokeWidth="2"
      />
      <text
        x="72"
        y="52"
        textAnchor="middle"
        className="fill-on-surface-variant text-[10px] font-semibold"
      >
        Socials
      </text>

      <circle cx="72" cy="108" r="26" fill="currentColor" className="text-surface-container" />
      <circle
        cx="72"
        cy="108"
        r="26"
        fill="transparent"
        stroke="currentColor"
        className="text-primary-container"
        strokeWidth="2"
      />
      <text
        x="72"
        y="112"
        textAnchor="middle"
        className="fill-on-surface-variant text-[10px] font-semibold"
      >
        Schema
      </text>

      <circle cx="140" cy="78" r="34" fill="currentColor" className="text-primary-container" />
      <text
        x="140"
        y="83"
        textAnchor="middle"
        className="fill-on-primary text-[11px] font-bold"
      >
        Brand
      </text>

      <circle cx="208" cy="78" r="22" fill="currentColor" className="text-secondary-container/60" />
      <circle
        cx="208"
        cy="78"
        r="22"
        fill="transparent"
        stroke="currentColor"
        className="text-secondary-container"
        strokeWidth="2"
      />
      <text
        x="208"
        y="82"
        textAnchor="middle"
        className="fill-on-surface-variant text-[10px] font-semibold"
      >
        Wiki
      </text>
    </svg>
  );
}

const STATUS_TONE_CLASS: Record<TrustStatusTone, { text: string; dot: string }> = {
  pass: { text: "text-[#2E7D32]", dot: "bg-[#2E7D32]" },
  warn: { text: "text-[#856404]", dot: "bg-[#FFC107]" },
  fail: { text: "text-error", dot: "bg-error" },
};

function StatusBadge({ item }: { item: TrustChecklistItem }) {
  const tone = STATUS_TONE_CLASS[item.statusTone];

  return (
    <span className={cn("flex items-center gap-1 font-label-md", tone.text)}>
      <span className={cn("h-2 w-2 rounded-full", tone.dot)} />
      {item.statusLabel}
    </span>
  );
}

function HeroSection({ data }: { data: TrustSignalsDetailView }) {
  return (
    <section className="grid min-w-0 grid-cols-1 gap-gutter lg:grid-cols-12">
      <div className="min-w-0 overflow-hidden rounded-[24px] border border-outline-variant bg-white p-stack-lg card-shadow lg:col-span-8">
        <div className="flex min-w-0 flex-col items-center gap-stack-lg md:flex-row md:items-center">
          <ReportScoreRing score={data.score} categorySlug="trust-signals" label="Score" />
          <div className="min-w-0 flex-1 text-center md:text-left">
            <div className="mb-stack-sm flex flex-wrap items-center justify-center gap-stack-md md:justify-start">
              <h1 className="break-words text-headline-lg font-semibold leading-tight text-on-surface">
                {data.title}
              </h1>
              <span
                className={cn(
                  "rounded-full px-stack-md py-1 font-label-md",
                  data.statusClassName,
                )}
              >
                {data.statusLabel}
              </span>
            </div>
            <p className="break-words text-body-md leading-relaxed text-on-surface-variant">
              {data.summary}
            </p>
          </div>
        </div>
      </div>

      <div className="relative flex min-w-0 flex-col justify-between overflow-hidden rounded-[24px] bg-primary-container p-stack-lg text-on-primary card-shadow lg:col-span-4">
        <div className="relative z-10 min-w-0">
          <p className="mb-stack-sm font-label-md uppercase tracking-widest opacity-80">
            Top Recommendation
          </p>
          <h3 className="mb-stack-md break-words text-headline-md font-bold leading-tight">
            {data.topRecommendation.title}
          </h3>
          <p className="mb-stack-lg break-words text-body-sm leading-tight opacity-90">
            {data.topRecommendation.description}
          </p>
        </div>
        <div className="relative z-10 flex min-w-0 flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-stack-sm">
            <Icon name="trending_up" size={20} className="shrink-0" />
            <span className="font-label-md">{data.topRecommendation.impactGain}</span>
          </div>
          <button
            type="button"
            className="rounded-lg bg-white px-stack-md py-2 font-label-md font-bold text-primary"
          >
            Apply Fix
          </button>
        </div>
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      </div>
    </section>
  );
}

function KpiStrip({ data }: { data: TrustSignalsDetailView }) {
  return (
    <section className="grid min-w-0 grid-cols-2 gap-gutter md:grid-cols-4">
      {data.kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="min-w-0 rounded-2xl border border-outline-variant bg-white p-stack-lg card-shadow"
        >
          <p className="mb-1 break-words font-label-md leading-tight text-on-surface-variant">
            {kpi.label}
          </p>
          <div className="flex items-end justify-between gap-2">
            <h4 className="text-headline-md font-bold tabular-nums text-on-surface">
              {kpi.value}
            </h4>
            <Icon name={kpi.icon} size={24} className={cn("shrink-0", kpi.iconClassName)} filled />
          </div>
        </div>
      ))}
    </section>
  );
}

function VerificationChecklist({ data }: { data: TrustSignalsDetailView }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[24px] border border-outline-variant bg-white card-shadow">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant bg-surface-container-low/50 p-stack-lg">
        <h2 className="text-headline-md">Verification Checklist</h2>
        <button
          type="button"
          className="flex items-center gap-1 font-label-md text-primary"
        >
          View Full Log
          <Icon name="open_in_new" size={16} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead className="bg-surface-container-low">
            <tr>
              <th className="p-stack-lg font-label-md text-on-surface-variant">Marker Domain</th>
              <th className="p-stack-lg font-label-md text-on-surface-variant">Status</th>
              <th className="p-stack-lg font-label-md text-on-surface-variant">LLM Confidence</th>
              <th className="p-stack-lg font-label-md text-on-surface-variant">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.checklist.map((item) => (
              <tr
                key={item.title}
                className="border-b border-outline-variant transition-colors last:border-b-0 hover:bg-surface-container-low"
              >
                <td className="p-stack-lg">
                  <div className="flex min-w-0 items-center gap-stack-md">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon name={item.icon} size={18} />
                    </div>
                    <span className="break-words text-body-sm font-semibold leading-tight">
                      {item.title}
                    </span>
                  </div>
                </td>
                <td className="p-stack-lg">
                  <StatusBadge item={item} />
                </td>
                <td className="p-stack-lg font-data-mono tabular-nums">{item.confidence}%</td>
                <td className="p-stack-lg">
                  <button
                    type="button"
                    className="text-on-surface-variant transition-colors hover:text-primary"
                    aria-label={`Actions for ${item.title}`}
                  >
                    <Icon name="more_horiz" size={24} className="shrink-0" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ImplementationSection({ data }: { data: TrustSignalsDetailView }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(data.implementationCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-[24px] border border-outline-variant bg-white card-shadow">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full min-w-0 items-center justify-between gap-3 bg-on-surface p-stack-lg text-surface transition-colors hover:opacity-95"
      >
        <span className="flex min-w-0 items-center gap-stack-md text-left">
          <Icon name="terminal" size={24} className="shrink-0" />
          <span className="break-words font-label-md uppercase tracking-wider">
            Schema.org Technical Example
          </span>
        </span>
        <Icon
          name="expand_more"
          size={24}
          className={cn("shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? (
        <div className="border-t border-outline-variant bg-[#1E1E1E] p-stack-lg">
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 font-label-md font-bold uppercase text-[#D4D4D4] hover:bg-white/5"
            >
              <Icon name={copied ? "check" : "content_copy"} size={16} />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="overflow-x-auto font-data-mono text-data-mono leading-relaxed text-[#D4D4D4]">
            <code>{data.implementationCode}</code>
          </pre>
        </div>
      ) : null}
    </div>
  );
}

function BenchmarkCard({ data }: { data: TrustSignalsDetailView }) {
  return (
    <div className="min-w-0 rounded-[24px] border border-outline-variant bg-white p-stack-lg card-shadow">
      <h3 className="mb-stack-lg text-[20px] font-semibold text-on-surface">
        Industry Benchmarking
      </h3>
      <div className="space-y-stack-lg">
        <div>
          <div className="mb-2 flex justify-between gap-2">
            <span className="font-label-md text-on-surface-variant">Your Score</span>
            <span className="font-label-md font-bold tabular-nums text-primary">
              {data.benchmark.yourScore}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${data.benchmark.yourScore}%` }}
            />
          </div>
        </div>
        <div>
          <div className="mb-2 flex justify-between gap-2">
            <span className="font-label-md text-on-surface-variant">SaaS Median</span>
            <span className="font-label-md font-bold tabular-nums text-on-surface">
              {data.benchmark.medianScore}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
            <div
              className="h-full rounded-full bg-on-surface-variant/40"
              style={{ width: `${data.benchmark.medianScore}%` }}
            />
          </div>
        </div>
        <p className="mt-stack-md break-words text-body-sm italic leading-tight text-on-surface-variant">
          {data.benchmark.insight}
        </p>
      </div>
    </div>
  );
}

function SeverityBreakdown({ data }: { data: TrustSignalsDetailView }) {
  return (
    <div className="min-w-0 rounded-[24px] border border-outline-variant bg-white p-stack-lg card-shadow">
      <h3 className="mb-stack-lg text-[20px] font-semibold text-on-surface">
        Severity Breakdown
      </h3>
      <div className="mb-stack-lg flex items-center gap-0.5">
        <div className="h-4 flex-1 rounded-l-full bg-[#2E7D32]" title="No Risk" />
        <div className="h-4 w-1/4 bg-[#FFC107]" title="Low Risk" />
        <div className="h-4 w-12 rounded-r-full bg-error" title="Critical" />
      </div>
      <div className="space-y-stack-md">
        {data.severityIssues.map((issue) => (
          <div
            key={issue.title}
            className="flex min-w-0 items-start gap-stack-md rounded-xl border border-outline-variant bg-surface-container-low p-stack-md"
          >
            <Icon name="done_outline" size={24} className="shrink-0 text-[#856404]" />
            <div className="min-w-0">
              <p className="break-words text-body-sm font-bold leading-tight text-on-surface">
                {issue.title}
              </p>
              <p className="break-words font-label-md leading-tight text-on-surface-variant">
                {issue.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
      {data.missingTrustElements.length > 0 ? (
        <div className="mt-stack-lg border-t border-outline-variant pt-stack-md">
          <p className="mb-stack-sm font-label-md uppercase text-on-surface-variant">
            Missing Trust Elements
          </p>
          <ul className="space-y-1">
            {data.missingTrustElements.map((element) => (
              <li
                key={element}
                className="break-words text-body-sm leading-tight text-on-surface-variant"
              >
                • {element}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function EntityMappingCard() {
  return (
    <div className="relative flex h-64 min-w-0 items-center justify-center overflow-hidden rounded-[24px] border border-outline-variant bg-surface card-shadow">
      <EntityRelationMappingVisual />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
      <div className="absolute bottom-stack-md px-4 text-center">
        <span className="font-label-md uppercase tracking-tighter text-on-surface-variant">
          AI Entity Relation Mapping
        </span>
      </div>
    </div>
  );
}

export function TrustSignalsDetailPage({ domain }: TrustSignalsDetailPageProps) {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(() => getTrustSignalsFallbackView(domain));

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    queueMicrotask(() => setData(loadTrustSignalsDetailView(domain)));
  }, [mounted, domain]);

  return (
    <CategoryDetailLayout
      domain={data.domain}
      categoryLabel="Trust Signals"
      activeNav="Trust Signals"
      auditDate={data.auditDate}
    >
      <HeroSection data={data} />
      <KpiStrip data={data} />
      <div className="grid min-w-0 grid-cols-1 gap-gutter lg:grid-cols-12">
        <div className="min-w-0 space-y-gutter lg:col-span-8">
          <VerificationChecklist data={data} />
          <ImplementationSection data={data} />
        </div>
        <div className="min-w-0 space-y-gutter lg:col-span-4">
          <BenchmarkCard data={data} />
          <SeverityBreakdown data={data} />
          <EntityMappingCard />
        </div>
      </div>
    </CategoryDetailLayout>
  );
}
