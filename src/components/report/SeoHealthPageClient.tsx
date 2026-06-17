"use client";

import {
  CategoryBenchmarkCard,
  CategoryDetailHeader,
  CategoryDetailLayout,
  CategoryFindingsTable,
  CategoryHealthTrendCard,
  CategoryImplementationExamples,
  CategoryIssueSpotlight,
  CategoryIssuesSection,
  CategoryKpiStrip,
  CategoryRecommendationsSection,
} from "@/components/report";
import {
  buildSeoHealthDetailView,
  loadSeoHealthDetailView,
  type CategoryFinding,
} from "@/lib/category-detail-data";
import { useEffect, useState } from "react";

type SeoHealthPageClientProps = {
  domain: string;
};

function buildStrengths(findings: CategoryFinding[]): string[] {
  return findings
    .filter((finding) => finding.status === "optimized")
    .slice(0, 3)
    .map((finding) => finding.detail);
}

function buildOpportunities(
  findings: CategoryFinding[],
  issueTitles: string[],
): string[] {
  const fromFindings = findings
    .filter((finding) => finding.status !== "optimized")
    .slice(0, 2)
    .map((finding) => `Improve ${finding.label.toLowerCase()}`);

  return [...fromFindings, ...issueTitles.slice(0, 2)].slice(0, 3);
}

export function SeoHealthPageClient({ domain }: SeoHealthPageClientProps) {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(() => buildSeoHealthDetailView(null, domain));

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    queueMicrotask(() => setData(loadSeoHealthDetailView(domain)));
  }, [mounted, domain]);

  const strengths = buildStrengths(data.findings);
  const opportunities = buildOpportunities(
    data.findings,
    data.issues.map((issue) => issue.title),
  );
  const spotlightIssue = data.issues[0];
  const remainingIssues = data.issues.slice(1);

  return (
    <CategoryDetailLayout
      domain={data.domain}
      categoryLabel="SEO Health"
      activeNav="SEO Health"
      auditDate={data.auditDate}
    >
      <div className="grid grid-cols-1 gap-stack-lg lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CategoryDetailHeader
            score={data.score}
            statusLabel={data.statusLabel}
            statusTone={data.statusTone}
            title="Technical Audit Summary"
            summary={data.summary}
            categorySlug="seo-health"
            strengths={strengths}
            opportunities={opportunities}
          />
        </div>
        <CategoryBenchmarkCard
          score={data.score}
          industryAvg={data.industryAvg}
          message={data.benchmarkMessage}
        />
      </div>

      <CategoryKpiStrip kpis={data.kpis} />

      <div className="grid grid-cols-1 items-start gap-stack-lg lg:grid-cols-12">
        <div className="lg:col-span-8">
          <CategoryHealthTrendCard score={data.score} />
        </div>
        <div className="lg:col-span-4">
          <CategoryIssueSpotlight issue={spotlightIssue} category="SEO Health" />
        </div>
      </div>

      <CategoryFindingsTable findings={data.findings} category="SEO Health" />

      <div className="grid grid-cols-1 items-start gap-stack-lg lg:grid-cols-12">
        <div className="lg:col-span-7">
          <CategoryIssuesSection issues={remainingIssues} category="SEO Health" />
        </div>
        <div className="lg:col-span-5">
          <CategoryImplementationExamples examples={data.implementationExamples} />
        </div>
      </div>

      <CategoryRecommendationsSection recommendations={data.recommendations} category="SEO Health" />
    </CategoryDetailLayout>
  );
}
