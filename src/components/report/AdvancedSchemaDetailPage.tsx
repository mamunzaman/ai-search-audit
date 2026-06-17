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
  getAdvancedSchemaFallbackView,
  loadAdvancedSchemaDetailView,
} from "@/data/report/advancedSchemaData";
import { useEffect, useState } from "react";

type AdvancedSchemaDetailPageProps = {
  domain: string;
};

export function AdvancedSchemaDetailPage({ domain }: AdvancedSchemaDetailPageProps) {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(() => getAdvancedSchemaFallbackView(domain));

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    queueMicrotask(() => setData(loadAdvancedSchemaDetailView(domain)));
  }, [mounted, domain]);

  return (
    <CategoryDetailLayout
      domain={data.domain}
      categoryLabel="Advanced Schema"
      activeNav="Advanced Schema"
      auditDate={data.auditDate}
    >
      <CategoryHeroCard
        score={data.score}
        categorySlug="advanced-schema"
        title={data.title}
        summary={data.summary}
        statusLabel={data.statusLabel}
        statusClassName={data.statusClassName}
      />
      <CategorySimpleKpiStrip kpis={data.kpis} />
      <CategorySignalFindingsTable
        title="Advanced Schema Signals"
        findings={data.findings}
        category="Advanced Schema"
      />
      <CategoryTopRecommendationCard recommendation={data.recommendation} />
      <CategoryGapsListSection title="Schema Gaps" issues={data.issues} category="Advanced Schema" />
    </CategoryDetailLayout>
  );
}
