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
  getOpenGraphFallbackView,
  loadOpenGraphDetailView,
} from "@/data/report/openGraphData";
import { useEffect, useState } from "react";

type OpenGraphDetailPageProps = {
  domain: string;
};

export function OpenGraphDetailPage({ domain }: OpenGraphDetailPageProps) {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(() => getOpenGraphFallbackView(domain));

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    queueMicrotask(() => setData(loadOpenGraphDetailView(domain)));
  }, [mounted, domain]);

  return (
    <CategoryDetailLayout
      domain={data.domain}
      categoryLabel="Open Graph"
      activeNav="Open Graph"
      auditDate={data.auditDate}
    >
      <CategoryHeroCard
        score={data.score}
        categorySlug="open-graph"
        title={data.title}
        summary={data.summary}
        statusLabel={data.statusLabel}
        statusClassName={data.statusClassName}
      />
      <CategorySimpleKpiStrip kpis={data.kpis} />
      <CategorySignalFindingsTable
        title="Open Graph Signals"
        findings={data.findings}
        category="Open Graph"
      />
      <CategoryTopRecommendationCard recommendation={data.recommendation} />
      <CategoryGapsListSection title="Preview Gaps" issues={data.issues} category="Open Graph" />
    </CategoryDetailLayout>
  );
}
