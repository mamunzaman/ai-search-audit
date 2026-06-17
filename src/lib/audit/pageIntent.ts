import type { AuditHeadings, AuditResponse } from "./types";

export const PAGE_INTENT_TYPES = [
  "homepage",
  "saas",
  "local-business",
  "ecommerce",
  "blog",
  "article",
  "documentation",
] as const;

export type PageIntentType = (typeof PAGE_INTENT_TYPES)[number];

export type PageIntent = {
  intent: PageIntentType;
  confidence: number;
  reasons: string[];
};

export type PageIntentInput = {
  pageUrl: string;
  title: string;
  metaDescription?: string;
  headings: AuditHeadings;
  schemaTypes: string[];
  hasFaqSchema: boolean;
  hasFaqText: boolean;
  questionHeadingCount?: number;
};

type IntentScoreMap = Record<PageIntentType, number>;

const DEFAULT_CATEGORY_WEIGHT = 1;

const SAAS_LANDING_WEIGHTS: Partial<Record<string, number>> = {
  "Citation Readiness": 0.15,
  "FAQ Readiness": 0.15,
  "Answer Extraction": 0.15,
  "Entity Clarity": 1.6,
  "Trust Signals": 1.7,
  "Schema Markup": 1.65,
  "Advanced Schema": 1.4,
  "AI Visibility": 1.8,
  "AI Answer Readiness": 1.4,
  "SEO Health": 1.25,
  "Open Graph": 1.25,
  "Content Structure": 1.2,
  "WCAG 2.2 Readiness": 0.7,
};

const CONTENT_PAGE_WEIGHTS: Partial<Record<string, number>> = {
  "Citation Readiness": 1.65,
  "FAQ Readiness": 1.55,
  "Answer Extraction": 1.6,
  "AI Answer Readiness": 1.45,
  "Content Structure": 1.35,
  "Entity Clarity": 1.1,
  "AI Visibility": 1.15,
};

const ECOMMERCE_WEIGHTS: Partial<Record<string, number>> = {
  "Citation Readiness": 0.55,
  "FAQ Readiness": 0.65,
  "Answer Extraction": 0.55,
  "Schema Markup": 1.45,
  "Advanced Schema": 1.35,
  "Trust Signals": 1.35,
  "Open Graph": 1.4,
  "Entity Clarity": 1.25,
  "AI Visibility": 1.35,
};

const LOCAL_BUSINESS_WEIGHTS: Partial<Record<string, number>> = {
  "Citation Readiness": 0.45,
  "FAQ Readiness": 0.55,
  "Answer Extraction": 0.45,
  "AI Answer Readiness": 0.55,
  "Trust Signals": 1.7,
  "Entity Clarity": 1.55,
  "Schema Markup": 1.45,
  "AI Visibility": 1.4,
};

const DOCUMENTATION_WEIGHTS: Partial<Record<string, number>> = {
  "Citation Readiness": 0.75,
  "FAQ Readiness": 0.9,
  "Answer Extraction": 1.35,
  "AI Answer Readiness": 1.25,
  "Content Structure": 1.45,
  "Schema Markup": 1.3,
  "Advanced Schema": 1.25,
  "AI Visibility": 1.2,
};

const INTENT_CATEGORY_WEIGHTS: Record<PageIntentType, Partial<Record<string, number>>> = {
  homepage: SAAS_LANDING_WEIGHTS,
  saas: SAAS_LANDING_WEIGHTS,
  "local-business": LOCAL_BUSINESS_WEIGHTS,
  ecommerce: ECOMMERCE_WEIGHTS,
  blog: CONTENT_PAGE_WEIGHTS,
  article: CONTENT_PAGE_WEIGHTS,
  documentation: DOCUMENTATION_WEIGHTS,
};

type OverallCompositionWeights = {
  checks: number;
  categories: number;
};

const NEUTRAL_OVERALL_COMPOSITION: OverallCompositionWeights = {
  checks: 0.5,
  categories: 0.5,
};

const MARKETING_OVERALL_COMPOSITION: OverallCompositionWeights = {
  checks: 0.04,
  categories: 0.96,
};

const INTENT_OVERALL_COMPOSITION: Record<PageIntentType, OverallCompositionWeights> = {
  homepage: MARKETING_OVERALL_COMPOSITION,
  saas: MARKETING_OVERALL_COMPOSITION,
  "local-business": { checks: 0.2, categories: 0.8 },
  ecommerce: MARKETING_OVERALL_COMPOSITION,
  blog: { checks: 0.35, categories: 0.65 },
  article: { checks: 0.35, categories: 0.65 },
  documentation: { checks: 0.25, categories: 0.75 },
};

function initIntentScores(): IntentScoreMap {
  return {
    homepage: 0,
    saas: 0,
    "local-business": 0,
    ecommerce: 0,
    blog: 0,
    article: 0,
    documentation: 0,
  };
}

function addScore(
  scores: IntentScoreMap,
  intent: PageIntentType,
  points: number,
  reasons: string[],
  reason: string,
): void {
  scores[intent] += points;
  reasons.push(reason);
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function schemaIncludes(schemaTypes: string[], types: string[]): boolean {
  const normalized = schemaTypes.map((type) => type.toLowerCase());
  return types.some((type) => normalized.includes(type.toLowerCase()));
}

function collectHeadingText(headings: AuditHeadings): string {
  return [
    ...headings.h1,
    ...headings.h2,
    ...headings.h3,
    ...headings.h4,
    ...headings.h5,
    ...headings.h6,
  ]
    .join(" ")
    .toLowerCase();
}

function getUrlSignals(pageUrl: string): {
  pathname: string;
  isRoot: boolean;
  segments: string[];
} {
  try {
    const pathname = new URL(pageUrl).pathname.replace(/\/+$/, "") || "/";
    const segments = pathname.split("/").filter(Boolean);
    return {
      pathname: pathname.toLowerCase(),
      isRoot: pathname === "/",
      segments: segments.map((segment) => segment.toLowerCase()),
    };
  } catch {
    return { pathname: "/", isRoot: true, segments: [] };
  }
}

export function detectPageIntent(input: PageIntentInput): PageIntent {
  const scores = initIntentScores();
  const reasons: string[] = [];
  const title = normalizeText(input.title);
  const meta = normalizeText(input.metaDescription ?? "");
  const headingText = collectHeadingText(input.headings);
  const combined = `${title} ${meta} ${headingText}`;
  const { pathname, isRoot, segments } = getUrlSignals(input.pageUrl);
  const firstSegment = segments[0] ?? "";

  if (isRoot) {
    addScore(scores, "homepage", 4, reasons, "Root URL path indicates a homepage.");
    addScore(scores, "saas", 2, reasons, "Root URL often serves a marketing landing page.");
  }

  if (includesAny(firstSegment, ["blog", "blogs", "news", "insights", "articles"])) {
    addScore(scores, "blog", 5, reasons, `URL segment "/${firstSegment}" suggests a blog hub.`);
  }

  if (
    includesAny(firstSegment, ["article", "post", "posts", "story", "stories"]) ||
    /\/\d{4}\/\d{2}\//.test(pathname)
  ) {
    addScore(scores, "article", 5, reasons, "URL pattern resembles an article page.");
  }

  if (
    includesAny(firstSegment, [
      "docs",
      "doc",
      "documentation",
      "developers",
      "developer",
      "api",
      "reference",
      "learn",
      "help",
      "support",
    ])
  ) {
    addScore(scores, "documentation", 5, reasons, `URL segment "/${firstSegment}" suggests documentation.`);
  }

  if (
    includesAny(firstSegment, [
      "product",
      "products",
      "shop",
      "store",
      "collections",
      "cart",
      "checkout",
      "catalog",
    ])
  ) {
    addScore(scores, "ecommerce", 5, reasons, `URL segment "/${firstSegment}" suggests commerce content.`);
  }

  if (
    includesAny(firstSegment, [
      "pricing",
      "features",
      "platform",
      "solutions",
      "enterprise",
      "customers",
    ])
  ) {
    addScore(scores, "saas", 4, reasons, `URL segment "/${firstSegment}" suggests SaaS marketing.`);
  }

  if (schemaIncludes(input.schemaTypes, ["BlogPosting", "NewsArticle", "Article"])) {
    addScore(scores, "article", 5, reasons, "Article-style schema types were detected.");
    addScore(scores, "blog", 2, reasons, "Article schema often appears on blog content.");
  }

  if (schemaIncludes(input.schemaTypes, ["Product", "Offer", "AggregateOffer"])) {
    addScore(scores, "ecommerce", 5, reasons, "Product or offer schema types were detected.");
  }

  if (schemaIncludes(input.schemaTypes, ["LocalBusiness", "Restaurant", "Store"])) {
    addScore(scores, "local-business", 6, reasons, "Local business schema types were detected.");
  }

  if (schemaIncludes(input.schemaTypes, ["SoftwareApplication", "WebApplication"])) {
    addScore(scores, "saas", 4, reasons, "Software application schema suggests a SaaS product.");
  }

  if (schemaIncludes(input.schemaTypes, ["WebSite", "Organization"])) {
    addScore(scores, "homepage", 2, reasons, "Organization or WebSite schema supports a site homepage.");
    addScore(scores, "saas", 2, reasons, "Organization schema is common on SaaS homepages.");
  }

  if (input.hasFaqSchema) {
    addScore(scores, "article", 1, reasons, "FAQ schema is present.");
    addScore(scores, "documentation", 2, reasons, "FAQ schema can indicate support/documentation content.");
  } else if (input.hasFaqText || (input.questionHeadingCount ?? 0) > 0) {
    addScore(scores, "blog", 1, reasons, "FAQ-style on-page content was detected.");
    addScore(scores, "article", 1, reasons, "Question-style headings resemble article/support content.");
  }

  if (
    includesAny(combined, [
      "pricing",
      "free trial",
      "get started",
      "platform",
      "enterprise",
      "developers",
      "api",
      "cloud",
      "dashboard",
      "customers",
      "solutions",
    ])
  ) {
    addScore(scores, "saas", 4, reasons, "Marketing/SaaS language appears in title, meta, or headings.");
  }

  if (
    includesAny(combined, [
      "blog",
      "news",
      "insights",
      "posted by",
      "written by",
      "author",
      "minute read",
    ])
  ) {
    addScore(scores, "blog", 3, reasons, "Blog or editorial language appears on the page.");
    addScore(scores, "article", 2, reasons, "Author or article cues were detected.");
  }

  if (
    includesAny(combined, [
      "documentation",
      "api reference",
      "getting started",
      "quickstart",
      "sdk",
      "developer docs",
      "changelog",
    ])
  ) {
    addScore(scores, "documentation", 4, reasons, "Documentation-oriented language was detected.");
  }

  if (
    includesAny(combined, [
      "add to cart",
      "buy now",
      "shop",
      "shipping",
      "checkout",
      "collection",
      "product",
    ])
  ) {
    addScore(scores, "ecommerce", 4, reasons, "Commerce-oriented language was detected.");
  }

  if (
    includesAny(combined, [
      "near me",
      "locations",
      "hours",
      "visit us",
      "our office",
      "serving",
      "local",
    ])
  ) {
    addScore(scores, "local-business", 4, reasons, "Local business language was detected.");
  }

  const ranked = PAGE_INTENT_TYPES.map((intent) => ({
    intent,
    score: scores[intent],
  })).sort((left, right) => right.score - left.score);

  const winner = ranked[0];
  const runnerUp = ranked[1];
  const winnerScore = winner?.score ?? 0;
  const runnerUpScore = runnerUp?.score ?? 0;

  if (winnerScore <= 0) {
    return {
      intent: isRoot ? "homepage" : "saas",
      confidence: isRoot ? 0.55 : 0.4,
      reasons: [
        ...reasons,
        isRoot
          ? "No strong intent signals found; defaulting to homepage."
          : "No strong intent signals found; defaulting to SaaS/marketing page.",
      ],
    };
  }

  const margin = winnerScore - runnerUpScore;
  const confidence = clamp(0.45 + winnerScore * 0.06 + margin * 0.05, 0.45, 0.98);

  return {
    intent: winner.intent,
    confidence: Number(confidence.toFixed(2)),
    reasons,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function detectPageIntentFromAudit(audit: AuditResponse): PageIntent {
  return detectPageIntent({
    pageUrl: audit.finalUrl || audit.url,
    title: audit.title,
    metaDescription: audit.metaDescription,
    headings: audit.headings,
    schemaTypes: audit.schemaTypes,
    hasFaqSchema: audit.aiVisibilitySignals.faqSchema,
    hasFaqText: audit.readabilityAnalysis.hasFAQText,
    questionHeadingCount: audit.readabilityAnalysis.questionHeadingCount,
  });
}

export function getCategoryWeightsForIntent(
  intent: PageIntentType,
): Partial<Record<string, number>> {
  return { ...INTENT_CATEGORY_WEIGHTS[intent] };
}

export function getCategoryWeight(
  intent: PageIntentType,
  categoryLabel: string,
): number {
  return INTENT_CATEGORY_WEIGHTS[intent][categoryLabel] ?? DEFAULT_CATEGORY_WEIGHT;
}

export function calculateIntentWeightedCategoryAverage(
  categoryScores: Array<{ label: string; score: number }>,
  pageIntent: PageIntent,
): number {
  if (categoryScores.length === 0) {
    return 0;
  }

  const flatAverage =
    categoryScores.reduce((sum, category) => sum + category.score, 0) /
    categoryScores.length;

  let weightedSum = 0;
  let weightTotal = 0;

  for (const category of categoryScores) {
    const weight = getCategoryWeight(pageIntent.intent, category.label);
    weightedSum += category.score * weight;
    weightTotal += weight;
  }

  const intentAverage = weightTotal > 0 ? weightedSum / weightTotal : flatAverage;
  const blend = clamp(pageIntent.confidence, 0, 1);

  return flatAverage * (1 - blend) + intentAverage * blend;
}

export function calculateIntentAwareOverallScore(
  overallFromChecks: number,
  categoryAverage: number,
  pageIntent: PageIntent,
): number {
  const intentComposition = INTENT_OVERALL_COMPOSITION[pageIntent.intent];
  const blend = clamp(pageIntent.confidence, 0, 1);
  const marketingIntents: PageIntentType[] = ["homepage", "saas", "ecommerce"];

  if (
    blend >= 0.8 &&
    marketingIntents.includes(pageIntent.intent)
  ) {
    return Math.round(categoryAverage);
  }

  const checksWeight =
    NEUTRAL_OVERALL_COMPOSITION.checks * (1 - blend) +
    intentComposition.checks * blend;
  const categoriesWeight =
    NEUTRAL_OVERALL_COMPOSITION.categories * (1 - blend) +
    intentComposition.categories * blend;
  const weightTotal = checksWeight + categoriesWeight;

  if (weightTotal <= 0) {
    return Math.round(categoryAverage);
  }

  const weightedScore =
    overallFromChecks * checksWeight + categoryAverage * categoriesWeight;

  return Math.round(weightedScore / weightTotal);
}
