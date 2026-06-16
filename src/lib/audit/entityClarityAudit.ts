import * as cheerio from "cheerio";
import { detectSchemaTypes } from "./schema-detector";
import type {
  AuditFinding,
  AuditIssue,
  AuditRecommendation,
  EntityClarityAuditResult,
  AIAuditStatus,
} from "@/types/audit";
import type {
  AuditHeadings,
  EntityAnalysis,
  SocialMetadata,
  TrustSignals,
} from "./types";

const SIGNAL_COUNT = 9;

const EMAIL_PATTERN =
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
const PHONE_PATTERN =
  /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}(?:[\s.-]?\d{1,4})?/;

const LOCATION_PATTERNS = [
  /\b\d{1,5}\s+[A-Za-z0-9.\s]+(?:street|st\.|road|rd\.|avenue|ave\.|boulevard|blvd\.|lane|ln\.|drive|dr\.)\b/i,
  /\b\d{5}(?:-\d{4})?\b/,
  /\b(?:suite|ste\.|floor|fl\.|unit)\s+[A-Za-z0-9-]+\b/i,
  /\b(?:headquarters|hq|office|campus)\b/i,
];

const PRODUCT_SERVICE_PATTERNS = [
  /\b(?:product|products|service|services|solution|solutions|platform|software|tool|tools)\b/i,
  /\b(?:pricing|plans|features|offerings|capabilities|consulting|subscription)\b/i,
  /\b(?:saas|api|integration|marketplace|store|shop|catalog)\b/i,
];

const DESCRIPTION_MIN_LENGTH = 40;

const ABOUT_PATH_PATTERN = /\/about(?:\/|$|-)/i;
const CONTACT_PATH_PATTERN = /\/contact(?:\/|$|-)/i;

const ABOUT_LINK_PATTERN = /about|über-uns|ueber-uns|who-we-are|unternehmen/i;
const CONTACT_LINK_PATTERN = /contact|kontakt|get-in-touch/i;

export type EntityClaritySitePage = {
  url: string;
  html: string;
  text: string;
  links: string[];
};

export type EntityClarityAuditOptions = {
  sitePages?: EntityClaritySitePage[];
  primaryPageUrl?: string;
};

type SiteContext = {
  combinedHtml: string;
  combinedText: string;
  combinedLinks: string[];
  pageUrls: string[];
  sitePages: EntityClaritySitePage[];
  usesSiteCrawl: boolean;
};

type SignalEvidence = {
  detected: boolean;
  partial?: boolean;
  detail: string;
};

type EntityClaritySignal = {
  id: string;
  label: string;
  passed: boolean;
  partial?: boolean;
  passMessage: string;
  failMessage: string;
  recommendation: string;
  issueImpact?: AuditIssue["impact"];
  estimatedGain: number;
};

export type EntityClarityAuditInput = {
  html: string;
  title: string;
  metaDescription: string;
  schemaTypes: string[];
  headings: AuditHeadings;
  trustSignals: TrustSignals;
  entityAnalysis: EntityAnalysis;
  socialMetadata?: SocialMetadata;
};

export const defaultEntityClarityAudit: EntityClarityAuditResult = {
  score: 0,
  status: "poor",
  findings: [],
  issues: [],
  recommendations: [],
};

function hasSchemaType(schemaTypes: string[], type: string): boolean {
  return schemaTypes.some(
    (schemaType) => schemaType.toLowerCase() === type.toLowerCase(),
  );
}

function cleanText(value: string | undefined | null): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function extractBodyText(html: string): string {
  const $ = cheerio.load(html);
  $("script, style, noscript").remove();
  return cleanText($("body").text());
}

function buildSiteContext(
  input: EntityClarityAuditInput,
  options?: EntityClarityAuditOptions,
): SiteContext {
  const sitePages = options?.sitePages?.filter((page) => page?.html) ?? [];

  if (sitePages.length === 0) {
    return {
      combinedHtml: input.html,
      combinedText: extractBodyText(input.html),
      combinedLinks: [],
      pageUrls: [],
      sitePages: [],
      usesSiteCrawl: false,
    };
  }

  return {
    combinedHtml: sitePages.map((page) => page.html).join("\n"),
    combinedText: sitePages.map((page) => cleanText(page.text)).join(" "),
    combinedLinks: Array.from(new Set(sitePages.flatMap((page) => page.links))),
    pageUrls: sitePages.map((page) => page.url),
    sitePages,
    usesSiteCrawl: true,
  };
}

function pathnameMatches(url: string, pattern: RegExp): boolean {
  try {
    return pattern.test(new URL(url).pathname);
  } catch {
    return pattern.test(url);
  }
}

function findPageByPath(
  sitePages: EntityClaritySitePage[],
  pattern: RegExp,
): EntityClaritySitePage | undefined {
  return sitePages.find((page) => pathnameMatches(page.url, pattern));
}

function findLinkMatch(
  links: string[],
  pathPattern: RegExp,
  textPattern: RegExp,
): string | undefined {
  for (const link of links) {
    if (pathnameMatches(link, pathPattern) || textPattern.test(link)) {
      return link;
    }
  }

  return undefined;
}

function collectSitewideSchemaTypes(sitePages: EntityClaritySitePage[]): string[] {
  const types = new Set<string>();

  for (const page of sitePages) {
    for (const schemaType of detectSchemaTypes(page.html)) {
      types.add(schemaType);
    }
  }

  return Array.from(types);
}

function findHtmlSignalSource(
  sitePages: EntityClaritySitePage[],
  primaryHtml: string,
  primaryPageUrl: string,
  detector: (html: string) => boolean,
  notFoundMessage: string,
  notFoundSitewideMessage: string,
): SignalEvidence {
  if (detector(primaryHtml)) {
    return {
      detected: true,
      detail: primaryPageUrl
        ? `Detected on submitted page (${primaryPageUrl}).`
        : "Detected on submitted page.",
    };
  }

  for (const page of sitePages) {
    if (detector(page.html)) {
      return {
        detected: true,
        detail: `Detected on crawled page (${page.url}).`,
      };
    }
  }

  return {
    detected: false,
    detail: sitePages.length > 0 ? notFoundSitewideMessage : notFoundMessage,
  };
}

function detectAboutPage(
  trustSignals: TrustSignals,
  siteContext: SiteContext,
): SignalEvidence {
  if (trustSignals.aboutPage) {
    return {
      detected: true,
      detail: "An About page link was detected on the submitted page.",
    };
  }

  if (!siteContext.usesSiteCrawl) {
    return {
      detected: false,
      detail: "No About page link was detected.",
    };
  }

  const crawledAbout = findPageByPath(siteContext.sitePages, ABOUT_PATH_PATTERN);

  if (crawledAbout) {
    return {
      detected: true,
      detail: `About page content found at ${crawledAbout.url}.`,
    };
  }

  const aboutLink = findLinkMatch(
    siteContext.combinedLinks,
    ABOUT_PATH_PATTERN,
    ABOUT_LINK_PATTERN,
  );

  if (aboutLink) {
    return {
      detected: true,
      detail: `About page link found across crawled pages (${aboutLink}).`,
    };
  }

  return {
    detected: false,
    detail: "No About page link was detected across crawled pages.",
  };
}

function detectContactPage(
  trustSignals: TrustSignals,
  siteContext: SiteContext,
): SignalEvidence {
  if (trustSignals.contactPage) {
    return {
      detected: true,
      detail: "A Contact page link was detected on the submitted page.",
    };
  }

  if (!siteContext.usesSiteCrawl) {
    return {
      detected: false,
      detail: "No Contact page link was detected.",
    };
  }

  const crawledContact = findPageByPath(
    siteContext.sitePages,
    CONTACT_PATH_PATTERN,
  );

  if (crawledContact) {
    return {
      detected: true,
      detail: `Contact page content found at ${crawledContact.url}.`,
    };
  }

  const contactLink = findLinkMatch(
    siteContext.combinedLinks,
    CONTACT_PATH_PATTERN,
    CONTACT_LINK_PATTERN,
  );

  if (contactLink) {
    return {
      detected: true,
      detail: `Contact page link found across crawled pages (${contactLink}).`,
    };
  }

  return {
    detected: false,
    detail: "No Contact page link was detected across crawled pages.",
  };
}

function detectEmail(html: string): boolean {
  if (/mailto:[^"'\s>]+/i.test(html)) {
    return true;
  }

  const $ = cheerio.load(html);
  const bodyText = cleanText($("body").text());
  return EMAIL_PATTERN.test(bodyText);
}

function detectPhone(html: string): boolean {
  if (/tel:[^"'\s>]+/i.test(html)) {
    return true;
  }

  const $ = cheerio.load(html);
  const bodyText = cleanText($("body").text());
  const matches = bodyText.match(PHONE_PATTERN);

  if (!matches) {
    return false;
  }

  return matches.some((match) => match.replace(/\D/g, "").length >= 10);
}

function detectSchemaDescription(html: string): string | null {
  const $ = cheerio.load(html);

  for (const element of $('script[type="application/ld+json"]').toArray()) {
    const raw = $(element).html()?.trim();

    if (!raw) {
      continue;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      const description = findDescriptionInNode(parsed);

      if (description) {
        return description;
      }
    } catch {
      continue;
    }
  }

  return null;
}

function findDescriptionInNode(node: unknown): string | null {
  if (!node || typeof node !== "object") {
    return null;
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      const description = findDescriptionInNode(item);

      if (description) {
        return description;
      }
    }

    return null;
  }

  const record = node as Record<string, unknown>;
  const description = cleanText(
    typeof record.description === "string" ? record.description : "",
  );

  if (description.length >= DESCRIPTION_MIN_LENGTH) {
    return description;
  }

  const graph = record["@graph"];

  if (Array.isArray(graph)) {
    for (const item of graph) {
      const nested = findDescriptionInNode(item);

      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

function detectLocation(
  html: string,
  schemaTypes: string[],
  entityAnalysis: EntityAnalysis,
): boolean {
  if (
    hasSchemaType(schemaTypes, "LocalBusiness") ||
    entityAnalysis.entityType === "LocalBusiness"
  ) {
    return true;
  }

  if (/itemprop=["']address["']/i.test(html)) {
    return true;
  }

  if (/"@type"\s*:\s*"(?:PostalAddress|Place|LocalBusiness)"/i.test(html)) {
    return true;
  }

  if (/"address"\s*:\s*\{/i.test(html)) {
    return true;
  }

  const $ = cheerio.load(html);
  const bodyText = cleanText($("body").text());

  return LOCATION_PATTERNS.some((pattern) => pattern.test(bodyText));
}

function detectProductServiceKeywords(
  headings: AuditHeadings,
  metaDescription: string,
  relatedEntities: string[],
  extraText = "",
): boolean {
  const combined = cleanText(
    [
      metaDescription,
      extraText,
      ...headings.h1,
      ...headings.h2,
      ...headings.h3,
      ...relatedEntities,
    ].join(" "),
  );

  return PRODUCT_SERVICE_PATTERNS.some((pattern) => pattern.test(combined));
}

function detectProductServiceSitewide(
  input: EntityClarityAuditInput,
  siteContext: SiteContext,
): SignalEvidence {
  if (
    detectProductServiceKeywords(
      input.headings,
      input.metaDescription,
      input.entityAnalysis.relatedEntities,
    )
  ) {
    return {
      detected: true,
      detail: "Product or service keywords were found on the submitted page.",
    };
  }

  if (!siteContext.usesSiteCrawl) {
    return {
      detected: false,
      detail: "No clear product or service keywords were detected.",
    };
  }

  const sourcePage = siteContext.sitePages.find((page) =>
    PRODUCT_SERVICE_PATTERNS.some((pattern) => pattern.test(page.text)),
  );

  if (sourcePage) {
    return {
      detected: true,
      detail: `Product or service keywords found on ${sourcePage.url}.`,
    };
  }

  if (PRODUCT_SERVICE_PATTERNS.some((pattern) => pattern.test(siteContext.combinedText))) {
    return {
      detected: true,
      detail: "Product or service keywords found across crawled pages.",
    };
  }

  return {
    detected: false,
    detail: "No clear product or service keywords were detected across crawled pages.",
  };
}

function detectBusinessDescription(
  metaDescription: string,
  html: string,
  socialMetadata?: SocialMetadata,
): boolean {
  if (metaDescription.length >= DESCRIPTION_MIN_LENGTH) {
    return true;
  }

  const ogDescription = cleanText(socialMetadata?.openGraph.description);

  if (ogDescription.length >= DESCRIPTION_MIN_LENGTH) {
    return true;
  }

  const schemaDescription = detectSchemaDescription(html);

  return Boolean(schemaDescription && schemaDescription.length >= DESCRIPTION_MIN_LENGTH);
}

function detectBusinessDescriptionSitewide(
  input: EntityClarityAuditInput,
  siteContext: SiteContext,
): SignalEvidence {
  if (
    detectBusinessDescription(
      input.metaDescription,
      input.html,
      input.socialMetadata,
    )
  ) {
    return {
      detected: true,
      detail: "A substantive business description was detected on the submitted page.",
    };
  }

  if (!siteContext.usesSiteCrawl) {
    return {
      detected: false,
      detail: "No substantive business description was detected.",
    };
  }

  const schemaDescription = detectSchemaDescription(siteContext.combinedHtml);

  if (schemaDescription && schemaDescription.length >= DESCRIPTION_MIN_LENGTH) {
    return {
      detected: true,
      detail: "A substantive business description was detected in crawled JSON-LD.",
    };
  }

  const sourcePage = siteContext.sitePages.find(
    (page) => page.text.length >= DESCRIPTION_MIN_LENGTH,
  );

  if (sourcePage) {
    return {
      detected: true,
      detail: `Substantive business description found on ${sourcePage.url}.`,
    };
  }

  return {
    detected: false,
    detail: "No substantive business description was detected across crawled pages.",
  };
}

function detectLocationSitewide(
  input: EntityClarityAuditInput,
  siteContext: SiteContext,
): SignalEvidence {
  const schemaTypes = siteContext.usesSiteCrawl
    ? collectSitewideSchemaTypes(siteContext.sitePages)
    : input.schemaTypes;
  const html = siteContext.usesSiteCrawl
    ? siteContext.combinedHtml
    : input.html;

  if (
    detectLocation(html, schemaTypes, input.entityAnalysis)
  ) {
    if (!siteContext.usesSiteCrawl) {
      return {
        detected: true,
        detail: "Location or address signals were detected on the submitted page.",
      };
    }

    const sourcePage = siteContext.sitePages.find((page) =>
      detectLocation(page.html, detectSchemaTypes(page.html), input.entityAnalysis),
    );

    return {
      detected: true,
      detail: sourcePage
        ? `Location or address signals found on ${sourcePage.url}.`
        : "Location or address signals found across crawled pages.",
    };
  }

  return {
    detected: false,
    detail: siteContext.usesSiteCrawl
      ? "No location or address signals were detected across crawled pages."
      : "No location or address signals were detected.",
  };
}

function detectOrganizationName(entityAnalysis: EntityAnalysis): {
  detected: boolean;
  partial: boolean;
  detail: string;
} {
  if (!entityAnalysis.primaryEntity) {
    return {
      detected: false,
      partial: false,
      detail: "No organization name could be detected.",
    };
  }

  const source = entityAnalysis.sources[0] ?? "";

  if (
    source === "page title" ||
    source === "domain name" ||
    entityAnalysis.confidence < 60
  ) {
    return {
      detected: false,
      partial: true,
      detail: `Weak name signal from ${source || "limited metadata"}: ${entityAnalysis.primaryEntity}.`,
    };
  }

  return {
    detected: true,
    partial: false,
    detail: `Organization name detected: ${entityAnalysis.primaryEntity}.`,
  };
}

function buildSignals(
  input: EntityClarityAuditInput,
  options?: EntityClarityAuditOptions,
): EntityClaritySignal[] {
  const siteContext = buildSiteContext(input, options);
  const primaryPageUrl = options?.primaryPageUrl ?? "";
  const orgName = detectOrganizationName(input.entityAnalysis);
  const organizationSchema =
    hasSchemaType(input.schemaTypes, "Organization") ||
    input.entityAnalysis.sources.some((source) =>
      /organization schema/i.test(source),
    );
  const aboutPage = detectAboutPage(input.trustSignals, siteContext);
  const contactPage = detectContactPage(input.trustSignals, siteContext);
  const emailDetected = findHtmlSignalSource(
    siteContext.sitePages,
    input.html,
    primaryPageUrl,
    detectEmail,
    "No contact email address was detected.",
    "No contact email address was detected across crawled pages.",
  );
  const phoneDetected = findHtmlSignalSource(
    siteContext.sitePages,
    input.html,
    primaryPageUrl,
    detectPhone,
    "No phone number was detected.",
    "No phone number was detected across crawled pages.",
  );
  const locationDetected = detectLocationSitewide(input, siteContext);
  const productServiceDetected = detectProductServiceSitewide(input, siteContext);
  const businessDescriptionDetected = detectBusinessDescriptionSitewide(
    input,
    siteContext,
  );

  return [
    {
      id: "organization-name",
      label: "Organization name detected",
      passed: orgName.detected,
      partial: orgName.partial,
      passMessage: orgName.detail,
      failMessage: orgName.detail,
      recommendation:
        "Add Organization schema with a clear name and align it with your page title and logo alt text.",
      issueImpact: "Critical",
      estimatedGain: 8,
    },
    {
      id: "organization-schema",
      label: "Organization schema detected",
      passed: organizationSchema,
      passMessage: "Organization schema is present in JSON-LD.",
      failMessage: "Organization schema was not detected.",
      recommendation:
        "Add JSON-LD Organization markup with name, url, logo, and sameAs links.",
      issueImpact: "High",
      estimatedGain: 7,
    },
    {
      id: "about-page",
      label: "About page link detected",
      passed: aboutPage.detected,
      passMessage: aboutPage.detail,
      failMessage: aboutPage.detail,
      recommendation:
        "Add a visible About page that explains who the organization is and what it does.",
      issueImpact: "High",
      estimatedGain: 5,
    },
    {
      id: "contact-page",
      label: "Contact page link detected",
      passed: contactPage.detected,
      passMessage: contactPage.detail,
      failMessage: contactPage.detail,
      recommendation:
        "Add a Contact page with clear ways to reach the organization.",
      issueImpact: "Medium",
      estimatedGain: 4,
    },
    {
      id: "email-detected",
      label: "Email detected",
      passed: emailDetected.detected,
      passMessage: emailDetected.detail,
      failMessage: emailDetected.detail,
      recommendation:
        "Publish a contact email on the Contact page or in Organization schema contactPoint.",
      issueImpact: "Medium",
      estimatedGain: 3,
    },
    {
      id: "phone-detected",
      label: "Phone detected",
      passed: phoneDetected.detected,
      passMessage: phoneDetected.detail,
      failMessage: phoneDetected.detail,
      recommendation:
        "Add a phone number for local or service businesses where phone contact matters.",
      issueImpact: "Medium",
      estimatedGain: 3,
    },
    {
      id: "location-detected",
      label: "Location detected",
      passed: locationDetected.detected,
      passMessage: locationDetected.detail,
      failMessage: locationDetected.detail,
      recommendation:
        "Add address details in LocalBusiness or Organization schema and on your Contact page.",
      issueImpact: "Medium",
      estimatedGain: 4,
    },
    {
      id: "product-service-keywords",
      label: "Product/service keywords detected",
      passed: productServiceDetected.detected,
      passMessage: productServiceDetected.detail,
      failMessage: productServiceDetected.detail,
      recommendation:
        "Use explicit product/service terms in H2 headings, meta description, and service pages.",
      issueImpact: "High",
      estimatedGain: 5,
    },
    {
      id: "business-description",
      label: "Business description detected",
      passed: businessDescriptionDetected.detected,
      passMessage: businessDescriptionDetected.detail,
      failMessage: businessDescriptionDetected.detail,
      recommendation:
        "Write a clear meta description or schema description explaining what the business does.",
      issueImpact: "High",
      estimatedGain: 6,
    },
  ];
}

function signalToFinding(signal: EntityClaritySignal): AuditFinding {
  const status = signal.passed
    ? "pass"
    : signal.partial
      ? "warning"
      : "fail";

  return {
    id: signal.id,
    label: signal.label,
    status,
    message: signal.passed || signal.partial ? signal.passMessage : signal.failMessage,
    recommendation: status === "pass" ? undefined : signal.recommendation,
  };
}

function signalToPoints(signal: EntityClaritySignal): number {
  if (signal.passed) {
    return 100;
  }

  if (signal.partial) {
    return 55;
  }

  return 0;
}

function deriveStatus(score: number): AIAuditStatus {
  if (score >= 80) {
    return "good";
  }

  if (score >= 50) {
    return "warning";
  }

  return "poor";
}

function buildIssues(findings: AuditFinding[]): AuditIssue[] {
  return findings
    .filter((finding) => finding.status !== "pass")
    .map((finding) => ({
      title: finding.label,
      impact:
        finding.status === "fail"
          ? finding.id === "organization-name" || finding.id === "organization-schema"
            ? "Critical"
            : "High"
          : "Medium",
      explanation: finding.message,
    }));
}

function buildRecommendations(signals: EntityClaritySignal[]): AuditRecommendation[] {
  return signals
    .filter((signal) => !signal.passed)
    .map((signal) => ({
      title: signal.partial
        ? `Strengthen ${signal.label.toLowerCase()}`
        : `Add ${signal.label.toLowerCase()}`,
      whyThisMatters:
        signal.partial
          ? "AI systems need a consistent, high-confidence organization identity to map your brand correctly."
          : "AI systems use explicit entity signals to understand who you are, what you offer, and how to cite you.",
      howToFix: signal.recommendation,
      estimatedGain: signal.estimatedGain,
    }))
    .sort((left, right) => right.estimatedGain - left.estimatedGain);
}

export function runEntityClarityAudit(
  input: EntityClarityAuditInput,
  options?: EntityClarityAuditOptions,
): EntityClarityAuditResult {
  const signals = buildSignals(input, options);
  const findings = signals.map(signalToFinding);
  const score = Math.round(
    signals.reduce((total, signal) => total + signalToPoints(signal), 0) /
      SIGNAL_COUNT,
  );

  return {
    score,
    status: deriveStatus(score),
    findings,
    issues: buildIssues(findings),
    recommendations: buildRecommendations(signals),
  };
}

export function getEntityClaritySummary(result: EntityClarityAuditResult): string {
  const passedCount = result.findings.filter(
    (finding) => finding.status === "pass",
  ).length;

  if (result.status === "good") {
    return `${passedCount}/${SIGNAL_COUNT} entity clarity signals detected; AI systems can likely identify this organization.`;
  }

  if (result.status === "warning") {
    return `${passedCount}/${SIGNAL_COUNT} entity clarity signals detected; some identity or offering details are missing.`;
  }

  return `Only ${passedCount}/${SIGNAL_COUNT} entity clarity signals detected; AI systems may struggle to understand this organization.`;
}
