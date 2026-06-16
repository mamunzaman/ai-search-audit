import { hasTrustPages } from "./trust-signals";
import { buildTechnicalSignals } from "./technicalSignals";
import { defaultSiteCrawl } from "./siteCrawler";
import {
  defaultAdvancedSchemaAudit,
  runAdvancedSchemaAudit,
} from "./advancedSchemaAudit";
import {
  defaultTwitterCardAudit,
  runTwitterCardAudit,
} from "./twitterCardAudit";
import {
  defaultOpenGraphAudit,
  runOpenGraphAudit,
} from "./openGraphAudit";
import {
  defaultTrustSignalsAudit,
  runTrustSignalsAudit,
} from "./trustSignalsAudit";
import {
  defaultAnswerExtractionAudit,
  runAnswerExtractionAudit,
} from "./answerExtractionAudit";
import {
  defaultCitationReadinessAudit,
  runCitationReadinessAudit,
} from "./citationReadinessAudit";
import {
  defaultEntityClarityAudit,
  runEntityClarityAudit,
} from "./entityClarityAudit";
import { defaultRobotsAnalysis } from "./robots-check";
import { defaultSitemapAnalysis } from "./sitemap-check";
import { defaultSocialMetadata } from "./social-metadata";
import { defaultEntityAnalysis } from "./entity-extraction";
import { defaultReadabilityAnalysis } from "./readability-check";
import { defaultAccessibilityAnalysis } from "./accessibility-check";
import type {
  AnswerExtractionAuditResult,
  CitationReadinessAuditResult,
  EntityClarityAuditResult,
  OpenGraphAuditResult,
  TrustSignalsAuditResult,
  TwitterCardAuditResult,
  AdvancedSchemaAuditResult,
  SiteCrawlResult,
} from "@/types/audit";
import type {
  AccessibilityAnalysis,
  AccessibilityFinding,
  AiVisibilitySignals,
  AuditCheck,
  AuditHeadings,
  AuditLinks,
  AuditResponse,
  EntityAnalysis,
  EntityType,
  ParsedAnchor,
  ReadabilityAnalysis,
  RobotsAnalysis,
  SitemapAnalysis,
  TechnicalSignal,
  SocialMetadata,
  TrustSignals,
} from "./types";

export const AUDIT_SCHEMA_VERSION = 17;

export const defaultTrustSignals: TrustSignals = {
  aboutPage: false,
  contactPage: false,
  privacyPage: false,
  legalPage: false,
  socialLinks: 0,
  externalAuthorityLinks: 0,
};

export const defaultAiVisibilitySignals: AiVisibilitySignals = {
  organizationSchema: false,
  faqSchema: false,
  clearH1: false,
  metaDescription: false,
  structuredHeadings: false,
  internalLinks: false,
  trustPages: false,
  visibleFaqHints: false,
};

function hasSchemaType(schemaTypes: string[], type: string): boolean {
  return schemaTypes.some(
    (schemaType) => schemaType.toLowerCase() === type.toLowerCase(),
  );
}

function normalizeHeadings(headings: AuditHeadings | undefined): AuditHeadings {
  return {
    h1: Array.isArray(headings?.h1) ? headings.h1 : [],
    h2: Array.isArray(headings?.h2) ? headings.h2 : [],
    h3: Array.isArray(headings?.h3) ? headings.h3 : [],
  };
}

function normalizeLinks(links: AuditLinks | undefined): AuditLinks {
  return {
    internal: typeof links?.internal === "number" ? links.internal : 0,
    external: typeof links?.external === "number" ? links.external : 0,
  };
}

function normalizeChecks(checks: AuditCheck[] | undefined): AuditCheck[] {
  if (!Array.isArray(checks)) {
    return [];
  }

  return checks.filter(
    (check) =>
      check &&
      typeof check.id === "string" &&
      typeof check.label === "string" &&
      typeof check.status === "string" &&
      typeof check.message === "string",
  );
}

function deriveTrustSignals(
  trustSignals: TrustSignals | undefined,
): TrustSignals {
  if (!trustSignals || typeof trustSignals !== "object") {
    return { ...defaultTrustSignals };
  }

  return {
    aboutPage: Boolean(trustSignals.aboutPage),
    contactPage: Boolean(trustSignals.contactPage),
    privacyPage: Boolean(trustSignals.privacyPage),
    legalPage: Boolean(trustSignals.legalPage),
    socialLinks:
      typeof trustSignals.socialLinks === "number" ? trustSignals.socialLinks : 0,
    externalAuthorityLinks:
      typeof trustSignals.externalAuthorityLinks === "number"
        ? trustSignals.externalAuthorityLinks
        : 0,
  };
}

function deriveAiVisibilitySignals(
  audit: {
    title?: string;
    metaDescription?: string;
    headings: AuditHeadings;
    links: AuditLinks;
    schemaTypes: string[];
    trustSignals: TrustSignals;
  },
  aiVisibilitySignals: AiVisibilitySignals | undefined,
): AiVisibilitySignals {
  if (aiVisibilitySignals && typeof aiVisibilitySignals === "object") {
    return {
      organizationSchema: Boolean(aiVisibilitySignals.organizationSchema),
      faqSchema: Boolean(aiVisibilitySignals.faqSchema),
      clearH1: Boolean(aiVisibilitySignals.clearH1),
      metaDescription: Boolean(aiVisibilitySignals.metaDescription),
      structuredHeadings: Boolean(aiVisibilitySignals.structuredHeadings),
      internalLinks: Boolean(aiVisibilitySignals.internalLinks),
      trustPages: Boolean(aiVisibilitySignals.trustPages),
      visibleFaqHints: Boolean(aiVisibilitySignals.visibleFaqHints),
    };
  }

  const totalHeadings =
    audit.headings.h1.length +
    audit.headings.h2.length +
    audit.headings.h3.length;

  return {
    organizationSchema: hasSchemaType(audit.schemaTypes, "Organization"),
    faqSchema: hasSchemaType(audit.schemaTypes, "FAQPage"),
    clearH1: audit.headings.h1.length === 1,
    metaDescription: Boolean(audit.metaDescription),
    structuredHeadings:
      audit.headings.h1.length === 1 &&
      audit.headings.h2.length >= 1 &&
      totalHeadings >= 3,
    internalLinks: audit.links.internal > 0,
    trustPages: hasTrustPages(audit.trustSignals),
    visibleFaqHints: false,
  };
}

function deriveRobotsReachability(
  value: unknown,
  exists: boolean,
): RobotsAnalysis["reachability"] {
  if (
    value === "reachable" ||
    value === "not_found" ||
    value === "error"
  ) {
    return value;
  }

  return exists ? "reachable" : "not_found";
}

function deriveRobotsAnalysis(
  robotsAnalysis: RobotsAnalysis | undefined,
): RobotsAnalysis {
  if (!robotsAnalysis || typeof robotsAnalysis !== "object") {
    return { ...defaultRobotsAnalysis };
  }

  const exists = Boolean(robotsAnalysis.exists);

  return {
    exists,
    reachability: deriveRobotsReachability(
      robotsAnalysis.reachability,
      exists,
    ),
    statusCode:
      typeof robotsAnalysis.statusCode === "number"
        ? robotsAnalysis.statusCode
        : null,
    sitemapCount:
      typeof robotsAnalysis.sitemapCount === "number"
        ? robotsAnalysis.sitemapCount
        : 0,
    sitemapUrls: Array.isArray(robotsAnalysis.sitemapUrls)
      ? robotsAnalysis.sitemapUrls.filter((url) => typeof url === "string")
      : [],
    disallowCount:
      typeof robotsAnalysis.disallowCount === "number"
        ? robotsAnalysis.disallowCount
        : 0,
    userAgentGroupCount:
      typeof robotsAnalysis.userAgentGroupCount === "number"
        ? robotsAnalysis.userAgentGroupCount
        : 0,
    rootDisallowed: Boolean(robotsAnalysis.rootDisallowed),
    blockedAiCrawlers: Array.isArray(robotsAnalysis.blockedAiCrawlers)
      ? robotsAnalysis.blockedAiCrawlers.filter(
          (agent) => typeof agent === "string",
        )
      : [],
  };
}

function deriveSitemapAnalysis(
  sitemapAnalysis: SitemapAnalysis | undefined,
): SitemapAnalysis {
  if (!sitemapAnalysis || typeof sitemapAnalysis !== "object") {
    return { ...defaultSitemapAnalysis };
  }

  const source =
    sitemapAnalysis.source === "robots" ||
    sitemapAnalysis.source === "default" ||
    sitemapAnalysis.source === "none"
      ? sitemapAnalysis.source
      : "none";

  const format =
    sitemapAnalysis.format === "urlset" ||
    sitemapAnalysis.format === "sitemapindex" ||
    sitemapAnalysis.format === "invalid" ||
    sitemapAnalysis.format === "none"
      ? sitemapAnalysis.format
      : "none";

  return {
    exists: Boolean(sitemapAnalysis.exists),
    source,
    sitemapCount:
      typeof sitemapAnalysis.sitemapCount === "number"
        ? sitemapAnalysis.sitemapCount
        : 0,
    urlCount:
      typeof sitemapAnalysis.urlCount === "number" ? sitemapAnalysis.urlCount : 0,
    childSitemapCount:
      typeof sitemapAnalysis.childSitemapCount === "number"
        ? sitemapAnalysis.childSitemapCount
        : 0,
    sampleUrls: Array.isArray(sitemapAnalysis.sampleUrls)
      ? sitemapAnalysis.sampleUrls.filter((url) => typeof url === "string")
      : [],
    format,
    invalidResponseCount:
      typeof sitemapAnalysis.invalidResponseCount === "number"
        ? sitemapAnalysis.invalidResponseCount
        : 0,
  };
}

function deriveTechnicalSignals(
  technicalSignals: TechnicalSignal[] | undefined,
  robotsAnalysis: RobotsAnalysis,
  sitemapAnalysis: SitemapAnalysis,
): TechnicalSignal[] {
  if (Array.isArray(technicalSignals) && technicalSignals.length > 0) {
    return technicalSignals.filter(
      (signal) =>
        signal &&
        typeof signal.id === "string" &&
        typeof signal.label === "string" &&
        typeof signal.summary === "string" &&
        typeof signal.recommendation === "string" &&
        typeof signal.scoreImpact === "number" &&
        (signal.status === "pass" ||
          signal.status === "warning" ||
          signal.status === "fail"),
    );
  }

  return buildTechnicalSignals(robotsAnalysis, sitemapAnalysis);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function deriveSocialMetadata(
  socialMetadata: SocialMetadata | undefined,
): SocialMetadata {
  if (!socialMetadata || typeof socialMetadata !== "object") {
    return { ...defaultSocialMetadata };
  }

  const openGraph =
    socialMetadata.openGraph && typeof socialMetadata.openGraph === "object"
      ? socialMetadata.openGraph
      : {};
  const twitter =
    socialMetadata.twitter && typeof socialMetadata.twitter === "object"
      ? socialMetadata.twitter
      : {};

  return {
    openGraph: {
      title: optionalString(openGraph.title),
      description: optionalString(openGraph.description),
      image: optionalString(openGraph.image),
      url: optionalString(openGraph.url),
      type: optionalString(openGraph.type),
      siteName: optionalString(openGraph.siteName),
    },
    twitter: {
      card: optionalString(twitter.card),
      title: optionalString(twitter.title),
      description: optionalString(twitter.description),
      image: optionalString(twitter.image),
      site: optionalString(twitter.site),
      creator: optionalString(twitter.creator),
    },
  };
}

const ENTITY_TYPES: EntityType[] = [
  "Organization",
  "Website",
  "Event",
  "LocalBusiness",
  "Article",
  "Unknown",
];

function deriveEntityAnalysis(
  entityAnalysis: EntityAnalysis | undefined,
): EntityAnalysis {
  if (!entityAnalysis || typeof entityAnalysis !== "object") {
    return { ...defaultEntityAnalysis };
  }

  const entityType = ENTITY_TYPES.includes(entityAnalysis.entityType)
    ? entityAnalysis.entityType
    : "Unknown";

  return {
    primaryEntity:
      typeof entityAnalysis.primaryEntity === "string"
        ? entityAnalysis.primaryEntity
        : null,
    entityType,
    confidence:
      typeof entityAnalysis.confidence === "number"
        ? Math.max(0, Math.min(100, entityAnalysis.confidence))
        : 0,
    sources: Array.isArray(entityAnalysis.sources)
      ? entityAnalysis.sources.filter((source) => typeof source === "string")
      : [],
    relatedEntities: Array.isArray(entityAnalysis.relatedEntities)
      ? entityAnalysis.relatedEntities.filter((entity) => typeof entity === "string")
      : [],
  };
}

function deriveReadabilityAnalysis(
  readabilityAnalysis: ReadabilityAnalysis | undefined,
): ReadabilityAnalysis {
  if (!readabilityAnalysis || typeof readabilityAnalysis !== "object") {
    return { ...defaultReadabilityAnalysis };
  }

  return {
    wordCount:
      typeof readabilityAnalysis.wordCount === "number"
        ? readabilityAnalysis.wordCount
        : 0,
    paragraphCount:
      typeof readabilityAnalysis.paragraphCount === "number"
        ? readabilityAnalysis.paragraphCount
        : 0,
    averageParagraphWords:
      typeof readabilityAnalysis.averageParagraphWords === "number"
        ? readabilityAnalysis.averageParagraphWords
        : 0,
    listCount:
      typeof readabilityAnalysis.listCount === "number"
        ? readabilityAnalysis.listCount
        : 0,
    tableCount:
      typeof readabilityAnalysis.tableCount === "number"
        ? readabilityAnalysis.tableCount
        : 0,
    questionHeadingCount:
      typeof readabilityAnalysis.questionHeadingCount === "number"
        ? readabilityAnalysis.questionHeadingCount
        : 0,
    hasFAQText: Boolean(readabilityAnalysis.hasFAQText),
    shortAnswerBlocks:
      typeof readabilityAnalysis.shortAnswerBlocks === "number"
        ? readabilityAnalysis.shortAnswerBlocks
        : 0,
  };
}

function deriveEntityClarityAudit(
  entityClarityAudit: EntityClarityAuditResult | undefined,
  audit: {
    title?: string;
    metaDescription?: string;
    schemaTypes: string[];
    headings: AuditHeadings;
    trustSignals: TrustSignals;
    entityAnalysis: EntityAnalysis;
    socialMetadata: SocialMetadata;
    finalUrl?: string;
  },
  siteCrawl?: SiteCrawlResult,
): EntityClarityAuditResult {
  if (
    entityClarityAudit &&
    typeof entityClarityAudit === "object" &&
    typeof entityClarityAudit.score === "number" &&
    Array.isArray(entityClarityAudit.findings) &&
    entityClarityAudit.findings.length > 0
  ) {
    return {
      score: Math.max(0, Math.min(100, entityClarityAudit.score)),
      status:
        entityClarityAudit.status === "good" ||
        entityClarityAudit.status === "warning" ||
        entityClarityAudit.status === "poor"
          ? entityClarityAudit.status
          : "poor",
      findings: entityClarityAudit.findings.filter(
        (finding) =>
          finding &&
          typeof finding.id === "string" &&
          typeof finding.label === "string" &&
          typeof finding.message === "string",
      ),
      issues: Array.isArray(entityClarityAudit.issues)
        ? entityClarityAudit.issues.filter(
            (issue) =>
              issue &&
              typeof issue.title === "string" &&
              typeof issue.explanation === "string",
          )
        : [],
      recommendations: Array.isArray(entityClarityAudit.recommendations)
        ? entityClarityAudit.recommendations.filter(
            (recommendation) =>
              recommendation &&
              typeof recommendation.title === "string" &&
              typeof recommendation.howToFix === "string",
          )
        : [],
    };
  }

  return runEntityClarityAudit(
    {
      html: "",
      title: audit.title ?? "",
      metaDescription: audit.metaDescription ?? "",
      schemaTypes: audit.schemaTypes,
      headings: audit.headings,
      trustSignals: audit.trustSignals,
      entityAnalysis: audit.entityAnalysis,
      socialMetadata: audit.socialMetadata,
    },
    {
      sitePages: siteCrawl?.pages.length
        ? siteCrawl.pages.map((page) => ({
            url: page.url,
            html: page.html,
            text: page.text,
            links: page.links,
          }))
        : undefined,
      primaryPageUrl: audit.finalUrl,
    },
  );
}

function deriveCitationReadinessAudit(
  citationReadinessAudit: CitationReadinessAuditResult | undefined,
  audit: {
    title?: string;
    metaDescription?: string;
    schemaTypes: string[];
    headings: AuditHeadings;
    links: AuditLinks;
    trustSignals: TrustSignals;
    finalUrl?: string;
  },
  siteCrawl?: SiteCrawlResult,
): CitationReadinessAuditResult {
  if (
    citationReadinessAudit &&
    typeof citationReadinessAudit === "object" &&
    typeof citationReadinessAudit.score === "number" &&
    Array.isArray(citationReadinessAudit.findings) &&
    citationReadinessAudit.findings.length > 0
  ) {
    return {
      score: Math.max(0, Math.min(100, citationReadinessAudit.score)),
      status:
        citationReadinessAudit.status === "good" ||
        citationReadinessAudit.status === "warning" ||
        citationReadinessAudit.status === "poor"
          ? citationReadinessAudit.status
          : "poor",
      findings: citationReadinessAudit.findings.filter(
        (finding) =>
          finding &&
          typeof finding.id === "string" &&
          typeof finding.label === "string" &&
          typeof finding.message === "string",
      ),
      issues: Array.isArray(citationReadinessAudit.issues)
        ? citationReadinessAudit.issues.filter(
            (issue) =>
              issue &&
              typeof issue.title === "string" &&
              typeof issue.explanation === "string",
          )
        : [],
      recommendations: Array.isArray(citationReadinessAudit.recommendations)
        ? citationReadinessAudit.recommendations.filter(
            (recommendation) =>
              recommendation &&
              typeof recommendation.title === "string" &&
              typeof recommendation.howToFix === "string",
          )
        : [],
    };
  }

  return runCitationReadinessAudit(
    {
      html: "",
      title: audit.title ?? "",
      metaDescription: audit.metaDescription ?? "",
      schemaTypes: audit.schemaTypes,
      headings: audit.headings,
      links: audit.links,
      trustSignals: audit.trustSignals,
      anchors: [],
      pageUrl: audit.finalUrl ?? "",
    },
    {
      sitePages: siteCrawl?.pages.length
        ? siteCrawl.pages.map((page) => ({
            url: page.url,
            html: page.html,
            text: page.text,
            links: page.links,
          }))
        : undefined,
      primaryPageUrl: audit.finalUrl,
    },
  );
}

function deriveAnswerExtractionAudit(
  answerExtractionAudit: AnswerExtractionAuditResult | undefined,
  audit: {
    schemaTypes: string[];
    headings: AuditHeadings;
    readabilityAnalysis: ReadabilityAnalysis;
  },
): AnswerExtractionAuditResult {
  if (
    answerExtractionAudit &&
    typeof answerExtractionAudit === "object" &&
    typeof answerExtractionAudit.score === "number" &&
    Array.isArray(answerExtractionAudit.findings) &&
    answerExtractionAudit.findings.length > 0
  ) {
    return {
      score: Math.max(0, Math.min(100, answerExtractionAudit.score)),
      status:
        answerExtractionAudit.status === "good" ||
        answerExtractionAudit.status === "warning" ||
        answerExtractionAudit.status === "poor"
          ? answerExtractionAudit.status
          : "poor",
      findings: answerExtractionAudit.findings.filter(
        (finding) =>
          finding &&
          typeof finding.id === "string" &&
          typeof finding.label === "string" &&
          typeof finding.message === "string",
      ),
      issues: Array.isArray(answerExtractionAudit.issues)
        ? answerExtractionAudit.issues.filter(
            (issue) =>
              issue &&
              typeof issue.title === "string" &&
              typeof issue.explanation === "string",
          )
        : [],
      recommendations: Array.isArray(answerExtractionAudit.recommendations)
        ? answerExtractionAudit.recommendations.filter(
            (recommendation) =>
              recommendation &&
              typeof recommendation.title === "string" &&
              typeof recommendation.howToFix === "string",
          )
        : [],
    };
  }

  return runAnswerExtractionAudit({
    html: "",
    headings: audit.headings,
    schemaTypes: audit.schemaTypes,
    readabilityAnalysis: audit.readabilityAnalysis,
  });
}

function deriveTrustSignalsAudit(
  trustSignalsAudit: TrustSignalsAuditResult | undefined,
  audit: {
    finalUrl?: string;
    trustSignals: TrustSignals;
    html?: string;
    anchors?: ParsedAnchor[];
  },
  siteCrawl?: SiteCrawlResult,
): TrustSignalsAuditResult {
  if (
    trustSignalsAudit &&
    typeof trustSignalsAudit === "object" &&
    typeof trustSignalsAudit.score === "number" &&
    Array.isArray(trustSignalsAudit.findings) &&
    trustSignalsAudit.findings.length > 0
  ) {
    return {
      score: Math.max(0, Math.min(100, trustSignalsAudit.score)),
      status:
        trustSignalsAudit.status === "good" ||
        trustSignalsAudit.status === "warning" ||
        trustSignalsAudit.status === "poor"
          ? trustSignalsAudit.status
          : "poor",
      findings: trustSignalsAudit.findings.filter(
        (finding) =>
          finding &&
          typeof finding.id === "string" &&
          typeof finding.label === "string" &&
          typeof finding.message === "string",
      ),
      issues: Array.isArray(trustSignalsAudit.issues)
        ? trustSignalsAudit.issues.filter(
            (issue) =>
              issue &&
              typeof issue.title === "string" &&
              typeof issue.explanation === "string",
          )
        : [],
      recommendations: Array.isArray(trustSignalsAudit.recommendations)
        ? trustSignalsAudit.recommendations.filter(
            (recommendation) =>
              recommendation &&
              typeof recommendation.title === "string" &&
              typeof recommendation.howToFix === "string",
          )
        : [],
    };
  }

  return runTrustSignalsAudit(
    {
      html: audit.html ?? "",
      pageUrl: audit.finalUrl ?? "",
      finalUrl: audit.finalUrl ?? "",
      trustSignals: audit.trustSignals,
      anchors: audit.anchors ?? [],
    },
    {
      sitePages: siteCrawl?.pages.length
        ? siteCrawl.pages.map((page) => ({
            url: page.url,
            html: page.html,
            text: page.text,
            links: page.links,
          }))
        : undefined,
    },
  );
}

function deriveOpenGraphAudit(
  openGraphAudit: OpenGraphAuditResult | undefined,
  audit: {
    socialMetadata: SocialMetadata;
  },
): OpenGraphAuditResult {
  if (
    openGraphAudit &&
    typeof openGraphAudit === "object" &&
    typeof openGraphAudit.score === "number" &&
    Array.isArray(openGraphAudit.findings) &&
    openGraphAudit.findings.length > 0
  ) {
    return {
      score: Math.max(0, Math.min(100, openGraphAudit.score)),
      status:
        openGraphAudit.status === "good" ||
        openGraphAudit.status === "warning" ||
        openGraphAudit.status === "poor"
          ? openGraphAudit.status
          : "poor",
      findings: openGraphAudit.findings.filter(
        (finding) =>
          finding &&
          typeof finding.id === "string" &&
          typeof finding.label === "string" &&
          typeof finding.message === "string",
      ),
      issues: Array.isArray(openGraphAudit.issues)
        ? openGraphAudit.issues.filter(
            (issue) =>
              issue &&
              typeof issue.title === "string" &&
              typeof issue.explanation === "string",
          )
        : [],
      recommendations: Array.isArray(openGraphAudit.recommendations)
        ? openGraphAudit.recommendations.filter(
            (recommendation) =>
              recommendation &&
              typeof recommendation.title === "string" &&
              typeof recommendation.howToFix === "string",
          )
        : [],
    };
  }

  return runOpenGraphAudit({
    socialMetadata: audit.socialMetadata,
  });
}

function deriveTwitterCardAudit(
  twitterCardAudit: TwitterCardAuditResult | undefined,
  audit: {
    socialMetadata: SocialMetadata;
  },
): TwitterCardAuditResult {
  if (
    twitterCardAudit &&
    typeof twitterCardAudit === "object" &&
    typeof twitterCardAudit.score === "number" &&
    Array.isArray(twitterCardAudit.findings) &&
    twitterCardAudit.findings.length > 0
  ) {
    return {
      score: Math.max(0, Math.min(100, twitterCardAudit.score)),
      status:
        twitterCardAudit.status === "good" ||
        twitterCardAudit.status === "warning" ||
        twitterCardAudit.status === "poor"
          ? twitterCardAudit.status
          : "poor",
      findings: twitterCardAudit.findings.filter(
        (finding) =>
          finding &&
          typeof finding.id === "string" &&
          typeof finding.label === "string" &&
          typeof finding.message === "string",
      ),
      issues: Array.isArray(twitterCardAudit.issues)
        ? twitterCardAudit.issues.filter(
            (issue) =>
              issue &&
              typeof issue.title === "string" &&
              typeof issue.explanation === "string",
          )
        : [],
      recommendations: Array.isArray(twitterCardAudit.recommendations)
        ? twitterCardAudit.recommendations.filter(
            (recommendation) =>
              recommendation &&
              typeof recommendation.title === "string" &&
              typeof recommendation.howToFix === "string",
          )
        : [],
    };
  }

  return runTwitterCardAudit({
    socialMetadata: audit.socialMetadata,
  });
}

function deriveAdvancedSchemaAudit(
  advancedSchemaAudit: AdvancedSchemaAuditResult | undefined,
  audit: {
    schemaTypes: string[];
  },
  html: string,
): AdvancedSchemaAuditResult {
  if (
    advancedSchemaAudit &&
    typeof advancedSchemaAudit === "object" &&
    typeof advancedSchemaAudit.score === "number" &&
    Array.isArray(advancedSchemaAudit.findings) &&
    advancedSchemaAudit.findings.length > 0
  ) {
    return {
      score: Math.max(0, Math.min(100, advancedSchemaAudit.score)),
      status:
        advancedSchemaAudit.status === "good" ||
        advancedSchemaAudit.status === "warning" ||
        advancedSchemaAudit.status === "poor"
          ? advancedSchemaAudit.status
          : "poor",
      findings: advancedSchemaAudit.findings.filter(
        (finding) =>
          finding &&
          typeof finding.id === "string" &&
          typeof finding.label === "string" &&
          typeof finding.message === "string",
      ),
      issues: Array.isArray(advancedSchemaAudit.issues)
        ? advancedSchemaAudit.issues.filter(
            (issue) =>
              issue &&
              typeof issue.title === "string" &&
              typeof issue.explanation === "string",
          )
        : [],
      recommendations: Array.isArray(advancedSchemaAudit.recommendations)
        ? advancedSchemaAudit.recommendations.filter(
            (recommendation) =>
              recommendation &&
              typeof recommendation.title === "string" &&
              typeof recommendation.howToFix === "string",
          )
        : [],
    };
  }

  return runAdvancedSchemaAudit({
    html,
    schemaTypes: audit.schemaTypes,
  });
}

function deriveSiteCrawl(siteCrawl: SiteCrawlResult | undefined): SiteCrawlResult {
  if (!siteCrawl || typeof siteCrawl !== "object") {
    return { ...defaultSiteCrawl };
  }

  const maxPages =
    typeof siteCrawl.maxPages === "number"
      ? Math.max(1, Math.min(5, siteCrawl.maxPages))
      : defaultSiteCrawl.maxPages;

  const pages = Array.isArray(siteCrawl.pages)
    ? siteCrawl.pages
        .filter(
          (page) =>
            page &&
            typeof page === "object" &&
            typeof page.url === "string" &&
            typeof page.html === "string" &&
            typeof page.text === "string" &&
            Array.isArray(page.links),
        )
        .slice(0, maxPages)
        .map((page) => ({
          url: page.url,
          title: typeof page.title === "string" ? page.title : undefined,
          statusCode:
            typeof page.statusCode === "number" ? page.statusCode : undefined,
          html: page.html,
          text: page.text,
          links: page.links.filter((link) => typeof link === "string"),
        }))
    : [];

  return {
    startUrl: typeof siteCrawl.startUrl === "string" ? siteCrawl.startUrl : "",
    pages,
    discoveredUrls: Array.isArray(siteCrawl.discoveredUrls)
      ? siteCrawl.discoveredUrls.filter((url) => typeof url === "string")
      : [],
    failedUrls: Array.isArray(siteCrawl.failedUrls)
      ? siteCrawl.failedUrls.filter((url) => typeof url === "string")
      : [],
    maxPages,
  };
}

function deriveAccessibilityFindings(
  findings: AccessibilityFinding[] | undefined,
): AccessibilityFinding[] {
  if (!Array.isArray(findings)) {
    return [];
  }

  return findings
    .filter(
      (finding) =>
        finding &&
        typeof finding.id === "string" &&
        typeof finding.label === "string" &&
        typeof finding.status === "string" &&
        typeof finding.wcag === "string" &&
        typeof finding.message === "string" &&
        typeof finding.recommendation === "string",
    )
    .map((finding) => ({
      id: finding.id,
      label: finding.label,
      status:
        finding.status === "pass" ||
        finding.status === "warning" ||
        finding.status === "fail"
          ? finding.status
          : "warning",
      wcag: finding.wcag,
      message: finding.message,
      recommendation: finding.recommendation,
    }));
}

function deriveAccessibilityAnalysis(
  accessibilityAnalysis: AccessibilityAnalysis | undefined,
): AccessibilityAnalysis {
  if (!accessibilityAnalysis || typeof accessibilityAnalysis !== "object") {
    return { ...defaultAccessibilityAnalysis };
  }

  const imageCount =
    typeof accessibilityAnalysis.imageCount === "number"
      ? accessibilityAnalysis.imageCount
      : 0;
  const imagesMissingAlt =
    typeof accessibilityAnalysis.imagesMissingAlt === "number"
      ? accessibilityAnalysis.imagesMissingAlt
      : 0;
  const inputCount =
    typeof accessibilityAnalysis.inputCount === "number"
      ? accessibilityAnalysis.inputCount
      : 0;
  const inputsMissingLabels =
    typeof accessibilityAnalysis.inputsMissingLabels === "number"
      ? accessibilityAnalysis.inputsMissingLabels
      : 0;
  const buttonCount =
    typeof accessibilityAnalysis.buttonCount === "number"
      ? accessibilityAnalysis.buttonCount
      : 0;
  const buttonsWithoutText =
    typeof accessibilityAnalysis.buttonsWithoutText === "number"
      ? accessibilityAnalysis.buttonsWithoutText
      : 0;
  const altTextCoverage =
    typeof accessibilityAnalysis.altTextCoverage === "number"
      ? accessibilityAnalysis.altTextCoverage
      : imageCount === 0
        ? 100
        : Math.round(((imageCount - imagesMissingAlt) / imageCount) * 100);
  const findings = deriveAccessibilityFindings(accessibilityAnalysis.findings);

  return {
    score:
      typeof accessibilityAnalysis.score === "number"
        ? Math.max(0, Math.min(100, accessibilityAnalysis.score))
        : 0,
    imageCount,
    imagesMissingAlt,
    altTextCoverage,
    buttonCount,
    buttonsWithoutText,
    inputCount,
    inputsMissingLabels,
    headingOrderIssues:
      typeof accessibilityAnalysis.headingOrderIssues === "number"
        ? accessibilityAnalysis.headingOrderIssues
        : 0,
    landmarkCount:
      typeof accessibilityAnalysis.landmarkCount === "number"
        ? accessibilityAnalysis.landmarkCount
        : 0,
    hasMainLandmark: Boolean(accessibilityAnalysis.hasMainLandmark),
    hasNavLandmark: Boolean(accessibilityAnalysis.hasNavLandmark),
    hasHeaderLandmark: Boolean(accessibilityAnalysis.hasHeaderLandmark),
    hasFooterLandmark: Boolean(accessibilityAnalysis.hasFooterLandmark),
    hasLangAttribute: Boolean(accessibilityAnalysis.hasLangAttribute),
    hasTitle: Boolean(accessibilityAnalysis.hasTitle),
    skipLinkDetected: Boolean(accessibilityAnalysis.skipLinkDetected),
    ariaLabelCount:
      typeof accessibilityAnalysis.ariaLabelCount === "number"
        ? accessibilityAnalysis.ariaLabelCount
        : 0,
    ariaHiddenCount:
      typeof accessibilityAnalysis.ariaHiddenCount === "number"
        ? accessibilityAnalysis.ariaHiddenCount
        : 0,
    emptyLinkCount:
      typeof accessibilityAnalysis.emptyLinkCount === "number"
        ? accessibilityAnalysis.emptyLinkCount
        : 0,
    duplicateIdCount:
      typeof accessibilityAnalysis.duplicateIdCount === "number"
        ? accessibilityAnalysis.duplicateIdCount
        : 0,
    findings,
  };
}

export function isValidStoredAudit(data: unknown): boolean {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return false;
  }

  const audit = data as Partial<AuditResponse>;

  return (
    typeof audit.url === "string" &&
    typeof audit.finalUrl === "string" &&
    typeof audit.statusCode === "number"
  );
}

export function normalizeAuditResponse(data: unknown): AuditResponse | null {
  if (!isValidStoredAudit(data)) {
    return null;
  }

  const audit = data as Partial<AuditResponse>;
  const headings = normalizeHeadings(audit.headings);
  const links = normalizeLinks(audit.links);
  const schemaTypes = Array.isArray(audit.schemaTypes) ? audit.schemaTypes : [];
  const trustSignals = deriveTrustSignals(audit.trustSignals);
  const robotsAnalysis = deriveRobotsAnalysis(audit.robotsAnalysis);
  const sitemapAnalysis = deriveSitemapAnalysis(audit.sitemapAnalysis);
  const technicalSignals = deriveTechnicalSignals(
    audit.technicalSignals,
    robotsAnalysis,
    sitemapAnalysis,
  );
  const socialMetadata = deriveSocialMetadata(audit.socialMetadata);
  const entityAnalysis = deriveEntityAnalysis(audit.entityAnalysis);
  const readabilityAnalysis = deriveReadabilityAnalysis(audit.readabilityAnalysis);

  return {
    url: audit.url ?? "",
    finalUrl: audit.finalUrl ?? "",
    statusCode: audit.statusCode ?? 0,
    title: typeof audit.title === "string" ? audit.title : "",
    metaDescription:
      typeof audit.metaDescription === "string" ? audit.metaDescription : "",
    headings,
    canonical: typeof audit.canonical === "string" ? audit.canonical : "",
    robotsMeta: typeof audit.robotsMeta === "string" ? audit.robotsMeta : "",
    schemaTypes,
    links,
    trustSignals,
    aiVisibilitySignals: deriveAiVisibilitySignals(
      {
        title: audit.title,
        metaDescription: audit.metaDescription,
        headings,
        links,
        schemaTypes,
        trustSignals,
      },
      audit.aiVisibilitySignals,
    ),
    robotsAnalysis,
    sitemapAnalysis,
    technicalSignals,
    socialMetadata: deriveSocialMetadata(audit.socialMetadata),
    entityAnalysis,
    entityClarityAudit: deriveEntityClarityAudit(audit.entityClarityAudit, {
      title: audit.title,
      metaDescription: audit.metaDescription,
      schemaTypes,
      headings,
      trustSignals,
      entityAnalysis,
      socialMetadata,
      finalUrl: audit.finalUrl,
    }, audit.siteCrawl),
    citationReadinessAudit: deriveCitationReadinessAudit(
      audit.citationReadinessAudit,
      {
        title: audit.title,
        metaDescription: audit.metaDescription,
        schemaTypes,
        headings,
        links,
        trustSignals,
        finalUrl: audit.finalUrl,
      },
      audit.siteCrawl,
    ),
    answerExtractionAudit: deriveAnswerExtractionAudit(
      audit.answerExtractionAudit,
      {
        schemaTypes,
        headings,
        readabilityAnalysis,
      },
    ),
    trustSignalsAudit: deriveTrustSignalsAudit(audit.trustSignalsAudit, {
      finalUrl: audit.finalUrl,
      trustSignals,
    }, audit.siteCrawl),
    openGraphAudit: deriveOpenGraphAudit(audit.openGraphAudit, {
      socialMetadata,
    }),
    twitterCardAudit: deriveTwitterCardAudit(audit.twitterCardAudit, {
      socialMetadata,
    }),
    advancedSchemaAudit: deriveAdvancedSchemaAudit(
      audit.advancedSchemaAudit,
      { schemaTypes },
      "",
    ),
    readabilityAnalysis,
    accessibilityAnalysis: deriveAccessibilityAnalysis(audit.accessibilityAnalysis),
    checks: normalizeChecks(audit.checks),
    siteCrawl: deriveSiteCrawl(audit.siteCrawl),
  };
}

export function getTrustSignalsAudit(
  audit: AuditResponse,
): TrustSignalsAuditResult {
  return audit.trustSignalsAudit ?? defaultTrustSignalsAudit;
}

export function getOpenGraphAudit(audit: AuditResponse): OpenGraphAuditResult {
  return audit.openGraphAudit ?? defaultOpenGraphAudit;
}

export function getTwitterCardAudit(audit: AuditResponse): TwitterCardAuditResult {
  return audit.twitterCardAudit ?? defaultTwitterCardAudit;
}

export function getAdvancedSchemaAudit(
  audit: AuditResponse,
): AdvancedSchemaAuditResult {
  return audit.advancedSchemaAudit ?? defaultAdvancedSchemaAudit;
}

export function getSiteCrawl(audit: AuditResponse): SiteCrawlResult {
  return audit.siteCrawl ?? defaultSiteCrawl;
}

export function getAnswerExtractionAudit(
  audit: AuditResponse,
): AnswerExtractionAuditResult {
  return audit.answerExtractionAudit ?? defaultAnswerExtractionAudit;
}

export function getCitationReadinessAudit(
  audit: AuditResponse,
): CitationReadinessAuditResult {
  return audit.citationReadinessAudit ?? defaultCitationReadinessAudit;
}

export function getEntityClarityAudit(
  audit: AuditResponse,
): EntityClarityAuditResult {
  return audit.entityClarityAudit ?? defaultEntityClarityAudit;
}

export function getTechnicalSignals(audit: AuditResponse): TechnicalSignal[] {
  if (audit.technicalSignals?.length) {
    return audit.technicalSignals;
  }

  return buildTechnicalSignals(
    getRobotsAnalysis(audit),
    getSitemapAnalysis(audit),
  );
}

export function getSitemapAnalysis(audit: AuditResponse): SitemapAnalysis {
  return audit.sitemapAnalysis ?? defaultSitemapAnalysis;
}

export function getRobotsAnalysis(audit: AuditResponse): RobotsAnalysis {
  return audit.robotsAnalysis ?? defaultRobotsAnalysis;
}

export function getTrustSignals(audit: AuditResponse): TrustSignals {
  return audit.trustSignals ?? defaultTrustSignals;
}

export function getAiVisibilitySignals(audit: AuditResponse): AiVisibilitySignals {
  return audit.aiVisibilitySignals ?? defaultAiVisibilitySignals;
}

export function getSocialMetadata(audit: AuditResponse): SocialMetadata {
  return audit.socialMetadata ?? defaultSocialMetadata;
}

export function getEntityAnalysis(audit: AuditResponse): EntityAnalysis {
  return audit.entityAnalysis ?? defaultEntityAnalysis;
}

export function getReadabilityAnalysis(audit: AuditResponse): ReadabilityAnalysis {
  return audit.readabilityAnalysis ?? defaultReadabilityAnalysis;
}

export function getAccessibilityAnalysis(
  audit: AuditResponse,
): AccessibilityAnalysis {
  return audit.accessibilityAnalysis ?? defaultAccessibilityAnalysis;
}
