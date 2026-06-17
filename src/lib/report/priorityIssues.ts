import { calculateAuditScores } from "@/lib/audit/audit-score";
import {
  getAccessibilityAnalysis,
  getAdvancedSchemaAudit,
  getAnswerExtractionAudit,
  getCitationReadinessAudit,
  getEntityClarityAudit,
  getOpenGraphAudit,
  getTechnicalSignals,
  getTrustSignalsAudit,
  getTwitterCardAudit,
  normalizeAuditResponse,
} from "@/lib/audit/audit-normalize";
import type { AuditResponse, CategoryScore } from "@/lib/audit/types";
import type {
  AuditIssue,
  AuditRecommendation,
  PriorityIssueSeverity,
  RankedPriorityIssue,
} from "@/types/audit";
import { enrichPriorityIssue } from "@/lib/report/recommendationTemplates";

const MAX_PRIORITY_ISSUES = 6;

const CATEGORY_SLUGS: Record<string, string> = {
  "SEO Health": "seo-health",
  "AI Visibility": "ai-visibility",
  "Entity Clarity": "entity-clarity",
  "Citation Readiness": "citation-readiness",
  "Answer Extraction": "answer-extraction",
  "Trust Signals": "trust-signals",
  "Open Graph": "open-graph",
  "Twitter Card": "twitter-card",
  "Content Structure": "content-structure",
  "Schema Markup": "schema-markup",
  "Advanced Schema": "advanced-schema",
  "FAQ Readiness": "ai-visibility",
  "AI Answer Readiness": "answer-extraction",
  "WCAG 2.2 Readiness": "wcag-22",
  Robots: "seo-health",
  Sitemap: "seo-health",
};

const AI_AUDIT_CATEGORIES = new Set([
  "Entity Clarity",
  "Citation Readiness",
  "Answer Extraction",
  "Trust Signals",
  "Open Graph",
  "Twitter Card",
  "Advanced Schema",
]);

type IssueDraft = RankedPriorityIssue & {
  categoryScore: number;
};

type AiAuditResult = {
  issues: AuditIssue[];
  recommendations: AuditRecommendation[];
};

export const demoRankedPriorityIssues: RankedPriorityIssue[] = [
  enrichPriorityIssue({
    title: "Missing Organization Schema",
    category: "Schema Markup",
    severity: "High",
    impact: "LLMs struggle to verify entity ownership without Organization schema.",
    recommendation: "Add JSON-LD Organization markup with name, url, logo, and sameAs links.",
    estimatedGain: 6,
    detailHref: "/report/schema-markup",
  }),
  enrichPriorityIssue({
    title: "Broken Semantic Links (Primary Nav)",
    category: "Content Structure",
    severity: "Medium",
    impact: "Navigation links reduce crawl depth and context for AI systems.",
    recommendation: "Fix broken internal links and ensure descriptive anchor text.",
    estimatedGain: 4,
    detailHref: "/report/content-structure",
  }),
  enrichPriorityIssue({
    title: "Incomplete Author Profiles",
    category: "Citation Readiness",
    severity: "High",
    impact: "Missing author signals reduce citation eligibility in AI answers.",
    recommendation: "Add visible author bylines plus meta author tags or Person schema.",
    estimatedGain: 5,
    detailHref: "/report/citation-readiness",
  }),
];

function severityRank(severity: PriorityIssueSeverity): number {
  if (severity === "Critical") {
    return 0;
  }

  if (severity === "High") {
    return 1;
  }

  if (severity === "Medium") {
    return 2;
  }

  return 3;
}

function defaultGainForSeverity(severity: PriorityIssueSeverity): number {
  if (severity === "Critical") {
    return 9;
  }

  if (severity === "High") {
    return 6;
  }

  if (severity === "Medium") {
    return 4;
  }

  return 2;
}

function mapAuditImpact(impact: AuditIssue["impact"]): PriorityIssueSeverity {
  return impact;
}

function normalizeIssueTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titlesMatch(left: string, right: string): boolean {
  const normalizedLeft = normalizeIssueTitle(left);
  const normalizedRight = normalizeIssueTitle(right);

  return (
    normalizedLeft === normalizedRight ||
    normalizedLeft.includes(normalizedRight) ||
    normalizedRight.includes(normalizedLeft)
  );
}

function deriveTitleFromProblem(problem: string): string {
  const cleaned = problem.replace(/\.$/, "").trim();

  if (!cleaned) {
    return "Issue detected";
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function getCategorySlug(category: string): string {
  return CATEGORY_SLUGS[category] ?? "seo-health";
}

function toRankedIssue(draft: IssueDraft): RankedPriorityIssue {
  return enrichPriorityIssue({
    title: draft.title,
    category: draft.category,
    severity: draft.severity,
    impact: draft.impact,
    recommendation: draft.recommendation,
    estimatedGain: draft.estimatedGain,
    detailHref: draft.detailHref,
  });
}

function findMatchingRecommendation(
  recommendations: AuditRecommendation[],
  title: string,
): AuditRecommendation | undefined {
  return recommendations.find((recommendation) =>
    titlesMatch(recommendation.title, title),
  );
}

function collectFromAiAudit(
  category: string,
  slug: string,
  categoryScore: number,
  result: AiAuditResult,
): IssueDraft[] {
  const collected: IssueDraft[] = [];

  for (const issue of result.issues) {
    const recommendation = findMatchingRecommendation(
      result.recommendations,
      issue.title,
    );
    const severity = mapAuditImpact(issue.impact);

    collected.push({
      title: issue.title,
      category,
      categoryScore,
      severity,
      impact: issue.explanation,
      recommendation: recommendation?.howToFix ?? issue.explanation,
      estimatedGain:
        recommendation?.estimatedGain ?? defaultGainForSeverity(severity),
      detailHref: `/report/${slug}`,
    });
  }

  for (const recommendation of result.recommendations) {
    if (collected.some((issue) => titlesMatch(issue.title, recommendation.title))) {
      continue;
    }

    const severity: PriorityIssueSeverity =
      recommendation.estimatedGain >= 8
        ? "Critical"
        : recommendation.estimatedGain >= 6
          ? "High"
          : "Medium";

    collected.push({
      title: recommendation.title,
      category,
      categoryScore,
      severity,
      impact: recommendation.whyThisMatters,
      recommendation: recommendation.howToFix,
      estimatedGain: recommendation.estimatedGain,
      detailHref: `/report/${slug}`,
    });
  }

  return collected;
}

function collectCategoryProblemIssues(category: CategoryScore): IssueDraft[] {
  const slug = getCategorySlug(category.label);
  const collected: IssueDraft[] = [];

  for (let index = 0; index < category.problems.length; index += 1) {
    const problem = category.problems[index];
    const recommendation =
      category.recommendations[index] ??
      category.recommendations[0] ??
      problem;
    const severity: PriorityIssueSeverity =
      category.score < 50
        ? "Critical"
        : category.score < 70
          ? "High"
          : "Medium";

    collected.push({
      title: deriveTitleFromProblem(problem),
      category: category.label,
      categoryScore: category.score,
      severity,
      impact: problem,
      recommendation,
      estimatedGain: Math.max(
        3,
        Math.min(10, Math.round((100 - category.score) * 0.12)),
      ),
      detailHref: `/report/${slug}`,
    });
  }

  return collected;
}

function collectCheckIssues(
  audit: AuditResponse,
  categoryScore: number,
): IssueDraft[] {
  const collected: IssueDraft[] = [];

  for (const check of audit.checks) {
    if (check.status === "pass") {
      continue;
    }

    const severity: PriorityIssueSeverity =
      check.status === "fail" ? "Critical" : "Medium";

    collected.push({
      title: check.label,
      category: "SEO Health",
      categoryScore,
      severity,
      impact: check.message,
      recommendation: check.message,
      estimatedGain: check.status === "fail" ? 8 : 5,
      detailHref: "/report/seo-health",
    });
  }

  return collected;
}

function collectPageLevelIssues(
  audit: AuditResponse,
  categoryScore: number,
): IssueDraft[] {
  const collected: IssueDraft[] = [];

  if (audit.statusCode >= 400 || audit.statusCode === 0) {
    collected.push({
      title: "Page unreachable",
      category: "SEO Health",
      categoryScore,
      severity: "Critical",
      impact: `The audited page responded with status ${audit.statusCode} and could not be fully analyzed.`,
      recommendation: "Ensure the submitted URL returns HTTP 200 and is publicly accessible.",
      estimatedGain: 10,
      detailHref: "/report/seo-health",
    });
  }

  if (!audit.title) {
    collected.push({
      title: "Missing title",
      category: "SEO Health",
      categoryScore,
      severity: "Critical",
      impact:
        "No page title was found. The title is a core signal for search engines and AI systems.",
      recommendation: "Add a descriptive title tag.",
      estimatedGain: 9,
      detailHref: "/report/seo-health",
    });
  }

  if (!audit.metaDescription) {
    collected.push({
      title: "Missing meta description",
      category: "SEO Health",
      categoryScore,
      severity: "Critical",
      impact:
        "Without a meta description, AI and search systems lack a concise page summary.",
      recommendation: "Write a unique 140–160 character meta description.",
      estimatedGain: 8,
      detailHref: "/report/seo-health",
    });
  }

  return collected;
}

function collectAccessibilityIssues(
  audit: AuditResponse,
  categoryScore: number,
): IssueDraft[] {
  const analysis = getAccessibilityAnalysis(audit);
  const collected: IssueDraft[] = [];

  for (const finding of analysis.findings) {
    if (finding.status === "pass") {
      continue;
    }

    const severity: PriorityIssueSeverity =
      finding.status === "fail" ? "Critical" : "Medium";

    collected.push({
      title: finding.label,
      category: "WCAG 2.2 Readiness",
      categoryScore,
      severity,
      impact: finding.message,
      recommendation: finding.recommendation,
      estimatedGain: finding.status === "fail" ? 6 : 4,
      detailHref: "/report/wcag-22",
    });
  }

  return collected;
}

function collectTechnicalSignalIssues(
  audit: AuditResponse,
  seoCategoryScore: number,
): IssueDraft[] {
  const collected: IssueDraft[] = [];

  for (const signal of getTechnicalSignals(audit)) {
    if (signal.status === "pass") {
      continue;
    }

    const isSitemap = signal.id.startsWith("sitemap");
    const category = isSitemap ? "Sitemap" : "Robots";
    const severity: PriorityIssueSeverity =
      signal.status === "fail" ? "High" : "Medium";

    collected.push({
      title: signal.label,
      category,
      categoryScore: seoCategoryScore,
      severity,
      impact: signal.summary,
      recommendation: signal.recommendation ?? signal.summary,
      estimatedGain: signal.status === "fail" ? 7 : 5,
      detailHref: "/report/seo-health",
    });
  }

  return collected;
}

function dedupeIssues(issues: IssueDraft[]): IssueDraft[] {
  const seen = new Set<string>();
  const deduped: IssueDraft[] = [];

  for (const issue of issues) {
    const key = normalizeIssueTitle(issue.title);

    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(issue);
  }

  return deduped;
}

function compareIssues(left: IssueDraft, right: IssueDraft): number {
  const severityDiff = severityRank(left.severity) - severityRank(right.severity);

  if (severityDiff !== 0) {
    return severityDiff;
  }

  const gainDiff = right.estimatedGain - left.estimatedGain;

  if (gainDiff !== 0) {
    return gainDiff;
  }

  return left.categoryScore - right.categoryScore;
}

export function generatePriorityIssues(audit: AuditResponse): RankedPriorityIssue[] {
  const normalized = normalizeAuditResponse(audit);

  if (!normalized) {
    return [];
  }

  const scores = calculateAuditScores(normalized);
  const categoryScoreMap = new Map(
    scores.categories.map((category) => [category.label, category.score]),
  );
  const seoCategoryScore = categoryScoreMap.get("SEO Health") ?? 0;
  const wcagCategoryScore = categoryScoreMap.get("WCAG 2.2 Readiness") ?? 0;

  const collected: IssueDraft[] = [
    ...collectFromAiAudit(
      "Entity Clarity",
      "entity-clarity",
      categoryScoreMap.get("Entity Clarity") ?? 0,
      getEntityClarityAudit(normalized),
    ),
    ...collectFromAiAudit(
      "Citation Readiness",
      "citation-readiness",
      categoryScoreMap.get("Citation Readiness") ?? 0,
      getCitationReadinessAudit(normalized),
    ),
    ...collectFromAiAudit(
      "Answer Extraction",
      "answer-extraction",
      categoryScoreMap.get("Answer Extraction") ?? 0,
      getAnswerExtractionAudit(normalized),
    ),
    ...collectFromAiAudit(
      "Trust Signals",
      "trust-signals",
      categoryScoreMap.get("Trust Signals") ?? 0,
      getTrustSignalsAudit(normalized),
    ),
    ...collectFromAiAudit(
      "Open Graph",
      "open-graph",
      categoryScoreMap.get("Open Graph") ?? 0,
      getOpenGraphAudit(normalized),
    ),
    ...collectFromAiAudit(
      "Twitter Card",
      "twitter-card",
      categoryScoreMap.get("Twitter Card") ?? 0,
      getTwitterCardAudit(normalized),
    ),
    ...collectFromAiAudit(
      "Advanced Schema",
      "advanced-schema",
      categoryScoreMap.get("Advanced Schema") ?? 0,
      getAdvancedSchemaAudit(normalized),
    ),
    ...collectAccessibilityIssues(normalized, wcagCategoryScore),
    ...collectTechnicalSignalIssues(normalized, seoCategoryScore),
    ...collectCheckIssues(normalized, seoCategoryScore),
    ...collectPageLevelIssues(normalized, seoCategoryScore),
  ];

  for (const category of scores.categories) {
    if (AI_AUDIT_CATEGORIES.has(category.label)) {
      continue;
    }

    collected.push(...collectCategoryProblemIssues(category));
  }

  return dedupeIssues(collected)
    .sort(compareIssues)
    .slice(0, MAX_PRIORITY_ISSUES)
    .map(toRankedIssue);
}
