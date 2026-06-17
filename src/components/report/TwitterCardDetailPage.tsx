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
  getTwitterCardFallbackView,
  loadTwitterCardDetailView,
} from "@/data/report/twitterCardData";
import { useEffect, useState } from "react";

type TwitterCardDetailPageProps = {
  domain: string;
};

export function TwitterCardDetailPage({ domain }: TwitterCardDetailPageProps) {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(() => getTwitterCardFallbackView(domain));

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    queueMicrotask(() => setData(loadTwitterCardDetailView(domain)));
  }, [mounted, domain]);

  return (
    <CategoryDetailLayout
      domain={data.domain}
      categoryLabel="Twitter Card"
      activeNav="Twitter Card"
      auditDate={data.auditDate}
    >
      <CategoryHeroCard
        score={data.score}
        categorySlug="twitter-card"
        title={data.title}
        summary={data.summary}
        statusLabel={data.statusLabel}
        statusClassName={data.statusClassName}
      />
      <CategorySimpleKpiStrip kpis={data.kpis} />
      <CategorySignalFindingsTable
        title="Twitter Card Signals"
        findings={data.findings}
        category="Twitter Card"
      />
      <CategoryTopRecommendationCard recommendation={data.recommendation} />
      <CategoryGapsListSection title="Preview Gaps" issues={data.issues} category="Twitter Card" />
    </CategoryDetailLayout>
  );
}
