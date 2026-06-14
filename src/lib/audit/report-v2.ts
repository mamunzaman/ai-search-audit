import type { ReportRecommendation, ReportCategory, ReportIssue } from "@/lib/report-data";
import { categories as demoCategories } from "@/lib/report-data";
import type { ReportViewData } from "./audit-to-report";

export const RADAR_CATEGORY_ORDER = [
  { label: "SEO Health", shortLabel: "SEO" },
  { label: "AI Visibility", shortLabel: "AI" },
  { label: "Entity Clarity", shortLabel: "ENTITY" },
  { label: "Trust Signals", shortLabel: "TRUST" },
  { label: "Content Structure", shortLabel: "CONTENT" },
  { label: "Schema Markup", shortLabel: "SCHEMA" },
  { label: "FAQ Readiness", shortLabel: "FAQ" },
  { label: "AI Answer Readiness", shortLabel: "ANSWERS" },
] as const;

export type ReportV2Metric = {
  label: string;
  value: number;
};

export type ReportV2GrowthArea = {
  label: string;
  current: number;
  potential: number;
};

export type ReportV2RadarPoint = {
  label: string;
  shortLabel: string;
  score: number;
};

export type ReportV2RecommendationRow = {
  title: string;
  description: string;
  status: "Critical" | "Optimization";
  impact: string;
  action: string;
};

export type ReportV2ViewData = {
  domain: string;
  isRealData: boolean;
  score: number;
  potentialScore: number;
  potentialGain: number;
  topOpportunity: string;
  strategicOverview: {
    summary: string;
    indexability: number;
    schemaHealth: number;
    aiVisibility: number;
  };
  radarPoints: ReportV2RadarPoint[];
  growthAreas: ReportV2GrowthArea[];
  trendPoints: number[];
  recommendations: ReportV2RecommendationRow[];
  criticalCount: number;
  optimizationCount: number;
};

function getCategoryScore(
  categories: ReportCategory[],
  title: string,
): number {
  return categories.find((category) => category.title === title)?.score ?? 0;
}

function buildPotentialGain(recommendations: ReportRecommendation[]): number {
  return recommendations
    .slice(0, 3)
    .reduce((sum, recommendation) => sum + recommendation.estimatedGain, 0);
}

function buildGrowthAreas(
  categories: ReportCategory[],
  recommendations: ReportRecommendation[],
): ReportV2GrowthArea[] {
  const sorted = [...categories].sort((left, right) => left.score - right.score);
  const gains = recommendations.slice(0, 3).map((rec) => rec.estimatedGain);

  return sorted.slice(0, 3).map((category, index) => {
    const gain = gains[index] ?? Math.max(5, Math.round((100 - category.score) * 0.25));
    return {
      label: category.title,
      current: category.score,
      potential: Math.min(100, category.score + gain),
    };
  });
}

function buildRadarPoints(categories: ReportCategory[]): ReportV2RadarPoint[] {
  return RADAR_CATEGORY_ORDER.map((item) => ({
    label: item.label,
    shortLabel: item.shortLabel,
    score: getCategoryScore(categories, item.label),
  }));
}

function buildProjectedTrend(currentScore: number): number[] {
  const points = 11;
  const start = Math.max(0, currentScore - 12);

  return Array.from({ length: points }, (_, index) => {
    const progress = index / (points - 1);
    const target = Math.min(100, currentScore + 6);
    return Math.round(start + (target - start) * progress);
  });
}

function mapIssueStatus(impact: ReportIssue["impact"]): "Critical" | "Optimization" {
  return impact === "Critical" ? "Critical" : "Optimization";
}

function buildRecommendationRows(
  priorityIssues: ReportIssue[],
  recommendations: ReportRecommendation[],
): ReportV2RecommendationRow[] {
  const rows: ReportV2RecommendationRow[] = [];

  for (const issue of priorityIssues) {
    rows.push({
      title: issue.title,
      description: issue.explanation ?? "",
      status: mapIssueStatus(issue.impact),
      impact: `+${issue.gain} pts`,
      action: "View Spec",
    });
  }

  for (const recommendation of recommendations) {
    if (rows.length >= 5) {
      break;
    }

    if (rows.some((row) => row.title === recommendation.title)) {
      continue;
    }

    rows.push({
      title: recommendation.title,
      description: recommendation.howToFix,
      status: "Optimization",
      impact: `+${recommendation.estimatedGain} pts`,
      action: "View Spec",
    });
  }

  return rows.slice(0, 5);
}

function buildAuditSummary(view: ReportViewData, potentialGain: number): string {
  const trustScore = getCategoryScore(view.categories, "Trust Signals");
  const seoScore = getCategoryScore(view.categories, "SEO Health");
  const weakCategories = [...view.categories]
    .sort((left, right) => left.score - right.score)
    .slice(0, 2)
    .map((category) => category.title);

  const foundations =
    trustScore >= 70 || seoScore >= 70
      ? "This website demonstrates strong trust and technical foundations."
      : "This website has a workable baseline but trust and technical signals need strengthening.";

  const opportunities = `The largest visibility opportunities are ${weakCategories.join(" and ")}.`;
  const uplift = `Addressing these gaps could improve AI visibility by approximately ${potentialGain} points.`;

  return `${foundations} ${opportunities} ${uplift}`;
}

function buildDemoAuditSummary(): string {
  return "This website demonstrates strong institutional authority and technical SEO depth. The largest visibility opportunities are Schema Markup and semantic content structure. Addressing these gaps could improve AI visibility by approximately 10 points.";
}

export function buildReportV2View(view: ReportViewData): ReportV2ViewData {
  const categories = view.isRealData ? view.categories : demoCategories;
  const potentialGain = view.isRealData
    ? buildPotentialGain(view.recommendations)
    : 10;
  const potentialScore = Math.min(100, view.score + potentialGain);
  const topOpportunity =
    view.recommendations[0]?.title ?? "Improve core SEO and schema signals";
  const recommendationRows = view.isRealData
    ? buildRecommendationRows(view.priorityIssues, view.recommendations)
    : [
        {
          title: "Microdata Entity Mapping",
          description:
            "Resolve missing Organization schema for historical archives.",
          status: "Critical" as const,
          impact: "+12 pts",
          action: "View Spec",
        },
        {
          title: "Content Cluster Pruning",
          description: "Consolidate thin tag pages into high-value topics.",
          status: "Optimization" as const,
          impact: "+6 pts",
          action: "View Spec",
        },
        {
          title: "Semantic Internal Linking",
          description: "Automate cross-linking between related site sections.",
          status: "Optimization" as const,
          impact: "+8 pts",
          action: "View Spec",
        },
      ];

  return {
    domain: view.domain,
    isRealData: view.isRealData,
    score: view.score,
    potentialScore,
    potentialGain,
    topOpportunity,
    strategicOverview: {
      summary: view.isRealData
        ? buildAuditSummary(view, potentialGain)
        : buildDemoAuditSummary(),
      indexability: getCategoryScore(categories, "SEO Health"),
      schemaHealth: getCategoryScore(categories, "Schema Markup"),
      aiVisibility: getCategoryScore(categories, "AI Visibility"),
    },
    radarPoints: buildRadarPoints(categories),
    growthAreas: view.isRealData
      ? buildGrowthAreas(categories, view.recommendations)
      : [
          { label: "Semantic Quality", current: 72, potential: 95 },
          { label: "Data Structure", current: 64, potential: 92 },
          { label: "Authority/E-E-A-T", current: 88, potential: 98 },
        ],
    trendPoints: buildProjectedTrend(view.score),
    recommendations: recommendationRows,
    criticalCount: recommendationRows.filter((row) => row.status === "Critical")
      .length,
    optimizationCount: recommendationRows.filter(
      (row) => row.status === "Optimization",
    ).length,
  };
}
