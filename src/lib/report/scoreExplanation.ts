import { calculateAuditScores } from "@/lib/audit/audit-score";
import { normalizeAuditResponse } from "@/lib/audit/audit-normalize";
import type { AuditResponse, CategoryScore } from "@/lib/audit/types";
import { generatePriorityIssues } from "@/lib/report/priorityIssues";
import type { PriorityIssueSeverity, ScoreExplanation } from "@/types/audit";

const STRENGTH_THRESHOLD = 80;
const BLOCKER_THRESHOLD = 60;
const MAX_ITEMS = 4;
const MAX_QUICK_WINS = 3;

const SKIP_CATEGORIES = new Set(["FAQ Readiness", "AI Answer Readiness"]);

const CATEGORY_STRENGTH_PHRASE: Record<string, string> = {
  "SEO Health": "Technical SEO health is strong",
  "AI Visibility": "AI visibility signals are strong",
  "Entity Clarity": "Entity clarity is strong",
  "Citation Readiness": "Citation readiness is strong",
  "Answer Extraction": "Answer extraction is strong",
  "Trust Signals": "Trust signals are strong",
  "Open Graph": "Open Graph metadata is strong",
  "Twitter Card": "Twitter Card metadata is strong",
  "Content Structure": "Content structure is strong",
  "Schema Markup": "Schema markup is present",
  "Advanced Schema": "Advanced schema coverage is strong",
  "WCAG 2.2 Readiness": "Accessibility readiness is strong",
};

const CATEGORY_BLOCKER_PHRASE: Record<string, string> = {
  "SEO Health": "Technical SEO health is weak",
  "AI Visibility": "AI visibility signals are weak",
  "Entity Clarity": "Entity clarity is weak",
  "Citation Readiness": "Citation readiness is weak",
  "Answer Extraction": "Answer extraction is weak",
  "Trust Signals": "Trust signals are weak",
  "Open Graph": "Open Graph metadata is incomplete",
  "Twitter Card": "Twitter Card metadata is incomplete",
  "Content Structure": "Content structure is weak",
  "Schema Markup": "Schema markup is missing or incomplete",
  "Advanced Schema": "Advanced schema coverage is weak",
  "WCAG 2.2 Readiness": "Accessibility readiness is weak",
};

export const defaultScoreExplanation: ScoreExplanation = {
  scoreLabel: "Why your AI Visibility Score is 72",
  summary:
    "Your site has a solid technical baseline, but AI search systems may struggle to cite and summarize it confidently.",
  strengths: ["Entity clarity is strong", "Schema markup is present"],
  blockers: ["Citation readiness is weak", "Social metadata is incomplete"],
  quickWins: [
    "Add author and updated date",
    "Add Open Graph image",
    "Add Organization schema",
  ],
};

function filteredCategories(categories: CategoryScore[]): CategoryScore[] {
  return categories.filter((category) => !SKIP_CATEGORIES.has(category.label));
}

function getCategoryScore(
  categories: CategoryScore[],
  label: string,
): number | undefined {
  return categories.find((category) => category.label === label)?.score;
}

function buildStrengths(categories: CategoryScore[]): string[] {
  const items: string[] = [];

  for (const category of filteredCategories(categories)) {
    if (category.score < STRENGTH_THRESHOLD) {
      continue;
    }

    if (category.label === "Open Graph" || category.label === "Twitter Card") {
      continue;
    }

    items.push(
      CATEGORY_STRENGTH_PHRASE[category.label] ??
        `${category.label} is strong`,
    );
  }

  const og = getCategoryScore(categories, "Open Graph");
  const twitter = getCategoryScore(categories, "Twitter Card");

  if (
    (og !== undefined && og >= STRENGTH_THRESHOLD) ||
    (twitter !== undefined && twitter >= STRENGTH_THRESHOLD)
  ) {
    items.push("Social metadata is in good shape");
  }

  return items.slice(0, MAX_ITEMS);
}

function buildBlockers(categories: CategoryScore[]): string[] {
  const items: string[] = [];
  const og = getCategoryScore(categories, "Open Graph");
  const twitter = getCategoryScore(categories, "Twitter Card");
  const socialWeak =
    (og !== undefined && og < BLOCKER_THRESHOLD) ||
    (twitter !== undefined && twitter < BLOCKER_THRESHOLD);

  for (const category of filteredCategories(categories)) {
    if (category.score >= BLOCKER_THRESHOLD) {
      continue;
    }

    if (category.label === "Open Graph" || category.label === "Twitter Card") {
      continue;
    }

    items.push(
      CATEGORY_BLOCKER_PHRASE[category.label] ??
        `${category.label} is weak`,
    );
  }

  if (socialWeak) {
    items.push("Social metadata is incomplete");
  }

  return items.slice(0, MAX_ITEMS);
}

function shortenQuickWin(text: string): string {
  const trimmed = text.trim();

  if (trimmed.length <= 72) {
    return trimmed;
  }

  const sentence = trimmed.split(/[.!?]/)[0]?.trim();

  if (sentence && sentence.length <= 72) {
    return sentence;
  }

  return `${trimmed.slice(0, 69).trim()}...`;
}

function buildQuickWins(audit: AuditResponse): string[] {
  const issues = generatePriorityIssues(audit);
  const eligibleSeverities = new Set<PriorityIssueSeverity>(["Medium", "Low"]);
  const seen = new Set<string>();
  const items: string[] = [];

  for (const issue of issues) {
    if (!eligibleSeverities.has(issue.severity)) {
      continue;
    }

    const text = shortenQuickWin(issue.howToFix ?? issue.recommendation ?? issue.title);
    const key = text.toLowerCase();

    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    items.push(text);

    if (items.length >= MAX_QUICK_WINS) {
      break;
    }
  }

  if (items.length > 0) {
    return items;
  }

  for (const issue of issues) {
    if (issue.severity === "Critical") {
      continue;
    }

    const text = shortenQuickWin(issue.howToFix ?? issue.recommendation ?? issue.title);
    const key = text.toLowerCase();

    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    items.push(text);

    if (items.length >= MAX_QUICK_WINS) {
      break;
    }
  }

  return items;
}

function buildSummary(
  strengthCount: number,
  blockerCount: number,
): string {
  if (strengthCount >= 2 && blockerCount >= 2) {
    return "Your site has a solid technical baseline, but AI search systems may struggle to cite and summarize it confidently.";
  }

  if (blockerCount === 0 && strengthCount >= 3) {
    return "Your site is well positioned for AI search visibility with strong signals across most audit categories.";
  }

  if (blockerCount >= 3 && strengthCount <= 1) {
    return "Several core AI visibility signals need attention before search systems can confidently cite and summarize this site.";
  }

  if (blockerCount === 0) {
    return "Core audit categories are performing well, with only minor refinements needed for stronger AI visibility.";
  }

  if (strengthCount === 0) {
    return "Foundational SEO and AI visibility signals need improvement before this site can compete confidently in AI search results.";
  }

  return "Your audit score reflects a mix of strong foundations and specific gaps that limit AI citation and summarization confidence.";
}

export function generateScoreExplanation(audit: AuditResponse): ScoreExplanation {
  const normalized = normalizeAuditResponse(audit);

  if (!normalized) {
    return defaultScoreExplanation;
  }

  const scores = calculateAuditScores(normalized);
  const strengths = buildStrengths(scores.categories);
  const blockers = buildBlockers(scores.categories);
  const quickWins = buildQuickWins(normalized);

  return {
    scoreLabel: `Why your AI Visibility Score is ${scores.overallScore}`,
    summary: buildSummary(strengths.length, blockers.length),
    strengths,
    blockers,
    quickWins,
  };
}

export function buildPlaceholderScoreExplanation(score: number): ScoreExplanation {
  return {
    ...defaultScoreExplanation,
    scoreLabel: `Why your AI Visibility Score is ${score}`,
  };
}
