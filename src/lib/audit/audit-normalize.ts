import { hasTrustPages } from "./trust-signals";
import { defaultRobotsAnalysis } from "./robots-check";
import { defaultSitemapAnalysis } from "./sitemap-check";
import { defaultSocialMetadata } from "./social-metadata";
import type {
  AiVisibilitySignals,
  AuditCheck,
  AuditHeadings,
  AuditLinks,
  AuditResponse,
  RobotsAnalysis,
  SitemapAnalysis,
  SocialMetadata,
  TrustSignals,
} from "./types";

export const AUDIT_SCHEMA_VERSION = 5;

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

function deriveRobotsAnalysis(
  robotsAnalysis: RobotsAnalysis | undefined,
): RobotsAnalysis {
  if (!robotsAnalysis || typeof robotsAnalysis !== "object") {
    return { ...defaultRobotsAnalysis };
  }

  return {
    exists: Boolean(robotsAnalysis.exists),
    sitemapCount:
      typeof robotsAnalysis.sitemapCount === "number"
        ? robotsAnalysis.sitemapCount
        : 0,
    disallowCount:
      typeof robotsAnalysis.disallowCount === "number"
        ? robotsAnalysis.disallowCount
        : 0,
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
  };
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
    },
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
    robotsAnalysis: deriveRobotsAnalysis(audit.robotsAnalysis),
    sitemapAnalysis: deriveSitemapAnalysis(audit.sitemapAnalysis),
    socialMetadata: deriveSocialMetadata(audit.socialMetadata),
    checks: normalizeChecks(audit.checks),
  };
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
