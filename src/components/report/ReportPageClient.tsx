"use client";

import {
  AccessibilityAuditReport,
  ExecutiveScoreCard,
  ExportReportButton,
  FixPlanCard,
  HighImpactRecommendationsTable,
  ReportLayout,
  ReportStagger,
  ScoreExplanationCard,
  StrategicOverviewCard,
  VisualInsightsCarousel,
  VisualInsightsSection,
} from "@/components/report";
import { reportStyles } from "@/components/report/reportStyles";
import { buildReportView } from "@/lib/audit/audit-to-report";
import { buildReportV2View } from "@/lib/audit/report-v2";
import { loadAuditReportSafe } from "@/lib/audit/storage";
import { useEffect, useState } from "react";

type ReportPageClientProps = {
  domain: string;
};

export function ReportPageClient({ domain }: ReportPageClientProps) {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState(() => buildReportView(null, domain));

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    queueMicrotask(() => setView(buildReportView(loadAuditReportSafe(), domain)));
  }, [mounted, domain]);

  const data = buildReportV2View(view);

  return (
    <ReportLayout domain={data.domain} auditDate={view.auditDate}>
      <div className="report-print-title hidden">
        <h1 className="text-headline-lg font-semibold text-primary">
          {data.domain} — AI Search Audit Report
        </h1>
        <p className="text-body-sm text-on-surface-variant">
          Generated {view.auditDate}
        </p>
      </div>

      <ReportStagger motionKey={data.domain} className={reportStyles.pageStack}>
        <section className="grid grid-cols-1 items-stretch gap-gutter lg:grid-cols-12">
          <ExecutiveScoreCard data={data} />
          <StrategicOverviewCard data={data.strategicOverview} domain={data.domain} />
        </section>

        <ScoreExplanationCard data={data.scoreExplanation} />

        <VisualInsightsCarousel
          radarPoints={data.radarPoints}
          growthAreas={data.growthAreas}
          trendPoints={data.trendPoints}
          semanticDistribution={data.semanticDistribution}
          llmIndexStatus={data.llmIndexStatus}
          accessibilityCard={data.accessibilityCard}
          domain={data.domain}
        />

        <AccessibilityAuditReport data={data.accessibilityReport} />

        <div className="flex flex-wrap items-center justify-between gap-stack-md">
          <div className="min-w-0">
            <p className="text-label-md font-bold uppercase tracking-wider text-primary">
              Action Plan
            </p>
            <h2 className="text-headline-md text-on-surface">Fix Plan &amp; Recommendations</h2>
          </div>
          <ExportReportButton domain={data.domain} compact />
        </div>

        <FixPlanCard data={data.fixPlan} />

        <VisualInsightsSection data={data.visualInsights} />

        <HighImpactRecommendationsTable
          rows={data.recommendations}
          criticalCount={data.criticalCount}
          optimizationCount={data.optimizationCount}
        />
      </ReportStagger>
    </ReportLayout>
  );
}
