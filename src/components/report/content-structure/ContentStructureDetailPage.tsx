"use client";

import { CategoryDetailLayout } from "@/components/report/CategoryDetailLayout";
import { CategoryTopRecommendationCard } from "@/components/report/CategoryTopRecommendationCard";
import { HeadingDensityChart } from "@/components/report/content-structure/HeadingDensityChart";
import { HeadingHierarchyVisual } from "@/components/report/content-structure/HeadingHierarchyVisual";
import { TechnicalStructureImplementation } from "@/components/report/content-structure/TechnicalStructureImplementation";
import { IssueExplanationAccordion } from "@/components/report/IssueExplanationAccordion";
import { reportStyles } from "@/components/report/reportStyles";
import { ReportScoreRing } from "@/components/report/ScoreRing";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import {
  getContentStructureFallbackView,
  loadContentStructureDetailView,
  type ContentFinding,
  type ContentStructureDetailView,
} from "@/data/report/contentStructureData";
import { Fragment, useEffect, useState } from "react";

type ContentStructureDetailPageProps = {
  domain: string;
};

function HeaderSection({ data }: { data: ContentStructureDetailView }) {
  return (
    <div className="grid min-w-0 grid-cols-1 items-start gap-stack-lg lg:grid-cols-12">
      <div className="flex min-w-0 flex-col items-start gap-stack-lg rounded-[24px] border border-outline-variant bg-white p-stack-lg card-shadow sm:flex-row sm:items-center lg:col-span-8">
        <ReportScoreRing
          score={data.score}
          categorySlug="content-structure"
          label="Score"
        />
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
    <div className={cn("grid min-w-0 grid-cols-1 gap-stack-lg sm:grid-cols-2 xl:grid-cols-4", reportStyles.gridGap)}>
      {data.kpis.map((kpi) => (
        <div
          key={kpi.label}
          className={cn(reportStyles.card, reportStyles.cardPadding, "text-center")}
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

function PriorityFindingsPanel({ findings }: { findings: ContentFinding[] }) {
  const priorityFindings = findings.filter((finding) => finding.statusLabel !== "Optimal");

  return (
    <section className={cn(reportStyles.card, "min-w-0 overflow-hidden")}>
      <div className={reportStyles.detailFindingsHeader}>
        <h3 className={reportStyles.sectionTitle}>Priority Findings</h3>
      </div>
      <div className={reportStyles.detailFindingsBody}>
        {priorityFindings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant bg-surface-container-low px-stack-md py-stack-lg text-center">
            <Icon name="check_circle" size={28} className="mb-2 text-[#2E7D32]" filled />
            <p className="font-semibold text-on-surface">No priority issues</p>
            <p className="mt-1 text-body-sm text-text-secondary">
              Heading and content structure signals look healthy.
            </p>
          </div>
        ) : (
          priorityFindings.map((finding) => (
            <article
              key={finding.title}
              className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-sm"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Icon name={finding.icon} size={20} className="shrink-0 text-primary" />
                  <h4 className="break-words text-body-sm font-bold text-on-surface">
                    {finding.title}
                  </h4>
                </div>
                <span className={cn("shrink-0 text-label-md font-bold", finding.statusClassName)}>
                  {finding.statusLabel}
                </span>
              </div>
              <p className="mb-2 break-words text-body-sm text-text-secondary">
                {finding.subtitle} · {finding.rawData}
              </p>
              <IssueExplanationAccordion
                title={finding.title}
                category="Content Structure"
                status={finding.statusLabel}
                recommendation={`${finding.subtitle} ${finding.rawData}`}
              />
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function ReadabilityBenchmark({ data }: { data: ContentStructureDetailView }) {
  return (
    <section
      className={cn(
        reportStyles.card,
        reportStyles.cardPadding,
        "flex h-full min-w-0 flex-col",
      )}
    >
      <h3 className={cn(reportStyles.sectionTitle, "mb-stack-md")}>Readability Benchmark</h3>
      <div className="flex flex-1 flex-col space-y-6">
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
        <p className="mt-auto border-t border-outline-variant pt-4 text-body-sm italic text-text-secondary">
          {data.benchmarkInsight}
        </p>
      </div>
    </section>
  );
}

function FindingRow({ finding }: { finding: ContentFinding }) {
  const showAccordion = finding.statusLabel !== "Optimal";

  return (
    <Fragment>
      <tr
        className={cn(
          "cursor-default transition-colors hover:bg-primary-fixed-dim",
          showAccordion ? "border-b-0" : "border-b border-outline-variant",
        )}
      >
        <td className="px-stack-md py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Icon name={finding.icon} size={24} className="shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="break-words font-bold text-on-surface">{finding.title}</p>
              <p className="break-words text-xs text-on-surface-variant">{finding.subtitle}</p>
            </div>
          </div>
        </td>
        <td className="whitespace-nowrap px-stack-md py-3">
          <span className={finding.statusClassName}>{finding.statusLabel}</span>
        </td>
        <td className="whitespace-nowrap px-stack-md py-3 text-right font-data-mono">{finding.rawData}</td>
        <td className={cn("whitespace-nowrap px-stack-md py-3 text-right", finding.impactClassName)}>
          {finding.impact}
        </td>
      </tr>
      {showAccordion ? (
        <tr
          className={cn(
            reportStyles.accordionRowConnected,
            "border-b border-outline-variant",
          )}
        >
          <td colSpan={4} className={reportStyles.accordionCellIndented}>
            <IssueExplanationAccordion
              title={finding.title}
              category="Content Structure"
              status={finding.statusLabel}
              recommendation={`${finding.subtitle} ${finding.rawData}`}
            />
          </td>
        </tr>
      ) : null}
    </Fragment>
  );
}

function DetailedFindingsTable({ data }: { data: ContentStructureDetailView }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[24px] border border-outline-variant bg-white card-shadow">
      <div className="border-b border-outline-variant px-stack-md py-3">
        <h3 className="text-headline-md">Detailed Findings</h3>
      </div>
      <div className="min-w-0 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead className="border-b border-outline-variant bg-surface-container-low">
            <tr>
              <th className="px-stack-md py-2.5 font-label-md uppercase tracking-wider text-on-surface-variant">
                Metric Component
              </th>
              <th className="px-stack-md py-2.5 font-label-md uppercase tracking-wider text-on-surface-variant">
                Status
              </th>
              <th className="px-stack-md py-2.5 text-right font-label-md uppercase tracking-wider text-on-surface-variant">
                Raw Data
              </th>
              <th className="px-stack-md py-2.5 text-right font-label-md uppercase tracking-wider text-on-surface-variant">
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
    <section className={cn(reportStyles.card, reportStyles.cardPadding, "min-w-0")}>
      <div className="mb-4 flex items-center gap-2">
        <Icon name="warning" size={24} className="shrink-0 text-[#FF5A4F]" />
        <h3 className={reportStyles.sectionTitle}>Missing Structure Elements</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex min-w-0 items-start gap-2 break-words text-body-sm text-text-secondary"
          >
            <Icon name="remove" size={16} className="mt-0.5 shrink-0 text-[#FF5A4F]" />
            {item}
          </li>
        ))}
      </ul>
    </section>
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
    <CategoryDetailLayout
      domain={data.domain}
      categoryLabel="Content Structure"
      activeNav="Content Structure"
      auditDate={data.auditDate}
    >
      <HeaderSection data={data} />
      <KpiStrip data={data} />
      <div className={reportStyles.contentStructureInsightGrid}>
        <div className={reportStyles.contentStructureInsightRow}>
          <HeadingDensityChart bars={data.densityBars} />
          <ReadabilityBenchmark data={data} />
        </div>
        <HeadingHierarchyVisual
          counts={data.headingCounts}
          outline={data.headingOutline}
          issues={data.headingIssues}
        />
        <div className={reportStyles.contentStructureInsightRow}>
          <div className={reportStyles.contentStructureColumn}>
            <PriorityFindingsPanel findings={data.findings} />
            <MissingStructureSection items={data.missingStructureElements} />
          </div>
          <div className={reportStyles.contentStructureColumn}>
            <CategoryTopRecommendationCard recommendation={data.recommendation} />
            <TechnicalStructureImplementation implementationCode={data.implementationCode} />
          </div>
        </div>
      </div>
      <DetailedFindingsTable data={data} />
    </CategoryDetailLayout>
  );
}
