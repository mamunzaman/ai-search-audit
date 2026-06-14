"use client";

import {
  CategoryGrid,
  PotentialImprovementCard,
  PriorityIssues,
  RecommendationsSection,
  ReportHeader,
  ReportLayout,
  ScoreHeroCard,
} from "@/components/report";
import {
  buildReportView,
  buildScoreHeroSummary,
} from "@/lib/audit/audit-to-report";
import { loadAuditReportSafe } from "@/lib/audit/storage";

type ReportPageClientProps = {
  domain: string;
};

export function ReportPageClient({ domain }: ReportPageClientProps) {
  const view = buildReportView(loadAuditReportSafe(), domain);
  const summary = buildScoreHeroSummary(view);

  return (
    <ReportLayout>
      <ReportHeader
        domain={view.domain}
        pageTitle={view.isRealData ? view.title : undefined}
        primaryEntity={view.isRealData ? view.primaryEntity : undefined}
        entityType={view.isRealData ? view.entityType : undefined}
        entityConfidence={view.isRealData ? view.entityConfidence : undefined}
        finalUrl={view.isRealData ? view.finalUrl : undefined}
        httpStatus={view.statusCode}
        score={view.score}
        auditDate={view.auditDate}
        isRealData={view.isRealData}
      />
      <ScoreHeroCard
        score={view.score}
        strengths={view.strengths}
        criticalIssues={view.criticalIssues}
        summary={summary}
        isRealData={view.isRealData}
        extractedSummary={
          view.isRealData ? view.extractedSummary : undefined
        }
      />
      <CategoryGrid categories={view.categories} />
      <PriorityIssues issues={view.priorityIssues} />
      <section className="grid grid-cols-1 gap-stack-lg lg:grid-cols-3">
        <RecommendationsSection
          recommendation={
            view.isRealData ? view.recommendations[0] : undefined
          }
        />
        <PotentialImprovementCard />
      </section>
    </ReportLayout>
  );
}
