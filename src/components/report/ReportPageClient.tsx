"use client";

import {
  CategoryRadarCard,
  ExecutiveScoreCard,
  GrowthPotentialCard,
  HighImpactRecommendationsTable,
  ReadinessTrendCard,
  ReportLayout,
  StrategicOverviewCard,
} from "@/components/report";
import { buildReportView } from "@/lib/audit/audit-to-report";
import { buildReportV2View } from "@/lib/audit/report-v2";
import { loadAuditReportSafe } from "@/lib/audit/storage";

type ReportPageClientProps = {
  domain: string;
};

export function ReportPageClient({ domain }: ReportPageClientProps) {
  const view = buildReportView(loadAuditReportSafe(), domain);
  const data = buildReportV2View(view);

  return (
    <ReportLayout domain={data.domain} auditDate={view.auditDate}>
      <section className="grid grid-cols-1 items-stretch gap-gutter lg:grid-cols-12">
        <ExecutiveScoreCard data={data} />
        <StrategicOverviewCard data={data.strategicOverview} />
      </section>

      <section className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
        <CategoryRadarCard points={data.radarPoints} />
        <GrowthPotentialCard areas={data.growthAreas} />
        <ReadinessTrendCard points={data.trendPoints} />
      </section>

      <HighImpactRecommendationsTable
        rows={data.recommendations}
        criticalCount={data.criticalCount}
        optimizationCount={data.optimizationCount}
      />
    </ReportLayout>
  );
}
