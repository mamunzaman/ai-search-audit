"use client";

import { CategoryRecommendationDetail } from "@/components/report/CategoryRecommendationDetail";
import { CategoryDetailLayout } from "@/components/report/CategoryDetailLayout";
import { reportStyles } from "@/components/report/reportStyles";
import { ReportScoreRing } from "@/components/report/ScoreRing";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import {
  DONUT_CIRCUMFERENCE,
  getSchemaMarkupFallbackView,
  loadSchemaMarkupDetailView,
  type SchemaAccordionItem,
  type SchemaDistributionSegment,
  type SchemaMarkupDetailView,
} from "@/data/report/schemaMarkupData";
import { useEffect, useState } from "react";
import { IssueExplanationAccordion } from "./IssueExplanationAccordion";

type SchemaMarkupDetailPageProps = {
  domain: string;
};

function SchemaDistributionDonut({
  segments,
  centerLabel,
  centerSubLabel,
}: {
  segments: SchemaDistributionSegment[];
  centerLabel: string;
  centerSubLabel: string;
}) {
  const donutSegments = segments.reduce<
    Array<SchemaDistributionSegment & { offset: number; dashLength: number; gapLength: number }>
  >((acc, segment) => {
    const dashLength = (segment.percent / 100) * DONUT_CIRCUMFERENCE;
    const gapLength = DONUT_CIRCUMFERENCE - dashLength;
    const offset = -acc.reduce((sum, item) => sum + item.dashLength, 0);
    acc.push({ ...segment, offset, dashLength, gapLength });
    return acc;
  }, []);

  return (
    <div className="relative h-48 w-48 shrink-0">
      <svg
        className="h-full w-full -rotate-90"
        viewBox="0 0 100 100"
        aria-hidden="true"
        focusable="false"
      >
        {donutSegments.map((segment) => (
          <circle
            key={segment.label}
            cx="50"
            cy="50"
            fill="transparent"
            r="40"
            stroke="currentColor"
            strokeDasharray={`${segment.dashLength} ${segment.gapLength}`}
            strokeDashoffset={segment.offset}
            strokeWidth="20"
            className={segment.strokeClassName}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-headline-md">{centerLabel}</span>
        <span className="text-[10px] font-label-md text-on-surface-variant">
          {centerSubLabel}
        </span>
      </div>
    </div>
  );
}

function HeaderSection({ data }: { data: SchemaMarkupDetailView }) {
  return (
    <div className={cn(reportStyles.heroCard, "md:flex-row")}>
      <ReportScoreRing score={data.score} categorySlug="schema-markup" label="Score" />
      <div className="min-w-0 flex-1 space-y-2 text-center md:text-left">
        <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
          <h1 className={reportStyles.pageTitle}>
            Schema Health:{" "}
            <span className="text-primary">{data.healthTier}</span>
          </h1>
          <span
            className={cn(
              reportStyles.statusBadge,
              data.statusBadgeClassName,
            )}
          >
            {data.statusBadge}
          </span>
        </div>
        <p className={reportStyles.pageSummary}>
          {data.summary}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap justify-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-primary px-4 py-2 font-label-md text-primary transition-all hover:bg-primary hover:text-white"
        >
          <Icon name="download" size={18} />
          Export PDF
        </button>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-label-md text-white transition-all hover:brightness-110"
        >
          <Icon name="refresh" size={18} />
          Re-Audit
        </button>
      </div>
    </div>
  );
}

function KpiStrip({ data }: { data: SchemaMarkupDetailView }) {
  return (
    <div className={cn("grid min-w-0 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4", reportStyles.gridGap)}>
      {data.kpis.map((kpi) => (
        <div
          key={kpi.label}
          className={cn(reportStyles.card, reportStyles.cardPadding)}
        >
          <p className="mb-1 font-label-md text-on-surface-variant">{kpi.label}</p>
          <div className="flex items-end justify-between gap-2">
            <span className="text-headline-md text-on-surface">{kpi.value}</span>
            {kpi.progress !== undefined ? (
              <div className="mb-2 h-1.5 w-16 overflow-hidden rounded-full bg-outline-variant">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${kpi.progress}%` }}
                />
              </div>
            ) : kpi.subLabel ? (
              <span
                className={cn(
                  "font-label-md text-primary",
                  kpi.subLabelClassName,
                )}
              >
                {kpi.subLabel}
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailedFindingsPanel({ data }: { data: SchemaMarkupDetailView }) {
  return (
    <div className={cn(reportStyles.detailFindingsCard, reportStyles.detailFindingsBody)}>
      <h3 className="mb-2 text-headline-md text-on-surface">Detailed Findings</h3>
      <div className="space-y-2">
        {data.findingRows.map((row) => (
          <div
            key={row.label}
            className="flex min-w-0 flex-col gap-1 rounded-lg p-2 transition-colors hover:bg-surface-container sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Icon name={row.icon} size={24} className={cn("shrink-0", row.iconClassName)} />
              <span className="font-body-md">{row.label}</span>
            </div>
            <span className="break-words font-data-mono text-on-surface-variant sm:text-right">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CriticalRecommendationCard({
  recommendation,
}: {
  recommendation: SchemaMarkupDetailView["criticalRecommendation"];
}) {
  return (
    <div className="min-w-0 rounded-[24px] border border-error-container bg-error-container p-stack-lg">
      <div className="mb-2 flex items-center gap-3">
        <Icon name="priority_high" size={24} className="shrink-0 text-error" />
        <h4 className="font-label-md uppercase tracking-wider text-on-error-container">
          Critical Recommendation
        </h4>
      </div>
      <p className="mb-1 break-words font-body-md font-semibold text-on-error-container">
        {recommendation.title}
      </p>
      <div className="mb-4 text-on-error-container">
        <CategoryRecommendationDetail
          whyItMatters={recommendation.whyItMatters}
          howToFix={recommendation.howToFix}
          copyableExample={recommendation.copyableExample}
          fallbackDescription={recommendation.description}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-label-md font-bold text-error">{recommendation.gainLabel}</span>
        <button
          type="button"
          className="rounded-lg bg-error px-3 py-1.5 text-[10px] font-bold text-white"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
}

function SchemaTypeCoverage({ data }: { data: SchemaMarkupDetailView }) {
  return (
    <div className="min-w-0 rounded-[24px] border border-outline-variant bg-white p-stack-md card-shadow">
      <h3 className="mb-stack-md text-headline-md text-on-surface">Schema Type Coverage</h3>
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        {data.schemaTypeSignals.map((signal) => (
          <div
            key={signal.label}
            className="min-w-0 rounded-xl border border-outline-variant p-stack-sm"
          >
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words font-body-md font-bold text-on-surface">
                  {signal.label}
                </p>
                <p className="break-words text-body-sm text-on-surface-variant">
                  {signal.detail}
                </p>
              </div>
              <Icon
                name={signal.detected ? "check_circle" : "cancel"}
                size={22}
                className={cn(
                  "shrink-0",
                  signal.detected ? "text-primary" : "text-[#FF5A4F]",
                )}
              />
            </div>
            {!signal.detected ? (
              <div className="mt-2 border-t border-outline-variant pt-2">
                <IssueExplanationAccordion
                  title={signal.label}
                  category="Schema Markup"
                  status="fail"
                  recommendation={signal.detail}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {data.validationIssues.length > 0 ? (
        <div className="mt-stack-md border-t border-outline-variant pt-stack-md">
          <h4 className="mb-2 font-label-md text-on-surface-variant">
            Schema Validation Issues
          </h4>
          <ul className="space-y-1">
            {data.validationIssues.map((issue) => (
              <li key={issue} className="min-w-0">
                <div className="flex min-w-0 items-start gap-2 break-words text-body-sm text-on-surface-variant">
                  <Icon name="error" size={16} className="mt-0.5 shrink-0 text-[#FF5A4F]" />
                  {issue}
                </div>
                <div className="mt-2 pl-6">
                  <IssueExplanationAccordion
                    title={issue}
                    category="Schema Markup"
                    status="fail"
                    recommendation={issue}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {data.missingRecommendedSchema.length > 0 ? (
        <div className="mt-stack-md border-t border-outline-variant pt-stack-md">
          <h4 className="mb-2 font-label-md text-on-surface-variant">
            Missing Recommended Schema
          </h4>
          <p className="break-words font-data-mono text-body-sm text-on-surface-variant">
            {data.missingRecommendedSchema.join(", ")}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function LowSeverityIssues({ issues }: { issues: SchemaMarkupDetailView["lowSeverityIssues"] }) {
  if (issues.length === 0) {
    return null;
  }

  return (
    <div className="min-w-0 rounded-[24px] border border-outline-variant bg-white p-stack-lg card-shadow">
      <h3 className="mb-stack-md text-headline-md text-on-surface">Low Severity Issues</h3>
      <div className="space-y-4">
        {issues.map((issue) => (
          <div
            key={issue.title}
            className="flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-low p-4 sm:flex-row sm:items-center"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF9C4] text-[#856404]">
              <Icon name="info" size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="break-words font-body-md font-bold text-on-surface">
                {issue.title}
              </p>
              <p className="break-words text-body-sm text-on-surface-variant">
                {issue.description}
              </p>
            </div>
            <div className="shrink-0 sm:text-right">
              <span className="font-label-md text-on-surface-variant">Status</span>
              <p className={issue.statusClassName}>{issue.status}</p>
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
  item: SchemaAccordionItem;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(item.code);
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
        className="flex w-full min-w-0 items-center justify-between gap-3 p-stack-lg transition-colors hover:bg-surface-container"
      >
        <div className="flex min-w-0 items-center gap-4">
          <Icon name={item.icon} size={24} className="shrink-0 text-primary" />
          <span className="break-words text-left text-on-surface">{item.title}</span>
        </div>
        <Icon
          name="expand_more"
          size={24}
          className={cn("shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? (
        <div className="min-w-0 px-stack-lg pb-stack-lg">
          <div className="relative min-w-0 overflow-x-auto rounded-xl bg-on-surface p-stack-lg">
            <button
              type="button"
              onClick={handleCopy}
              className="absolute right-4 top-4 text-outline transition-colors hover:text-white"
              aria-label={copied ? "Copied" : "Copy code"}
            >
              <Icon name={copied ? "check" : "content_copy"} size={18} />
            </button>
            <pre className="font-data-mono text-[13px] leading-relaxed text-on-primary-container">
              <code className="block min-w-max whitespace-pre">{item.code}</code>
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ImplementationAccordion({ items }: { items: SchemaAccordionItem[] }) {
  return (
    <div className="min-w-0 space-y-gutter">
      <h3 className="text-headline-md text-on-surface">
        Implementation Reference (JSON-LD)
      </h3>
      {items.map((item, index) => (
        <AccordionItem key={item.title} item={item} defaultOpen={index === 0} />
      ))}
    </div>
  );
}

export function SchemaMarkupDetailPage({ domain }: SchemaMarkupDetailPageProps) {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(() => getSchemaMarkupFallbackView(domain));

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    queueMicrotask(() => setData(loadSchemaMarkupDetailView(domain)));
  }, [mounted, domain]);

  return (
    <CategoryDetailLayout
      domain={data.domain}
      categoryLabel="Schema Markup"
      activeNav="Schema Markup"
      auditDate={data.auditDate}
    >
      <HeaderSection data={data} />
      <KpiStrip data={data} />
      <div className={reportStyles.visualFindingsGrid}>
        <div className={cn(reportStyles.card, reportStyles.cardPadding, "min-w-0 overflow-hidden")}>
          <div className="mb-stack-md flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className={reportStyles.sectionTitle}>Schema Distribution</h3>
              <p className="text-body-sm text-on-surface-variant">
                Relative weight of structured data entities across the domain.
              </p>
            </div>
            <select
              className="shrink-0 rounded-lg border-none bg-surface-container text-body-sm focus:ring-primary"
              defaultValue="30"
              aria-label="Distribution time range"
            >
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-6 lg:flex-row lg:gap-8">
            <SchemaDistributionDonut
              segments={data.distributionSegments}
              centerLabel={data.distributionCenterLabel}
              centerSubLabel={data.distributionCenterSubLabel}
            />
            <div className="min-w-0 space-y-4">
              {data.distributionSegments.map((segment) => (
                <div key={segment.label} className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      "h-3 w-3 shrink-0 rounded-full bg-current",
                      segment.strokeClassName,
                    )}
                  />
                  <div className="min-w-0">
                    <span className="font-label-md text-on-surface">
                      {segment.label} ({segment.percent}%)
                    </span>
                    <span className="block text-[10px] text-on-surface-variant">
                      {segment.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-gutter">
          <DetailedFindingsPanel data={data} />
          <CriticalRecommendationCard recommendation={data.criticalRecommendation} />
        </div>
      </div>
      <LowSeverityIssues issues={data.lowSeverityIssues} />
      <SchemaTypeCoverage data={data} />
      <ImplementationAccordion items={data.accordionItems} />
    </CategoryDetailLayout>
  );
}
