import type {
  AuditCheck,
  AuditCheckStatus,
  AuditRecommendation,
  AuditResponse,
  AuditScoreResult,
  CategoryScore,
  CategoryScoreStatus,
  PriorityImpact,
  PriorityIssue,
} from "./types";
import {
  getAnswerExtractionSummary,
} from "./answerExtractionAudit";
import {
  getAdvancedSchemaAuditSummary,
} from "./advancedSchemaAudit";
import {
  getTwitterCardAuditSummary,
} from "./twitterCardAudit";
import {
  getOpenGraphAuditSummary,
} from "./openGraphAudit";
import {
  getTrustSignalsAuditSummary,
} from "./trustSignalsAudit";
import {
  getCitationReadinessSummary,
} from "./citationReadinessAudit";
import {
  getEntityClaritySummary,
} from "./entityClarityAudit";
import {
  getAccessibilityAnalysis,
  getAiVisibilitySignals,
  getEntityAnalysis,
  getReadabilityAnalysis,
  getRobotsAnalysis,
  getSitemapAnalysis,
  getSocialMetadata,
  getTechnicalSignals,
  normalizeAuditResponse,
} from "./audit-normalize";
import {
  formatEntitySourceMessage,
} from "./entity-extraction";
import {
  hasEnoughBodyContent,
  hasScannableParagraphs,
  hasStructuredContentBlocks,
  isEasyForAiAnswerExtraction,
} from "./readability-check";
import {
  hasCompleteOpenGraph,
  hasTwitterCard,
} from "./social-metadata";

const FAIL_PENALTY = 15;
const WARN_PENALTY = 7;
const GENTLE_WARN_SCORE = 75;

function getTechnicalSignalById(
  audit: AuditResponse,
  id: string,
): ReturnType<typeof getTechnicalSignals>[number] | undefined {
  return getTechnicalSignals(audit).find((signal) => signal.id === id);
}

function technicalSignalToGentleScore(
  status: "pass" | "warning" | "fail" | undefined,
): { score: number; status: AuditCheckStatus } {
  if (status === "pass") {
    return { score: 100, status: "pass" };
  }

  if (status === "fail") {
    return { score: 50, status: "fail" };
  }

  return { score: GENTLE_WARN_SCORE, status: "warn" };
}

function appendTechnicalNarratives(
  audit: AuditResponse,
  signalIds: string[],
  targets: {
    positives: string[];
    problems: string[];
    recommendations: string[];
  },
): void {
  for (const id of signalIds) {
    const signal = getTechnicalSignalById(audit, id);

    if (!signal) {
      continue;
    }

    if (signal.status === "pass") {
      targets.positives.push(signal.summary);
      continue;
    }

    targets.problems.push(signal.summary);

    if (signal.recommendation) {
      targets.recommendations.push(signal.recommendation);
    }
  }
}

type CategoryDraft = {
  id: string;
  label: string;
  score: number;
  status: CategoryScoreStatus;
  issueCount: number;
  summary: string;
  positives: string[];
  problems: string[];
  recommendations: string[];
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(
    values.reduce((total, value) => total + value, 0) / values.length,
  );
}

function checkToPoints(status: AuditCheckStatus): number {
  if (status === "pass") {
    return 100;
  }

  if (status === "warn") {
    return 50;
  }

  return 0;
}

function getCheck(audit: AuditResponse, id: string): AuditCheck | undefined {
  return audit.checks.find((check) => check.id === id);
}

function deriveCategoryStatus(
  scores: number[],
  statuses: AuditCheckStatus[],
): CategoryScoreStatus {
  const score = average(scores);

  if (statuses.includes("fail") || score < 50) {
    return "fail";
  }

  if (statuses.includes("warn") || score < 80) {
    return "warning";
  }

  return "pass";
}

function hasSchemaType(audit: AuditResponse, type: string): boolean {
  return audit.schemaTypes.some(
    (schemaType) => schemaType.toLowerCase() === type.toLowerCase(),
  );
}

function buildCategoryScore(
  label: string,
  scores: number[],
  statuses: AuditCheckStatus[],
): Pick<CategoryScore, "label" | "score" | "status" | "issueCount"> {
  return {
    label,
    score: average(scores),
    status: deriveCategoryStatus(scores, statuses),
    issueCount: statuses.filter((status) => status !== "pass").length,
  };
}

function finalizeCategory(draft: CategoryDraft): CategoryScore {
  return draft;
}

export function calculateOverallScoreFromChecks(checks: AuditCheck[]): number {
  let score = 100;

  for (const check of checks) {
    if (check.status === "fail") {
      score -= FAIL_PENALTY;
    } else if (check.status === "warn") {
      score -= WARN_PENALTY;
    }
  }

  return clamp(score, 0, 100);
}

function scoreSeoHealth(audit: AuditResponse): CategoryScore {
  const robotsReachable = technicalSignalToGentleScore(
    getTechnicalSignalById(audit, "robots-txt-reachable")?.status,
  );
  const sitemapDiscovered = technicalSignalToGentleScore(
    getTechnicalSignalById(audit, "sitemap-discovered")?.status,
  );
  const checks = [
    getCheck(audit, "title-exists"),
    getCheck(audit, "meta-description-exists"),
    getCheck(audit, "one-h1-exists"),
    getCheck(audit, "canonical-exists"),
  ].filter((check): check is AuditCheck => Boolean(check));

  const scores = [
    ...checks.map((check) => checkToPoints(check.status)),
    robotsReachable.score,
    sitemapDiscovered.score,
  ];
  const statuses = [
    ...checks.map((check) => check.status),
    robotsReachable.status,
    sitemapDiscovered.status,
  ];
  const base = buildCategoryScore("SEO Health", scores, statuses);
  const positives: string[] = [];
  const problems: string[] = [];
  const recommendations: string[] = [];

  if (audit.title) {
    positives.push("Title tag is present.");
  } else {
    problems.push("No page title found.");
    recommendations.push("Add a descriptive title tag.");
  }

  if (audit.metaDescription) {
    positives.push("Meta description is present.");
  } else {
    problems.push("Meta description is missing.");
    recommendations.push("Improve meta description.");
  }

  if (audit.headings.h1.length === 1) {
    positives.push("Exactly one H1 heading was found.");
  } else {
    problems.push(
      `Expected one H1, found ${audit.headings.h1.length}.`,
    );
    recommendations.push("Add one clear H1.");
  }

  if (audit.canonical) {
    positives.push("Canonical URL is set.");
  } else {
    problems.push("Canonical link tag is missing.");
    recommendations.push("Add a canonical URL.");
  }

  appendTechnicalNarratives(audit, [
    "robots-txt-reachable",
    "robots-sitemap-declared",
    "sitemap-discovered",
    "sitemap-valid-xml",
  ], { positives, problems, recommendations });

  const summary =
    problems.length === 0
      ? "Core SEO tags are present and correctly configured."
      : `${problems.length} core SEO element(s) need attention.`;

  return finalizeCategory({
    id: "seo-health",
    ...base,
    summary,
    positives,
    problems,
    recommendations,
  });
}

function scoreSchemaMarkup(audit: AuditResponse): CategoryScore {
  const check = getCheck(audit, "json-ld-schema-detected");
  const status = check?.status ?? "fail";
  const score = checkToPoints(status);
  const positives: string[] = [];
  const problems: string[] = [];
  const recommendations: string[] = [];

  if (audit.schemaTypes.length > 0) {
    positives.push(
      `Detected ${audit.schemaTypes.length} schema type(s): ${audit.schemaTypes.join(", ")}.`,
    );

    if (hasSchemaType(audit, "Organization")) {
      positives.push("Organization schema helps identify the site entity.");
    }
  } else {
    problems.push("No JSON-LD schema was detected.");
    recommendations.push("Add structured data markup.");
  }

  if (!hasSchemaType(audit, "FAQPage")) {
    problems.push("FAQPage schema is not present (tracked under FAQ Readiness).");
  }

  const sitemapSignal = getTechnicalSignalById(audit, "sitemap-discovered");
  if (sitemapSignal?.status !== "pass") {
    recommendations.push(
      sitemapSignal?.recommendation ??
        "Publish sitemap.xml and declare it in robots.txt for structured discovery.",
    );
  }

  const summary =
    audit.schemaTypes.length > 0
      ? `Structured data found with ${audit.schemaTypes.length} schema type(s).`
      : "No structured data markup was detected on this page.";

  return finalizeCategory({
    id: "schema-markup",
    label: "Schema Markup",
    score,
    status:
      status === "fail" ? "fail" : status === "warn" ? "warning" : "pass",
    issueCount: audit.schemaTypes.length === 0 ? 1 : 0,
    summary,
    positives,
    problems,
    recommendations,
  });
}

function scoreContentStructure(audit: AuditResponse): CategoryScore {
  const internalCheck = getCheck(audit, "internal-links-found");
  const sitemapAnalysis = getSitemapAnalysis(audit);
  const readability = getReadabilityAnalysis(audit);
  const hasSitemapUrls =
    sitemapAnalysis.urlCount > 0 || sitemapAnalysis.childSitemapCount > 0;
  const enoughContent = hasEnoughBodyContent(readability);
  const scannableParagraphs = hasScannableParagraphs(readability);
  const structuredBlocks = hasStructuredContentBlocks(readability);
  const signals: { score: number; status: AuditCheckStatus }[] = [
    {
      score: audit.headings.h1.length >= 1 ? 100 : 0,
      status: audit.headings.h1.length >= 1 ? "pass" : "fail",
    },
    {
      score: audit.headings.h2.length >= 1 ? 100 : 50,
      status: audit.headings.h2.length >= 1 ? "pass" : "warn",
    },
    {
      score: audit.headings.h3.length >= 1 ? 100 : 50,
      status: audit.headings.h3.length >= 1 ? "pass" : "warn",
    },
    {
      score: internalCheck ? checkToPoints(internalCheck.status) : 0,
      status: internalCheck?.status ?? "fail",
    },
    {
      score: hasSitemapUrls ? 100 : 50,
      status: hasSitemapUrls ? "pass" : "warn",
    },
    {
      score: enoughContent ? 100 : readability.wordCount >= 100 ? 50 : 0,
      status: enoughContent ? "pass" : readability.wordCount >= 100 ? "warn" : "fail",
    },
    {
      score: scannableParagraphs ? 100 : readability.paragraphCount > 0 ? 50 : 0,
      status: scannableParagraphs
        ? "pass"
        : readability.paragraphCount > 0
          ? "warn"
          : "fail",
    },
    {
      score: structuredBlocks ? 100 : 50,
      status: structuredBlocks ? "pass" : "warn",
    },
  ];

  const base = buildCategoryScore(
    "Content Structure",
    signals.map((signal) => signal.score),
    signals.map((signal) => signal.status),
  );
  const positives: string[] = [];
  const problems: string[] = [];
  const recommendations: string[] = [];

  positives.push(
    `Heading counts: H1 ${audit.headings.h1.length}, H2 ${audit.headings.h2.length}, H3 ${audit.headings.h3.length}.`,
  );

  if (audit.headings.h1.length !== 1) {
    problems.push("Page should have exactly one H1 for clear hierarchy.");
    recommendations.push("Add one clear H1.");
  }

  if (audit.headings.h2.length === 0) {
    problems.push("No H2 subheadings found to break up content.");
  }

  if (audit.headings.h3.length === 0) {
    problems.push("No H3 subheadings found for deeper content structure.");
  }

  if (audit.links.internal > 0) {
    positives.push(`${audit.links.internal} internal links support navigation.`);
  } else {
    problems.push("No internal links were found.");
    recommendations.push("Add internal links.");
  }

  if (sitemapAnalysis.exists) {
    if (sitemapAnalysis.urlCount > 0) {
      positives.push(
        `Sitemap lists ${sitemapAnalysis.urlCount} URL(s) for site structure discovery.`,
      );
    } else if (sitemapAnalysis.childSitemapCount > 0) {
      positives.push(
        `Sitemap index references ${sitemapAnalysis.childSitemapCount} child sitemap(s).`,
      );
    } else {
      problems.push("Sitemap was found but no URLs were discovered.");
    }
  } else {
    problems.push("No sitemap.xml could be fetched for content discovery.");
  }

  if (enoughContent) {
    positives.push(
      `${readability.wordCount} words and ${readability.paragraphCount} paragraphs provide usable body depth.`,
    );
  } else {
    problems.push(
      `Only ${readability.wordCount} words detected; content depth is limited for AI extraction.`,
    );
  }

  if (scannableParagraphs) {
    positives.push(
      `Paragraphs average ${readability.averageParagraphWords} words, which is scannable for AI parsing.`,
    );
  } else if (readability.paragraphCount > 0) {
    problems.push(
      `Paragraphs average ${readability.averageParagraphWords} words; shorter blocks improve scannability.`,
    );
  } else {
    problems.push("No scannable paragraph structure was detected.");
  }

  if (structuredBlocks) {
    positives.push(
      `${readability.listCount} list(s) and ${readability.tableCount} table(s) add structured content blocks.`,
    );
  } else {
    problems.push("No lists or tables were found to structure page content.");
  }

  const summary = enoughContent && scannableParagraphs
    ? `Content uses ${audit.headings.h1.length + audit.headings.h2.length + audit.headings.h3.length} headings, ${readability.wordCount} words, and scannable paragraph blocks.`
    : `Content structure is limited with ${readability.wordCount} words and ${readability.paragraphCount} paragraph(s).`;

  return finalizeCategory({
    id: "content-structure",
    ...base,
    summary,
    positives,
    problems,
    recommendations,
  });
}

function scoreTrustSignals(audit: AuditResponse): CategoryScore {
  const trustAudit = audit.trustSignalsAudit;
  const positives: string[] = [];
  const problems: string[] = [];
  const recommendations: string[] = [];

  for (const finding of trustAudit.findings) {
    if (finding.status === "pass") {
      positives.push(finding.message);
      continue;
    }

    problems.push(finding.message);

    if (finding.recommendation) {
      recommendations.push(finding.recommendation);
    }
  }

  let status: CategoryScoreStatus;

  if (trustAudit.status === "good") {
    status = "pass";
  } else if (trustAudit.status === "warning") {
    status = "warning";
  } else {
    status = "fail";
  }

  return finalizeCategory({
    id: "trust-signals",
    label: "Trust Signals",
    score: trustAudit.score,
    status,
    issueCount: Math.max(trustAudit.issues.length, problems.length > 0 ? 1 : 0),
    summary: getTrustSignalsAuditSummary(trustAudit),
    positives,
    problems,
    recommendations,
  });
}

function scoreOpenGraph(audit: AuditResponse): CategoryScore {
  const ogAudit = audit.openGraphAudit;
  const positives: string[] = [];
  const problems: string[] = [];
  const recommendations: string[] = [];

  for (const finding of ogAudit.findings) {
    if (finding.status === "pass") {
      positives.push(finding.message);
      continue;
    }

    problems.push(finding.message);

    if (finding.recommendation) {
      recommendations.push(finding.recommendation);
    }
  }

  let status: CategoryScoreStatus;

  if (ogAudit.status === "good") {
    status = "pass";
  } else if (ogAudit.status === "warning") {
    status = "warning";
  } else {
    status = "fail";
  }

  return finalizeCategory({
    id: "open-graph",
    label: "Open Graph",
    score: ogAudit.score,
    status,
    issueCount: Math.max(ogAudit.issues.length, problems.length > 0 ? 1 : 0),
    summary: getOpenGraphAuditSummary(ogAudit),
    positives,
    problems,
    recommendations,
  });
}

function scoreTwitterCard(audit: AuditResponse): CategoryScore {
  const twitterAudit = audit.twitterCardAudit;
  const positives: string[] = [];
  const problems: string[] = [];
  const recommendations: string[] = [];

  for (const finding of twitterAudit.findings) {
    if (finding.status === "pass") {
      positives.push(finding.message);
      continue;
    }

    problems.push(finding.message);

    if (finding.recommendation) {
      recommendations.push(finding.recommendation);
    }
  }

  let status: CategoryScoreStatus;

  if (twitterAudit.status === "good") {
    status = "pass";
  } else if (twitterAudit.status === "warning") {
    status = "warning";
  } else {
    status = "fail";
  }

  return finalizeCategory({
    id: "twitter-card",
    label: "Twitter Card",
    score: twitterAudit.score,
    status,
    issueCount: Math.max(twitterAudit.issues.length, problems.length > 0 ? 1 : 0),
    summary: getTwitterCardAuditSummary(twitterAudit),
    positives,
    problems,
    recommendations,
  });
}

function scoreAdvancedSchema(audit: AuditResponse): CategoryScore {
  const schemaAudit = audit.advancedSchemaAudit;
  const positives: string[] = [];
  const problems: string[] = [];
  const recommendations: string[] = [];

  for (const finding of schemaAudit.findings) {
    if (finding.status === "pass") {
      positives.push(finding.message);
      continue;
    }

    problems.push(finding.message);

    if (finding.recommendation) {
      recommendations.push(finding.recommendation);
    }
  }

  let status: CategoryScoreStatus;

  if (schemaAudit.status === "good") {
    status = "pass";
  } else if (schemaAudit.status === "warning") {
    status = "warning";
  } else {
    status = "fail";
  }

  return finalizeCategory({
    id: "advanced-schema",
    label: "Advanced Schema",
    score: schemaAudit.score,
    status,
    issueCount: Math.max(schemaAudit.issues.length, problems.length > 0 ? 1 : 0),
    summary: getAdvancedSchemaAuditSummary(schemaAudit),
    positives,
    problems,
    recommendations,
  });
}

function scoreAiVisibility(audit: AuditResponse): CategoryScore {
  const signals = getAiVisibilitySignals(audit);
  const sitemapAnalysis = getSitemapAnalysis(audit);
  const socialMetadata = getSocialMetadata(audit);
  const entityAnalysis = getEntityAnalysis(audit);
  const hasCompleteOg = hasCompleteOpenGraph(socialMetadata);
  const hasTwitter = hasTwitterCard(socialMetadata);
  const hasPrimaryEntity = Boolean(entityAnalysis.primaryEntity);
  const hasRelatedEntities = entityAnalysis.relatedEntities.length > 0;
  const hasSitemapUrls =
    sitemapAnalysis.urlCount > 0 || sitemapAnalysis.childSitemapCount > 0;
  const robotsAnalysis = getRobotsAnalysis(audit);
  const aiCrawlerAccess = technicalSignalToGentleScore(
    getTechnicalSignalById(audit, "robots-ai-crawler-access")?.status,
  );
  const signalEntries: { score: number; status: AuditCheckStatus }[] = [
    {
      score: signals.organizationSchema ? 100 : 50,
      status: signals.organizationSchema ? "pass" : "warn",
    },
    {
      score: signals.faqSchema ? 100 : 50,
      status: signals.faqSchema ? "pass" : "warn",
    },
    {
      score: signals.clearH1 ? 100 : 0,
      status: signals.clearH1 ? "pass" : "fail",
    },
    {
      score: signals.metaDescription ? 100 : 0,
      status: signals.metaDescription ? "pass" : "fail",
    },
    {
      score: signals.structuredHeadings ? 100 : 50,
      status: signals.structuredHeadings ? "pass" : "warn",
    },
    {
      score: signals.internalLinks ? 100 : 50,
      status: signals.internalLinks ? "pass" : "warn",
    },
    {
      score: signals.trustPages ? 100 : 50,
      status: signals.trustPages ? "pass" : "warn",
    },
    {
      score: hasSitemapUrls ? 100 : 50,
      status: hasSitemapUrls ? "pass" : "warn",
    },
    {
      score: hasCompleteOg ? 100 : 50,
      status: hasCompleteOg ? "pass" : "warn",
    },
    {
      score: hasTwitter ? 100 : 50,
      status: hasTwitter ? "pass" : "warn",
    },
    {
      score: hasPrimaryEntity
        ? entityAnalysis.confidence >= 75
          ? 100
          : 75
        : 40,
      status: hasPrimaryEntity
        ? entityAnalysis.confidence >= 75
          ? "pass"
          : "warn"
        : "fail",
    },
    {
      score: hasRelatedEntities ? 100 : 50,
      status: hasRelatedEntities ? "pass" : "warn",
    },
    aiCrawlerAccess,
  ];

  const base = buildCategoryScore(
    "AI Visibility",
    signalEntries.map((signal) => signal.score),
    signalEntries.map((signal) => signal.status),
  );
  const positives: string[] = [];
  const problems: string[] = [];
  const recommendations: string[] = [];

  if (signals.organizationSchema) {
    positives.push("Organization schema supports machine-readable entity context.");
  } else {
    problems.push("Organization schema is missing for AI entity mapping.");
    recommendations.push("Add Organization schema.");
  }

  if (signals.faqSchema) {
    positives.push("FAQPage schema improves AI answer eligibility.");
  }

  if (signals.clearH1) {
    positives.push("A single clear H1 defines the main topic for AI parsing.");
  } else {
    problems.push("H1 structure is unclear for AI systems.");
    recommendations.push("Add one clear H1.");
  }

  if (signals.metaDescription) {
    positives.push("Meta description provides a machine-readable page summary.");
  } else {
    problems.push("Missing meta description reduces AI visibility.");
    recommendations.push("Improve meta description.");
  }

  if (signals.structuredHeadings) {
    positives.push("Heading hierarchy is structured for AI readability.");
  } else {
    problems.push("Heading hierarchy is not structured enough for AI parsing.");
  }

  if (signals.internalLinks) {
    positives.push("Internal links help AI systems understand site depth.");
  } else {
    problems.push("No internal links limit AI navigation context.");
    recommendations.push("Add internal links.");
  }

  if (signals.trustPages) {
    positives.push("Trust pages (about/contact/legal) strengthen AI confidence.");
  } else {
    problems.push("Trust pages are missing from detected navigation.");
  }

  if (hasSitemapUrls) {
    positives.push(
      `Sitemap exposes ${sitemapAnalysis.urlCount || sitemapAnalysis.childSitemapCount} discoverable URL(s) for AI crawling.`,
    );
  } else {
    problems.push("No sitemap URLs were discovered for AI crawl discovery.");
  }

  if (hasCompleteOg) {
    positives.push(
      "Complete Open Graph metadata helps AI systems and platforms summarize this page.",
    );
  } else {
    problems.push("Open Graph metadata is incomplete for AI and social summaries.");
    recommendations.push("Add og:title, og:description, and og:image tags.");
  }

  if (hasTwitter) {
    positives.push(
      `Twitter Card metadata (${socialMetadata.twitter.card}) improves preview consistency.`,
    );
  } else {
    problems.push("Twitter Card metadata is missing for social/AI preview channels.");
    recommendations.push("Add twitter:card and related Twitter meta tags.");
  }

  if (hasPrimaryEntity) {
    positives.push(formatEntitySourceMessage(entityAnalysis));
  } else {
    problems.push("No primary entity was detected for LLM visibility.");
    recommendations.push("Add Organization schema with a clear entity name.");
  }

  if (hasRelatedEntities) {
    positives.push(
      `Related entities extracted for LLM context: ${entityAnalysis.relatedEntities.join(", ")}.`,
    );
  } else {
    problems.push("No related entity terms were extracted from page content.");
  }

  if (robotsAnalysis.blockedAiCrawlers.length > 0) {
    problems.push(
      `AI crawlers blocked in robots.txt: ${robotsAnalysis.blockedAiCrawlers.join(", ")}.`,
    );
    recommendations.push(
      "Review robots.txt if AI visibility matters for your content strategy.",
    );
  } else if (robotsAnalysis.reachability === "reachable") {
    positives.push("No common AI crawler blocks detected in robots.txt.");
  }

  appendTechnicalNarratives(audit, ["sitemap-url-count"], {
    positives,
    problems,
    recommendations,
  });

  const summary =
    base.score >= 80
      ? "Core AI visibility signals are largely in place."
      : "Several AI visibility signals are missing or weak.";

  return finalizeCategory({
    id: "ai-visibility",
    ...base,
    summary,
    positives,
    problems,
    recommendations,
  });
}

function scoreEntityClarity(audit: AuditResponse): CategoryScore {
  const entityAnalysis = getEntityAnalysis(audit);
  const entityClarity = audit.entityClarityAudit;
  const positives: string[] = [];
  const problems: string[] = [];
  const recommendations: string[] = [];

  for (const finding of entityClarity.findings) {
    if (finding.status === "pass") {
      positives.push(finding.message);
      continue;
    }

    problems.push(finding.message);

    if (finding.recommendation) {
      recommendations.push(finding.recommendation);
    }
  }

  const score = entityClarity.score;
  let status: CategoryScoreStatus;

  if (entityClarity.status === "good") {
    status = "pass";
  } else if (entityClarity.status === "warning") {
    status = "warning";
  } else {
    status = "fail";
  }

  const issueCount = entityClarity.issues.length;
  const summary = getEntityClaritySummary(entityClarity);

  if (entityAnalysis.primaryEntity && score >= 80) {
    positives.push(
      `Primary entity "${entityAnalysis.primaryEntity}" aligns with entity clarity signals.`,
    );
  }

  return finalizeCategory({
    id: "entity-clarity",
    label: "Entity Clarity",
    score,
    status,
    issueCount: Math.max(issueCount, problems.length > 0 ? 1 : 0),
    summary,
    positives,
    problems,
    recommendations,
  });
}

function scoreCitationReadiness(audit: AuditResponse): CategoryScore {
  const citationAudit = audit.citationReadinessAudit;
  const positives: string[] = [];
  const problems: string[] = [];
  const recommendations: string[] = [];

  for (const finding of citationAudit.findings) {
    if (finding.status === "pass") {
      positives.push(finding.message);
      continue;
    }

    problems.push(finding.message);

    if (finding.recommendation) {
      recommendations.push(finding.recommendation);
    }
  }

  let status: CategoryScoreStatus;

  if (citationAudit.status === "good") {
    status = "pass";
  } else if (citationAudit.status === "warning") {
    status = "warning";
  } else {
    status = "fail";
  }

  return finalizeCategory({
    id: "citation-readiness",
    label: "Citation Readiness",
    score: citationAudit.score,
    status,
    issueCount: Math.max(citationAudit.issues.length, problems.length > 0 ? 1 : 0),
    summary: getCitationReadinessSummary(citationAudit),
    positives,
    problems,
    recommendations,
  });
}

function scoreAnswerExtraction(audit: AuditResponse): CategoryScore {
  const extractionAudit = audit.answerExtractionAudit;
  const positives: string[] = [];
  const problems: string[] = [];
  const recommendations: string[] = [];

  for (const finding of extractionAudit.findings) {
    if (finding.status === "pass") {
      positives.push(finding.message);
      continue;
    }

    problems.push(finding.message);

    if (finding.recommendation) {
      recommendations.push(finding.recommendation);
    }
  }

  let status: CategoryScoreStatus;

  if (extractionAudit.status === "good") {
    status = "pass";
  } else if (extractionAudit.status === "warning") {
    status = "warning";
  } else {
    status = "fail";
  }

  return finalizeCategory({
    id: "answer-extraction",
    label: "Answer Extraction",
    score: extractionAudit.score,
    status,
    issueCount: Math.max(extractionAudit.issues.length, problems.length > 0 ? 1 : 0),
    summary: getAnswerExtractionSummary(extractionAudit),
    positives,
    problems,
    recommendations,
  });
}

function scoreFaqReadiness(audit: AuditResponse): CategoryScore {
  const aiSignals = getAiVisibilitySignals(audit);
  const readability = getReadabilityAnalysis(audit);
  const hasFaq = aiSignals.faqSchema;
  const visibleFaqHints =
    aiSignals.visibleFaqHints ||
    readability.hasFAQText ||
    readability.questionHeadingCount > 0;
  const positives: string[] = [];
  const problems: string[] = [];
  const recommendations: string[] = [];

  if (hasFaq) {
    positives.push("FAQPage schema is present for AI answer eligibility.");
  } else {
    problems.push("FAQPage schema was not detected.");
    recommendations.push("Add FAQPage schema and visible FAQ content.");

    if (visibleFaqHints) {
      problems.push("FAQ-style content exists, but structured FAQPage schema is missing.");
    }
  }

  if (readability.hasFAQText) {
    positives.push("Visible FAQ-related text was detected on the page.");
  }

  if (readability.questionHeadingCount > 0) {
    positives.push(
      `${readability.questionHeadingCount} question-style heading(s) support FAQ-style answers.`,
    );
  } else if (!hasFaq) {
    problems.push("No question-style headings were found for FAQ extraction.");
  }

  let score = hasFaq ? 100 : 30;

  if (!hasFaq && readability.hasFAQText) {
    score = Math.max(score, 50);
  }

  if (!hasFaq && readability.questionHeadingCount > 0) {
    score = Math.max(score, 45);
  }

  if (!hasFaq && visibleFaqHints) {
    score = Math.max(score, 45);
  }

  return finalizeCategory({
    id: "faq-readiness",
    label: "FAQ Readiness",
    score,
    status: hasFaq ? "pass" : "warning",
    issueCount: hasFaq ? 0 : 1,
    summary: hasFaq
      ? "FAQ schema is ready for AI answer surfaces."
      : visibleFaqHints
        ? "FAQ content hints exist, but FAQPage schema is still missing."
        : "FAQ readiness is low without FAQPage schema.",
    positives,
    problems,
    recommendations,
  });
}

function scoreAiAnswerReadiness(audit: AuditResponse): CategoryScore {
  const entityAnalysis = getEntityAnalysis(audit);
  const readability = getReadabilityAnalysis(audit);
  const easyExtraction = isEasyForAiAnswerExtraction(readability);
  const checks = [
    getCheck(audit, "title-exists"),
    getCheck(audit, "meta-description-exists"),
    getCheck(audit, "one-h1-exists"),
    getCheck(audit, "json-ld-schema-detected"),
    getCheck(audit, "internal-links-found"),
    getCheck(audit, "enough-body-content"),
    getCheck(audit, "scannable-paragraphs"),
  ].filter((check): check is AuditCheck => Boolean(check));

  const scores = checks.map((check) => checkToPoints(check.status));
  const statuses = checks.map((check) => check.status);

  if (entityAnalysis.primaryEntity) {
    scores.push(entityAnalysis.confidence >= 75 ? 100 : 75);
    statuses.push(entityAnalysis.confidence >= 75 ? "pass" : "warn");
  } else {
    scores.push(40);
    statuses.push("warn");
  }

  if (easyExtraction) {
    scores.push(100);
    statuses.push("pass");
  } else if (readability.wordCount > 0) {
    scores.push(50);
    statuses.push("warn");
  } else {
    scores.push(0);
    statuses.push("fail");
  }

  const base = buildCategoryScore("AI Answer Readiness", scores, statuses);
  const positives: string[] = [];
  const problems: string[] = [];
  const recommendations: string[] = [];
  const readySignals = [
    audit.title && "title",
    audit.metaDescription && "meta description",
    audit.headings.h1.length === 1 && "single H1",
    audit.schemaTypes.length > 0 && "schema markup",
    entityAnalysis.primaryEntity && "primary entity",
    audit.links.internal > 0 && "internal links",
    hasEnoughBodyContent(readability) && "body content depth",
    hasScannableParagraphs(readability) && "scannable paragraphs",
  ].filter(Boolean);

  if (readySignals.length >= 6) {
    positives.push(
      "AI can extract a direct answer using title, meta, H1, schema, entity, and readable content blocks.",
    );
  } else {
    positives.push(
      `Answer signals present: ${readySignals.join(", ") || "none"}.`,
    );
  }

  if (easyExtraction) {
    positives.push(
      "Content is easy for AI systems to extract direct answers from.",
    );
  } else {
    problems.push(
      "Content is difficult for AI systems to extract direct answers from.",
    );
    recommendations.push(
      "Add concise paragraphs, lists/tables, and question-style headings.",
    );
  }

  if (!audit.title) {
    problems.push("Missing title limits direct answer extraction.");
    recommendations.push("Add a descriptive title tag.");
  }

  if (!audit.metaDescription) {
    problems.push("Missing meta description limits answer summaries.");
    recommendations.push("Improve meta description.");
  }

  if (audit.headings.h1.length !== 1) {
    problems.push("Unclear H1 structure makes answer extraction harder.");
    recommendations.push("Add one clear H1.");
  }

  if (audit.schemaTypes.length === 0) {
    problems.push("No schema to reinforce answer context.");
    recommendations.push("Add structured data markup.");
  }

  if (!entityAnalysis.primaryEntity) {
    problems.push("No primary entity detected to anchor AI answer context.");
    recommendations.push("Add Organization schema with a clear entity name.");
  }

  if (audit.links.internal === 0) {
    problems.push("No internal links to support follow-up answers.");
    recommendations.push("Add internal links.");
  }

  if (!hasEnoughBodyContent(readability)) {
    problems.push(
      `Only ${readability.wordCount} words of body content limit answer depth.`,
    );
  }

  if (!hasScannableParagraphs(readability)) {
    problems.push("Paragraph structure is not scannable for AI answer extraction.");
  }

  const summary = easyExtraction && base.score >= 80
    ? "Page has strong signals for AI answer extraction with readable content blocks."
    : easyExtraction
      ? "Readable content exists, but some answer signals are still missing."
      : "Content is difficult for AI systems to extract direct answers from.";

  return finalizeCategory({
    id: "ai-answer-readiness",
    ...base,
    summary,
    positives,
    problems,
    recommendations,
  });
}

function scoreWcag22(audit: AuditResponse): CategoryScore {
  const analysis = getAccessibilityAnalysis(audit);
  const failingFindings = analysis.findings.filter(
    (finding) => finding.status !== "pass",
  );
  const status: CategoryScoreStatus =
    analysis.score >= 80 ? "pass" : analysis.score >= 60 ? "warning" : "fail";
  const positives = analysis.findings
    .filter((finding) => finding.status === "pass")
    .map((finding) => finding.message)
    .slice(0, 5);
  const problems = failingFindings.map((finding) => finding.message);
  const recommendations = [
    ...new Set(failingFindings.map((finding) => finding.recommendation)),
  ];

  const summary =
    analysis.score >= 80
      ? "Automated WCAG 2.2 readiness signals are strong. This is not legal compliance or certification."
      : analysis.score >= 60
        ? "Some automated WCAG 2.2 readiness signals need improvement."
        : "Automated WCAG 2.2 readiness signals are weak across accessibility basics.";

  return finalizeCategory({
    id: "wcag-2-2-readiness",
    label: "WCAG 2.2 Readiness",
    score: analysis.score,
    status,
    issueCount: failingFindings.length,
    summary,
    positives,
    problems,
    recommendations,
  });
}

function deriveOverallStatus(score: number): CategoryScoreStatus {
  if (score >= 80) {
    return "pass";
  }

  if (score >= 60) {
    return "warning";
  }

  return "fail";
}

const IMPACT_ORDER: Record<PriorityImpact, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
};

const FAQ_RECOMMENDATION_KEY = "Add FAQPage schema and visible FAQ content.";

function isPageUnreachable(audit: AuditResponse): boolean {
  const check = getCheck(audit, "page-reachable");
  return check?.status === "fail" || audit.statusCode >= 400;
}

function hasBasicSeoHealthy(audit: AuditResponse): boolean {
  return (
    Boolean(audit.title) &&
    Boolean(audit.metaDescription) &&
    audit.headings.h1.length === 1 &&
    audit.schemaTypes.length > 0
  );
}

function sortByImpactAndGain(issues: PriorityIssue[]): PriorityIssue[] {
  return [...issues].sort((left, right) => {
    const impactDiff = IMPACT_ORDER[left.impact] - IMPACT_ORDER[right.impact];

    if (impactDiff !== 0) {
      return impactDiff;
    }

    return right.estimatedGain - left.estimatedGain;
  });
}

function generatePriorityIssues(audit: AuditResponse): PriorityIssue[] {
  const issues: PriorityIssue[] = [];

  if (isPageUnreachable(audit)) {
    issues.push({
      title: "Page unreachable",
      impact: "Critical",
      difficulty: "Hard",
      estimatedGain: 10,
      explanation: `The audited page responded with status ${audit.statusCode} and could not be fully analyzed.`,
    });
  }

  if (!audit.title) {
    issues.push({
      title: "Missing title",
      impact: "Critical",
      difficulty: "Easy",
      estimatedGain: 9,
      explanation:
        "No page title was found. The title is a core signal for search engines and AI systems.",
    });
  }

  if (!audit.metaDescription) {
    issues.push({
      title: "Missing meta description",
      impact: "Critical",
      difficulty: "Easy",
      estimatedGain: 8,
      explanation:
        "Without a meta description, AI and search systems lack a concise page summary.",
    });
  }

  if (audit.headings.h1.length === 0) {
    issues.push({
      title: "Missing H1",
      impact: "Critical",
      difficulty: "Easy",
      estimatedGain: 7,
      explanation:
        "No H1 heading was found. A single clear H1 helps define the main page topic.",
    });
  }

  if (audit.schemaTypes.length === 0) {
    issues.push({
      title: "No schema detected",
      impact: "Critical",
      difficulty: "Moderate",
      estimatedGain: 7,
      explanation: "No JSON-LD structured data was found on the audited page.",
    });
  }

  if (
    !getAiVisibilitySignals(audit).organizationSchema &&
    audit.schemaTypes.length > 0
  ) {
    issues.push({
      title: "Missing Organization schema",
      impact: "High",
      difficulty: "Easy",
      estimatedGain: 6,
      explanation:
        "Structured data exists, but Organization schema is missing for entity verification.",
    });
  }

  if (!audit.canonical) {
    issues.push({
      title: "Missing canonical URL",
      impact: "High",
      difficulty: "Easy",
      estimatedGain: 5,
      explanation:
        "A canonical tag prevents duplicate URL confusion for crawlers and AI systems.",
    });
  }

  const internalCheck = getCheck(audit, "internal-links-found");
  if (audit.links.internal === 0 || internalCheck?.status === "warn") {
    issues.push({
      title: "Low internal links",
      impact: "High",
      difficulty: "Moderate",
      estimatedGain: 4,
      explanation:
        audit.links.internal === 0
          ? "No internal links were found to connect related content."
          : `Only ${audit.links.internal} internal link(s) were found, which limits site navigation depth.`,
    });
  }

  if (!getAiVisibilitySignals(audit).faqSchema) {
    issues.push({
      title: "Missing FAQPage schema",
      impact: "Medium",
      difficulty: "Moderate",
      estimatedGain: hasBasicSeoHealthy(audit) ? 5 : 2,
      explanation:
        "No FAQPage JSON-LD was detected. This is an enhancement opportunity once core SEO is in place.",
    });
  }

  if (audit.links.external === 0) {
    issues.push({
      title: "No external links",
      impact: "Medium",
      difficulty: "Easy",
      estimatedGain: 3,
      explanation:
        "No outbound references were found, which can weaken perceived trust and context.",
    });
  }

  if (audit.headings.h1.length > 1) {
    issues.push({
      title: "Multiple H1 headings",
      impact: "Medium",
      difficulty: "Easy",
      estimatedGain: 3,
      explanation: `Found ${audit.headings.h1.length} H1 headings. One clear H1 improves structure and AI parsing.`,
    });
  }

  const accessibility = getAccessibilityAnalysis(audit);

  if (!accessibility.hasLangAttribute) {
    issues.push({
      title: "Missing HTML lang attribute",
      impact: "High",
      difficulty: "Easy",
      estimatedGain: 5,
      explanation:
        "No valid HTML lang attribute was detected, which affects language detection for assistive tech.",
    });
  }

  if (
    accessibility.imageCount > 0 &&
    accessibility.imagesMissingAlt > 0 &&
    (accessibility.imagesMissingAlt >= 3 ||
      accessibility.imagesMissingAlt / accessibility.imageCount >= 0.5)
  ) {
    issues.push({
      title: "Images missing alt text",
      impact: "High",
      difficulty: "Easy",
      estimatedGain: 5,
      explanation: `${accessibility.imagesMissingAlt} of ${accessibility.imageCount} image(s) lack alt text.`,
    });
  }

  if (accessibility.inputsMissingLabels > 0) {
    issues.push({
      title: "Form inputs missing labels",
      impact: "High",
      difficulty: "Moderate",
      estimatedGain: 4,
      explanation: `${accessibility.inputsMissingLabels} form input(s) lack accessible labels.`,
    });
  }

  if (!accessibility.hasMainLandmark) {
    issues.push({
      title: "Missing main landmark",
      impact: "Medium",
      difficulty: "Easy",
      estimatedGain: 3,
      explanation:
        "No main landmark was detected to help assistive technology reach primary content.",
    });
  }

  if (accessibility.headingOrderIssues >= 3) {
    issues.push({
      title: "Heading order issues",
      impact: "Medium",
      difficulty: "Moderate",
      estimatedGain: 3,
      explanation: `${accessibility.headingOrderIssues} heading order issue(s) were detected.`,
    });
  }

  if (accessibility.buttonsWithoutText > 0) {
    issues.push({
      title: "Buttons missing accessible text",
      impact: "High",
      difficulty: "Easy",
      estimatedGain: 4,
      explanation: `${accessibility.buttonsWithoutText} button(s) lack accessible names.`,
    });
  }

  if (accessibility.emptyLinkCount > 0) {
    issues.push({
      title: "Empty links detected",
      impact: "High",
      difficulty: "Easy",
      estimatedGain: 4,
      explanation: `${accessibility.emptyLinkCount} link(s) have no accessible name.`,
    });
  }

  return sortByImpactAndGain(issues);
}

const RECOMMENDATION_LIBRARY: Record<
  string,
  Omit<AuditRecommendation, "title"> & { title: string }
> = {
  "Add FAQPage schema and visible FAQ content.": {
    title: "Add FAQPage schema",
    whyThisMatters:
      "FAQPage schema helps AI systems identify question-and-answer content and surface direct responses.",
    howToFix:
      "Add visible FAQ content on the page and inject JSON-LD with @type FAQPage for each question and answer pair.",
    estimatedGain: 5,
  },
  "Add Organization schema.": {
    title: "Add Organization schema",
    whyThisMatters:
      "Organization schema helps AI systems verify the entity behind the website and improves trust signals.",
    howToFix:
      "Add JSON-LD Organization markup with name, url, logo, and sameAs links to official profiles.",
    estimatedGain: 6,
  },
  "Improve meta description.": {
    title: "Improve meta description",
    whyThisMatters:
      "A clear meta description gives search engines and AI a concise summary of the page topic.",
    howToFix:
      "Write a unique 140–160 character meta description that explains the page purpose and primary value.",
    estimatedGain: 8,
  },
  "Add one clear H1.": {
    title: "Add one clear H1",
    whyThisMatters:
      "A single H1 defines the main topic and helps AI systems understand page hierarchy.",
    howToFix:
      "Ensure the page has exactly one H1 that states the primary topic in plain language.",
    estimatedGain: 5,
  },
  "Add a canonical URL.": {
    title: "Add a canonical URL",
    whyThisMatters:
      "Canonical tags tell crawlers which URL is authoritative and reduce duplicate-content confusion.",
    howToFix:
      "Add a <link rel=\"canonical\"> tag in the page head pointing to the preferred URL.",
    estimatedGain: 4,
  },
  "Add structured data markup.": {
    title: "Add structured data markup",
    whyThisMatters:
      "JSON-LD schema helps machines interpret page type, entities, and content relationships.",
    howToFix:
      "Add relevant JSON-LD blocks such as WebSite, WebPage, Organization, or page-specific schema types.",
    estimatedGain: 7,
  },
  "Add internal links.": {
    title: "Add internal links",
    whyThisMatters:
      "Internal links connect related pages and help AI systems understand site structure and depth.",
    howToFix:
      "Link to related pages, services, or resources using descriptive anchor text within the page body or navigation.",
    estimatedGain: 4,
  },
  "Add external references/trust links.": {
    title: "Add external references/trust links",
    whyThisMatters:
      "Outbound links to credible sources can reinforce context and trustworthiness for readers and AI systems.",
    howToFix:
      "Add relevant outbound links to authoritative references, partners, or source material where appropriate.",
    estimatedGain: 3,
  },
  "Add a descriptive title tag.": {
    title: "Add a descriptive title tag",
    whyThisMatters:
      "The title tag is a primary signal for page topic and is heavily used by AI retrieval systems.",
    howToFix:
      "Add a unique, descriptive <title> element that names the page topic and brand clearly.",
    estimatedGain: 5,
  },
  "Add missing alt text to images.": {
    title: "Add missing alt text",
    whyThisMatters:
      "Alt text helps screen readers and improves machine-readable content structure for accessibility signals.",
    howToFix:
      "Add descriptive alt attributes to images that convey meaning, or alt=\"\" for decorative images.",
    estimatedGain: 5,
  },
  "Add accessible labels to form inputs.": {
    title: "Label form inputs",
    whyThisMatters:
      "Accessible form labels help users and assistive technology understand input purpose.",
    howToFix:
      "Associate each input with a <label>, or provide aria-label / aria-labelledby attributes.",
    estimatedGain: 4,
  },
  "Add a main landmark.": {
    title: "Add main landmark",
    whyThisMatters:
      "A main landmark helps assistive technology jump directly to primary page content.",
    howToFix:
      "Wrap primary content in <main> or add role=\"main\" to the primary content container.",
    estimatedGain: 3,
  },
  "Fix heading order.": {
    title: "Fix heading order",
    whyThisMatters:
      "Logical heading order improves navigation for screen readers and content hierarchy for parsers.",
    howToFix:
      "Ensure headings do not skip levels (for example, avoid jumping from H2 directly to H4).",
    estimatedGain: 3,
  },
  "Add skip link for keyboard users.": {
    title: "Add skip link",
    whyThisMatters:
      "Skip links let keyboard users bypass repetitive navigation and reach main content faster.",
    howToFix:
      "Add a visible-on-focus skip link near the top of the page that targets the main content area.",
    estimatedGain: 2,
  },
  "Add a valid HTML lang attribute.": {
    title: "Add HTML lang attribute",
    whyThisMatters:
      "The lang attribute helps browsers and assistive technology pronounce and parse content correctly.",
    howToFix:
      "Add lang=\"en\" (or the correct language code) to the <html> element.",
    estimatedGain: 4,
  },
  "Add accessible text to buttons.": {
    title: "Label buttons accessibly",
    whyThisMatters:
      "Buttons without accessible names are difficult for assistive technology users to operate.",
    howToFix:
      "Provide visible text, aria-label, or aria-labelledby for each button.",
    estimatedGain: 3,
  },
};

const RECOMMENDATION_IMPACT: Record<string, PriorityImpact> = {
  "Add a descriptive title tag.": "Critical",
  "Improve meta description.": "Critical",
  "Add structured data markup.": "Critical",
  "Add one clear H1.": "Critical",
  "Add Organization schema.": "High",
  "Add a canonical URL.": "High",
  "Add internal links.": "High",
  "Add missing alt text to images.": "High",
  "Add accessible labels to form inputs.": "High",
  "Add a valid HTML lang attribute.": "High",
  [FAQ_RECOMMENDATION_KEY]: "Medium",
  "Add a main landmark.": "Medium",
  "Fix heading order.": "Medium",
  "Add accessible text to buttons.": "Medium",
  "Add skip link for keyboard users.": "Medium",
  "Add external references/trust links.": "Medium",
};

function getRecommendationImpact(
  recommendationKey: string,
  audit: AuditResponse,
): PriorityImpact {
  const baseImpact = RECOMMENDATION_IMPACT[recommendationKey] ?? "Medium";

  if (recommendationKey === FAQ_RECOMMENDATION_KEY && hasBasicSeoHealthy(audit)) {
    return "Medium";
  }

  if (recommendationKey === FAQ_RECOMMENDATION_KEY && !hasBasicSeoHealthy(audit)) {
    return "Medium";
  }

  return baseImpact;
}

function getRecommendationSortRank(
  recommendationKey: string,
  recommendation: AuditRecommendation,
  audit: AuditResponse,
): number {
  const impact = getRecommendationImpact(recommendationKey, audit);
  let rank = IMPACT_ORDER[impact] * 100;

  if (
    recommendationKey === FAQ_RECOMMENDATION_KEY &&
    !hasBasicSeoHealthy(audit)
  ) {
    rank += 50;
  }

  if (
    recommendationKey === FAQ_RECOMMENDATION_KEY &&
    hasBasicSeoHealthy(audit)
  ) {
    rank -= 1;
  }

  return rank * 100 - recommendation.estimatedGain;
}

function generateRecommendations(
  audit: AuditResponse,
  categories: CategoryScore[],
): AuditRecommendation[] {
  const seen = new Set<string>();
  const recommendations: Array<{
    key: string;
    recommendation: AuditRecommendation;
  }> = [];

  for (const category of categories) {
    for (const recommendationKey of category.recommendations) {
      if (seen.has(recommendationKey)) {
        continue;
      }

      seen.add(recommendationKey);
      const template = RECOMMENDATION_LIBRARY[recommendationKey];

      recommendations.push({
        key: recommendationKey,
        recommendation: template ?? {
          title: recommendationKey,
          whyThisMatters:
            "This change addresses a gap found during the deterministic audit.",
          howToFix: recommendationKey,
          estimatedGain: 4,
        },
      });
    }
  }

  return recommendations
    .sort(
      (left, right) =>
        getRecommendationSortRank(left.key, left.recommendation, audit) -
        getRecommendationSortRank(right.key, right.recommendation, audit),
    )
    .map((entry) => entry.recommendation);
}

export function calculateAuditScores(audit: AuditResponse): AuditScoreResult {
  const normalized = normalizeAuditResponse(audit);

  if (!normalized) {
    return {
      overallScore: 0,
      overallStatus: "fail",
      categories: [],
      priorityIssues: [],
      recommendations: [],
    };
  }

  const categories = [
    scoreSeoHealth(normalized),
    scoreAiVisibility(normalized),
    scoreEntityClarity(normalized),
    scoreCitationReadiness(normalized),
    scoreAnswerExtraction(normalized),
    scoreTrustSignals(normalized),
    scoreOpenGraph(normalized),
    scoreTwitterCard(normalized),
    scoreContentStructure(normalized),
    scoreSchemaMarkup(normalized),
    scoreAdvancedSchema(normalized),
    scoreFaqReadiness(normalized),
    scoreAiAnswerReadiness(normalized),
    scoreWcag22(normalized),
  ];

  const overallFromChecks = calculateOverallScoreFromChecks(normalized.checks);
  const categoryAverage = average(categories.map((category) => category.score));
  const overallScore = clamp(
    Math.round((overallFromChecks + categoryAverage) / 2),
    0,
    100,
  );
  const priorityIssues = generatePriorityIssues(normalized);
  const recommendations = generateRecommendations(normalized, categories);

  return {
    overallScore,
    overallStatus: deriveOverallStatus(overallScore),
    categories,
    priorityIssues,
    recommendations,
  };
}

export function scoreToStatusLabel(score: number): string {
  if (score >= 80) {
    return "Good";
  }

  if (score >= 60) {
    return "Fair";
  }

  return "Needs Work";
}

export function buildHeroStrengths(
  categories: CategoryScore[],
): { title: string; text: string }[] {
  return [...categories]
    .sort((left, right) => right.score - left.score)
    .flatMap((category) =>
      category.positives.map((positive) => ({
        title: `${category.label}:`,
        text: positive,
      })),
    )
    .slice(0, 3);
}

export function buildHeroIssues(
  categories: CategoryScore[],
): { title: string; text: string }[] {
  return [...categories]
    .sort((left, right) => left.score - right.score)
    .flatMap((category) =>
      category.problems.map((problem) => ({
        title: `${category.label}:`,
        text: problem,
      })),
    )
    .slice(0, 3);
}
