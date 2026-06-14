import type { ReportRecommendation, ReportCategory, ReportIssue } from "@/lib/report-data";
import { categories as demoCategories } from "@/lib/report-data";
import type { ReportViewData } from "./audit-to-report";
import {
  getFormLabelCoverage,
} from "./accessibility-check";
import type { AccessibilityAnalysis } from "./types";

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

export type ReportV2SemanticBar = {
  label: string;
  shortLabel: string;
  value: number;
};

export type ReportV2LlmReadiness = {
  name: string;
  value: number;
};

export type ReportV2AccessibilityCard = {
  score: number;
  altCoverage: number;
  formLabelStatus: string;
  landmarkStatus: string;
  headingOrderStatus: string;
  topIssue: string;
};

export type ReportV2AccessibilityFindingRow = {
  id: string;
  label: string;
  wcag: string;
  status: "pass" | "warning" | "fail";
  recommendation: string;
};

export type ReportV2AccessibilityReport = {
  score: number;
  findings: ReportV2AccessibilityFindingRow[];
  totalFindings: number;
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
  semanticDistribution: ReportV2SemanticBar[];
  llmIndexStatus: ReportV2LlmReadiness[];
  accessibilityCard: ReportV2AccessibilityCard;
  accessibilityReport: ReportV2AccessibilityReport;
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

function buildSemanticDistribution(
  categories: ReportCategory[],
): ReportV2SemanticBar[] {
  return RADAR_CATEGORY_ORDER.map((item) => ({
    label: item.label,
    shortLabel: item.shortLabel,
    value: getCategoryScore(categories, item.label),
  }));
}

function buildLlmIndexStatus(categories: ReportCategory[]): ReportV2LlmReadiness[] {
  const aiVisibility = getCategoryScore(categories, "AI Visibility");
  const entityClarity = getCategoryScore(categories, "Entity Clarity");
  const trustSignals = getCategoryScore(categories, "Trust Signals");

  const weighted = (aiWeight: number, entityWeight: number, trustWeight: number) =>
    Math.min(
      100,
      Math.round(
        aiVisibility * aiWeight +
          entityClarity * entityWeight +
          trustSignals * trustWeight,
      ),
    );

  return [
    {
      name: "GPT-4o Search",
      value: weighted(0.5, 0.3, 0.2),
    },
    {
      name: "Claude 3.5 Sonnet",
      value: weighted(0.4, 0.35, 0.25),
    },
    {
      name: "Perplexity AI",
      value: weighted(0.45, 0.25, 0.3),
    },
  ];
}

function buildTopAccessibilityIssue(
  analysis: AccessibilityAnalysis,
  priorityIssues: ReportIssue[],
): string {
  const accessibilityIssue = priorityIssues.find((issue) =>
    /alt text|landmark|heading order|lang attribute|form input|skip link|accessible/i.test(
      issue.title,
    ),
  );

  if (accessibilityIssue) {
    return accessibilityIssue.title;
  }

  if (!analysis.hasLangAttribute) {
    return "Add a valid HTML lang attribute.";
  }

  if (analysis.imagesMissingAlt > 0) {
    return "Add missing alt text to images.";
  }

  if (analysis.inputsMissingLabels > 0) {
    return "Add accessible labels to form inputs.";
  }

  if (!analysis.hasMainLandmark) {
    return "Add a main landmark.";
  }

  if (analysis.headingOrderIssues > 0) {
    return "Fix heading order.";
  }

  if (!analysis.skipLinkDetected) {
    return "Add skip link for keyboard users.";
  }

  return "No major accessibility signal gaps detected.";
}

function buildAccessibilityCard(view: ReportViewData): ReportV2AccessibilityCard {
  const analysis = view.accessibilityAnalysis;
  const score =
    analysis.score || getCategoryScore(view.categories, "WCAG 2.2 Readiness");
  const formCoverage = getFormLabelCoverage(analysis);
  const landmarks = [
    analysis.hasMainLandmark ? "Main" : null,
    analysis.hasNavLandmark ? "Nav" : null,
    analysis.hasHeaderLandmark ? "Header" : null,
    analysis.hasFooterLandmark ? "Footer" : null,
  ].filter(Boolean);

  return {
    score,
    altCoverage: analysis.altTextCoverage,
    formLabelStatus:
      formCoverage >= 90 ? "Good" : formCoverage >= 70 ? "Partial" : "Needs work",
    landmarkStatus: landmarks.length > 0 ? landmarks.join(" + ") : "Missing",
    headingOrderStatus:
      analysis.headingOrderIssues === 0
        ? "Logical"
        : `${analysis.headingOrderIssues} issue(s)`,
    topIssue: buildTopAccessibilityIssue(analysis, view.priorityIssues),
  };
}

function buildAccessibilityReport(
  view: ReportViewData,
): ReportV2AccessibilityReport {
  const analysis = view.accessibilityAnalysis;
  const statusOrder = { fail: 0, warning: 1, pass: 2 };
  const findings = [...analysis.findings]
    .sort((left, right) => statusOrder[left.status] - statusOrder[right.status])
    .map((finding) => ({
      id: finding.id,
      label: finding.label,
      wcag: finding.wcag,
      status: finding.status,
      recommendation: finding.recommendation,
    }));

  return {
    score: analysis.score || getCategoryScore(view.categories, "WCAG 2.2 Readiness"),
    findings,
    totalFindings: findings.length,
  };
}

function buildDemoAccessibilityCard(): ReportV2AccessibilityCard {
  return {
    score: 72,
    altCoverage: 88,
    formLabelStatus: "Partial",
    landmarkStatus: "Main + Nav",
    headingOrderStatus: "Logical",
    topIssue: "Add missing alt text to images.",
  };
}

function buildDemoAccessibilityReport(): ReportV2AccessibilityReport {
  return {
    score: 72,
    totalFindings: 6,
    findings: [
      {
        id: "image-alt-text",
        label: "Image alt text",
        wcag: "WCAG 1.1.1 Non-text Content",
        status: "warning",
        recommendation: "Add descriptive alt text to meaningful images.",
      },
      {
        id: "skip-link",
        label: "Skip link",
        wcag: "WCAG 2.4.1 Bypass Blocks",
        status: "warning",
        recommendation: "Add a visible-on-focus skip link that targets the main content area.",
      },
      {
        id: "lang-attribute",
        label: "HTML lang attribute",
        wcag: "WCAG 3.1.1 Language of Page",
        status: "pass",
        recommendation: "Add lang=\"en\" (or the correct language code) to the <html> element.",
      },
      {
        id: "page-title",
        label: "Page title",
        wcag: "WCAG 2.4.2 Page Titled",
        status: "pass",
        recommendation: "Add a descriptive <title> element to the page head.",
      },
      {
        id: "landmarks",
        label: "Page landmarks",
        wcag: "WCAG 1.3.1 / 2.4.1 Bypass Blocks",
        status: "pass",
        recommendation: "Add <main>, <nav>, <header>, and <footer> landmarks where appropriate.",
      },
      {
        id: "heading-order",
        label: "Heading order",
        wcag: "WCAG 1.3.1 Info and Relationships",
        status: "pass",
        recommendation: "Avoid skipping heading levels (for example, H2 directly to H4).",
      },
    ],
  };
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
    semanticDistribution: buildSemanticDistribution(categories),
    llmIndexStatus: buildLlmIndexStatus(categories),
    accessibilityCard: view.isRealData
      ? buildAccessibilityCard(view)
      : buildDemoAccessibilityCard(),
    accessibilityReport: view.isRealData
      ? buildAccessibilityReport(view)
      : buildDemoAccessibilityReport(),
    recommendations: recommendationRows,
    criticalCount: recommendationRows.filter((row) => row.status === "Critical")
      .length,
    optimizationCount: recommendationRows.filter(
      (row) => row.status === "Optimization",
    ).length,
  };
}
