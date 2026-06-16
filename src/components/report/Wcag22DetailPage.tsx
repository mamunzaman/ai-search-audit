"use client";

import { CategoryDetailLayout } from "@/components/report/CategoryDetailLayout";
import { reportStyles } from "@/components/report/reportStyles";
import { ReportScoreRing } from "@/components/report/ScoreRing";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import {
  getWcag22FallbackView,
  loadWcag22DetailView,
  type Wcag22DetailView,
  type WcagAccordionItem,
  type WcagBenchmarkRow,
  type WcagCriticalIssue,
  type WcagPourKpi,
  type WcagRecommendation,
} from "@/data/report/wcag22Data";
import { useEffect, useState } from "react";

type Wcag22DetailPageProps = {
  domain: string;
};

function BenchmarkCard({ rows }: { rows: WcagBenchmarkRow[] }) {
  return (
    <div className="min-w-0 space-y-4 rounded-xl border border-outline-variant bg-white p-stack-lg card-shadow">
      <h3 className="mb-4 border-b border-outline-variant pb-4 text-headline-md">
        Benchmark
      </h3>
      <div className="space-y-6">
        {rows.map((row) => (
          <div key={row.label} className="space-y-2">
            <div className="flex justify-between font-label-md">
              <span className={row.labelClassName}>{row.label}</span>
              <span className={row.valueClassName}>{row.value}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-surface-container-high">
              <div
                className={cn(
                  "h-3 rounded-full",
                  row.barClassName,
                  row.barOpacityClassName,
                )}
                style={{ width: `${row.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroSection({ data }: { data: Wcag22DetailView }) {
  return (
    <section className="grid min-w-0 grid-cols-1 gap-gutter lg:grid-cols-12">
      <div className="flex min-w-0 flex-col items-center gap-8 rounded-xl border border-outline-variant bg-white p-stack-lg card-shadow md:flex-row lg:col-span-8">
        <ReportScoreRing score={data.score} categorySlug="wcag-22" label="Score" />
        <div className="min-w-0 flex-1 space-y-4 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <h1 className="text-headline-lg text-on-surface">WCAG 2.2 Readiness</h1>
            <span
              className={cn(
                "rounded-full px-3 py-1 font-label-md uppercase tracking-tighter",
                data.statusClassName,
              )}
            >
              {data.statusLabel}
            </span>
          </div>
          <p className="text-body-lg text-on-surface-variant">{data.summary}</p>
          <div className="flex flex-wrap justify-center gap-4 pt-2 md:justify-start">
            <button
              type="button"
              className="rounded-lg bg-primary px-6 py-2.5 font-label-md font-bold text-white transition-all hover:opacity-90"
            >
              Download Audit Log
            </button>
            <button
              type="button"
              className="rounded-lg border border-outline px-6 py-2.5 font-label-md font-bold text-on-surface-variant transition-all hover:bg-surface-container-low"
            >
              Share Report
            </button>
          </div>
        </div>
      </div>
      <div className="lg:col-span-4">
        <BenchmarkCard rows={data.benchmarkRows} />
      </div>
    </section>
  );
}

function PourKpiStrip({ kpis }: { kpis: WcagPourKpi[] }) {
  return (
    <section className="grid min-w-0 grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.principle}
          className={cn(
            "flex min-w-0 flex-col gap-2 rounded-xl border border-outline-variant bg-white p-stack-lg card-shadow",
            kpi.borderClassName,
          )}
        >
          <div className="flex items-center justify-between">
            <span className="font-label-md uppercase text-outline">{kpi.principle}</span>
            <Icon
              name={kpi.icon}
              size={24}
              filled={kpi.iconFilled}
              className={kpi.iconClassName}
            />
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-headline-lg">{kpi.value}%</span>
            <span className={cn("font-label-md", kpi.trendClassName)}>
              {kpi.trendLabel}
            </span>
          </div>
        </div>
      ))}
    </section>
  );
}

function PrinciplesMatrix({ data }: { data: Wcag22DetailView }) {
  return (
    <section className="min-w-0 rounded-xl border border-outline-variant bg-white p-stack-lg card-shadow">
      <div className="mb-stack-lg flex min-w-0 flex-col gap-3 border-b border-outline-variant pb-stack-lg sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-headline-md">Accessibility Principles Matrix</h3>
        <button
          type="button"
          className="flex shrink-0 items-center gap-1 font-label-md font-bold text-primary hover:underline"
        >
          Detailed Methodology
          <Icon name="open_in_new" size={16} />
        </button>
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-stack-xl md:grid-cols-2">
        {data.matrixRows.map((row) => (
          <div key={row.label} className="space-y-4">
            <div className="flex justify-between font-label-md">
              <span className="text-on-surface">{row.label}</span>
              <span className="font-bold">{row.value}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-container-high">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${row.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CriticalIssuesSection({ issues }: { issues: WcagCriticalIssue[] }) {
  return (
    <section className="min-w-0 space-y-stack-md">
      <h3 className="text-headline-md">Critical Issues Found</h3>
      <div className="grid min-w-0 grid-cols-1 gap-gutter lg:grid-cols-3">
        {issues.map((issue) => (
          <div
            key={issue.title}
            className={cn(
              "flex min-w-0 flex-col justify-between rounded-xl border border-outline-variant border-t-4 bg-white p-stack-lg card-shadow",
              issue.borderClassName,
            )}
          >
            <div>
              <div className="mb-4 flex items-start justify-between gap-2">
                <span
                  className={cn(
                    "rounded px-2 py-0.5 font-label-md font-bold",
                    issue.severityClassName,
                  )}
                >
                  {issue.severity}
                </span>
                <span className="font-label-md text-outline">{issue.instanceLabel}</span>
              </div>
              <h4 className="mb-2 font-body-lg font-bold text-on-surface">
                {issue.title}
              </h4>
              <p className="mb-6 text-body-sm text-on-surface-variant">
                {issue.description}
              </p>
            </div>
            <button
              type="button"
              className="w-full rounded-lg bg-primary py-2 font-label-md font-bold text-white transition-all hover:brightness-110"
            >
              Recommended Fix
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function AiReadinessBanner({ cards }: { cards: Wcag22DetailView["aiReadinessCards"] }) {
  return (
    <section className="relative flex min-h-[280px] min-w-0 items-center overflow-hidden rounded-xl bg-primary sm:min-h-[320px]">
      <div className="relative z-10 flex w-full min-w-0 flex-col items-center gap-stack-xl p-stack-xl lg:flex-row">
        <div className="min-w-0 flex-1 space-y-4 text-white">
          <h3 className="text-headline-lg">AI Accessibility Readiness</h3>
          <p className="max-w-xl text-body-lg opacity-90">
            LLMs and AI agents rely on the same semantic structure as assistive
            technology to crawl, interpret, and trust your content&apos;s integrity.
          </p>
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-stack-md md:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className="min-w-0 rounded-xl border border-white/20 bg-white/10 p-stack-md text-white backdrop-blur-md"
            >
              <Icon name={card.icon} size={24} className="mb-2" />
              <h5 className="mb-1 font-label-md uppercase">{card.title}</h5>
              <p className="text-body-sm opacity-80">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RecommendationsPanel({ items }: { items: WcagRecommendation[] }) {
  return (
    <div className="min-w-0 space-y-stack-md rounded-xl border border-outline-variant bg-white p-stack-lg card-shadow">
      <h3 className="text-headline-md">Optimization Recommendations</h3>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="group flex min-w-0 cursor-pointer flex-col gap-3 rounded-lg border border-outline-variant bg-surface-container-low p-4 transition-colors hover:border-primary sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-4">
              <span className="shrink-0 rounded-lg bg-primary-fixed p-2 text-primary">
                <Icon name={item.icon} size={24} />
              </span>
              <div className="min-w-0">
                <p className="break-words font-body-md font-bold text-on-surface">
                  {item.title}
                </p>
                <p className="break-words text-body-sm text-outline">{item.subtitle}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="font-label-md font-bold text-green-600">{item.gainLabel}</span>
              <Icon
                name="chevron_right"
                size={24}
                className="text-outline transition-colors group-hover:text-primary"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccordionItem({
  item,
  defaultOpen,
}: {
  item: WcagAccordionItem;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full min-w-0 items-center justify-between gap-3 p-4 text-left font-bold text-on-surface"
      >
        <span className="break-words">{item.title}</span>
        <Icon
          name="expand_more"
          size={24}
          className={cn("shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? (
        <div className="min-w-0 px-4 pb-4">
          <div className="min-w-0 overflow-x-auto rounded-lg bg-inverse-surface p-4">
            <pre className="font-data-mono text-data-mono text-white">
              <code className="block min-w-max whitespace-pre">{item.code}</code>
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ImplementationAccordions({ items }: { items: WcagAccordionItem[] }) {
  return (
    <div className={cn(reportStyles.card, reportStyles.cardPadding, "min-w-0 space-y-stack-md")}>
      <h3 className={reportStyles.sectionTitle}>Implementation Examples</h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <AccordionItem key={item.title} item={item} defaultOpen={index === 0} />
        ))}
      </div>
    </div>
  );
}


export function Wcag22DetailPage({ domain }: Wcag22DetailPageProps) {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(() => getWcag22FallbackView(domain));

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    queueMicrotask(() => setData(loadWcag22DetailView(domain)));
  }, [mounted, domain]);

  return (
    <CategoryDetailLayout
      domain={data.domain}
      categoryLabel="WCAG 2.2 Readiness"
      activeNav="WCAG 2.2"
      auditDate={data.auditDate}
    >
      <HeroSection data={data} />
      <PourKpiStrip kpis={data.pourKpis} />
      <PrinciplesMatrix data={data} />
      <CriticalIssuesSection issues={data.criticalIssues} />
      <AiReadinessBanner cards={data.aiReadinessCards} />
      <section className={cn("grid min-w-0 grid-cols-1 lg:grid-cols-2", reportStyles.gridGap)}>
        <RecommendationsPanel items={data.recommendations} />
        <ImplementationAccordions items={data.accordionItems} />
      </section>
      <blockquote className="rounded-[24px] border border-outline-variant bg-white p-stack-lg text-center text-body-md italic text-on-surface-variant card-shadow">
        &ldquo;{data.footerQuote}&rdquo;
      </blockquote>
    </CategoryDetailLayout>
  );
}
