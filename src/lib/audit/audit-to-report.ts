import { defaultAccessibilityAnalysis } from "./accessibility-check";
import { normalizeDomain } from "@/lib/domain";
import type { ActivityLogEntry, ProcessingMetric } from "@/lib/processing-data";
import {
  categories as placeholderCategories,
  criticalIssues,
  reportMeta,
  strengths,
  type ReportCategory,
  type ReportRecommendation,
} from "@/lib/report-data";
import {
  buildHeroIssues,
  buildHeroStrengths,
  calculateAuditScores,
  scoreToStatusLabel,
} from "./audit-score";
import {
  defaultExecutiveSummary,
  generateExecutiveSummary,
} from "@/lib/report/executiveSummary";
import {
  demoRankedPriorityIssues,
  generatePriorityIssues,
} from "@/lib/report/priorityIssues";
import type { ExecutiveSummary, RankedPriorityIssue } from "@/types/audit";
import {
  getAccessibilityAnalysis,
  getEntityAnalysis,
  getReadabilityAnalysis,
  getRobotsAnalysis,
  getSiteCrawl,
  getSitemapAnalysis,
  getSocialMetadata,
  normalizeAuditResponse,
} from "./audit-normalize";
import type { AccessibilityAnalysis, AuditCheck, AuditResponse, CategoryScore } from "./types";

export type ReportStrength = {
  title: string;
  text: string;
};

export type ExtractedDataSummary = {
  h1Count: number;
  h2Count: number;
  schemaTypesCount: number;
  schemaTypes: string[];
  internalLinks: number;
  externalLinks: number;
  robotsTxtExists: boolean;
  robotsReachability: string;
  robotsSitemapCount: number;
  robotsDisallowCount: number;
  robotsRootDisallowed: boolean;
  blockedAiCrawlers: string[];
  sitemapExists: boolean;
  sitemapFormat: string;
  sitemapUrlCount: number;
  sitemapChildCount: number;
  ogTitleFound: boolean;
  ogDescriptionFound: boolean;
  ogImageFound: boolean;
  twitterCard: string;
  primaryEntity: string;
  entityType: string;
  entityConfidence: number;
  relatedEntities: string[];
  wordCount: number;
  paragraphCount: number;
  listCount: number;
  tableCount: number;
  questionHeadingCount: number;
  hasFAQText: boolean;
};

export type ReportViewData = {
  domain: string;
  title: string;
  metaDescription: string;
  finalUrl: string;
  statusCode: number | null;
  isRealData: boolean;
  score: number;
  status: string;
  auditDate: string;
  headingsCount: number;
  h1Count: number;
  h2Count: number;
  schemaTypes: string[];
  links: AuditResponse["links"];
  checks: AuditCheck[];
  extractedSummary: ExtractedDataSummary;
  primaryEntity: string;
  entityType: string;
  entityConfidence: number;
  strengths: ReportStrength[];
  criticalIssues: ReportStrength[];
  categories: ReportCategory[];
  priorityIssues: RankedPriorityIssue[];
  recommendations: ReportRecommendation[];
  accessibilityAnalysis: AccessibilityAnalysis;
  executiveSummary: ExecutiveSummary;
};

const CATEGORY_ORDER = [
  "SEO Health",
  "AI Visibility",
  "Entity Clarity",
  "Citation Readiness",
  "Answer Extraction",
  "Trust Signals",
  "Open Graph",
  "Twitter Card",
  "Content Structure",
  "Schema Markup",
  "Advanced Schema",
  "FAQ Readiness",
  "AI Answer Readiness",
  "WCAG 2.2 Readiness",
] as const;

const categoryIconMap = Object.fromEntries(
  placeholderCategories.map((category) => [category.title, category.icon]),
) as Record<string, string>;

function mapCategoryScores(categoryScores: CategoryScore[]): ReportCategory[] {
  const scoreMap = Object.fromEntries(
    categoryScores.map((category) => [category.label, category]),
  );

  return CATEGORY_ORDER.map((title) => {
    const category = scoreMap[title];
    const score = category?.score ?? 0;
    const isCritical =
      category?.status === "fail" ||
      (category?.status === "warning" && score < 70);

    return {
      icon: categoryIconMap[title] ?? "dashboard",
      title,
      score,
      critical: isCritical,
      summary: category?.summary,
      issueCount: category?.issueCount,
    };
  });
}


function countHeadings(audit: AuditResponse): number {
  return (
    audit.headings.h1.length +
    audit.headings.h2.length +
    audit.headings.h3.length
  );
}

function buildExtractedSummary(audit: AuditResponse): ExtractedDataSummary {
  const robotsAnalysis = getRobotsAnalysis(audit);
  const sitemapAnalysis = getSitemapAnalysis(audit);
  const socialMetadata = getSocialMetadata(audit);
  const entityAnalysis = getEntityAnalysis(audit);
  const readability = getReadabilityAnalysis(audit);

  return {
    h1Count: audit.headings.h1.length,
    h2Count: audit.headings.h2.length,
    schemaTypesCount: audit.schemaTypes.length,
    schemaTypes: audit.schemaTypes,
    internalLinks: audit.links.internal,
    externalLinks: audit.links.external,
    robotsTxtExists: robotsAnalysis.exists,
    robotsReachability: robotsAnalysis.reachability,
    robotsSitemapCount: robotsAnalysis.sitemapCount,
    robotsDisallowCount: robotsAnalysis.disallowCount,
    robotsRootDisallowed: robotsAnalysis.rootDisallowed,
    blockedAiCrawlers: robotsAnalysis.blockedAiCrawlers,
    sitemapExists: sitemapAnalysis.exists,
    sitemapFormat: sitemapAnalysis.format,
    sitemapUrlCount: sitemapAnalysis.urlCount,
    sitemapChildCount: sitemapAnalysis.childSitemapCount,
    ogTitleFound: Boolean(socialMetadata.openGraph.title),
    ogDescriptionFound: Boolean(socialMetadata.openGraph.description),
    ogImageFound: Boolean(socialMetadata.openGraph.image),
    twitterCard: socialMetadata.twitter.card ?? "Missing",
    primaryEntity: entityAnalysis.primaryEntity ?? "Not detected",
    entityType: entityAnalysis.entityType,
    entityConfidence: entityAnalysis.confidence,
    relatedEntities: entityAnalysis.relatedEntities,
    wordCount: readability.wordCount,
    paragraphCount: readability.paragraphCount,
    listCount: readability.listCount,
    tableCount: readability.tableCount,
    questionHeadingCount: readability.questionHeadingCount,
    hasFAQText: readability.hasFAQText,
  };
}

export function auditToProcessingMetrics(
  audit: AuditResponse,
): ProcessingMetric[] {
  const crawledPages = getSiteCrawl(audit).pages.length;

  return [
    { label: "Page Audited", value: Math.max(1, crawledPages) },
    { label: "Headings Found", value: countHeadings(audit) },
    { label: "Schema Types", value: audit.schemaTypes.length },
    {
      label: "Passed Checks",
      value: audit.checks.filter((check) => check.status === "pass").length,
    },
  ];
}

function formatActivityTime(base: Date, offsetSeconds: number): string {
  const timestamp = new Date(base.getTime() + offsetSeconds * 1000);
  return timestamp.toTimeString().slice(0, 8);
}

function hasFaqPageSchema(audit: AuditResponse): boolean {
  return audit.schemaTypes.some(
    (schemaType) => schemaType.toLowerCase() === "faqpage",
  );
}

export function auditToActivityLog(audit: AuditResponse): ActivityLogEntry[] {
  const now = new Date();
  const headingsCount = countHeadings(audit);
  const schemaCount = audit.schemaTypes.length;
  const passedChecks = audit.checks.filter((check) => check.status === "pass")
    .length;
  const totalChecks = audit.checks.length;
  const faqFound = hasFaqPageSchema(audit);

  return [
    {
      time: formatActivityTime(now, 0),
      message: "Crawling homepage...",
      status: "OK",
    },
    {
      time: formatActivityTime(now, 2),
      message: "Checking structured data...",
      status:
        schemaCount > 0
          ? `${schemaCount} schema types detected`
          : "none detected",
    },
    {
      time: formatActivityTime(now, 4),
      message: "Detecting headings...",
      status: `${headingsCount} headings found`,
    },
    {
      time: formatActivityTime(now, 6),
      message: "Running SEO checks...",
      status: `${passedChecks}/${totalChecks} checks passed`,
    },
    {
      time: formatActivityTime(now, 8),
      message: "Evaluating FAQ readiness...",
      status: faqFound ? "FAQPage found" : "not found",
    },
  ];
}

export function auditToReportView(
  audit: AuditResponse,
  fallbackDomain: string,
): ReportViewData {
  const normalized = normalizeAuditResponse(audit);

  if (!normalized) {
    return getPlaceholderReportView(fallbackDomain);
  }

  const domain = normalizeDomain(normalized.finalUrl) || fallbackDomain;
  const scores = calculateAuditScores(normalized);
  const entityAnalysis = getEntityAnalysis(normalized);

  return {
    domain,
    title: normalized.title,
    metaDescription: normalized.metaDescription,
    finalUrl: normalized.finalUrl,
    statusCode: normalized.statusCode,
    isRealData: true,
    score: scores.overallScore,
    status: scoreToStatusLabel(scores.overallScore),
    auditDate: reportMeta.auditDate,
    headingsCount: countHeadings(normalized),
    h1Count: normalized.headings.h1.length,
    h2Count: normalized.headings.h2.length,
    schemaTypes: normalized.schemaTypes,
    links: normalized.links,
    checks: normalized.checks,
    extractedSummary: buildExtractedSummary(normalized),
    primaryEntity: entityAnalysis.primaryEntity ?? "Not detected",
    entityType: entityAnalysis.entityType,
    entityConfidence: entityAnalysis.confidence,
    strengths: buildHeroStrengths(scores.categories),
    criticalIssues: buildHeroIssues(scores.categories),
    categories: mapCategoryScores(scores.categories),
    priorityIssues: generatePriorityIssues(normalized),
    recommendations: scores.recommendations,
    accessibilityAnalysis: getAccessibilityAnalysis(normalized),
    executiveSummary: generateExecutiveSummary(normalized),
  };
}

export function getPlaceholderReportView(domain: string): ReportViewData {
  return {
    domain,
    title: "",
    metaDescription: "",
    finalUrl: "",
    statusCode: null,
    isRealData: false,
    score: reportMeta.score,
    status: reportMeta.status,
    auditDate: reportMeta.auditDate,
    headingsCount: 0,
    h1Count: 0,
    h2Count: 0,
    schemaTypes: [],
    links: { internal: 0, external: 0 },
    checks: [],
    primaryEntity: "Not detected",
    entityType: "Unknown",
    entityConfidence: 0,
    extractedSummary: {
      h1Count: 0,
      h2Count: 0,
      schemaTypesCount: 0,
      schemaTypes: [],
      internalLinks: 0,
      externalLinks: 0,
      robotsTxtExists: false,
      robotsReachability: "not_found",
      robotsSitemapCount: 0,
      robotsDisallowCount: 0,
      robotsRootDisallowed: false,
      blockedAiCrawlers: [],
      sitemapExists: false,
      sitemapFormat: "none",
      sitemapUrlCount: 0,
      sitemapChildCount: 0,
      ogTitleFound: false,
      ogDescriptionFound: false,
      ogImageFound: false,
      twitterCard: "Missing",
      primaryEntity: "Not detected",
      entityType: "Unknown",
      entityConfidence: 0,
      relatedEntities: [],
      wordCount: 0,
      paragraphCount: 0,
      listCount: 0,
      tableCount: 0,
      questionHeadingCount: 0,
      hasFAQText: false,
    },
    strengths,
    criticalIssues,
    categories: placeholderCategories,
    priorityIssues: demoRankedPriorityIssues,
    recommendations: [],
    accessibilityAnalysis: { ...defaultAccessibilityAnalysis },
    executiveSummary: defaultExecutiveSummary,
  };
}

export function buildReportView(
  audit: AuditResponse | null,
  fallbackDomain: string,
): ReportViewData {
  if (!audit) {
    return getPlaceholderReportView(fallbackDomain);
  }

  const normalized = normalizeAuditResponse(audit);

  if (!normalized) {
    return getPlaceholderReportView(fallbackDomain);
  }

  return auditToReportView(normalized, fallbackDomain);
}

export function buildScoreHeroSummary(view: ReportViewData): string {
  if (view.title && view.metaDescription) {
    return `Page "${view.title}" — ${view.metaDescription}`;
  }

  if (view.title) {
    return `Page "${view.title}" analyzed.`;
  }

  if (view.metaDescription) {
    return view.metaDescription;
  }

  return "Your domain exhibits high authority in niche entity associations.";
}
