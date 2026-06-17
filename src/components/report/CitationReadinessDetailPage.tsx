"use client";

import {
  CategoryDetailLayout,
  CategoryGapsListSection,
  CategoryHeroCard,
  CategorySignalFindingsTable,
  CategorySimpleKpiStrip,
  CategoryTopRecommendationCard,
} from "@/components/report";
import {
  getCitationReadinessFallbackView,
  loadCitationReadinessDetailView,
} from "@/data/report/citationReadinessData";
import { useEffect, useState } from "react";

type CitationReadinessDetailPageProps = {
  domain: string;
};

export function CitationReadinessDetailPage({
  domain,
}: CitationReadinessDetailPageProps) {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(() => getCitationReadinessFallbackView(domain));

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    queueMicrotask(() => setData(loadCitationReadinessDetailView(domain)));
  }, [mounted, domain]);

  return (
    <CategoryDetailLayout
      domain={data.domain}
      categoryLabel="Citation Readiness"
      activeNav="Citation Readiness"
      auditDate={data.auditDate}
    >
      <CategoryHeroCard
        score={data.score}
        categorySlug="citation-readiness"
        title={data.title}
        summary={data.summary}
        statusLabel={data.statusLabel}
        statusClassName={data.statusClassName}
      />
      <CategorySimpleKpiStrip kpis={data.kpis} />
      <CategorySignalFindingsTable
        title="Citation Signals"
        findings={data.findings}
        category="Citation Readiness"
      />
      <CategoryTopRecommendationCard recommendation={data.recommendation} />
      <CategoryGapsListSection
        title="Citation Gaps"
        issues={data.issues}
        category="Citation Readiness"
      />
    </CategoryDetailLayout>
  );
}
