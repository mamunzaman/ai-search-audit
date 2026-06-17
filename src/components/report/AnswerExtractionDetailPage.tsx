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
  getAnswerExtractionFallbackView,
  loadAnswerExtractionDetailView,
} from "@/data/report/answerExtractionData";
import { useEffect, useState } from "react";

type AnswerExtractionDetailPageProps = {
  domain: string;
};

export function AnswerExtractionDetailPage({
  domain,
}: AnswerExtractionDetailPageProps) {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(() => getAnswerExtractionFallbackView(domain));

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    queueMicrotask(() => setData(loadAnswerExtractionDetailView(domain)));
  }, [mounted, domain]);

  return (
    <CategoryDetailLayout
      domain={data.domain}
      categoryLabel="Answer Extraction"
      activeNav="Answer Extraction"
      auditDate={data.auditDate}
    >
      <CategoryHeroCard
        score={data.score}
        categorySlug="answer-extraction"
        title={data.title}
        summary={data.summary}
        statusLabel={data.statusLabel}
        statusClassName={data.statusClassName}
      />
      <CategorySimpleKpiStrip kpis={data.kpis} />
      <CategorySignalFindingsTable
        title="Extraction Signals"
        findings={data.findings}
        category="Answer Extraction"
      />
      <CategoryTopRecommendationCard recommendation={data.recommendation} />
      <CategoryGapsListSection
        title="Extraction Gaps"
        issues={data.issues}
        category="Answer Extraction"
      />
    </CategoryDetailLayout>
  );
}
