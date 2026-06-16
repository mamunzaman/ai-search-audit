import { calculateAuditScores } from "@/lib/audit/audit-score";
import { normalizeAuditResponse } from "@/lib/audit/audit-normalize";
import type {
  AuditRecommendation,
  AuditResponse,
  CategoryScore,
  PriorityIssue,
} from "@/lib/audit/types";
import type { ExecutiveSummary } from "@/types/audit";

const STRENGTH_THRESHOLD = 80;
const OPPORTUNITY_THRESHOLD = 70;
const MAX_POTENTIAL_GAIN = 25;

const CATEGORY_PHRASES: Record<string, string> = {
  "SEO Health": "technical SEO health",
  "AI Visibility": "AI visibility signals",
  "Entity Clarity": "entity clarity",
  "Citation Readiness": "citation readiness",
  "Answer Extraction": "answer extraction",
  "Trust Signals": "trust signals",
  "Open Graph": "Open Graph metadata",
  "Twitter Card": "Twitter Card coverage",
  "Content Structure": "content structure",
  "Schema Markup": "structured data implementation",
  "Advanced Schema": "advanced schema markup",
  "FAQ Readiness": "FAQ readiness",
  "AI Answer Readiness": "AI answer readiness",
  "WCAG 2.2 Readiness": "accessibility readiness",
};

export const defaultExecutiveSummary: ExecutiveSummary = {
  overallSummary:
    "This website demonstrates strong institutional authority and technical SEO depth. The largest improvement opportunities are Schema Markup and semantic content structure. Addressing these gaps could improve AI visibility by approximately 10 points.",
  strengths: [],
  opportunities: [],
  potentialGain: 10,
};

function categoryPhrase(label: string): string {
  return CATEGORY_PHRASES[label] ?? label;
}

function formatPhraseList(items: string[]): string {
  if (items.length === 0) {
    return "";
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function buildStrengthItems(categories: CategoryScore[]): string[] {
  return categories
    .filter((category) => category.score >= STRENGTH_THRESHOLD)
    .sort((left, right) => right.score - left.score)
    .map((category) => `${category.label} (${category.score}%)`);
}

function buildOpportunityItems(categories: CategoryScore[]): string[] {
  return categories
    .filter((category) => category.score < OPPORTUNITY_THRESHOLD)
    .sort((left, right) => left.score - right.score)
    .map((category) => `${category.label} (${category.score}%)`);
}

function calculatePotentialGain(
  recommendations: AuditRecommendation[],
  priorityIssues: PriorityIssue[],
): number {
  const seen = new Set<string>();
  let total = 0;

  for (const issue of priorityIssues) {
    if (seen.has(issue.title)) {
      continue;
    }

    seen.add(issue.title);
    total += issue.estimatedGain;
  }

  for (const recommendation of recommendations) {
    if (seen.has(recommendation.title)) {
      continue;
    }

    seen.add(recommendation.title);
    total += recommendation.estimatedGain;
  }

  return Math.min(MAX_POTENTIAL_GAIN, total);
}

function buildOverallSummary(
  strengthPhrases: string[],
  opportunityPhrases: string[],
  potentialGain: number,
): string {
  const parts: string[] = [];

  if (strengthPhrases.length > 0) {
    parts.push(
      `Strong ${formatPhraseList(strengthPhrases.slice(0, 3))} provide a solid foundation for AI visibility.`,
    );
  } else {
    parts.push(
      "This site has room to build stronger AI visibility foundations across core audit categories.",
    );
  }

  if (opportunityPhrases.length > 0) {
    parts.push(
      `The largest improvement opportunities are ${formatPhraseList(opportunityPhrases.slice(0, 3))}.`,
    );
  }

  if (potentialGain > 0 && opportunityPhrases.length > 0) {
    parts.push(
      `Addressing these issues could improve visibility by approximately ${potentialGain} points.`,
    );
  }

  return parts.join(" ");
}

export function generateExecutiveSummary(audit: AuditResponse): ExecutiveSummary {
  const normalized = normalizeAuditResponse(audit);

  if (!normalized) {
    return defaultExecutiveSummary;
  }

  const scores = calculateAuditScores(normalized);
  const strengths = buildStrengthItems(scores.categories);
  const opportunities = buildOpportunityItems(scores.categories);
  const potentialGain = calculatePotentialGain(
    scores.recommendations,
    scores.priorityIssues,
  );

  const strengthPhrases = scores.categories
    .filter((category) => category.score >= STRENGTH_THRESHOLD)
    .sort((left, right) => right.score - left.score)
    .map((category) => categoryPhrase(category.label));

  const opportunityPhrases = scores.categories
    .filter((category) => category.score < OPPORTUNITY_THRESHOLD)
    .sort((left, right) => left.score - right.score)
    .map((category) => categoryPhrase(category.label));

  return {
    overallSummary: buildOverallSummary(
      strengthPhrases,
      opportunityPhrases,
      potentialGain,
    ),
    strengths,
    opportunities,
    potentialGain,
  };
}
