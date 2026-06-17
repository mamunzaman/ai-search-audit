"use client";

import { CategoryDetailLayout } from "@/components/report/CategoryDetailLayout";
import { Icon } from "@/components/icons/Icon";
import { ReportScoreRing } from "@/components/report/ScoreRing";
import { cn } from "@/lib/cn";
import { reportStyles } from "@/components/report/reportStyles";
import {
  getAiVisibilityFallbackView,
  loadAiVisibilityDetailView,
  type AiVisibilityDetailView,
} from "@/data/report/aiVisibilityData";
import { useEffect, useState } from "react";

type AIVisibilityDetailPageProps = {
  domain: string;
};

function HeroSection({ data }: { data: AiVisibilityDetailView }) {
  return (
    <section className={cn(reportStyles.heroCard, "lg:items-start")}>
      <div className="flex min-w-0 flex-col items-center gap-10 md:flex-row md:items-center">
        <div className="relative mx-4 flex shrink-0 items-center justify-center md:mx-8">
          <ReportScoreRing
            score={data.score}
            categorySlug="ai-visibility"
            label="Score"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-4">
            <h1 className={reportStyles.pageTitle}>
              {data.title}
            </h1>
            <span
              className={cn(
                reportStyles.statusBadge,
                data.statusClassName,
              )}
            >
              {data.statusLabel}
            </span>
          </div>
          <p className={reportStyles.pageSummary}>
            {data.summary}
          </p>
        </div>

        <div className="min-w-0 w-full shrink-0 rounded-2xl bg-surface-container p-stack-md md:w-64">
          <h4 className="mb-4 font-label-md uppercase text-on-surface-variant">
            VS COMPETITORS
          </h4>
          <div className="space-y-4">
            <div className="min-w-0">
              <div className="mb-1 flex min-w-0 justify-between gap-2 font-label-md">
                <span className="min-w-0 break-words">Current Site</span>
                <span className="shrink-0 font-bold tabular-nums">{data.score}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-outline-variant">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${data.score}%` }}
                />
              </div>
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex min-w-0 justify-between gap-2 font-label-md">
                <span className="min-w-0 break-words">{data.competitorLabel}</span>
                <span className="shrink-0 font-bold tabular-nums">{data.competitorScore}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-outline-variant">
                <div
                  className="h-full bg-tertiary"
                  style={{ width: `${data.competitorScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function KpiStrip({ data }: { data: AiVisibilityDetailView }) {
  return (
    <div className={cn("grid min-w-0 grid-cols-1 md:grid-cols-4", reportStyles.gridGap)}>
      {data.kpis.map((kpi) => (
        <div
          key={kpi.label}
          className={cn(reportStyles.card, reportStyles.cardPadding)}
        >
          <p className={cn("mb-2 break-words", reportStyles.subsectionLabel)}>
            {kpi.label}
          </p>
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
            <span
              className={cn(
                "shrink-0 text-headline-lg font-bold tabular-nums",
                kpi.valueClassName ?? "text-on-surface",
              )}
            >
              {kpi.value}
            </span>
            <span
              className={cn(
                "flex min-w-0 items-center gap-0.5 break-words font-label-md leading-tight",
                kpi.trendClassName,
              )}
            >
              <Icon name={kpi.trendIcon} size={16} />
              {kpi.trendLabel}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

const MATRIX_AXIS_LAYOUT = [
  { label: "AI Readiness", position: "left-1/2 top-0 -translate-x-1/2" },
  { label: "Trust", position: "left-0 top-1/2 -translate-y-1/2" },
  { label: "Citations", position: "right-0 top-1/2 -translate-y-1/2" },
  { label: "Signals", position: "bottom-0 left-4" },
  { label: "Extraction", position: "bottom-0 right-4" },
] as const;

function EquilibriumMatrix({ data }: { data: AiVisibilityDetailView }) {
  const scores = Object.fromEntries(
    data.radarDimensions.map((dimension) => [dimension.label, dimension.score]),
  );
  const average =
    data.radarDimensions.reduce((sum, item) => sum + item.score, 0) /
    Math.max(1, data.radarDimensions.length);
  const fillOpacity = Math.min(0.35, average / 250 + 0.08);

  return (
    <div className={cn(reportStyles.card, reportStyles.cardPadding, "flex min-w-0 flex-col items-center overflow-hidden")}>
      <h3 className={cn(reportStyles.sectionTitle, "mb-4 self-start")}>Equilibrium Matrix</h3>

      <div className="relative mx-auto h-[200px] w-[200px] shrink-0 md:h-[220px] md:w-[220px]">
        {MATRIX_AXIS_LAYOUT.map(({ label, position }) => (
          <div
            key={label}
            className={cn(
              "absolute z-10 max-w-[90px] text-center font-label-md leading-tight text-on-surface-variant",
              position,
            )}
          >
            <span className="block">{label}</span>
            <span className="block font-bold tabular-nums text-on-surface">
              {scores[label] ?? 0}
            </span>
          </div>
        ))}

        <div className="absolute inset-8 flex items-center justify-center rounded-full bg-surface-container">
          <div
            className="h-3/4 w-3/4 animate-pulse border-2 border-primary/30 bg-primary/10"
            style={{
              clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
              opacity: fillOpacity + 0.5,
            }}
            aria-hidden="true"
          />
        </div>
      </div>

      <p className="mt-4 w-full break-words px-1 text-center text-body-sm leading-tight text-on-surface-variant">
        {data.radarInsight}
      </p>
    </div>
  );
}

function AuditBreakdown({ data }: { data: AiVisibilityDetailView }) {
  return (
    <div className={cn(reportStyles.card, "min-w-0 overflow-hidden")}>
      <div className={reportStyles.tableSectionHeader}>
        <h3 className={reportStyles.sectionTitle}>Audit Breakdown</h3>
      </div>
      <div className="divide-y divide-outline-variant">
        {data.breakdown.map((item) => (
          <div
            key={item.title}
            className="grid grid-cols-1 gap-3 p-4 transition-colors hover:bg-surface-container-low sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-4"
          >
            <Icon
              name={item.icon}
              size={24}
              className={cn("shrink-0 rounded-xl p-3", item.iconWrapClassName)}
            />
            <div className="min-w-0">
              <h4 className="break-words font-semibold leading-tight text-on-surface">
                {item.title}
              </h4>
              <p className="break-words text-body-sm leading-tight text-on-surface-variant">
                {item.description}
              </p>
            </div>
            <div className="shrink-0 text-left sm:text-right">
              <span
                className={cn(
                  "block font-bold tabular-nums",
                  item.scoreClassName ?? "text-primary",
                )}
              >
                {item.score}/100
              </span>
              <span
                className={cn(
                  "mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase",
                  item.badgeClassName,
                )}
              >
                {item.badge}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IssuesAndRecommendations({ data }: { data: AiVisibilityDetailView }) {
  return (
    <div className={cn("grid min-w-0 grid-cols-1 md:grid-cols-2", reportStyles.gridGap)}>
      <div className="min-w-0 rounded-[24px] border-2 border-error bg-[#FFF5F5] p-stack-lg">
        <div className="mb-4 flex min-w-0 items-start gap-3">
          <Icon name="error" size={24} className="shrink-0 text-error" filled />
          <h3 className={cn(reportStyles.sectionTitle, "min-w-0 break-words text-on-error-container")}>
            {data.criticalIssue.title}
          </h3>
        </div>
        <p className="mb-6 break-words text-body-md leading-tight text-on-error-container">
          {data.criticalIssue.description}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-error/20 bg-white p-stack-md card-shadow">
            <span className={cn("mb-1 block opacity-70", reportStyles.subsectionLabel)}>
              Loss Score
            </span>
            <span className="text-headline-md tabular-nums text-error">
              -{data.criticalIssue.lossScore} pts
            </span>
          </div>
          <div className="rounded-xl border border-error/20 bg-white p-stack-md card-shadow">
            <span className={cn("mb-1 block opacity-70", reportStyles.subsectionLabel)}>
              Affected URLs
            </span>
            <span className="text-headline-md tabular-nums text-error">
              {data.criticalIssue.affectedUrls}
            </span>
          </div>
        </div>
      </div>

      <div className="min-w-0 rounded-[24px] bg-primary-container p-stack-lg text-on-primary">
        <div className="mb-4 flex min-w-0 items-start gap-3">
          <Icon name="lightbulb" size={24} className="shrink-0" filled />
          <h3 className={cn(reportStyles.sectionTitle, "min-w-0 break-words text-on-primary")}>
            Top Recommendation
          </h3>
        </div>
        <h4 className="mb-2 break-words text-headline-md font-bold">
          {data.topRecommendation.title}
        </h4>
        <p className="mb-6 break-words text-body-md leading-tight opacity-90">
          {data.topRecommendation.description}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <span className="mb-1 block font-label-md uppercase opacity-70">
              Potential Gain
            </span>
            <span className="text-headline-md tabular-nums font-bold">
              +{data.topRecommendation.potentialGain} Score
            </span>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/10 p-stack-md">
            <span className={cn("mb-1 block opacity-70", reportStyles.subsectionLabel)}>
              Difficulty
            </span>
            <span className="text-headline-md font-bold">{data.topRecommendation.difficulty}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImplementationSection({ data }: { data: AiVisibilityDetailView }) {
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
    <section className={cn(reportStyles.card, "overflow-hidden")}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full min-w-0 items-center justify-between gap-3 px-stack-lg py-stack-md transition-colors hover:bg-surface-container-low"
      >
        <span className={cn("flex min-w-0 items-center gap-3 break-words text-left", reportStyles.sectionTitle)}>
          <Icon name="terminal" />
          Developer Implementation: JSON-LD FAQ Pattern
        </span>
        <Icon
          name="expand_more"
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? (
        <div className="border-t border-outline-variant bg-[#1a1b23] p-stack-lg">
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-label-md font-bold uppercase text-[#A5B4FC] hover:bg-white/5"
            >
              <Icon name={copied ? "check" : "content_copy"} size={16} />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-[#A5B4FC]">
            <code>{data.implementationCode}</code>
          </pre>
        </div>
      ) : null}
    </section>
  );
}

export function AIVisibilityDetailPage({ domain }: AIVisibilityDetailPageProps) {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(() => getAiVisibilityFallbackView(domain));

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    queueMicrotask(() => setData(loadAiVisibilityDetailView(domain)));
  }, [mounted, domain]);

  return (
    <CategoryDetailLayout
      domain={data.domain}
      categoryLabel="AI Visibility"
      activeNav="AI Visibility"
      auditDate={data.auditDate}
    >
      <HeroSection data={data} />
      <KpiStrip data={data} />
      <div className={cn("grid min-w-0 grid-cols-1 items-start", reportStyles.gridGap, "xl:grid-cols-[minmax(280px,0.38fr)_minmax(0,1fr)]")}>
        <EquilibriumMatrix data={data} />
        <AuditBreakdown data={data} />
      </div>
      <IssuesAndRecommendations data={data} />
      <ImplementationSection data={data} />
    </CategoryDetailLayout>
  );
}
