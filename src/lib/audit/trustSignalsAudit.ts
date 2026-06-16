import * as cheerio from "cheerio";
import { parseHtml } from "./html-parser";
import { detectTrustSignals } from "./trust-signals";
import type {
  AuditFinding,
  AuditIssue,
  AuditRecommendation,
  AIAuditStatus,
  TrustSignalsAuditResult,
} from "@/types/audit";
import type { ParsedAnchor, TrustSignals } from "./types";

const SIGNAL_COUNT = 9;

const EMAIL_PATTERN =
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
const PHONE_PATTERN =
  /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}(?:[\s.-]?\d{1,4})?/;

const ADDRESS_PATTERNS = [
  /\b\d{1,5}\s+[A-Za-z0-9.\s]+(?:street|st\.|road|rd\.|avenue|ave\.|boulevard|blvd\.|lane|ln\.|drive|dr\.)\b/i,
  /\b\d{5}(?:-\d{4})?\b/,
  /\b(?:suite|ste\.|floor|fl\.|unit)\s+[A-Za-z0-9-]+\b/i,
  /itemprop=["']address["']/i,
  /"@type"\s*:\s*"PostalAddress"/i,
];

const TEAM_PATTERNS = [
  /\b(?:team|leadership|founders?|our people|staff|meet the team|about us)\b/i,
  /\/team\b/i,
  /\/leadership\b/i,
  /\/people\b/i,
];

const ABOUT_PATH_PATTERN = /\/(?:about|ueber-uns|über-uns|unternehmen|who-we-are)(?:\/|$|-)/i;
const CONTACT_PATH_PATTERN = /\/(?:contact|kontakt|get-in-touch)(?:\/|$|-)/i;
const PRIVACY_PATH_PATTERN =
  /\/(?:privacy|datenschutz|datenschutzerklaerung|datenschutzerklärung|data-protection)(?:\/|$|-)/i;
const LEGAL_PATH_PATTERN =
  /\/(?:terms|legal|imprint|impressum|agb|rechtliches|nutzungsbedingungen|disclaimer)(?:\/|$|-)/i;

const ABOUT_LINK_PATTERN = /about|über-uns|ueber-uns|who-we-are|unternehmen/i;
const CONTACT_LINK_PATTERN = /contact|kontakt|get-in-touch/i;
const PRIVACY_LINK_PATTERN =
  /privacy|datenschutz|datenschutzerklärung|datenschutzerklaerung|data-protection/i;
const LEGAL_LINK_PATTERN =
  /terms|legal|imprint|impressum|agb|rechtliches|nutzungsbedingungen|disclaimer/i;

export type TrustSignalsSitePage = {
  url: string;
  html: string;
  text: string;
  links: string[];
};

export type TrustSignalsAuditOptions = {
  sitePages?: TrustSignalsSitePage[];
};

type SiteContext = {
  combinedHtml: string;
  combinedText: string;
  combinedLinks: string[];
  pageUrls: string[];
  sitePages: TrustSignalsSitePage[];
  usesSiteCrawl: boolean;
};

type SignalEvidence = {
  detected: boolean;
  partial?: boolean;
  detail: string;
};

type TrustSignal = {
  id: string;
  label: string;
  passed: boolean;
  partial?: boolean;
  passMessage: string;
  failMessage: string;
  recommendation: string;
  estimatedGain: number;
};

export type TrustSignalsAuditInput = {
  html: string;
  pageUrl: string;
  finalUrl: string;
  trustSignals: TrustSignals;
  anchors: ParsedAnchor[];
};

export const defaultTrustSignalsAudit: TrustSignalsAuditResult = {
  score: 0,
  status: "poor",
  findings: [],
  issues: [],
  recommendations: [],
};

function cleanText(value: string | undefined | null): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function buildSiteContext(
  input: TrustSignalsAuditInput,
  options?: TrustSignalsAuditOptions,
): SiteContext {
  const sitePages = options?.sitePages?.filter((page) => page?.html) ?? [];

  if (sitePages.length === 0) {
    return {
      combinedHtml: input.html,
      combinedText: cleanText(cheerio.load(input.html)("body").text()),
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
  sitePages: TrustSignalsSitePage[],
  pathPattern: RegExp,
): TrustSignalsSitePage | undefined {
  return sitePages.find((page) => pathnameMatches(page.url, pathPattern));
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

function collectSitewideTrustSignals(
  input: TrustSignalsAuditInput,
  siteContext: SiteContext,
): TrustSignals {
  if (!siteContext.usesSiteCrawl) {
    return input.trustSignals;
  }

  const anchors: ParsedAnchor[] = [...input.anchors];

  for (const page of siteContext.sitePages) {
    const parsed = parseHtml(page.html, page.url);
    anchors.push(...(parsed.anchors ?? []));
  }

  const aggregated = detectTrustSignals({
    pageUrl: input.finalUrl || input.pageUrl,
    anchors,
  });

  return {
    aboutPage: input.trustSignals.aboutPage || aggregated.aboutPage,
    contactPage: input.trustSignals.contactPage || aggregated.contactPage,
    privacyPage: input.trustSignals.privacyPage || aggregated.privacyPage,
    legalPage: input.trustSignals.legalPage || aggregated.legalPage,
    socialLinks: Math.max(input.trustSignals.socialLinks, aggregated.socialLinks),
    externalAuthorityLinks: Math.max(
      input.trustSignals.externalAuthorityLinks,
      aggregated.externalAuthorityLinks,
    ),
  };
}

function detectTrustPage(
  primaryFlag: boolean,
  aggregatedFlag: boolean,
  siteContext: SiteContext,
  pathPattern: RegExp,
  linkPattern: RegExp,
  submittedMessage: string,
  notFoundMessage: string,
  foundLabel: string,
): SignalEvidence {
  if (primaryFlag) {
    return {
      detected: true,
      detail: submittedMessage,
    };
  }

  if (!siteContext.usesSiteCrawl) {
    return {
      detected: false,
      detail: notFoundMessage,
    };
  }

  if (aggregatedFlag) {
    const crawledPage = findPageByPath(siteContext.sitePages, pathPattern);

    if (crawledPage) {
      return {
        detected: true,
        detail: `${foundLabel} found at ${crawledPage.url}.`,
      };
    }

    const matchedLink = findLinkMatch(
      siteContext.combinedLinks,
      pathPattern,
      linkPattern,
    );

    if (matchedLink) {
      return {
        detected: true,
        detail: `${foundLabel} link found across crawled pages (${matchedLink}).`,
      };
    }

    return {
      detected: true,
      detail: `${foundLabel} detected across crawled pages.`,
    };
  }

  const crawledPage = findPageByPath(siteContext.sitePages, pathPattern);

  if (crawledPage) {
    return {
      detected: true,
      detail: `${foundLabel} content found at ${crawledPage.url}.`,
    };
  }

  const matchedLink = findLinkMatch(
    siteContext.combinedLinks,
    pathPattern,
    linkPattern,
  );

  if (matchedLink) {
    return {
      detected: true,
      detail: `${foundLabel} link found across crawled pages (${matchedLink}).`,
    };
  }

  if (
    linkPattern.test(siteContext.combinedText) ||
    linkPattern.test(siteContext.combinedHtml)
  ) {
    const sourcePage = siteContext.sitePages.find(
      (page) => linkPattern.test(page.text) || linkPattern.test(page.html),
    );

    return {
      detected: true,
      detail: sourcePage
        ? `${foundLabel} signal found on ${sourcePage.url}.`
        : `${foundLabel} detected across crawled pages.`,
    };
  }

  return {
    detected: false,
    detail: notFoundMessage,
  };
}

function findHtmlSignalSource(
  sitePages: TrustSignalsSitePage[],
  primaryHtml: string,
  detector: (html: string) => boolean,
  notFoundMessage: string,
  notFoundSitewideMessage: string,
  foundLabel: string,
): SignalEvidence {
  if (detector(primaryHtml)) {
    return {
      detected: true,
      detail: `${foundLabel} detected on the submitted page.`,
    };
  }

  for (const page of sitePages) {
    if (detector(page.html)) {
      return {
        detected: true,
        detail: `${foundLabel} detected on crawled page (${page.url}).`,
      };
    }
  }

  return {
    detected: false,
    detail: sitePages.length > 0 ? notFoundSitewideMessage : notFoundMessage,
  };
}

function detectEmailOrPhone(html: string): boolean {
  if (/mailto:[^"'\s>]+/i.test(html) || /tel:[^"'\s>]+/i.test(html)) {
    return true;
  }

  const $ = cheerio.load(html);
  const bodyText = cleanText($("body").text());

  if (EMAIL_PATTERN.test(bodyText)) {
    return true;
  }

  const phoneMatches = bodyText.match(PHONE_PATTERN);
  return Boolean(
    phoneMatches?.some((match) => match.replace(/\D/g, "").length >= 10),
  );
}

function detectBusinessAddress(html: string): { detected: boolean; partial: boolean; detail: string } {
  if (ADDRESS_PATTERNS.some((pattern) => pattern.test(html))) {
    return {
      detected: true,
      partial: false,
      detail: "Business address or postal address markup was detected.",
    };
  }

  const $ = cheerio.load(html);
  const bodyText = cleanText($("body").text());

  if (/\b(?:headquarters|hq|office located|registered office)\b/i.test(bodyText)) {
    return {
      detected: false,
      partial: true,
      detail: "Office location language found, but no structured address was detected.",
    };
  }

  return {
    detected: false,
    partial: false,
    detail: "No business address was detected on the page.",
  };
}

function detectAuthorTeamSignal(
  html: string,
  anchors: ParsedAnchor[],
  trustSignals: TrustSignals,
): { detected: boolean; partial: boolean; detail: string } {
  const combinedAnchors = anchors
    .map((anchor) => `${anchor.href} ${anchor.text}`)
    .join(" ");

  if (
    TEAM_PATTERNS.some((pattern) => pattern.test(html) || pattern.test(combinedAnchors)) ||
    /rel=["']author["']/i.test(html) ||
    /itemprop=["']author["']/i.test(html) ||
    /class=["'][^"']*(?:author|team-member|leadership)[^"']*["']/i.test(html)
  ) {
    return {
      detected: true,
      partial: false,
      detail: "Author, team, or leadership attribution signal was detected.",
    };
  }

  if (trustSignals.aboutPage) {
    return {
      detected: false,
      partial: true,
      detail: "About page exists, but no team or author attribution signal was found.",
    };
  }

  return {
    detected: false,
    partial: false,
    detail: "No author, team, or about-person signal was detected.",
  };
}

function detectExternalTrustLinks(
  trustSignals: TrustSignals,
): { detected: boolean; partial: boolean; detail: string } {
  if (trustSignals.externalAuthorityLinks >= 2) {
    return {
      detected: true,
      partial: false,
      detail: `${trustSignals.externalAuthorityLinks} external trust or authority link(s) detected.`,
    };
  }

  if (trustSignals.externalAuthorityLinks >= 1) {
    return {
      detected: true,
      partial: false,
      detail: "At least one external trust or authority link was detected.",
    };
  }

  if (trustSignals.socialLinks >= 2) {
    return {
      detected: false,
      partial: true,
      detail: `${trustSignals.socialLinks} social profile link(s) found, but no authority references detected.`,
    };
  }

  if (trustSignals.socialLinks >= 1) {
    return {
      detected: false,
      partial: true,
      detail: "One social profile link found; add authoritative external trust references.",
    };
  }

  return {
    detected: false,
    partial: false,
    detail: "No external trust or authority links were detected.",
  };
}

function detectHttps(finalUrl: string): { detected: boolean; partial: boolean; detail: string } {
  try {
    const url = new URL(finalUrl);

    if (url.protocol === "https:") {
      return {
        detected: true,
        partial: false,
        detail: "Site is served over secure HTTPS.",
      };
    }
  } catch {
    return {
      detected: false,
      partial: false,
      detail: "Could not verify HTTPS for the audited URL.",
    };
  }

  return {
    detected: false,
    partial: false,
    detail: "Site is not served over HTTPS.",
  };
}

function detectBusinessAddressSitewide(
  primaryHtml: string,
  siteContext: SiteContext,
): SignalEvidence {
  const primary = detectBusinessAddress(primaryHtml);

  if (primary.detected) {
    return {
      detected: true,
      detail: "Business address or postal address markup was detected on the submitted page.",
    };
  }

  if (primary.partial) {
    return primary;
  }

  if (!siteContext.usesSiteCrawl) {
    return primary;
  }

  for (const page of siteContext.sitePages) {
    const result = detectBusinessAddress(page.html);

    if (result.detected) {
      return {
        detected: true,
        detail: `Business address detected on crawled page (${page.url}).`,
      };
    }

    if (result.partial) {
      return {
        detected: false,
        partial: true,
        detail: `Office location language found on ${page.url}, but no structured address was detected.`,
      };
    }
  }

  return {
    detected: false,
    detail: "No business address was detected across crawled pages.",
  };
}

function detectAuthorTeamSitewide(
  input: TrustSignalsAuditInput,
  siteContext: SiteContext,
  aggregatedTrust: TrustSignals,
): SignalEvidence {
  const primary = detectAuthorTeamSignal(
    input.html,
    input.anchors,
    aggregatedTrust,
  );

  if (primary.detected) {
    return {
      detected: true,
      detail: "Author, team, or leadership attribution signal was detected on the submitted page.",
    };
  }

  if (!siteContext.usesSiteCrawl) {
    return primary;
  }

  for (const page of siteContext.sitePages) {
    const parsed = parseHtml(page.html, page.url);
    const result = detectAuthorTeamSignal(
      page.html,
      parsed.anchors ?? [],
      aggregatedTrust,
    );

    if (result.detected) {
      return {
        detected: true,
        detail: `Author, team, or leadership signal detected on crawled page (${page.url}).`,
      };
    }
  }

  if (primary.partial) {
    return primary;
  }

  return {
    detected: false,
    detail: "No author, team, or about-person signal was detected across crawled pages.",
  };
}

function detectExternalTrustSitewide(
  primaryTrust: TrustSignals,
  aggregatedTrust: TrustSignals,
  siteContext: SiteContext,
): SignalEvidence {
  const externalTrust = detectExternalTrustLinks(aggregatedTrust);

  if (!siteContext.usesSiteCrawl || externalTrust.detected) {
    if (externalTrust.detected && siteContext.usesSiteCrawl && !primaryTrust.externalAuthorityLinks) {
      const sourcePage = siteContext.sitePages.find((page) => {
        const parsed = parseHtml(page.html, page.url);
        const signals = detectTrustSignals({
          pageUrl: page.url,
          anchors: parsed.anchors ?? [],
        });
        return signals.externalAuthorityLinks > 0;
      });

      return {
        detected: true,
        detail: sourcePage
          ? `External trust links detected on crawled page (${sourcePage.url}).`
          : externalTrust.detail,
      };
    }

    return externalTrust;
  }

  if (externalTrust.partial) {
    return externalTrust;
  }

  return externalTrust;
}

function buildSignals(
  input: TrustSignalsAuditInput,
  options?: TrustSignalsAuditOptions,
): TrustSignal[] {
  const siteContext = buildSiteContext(input, options);
  const aggregatedTrust = collectSitewideTrustSignals(input, siteContext);
  const aboutPage = detectTrustPage(
    input.trustSignals.aboutPage,
    aggregatedTrust.aboutPage,
    siteContext,
    ABOUT_PATH_PATTERN,
    ABOUT_LINK_PATTERN,
    "An About page link was detected on the submitted page.",
    "No About page link was detected.",
    "About page",
  );
  const contactPage = detectTrustPage(
    input.trustSignals.contactPage,
    aggregatedTrust.contactPage,
    siteContext,
    CONTACT_PATH_PATTERN,
    CONTACT_LINK_PATTERN,
    "A Contact page link was detected on the submitted page.",
    "No Contact page link was detected.",
    "Contact page",
  );
  const privacyPage = detectTrustPage(
    input.trustSignals.privacyPage,
    aggregatedTrust.privacyPage,
    siteContext,
    PRIVACY_PATH_PATTERN,
    PRIVACY_LINK_PATTERN,
    "A privacy policy link was detected on the submitted page.",
    "No privacy policy link was detected.",
    "Privacy policy",
  );
  const legalPage = detectTrustPage(
    input.trustSignals.legalPage,
    aggregatedTrust.legalPage,
    siteContext,
    LEGAL_PATH_PATTERN,
    LEGAL_LINK_PATTERN,
    "A terms or legal/imprint page link was detected on the submitted page.",
    "No terms or legal/imprint page link was detected.",
    "Terms/legal page",
  );
  const address = detectBusinessAddressSitewide(input.html, siteContext);
  const emailPhone = findHtmlSignalSource(
    siteContext.sitePages,
    input.html,
    detectEmailOrPhone,
    "No contact email or phone number was detected.",
    "No contact email or phone number was detected across crawled pages.",
    "Contact email or phone",
  );
  const authorTeam = detectAuthorTeamSitewide(input, siteContext, aggregatedTrust);
  const externalTrust = detectExternalTrustSitewide(
    input.trustSignals,
    aggregatedTrust,
    siteContext,
  );
  const https = detectHttps(input.finalUrl);

  return [
    {
      id: "about-page",
      label: "About page detected",
      passed: aboutPage.detected,
      passMessage: aboutPage.detail,
      failMessage: aboutPage.detail,
      recommendation: "Add a visible About page explaining who the organization is.",
      estimatedGain: 7,
    },
    {
      id: "contact-page",
      label: "Contact page detected",
      passed: contactPage.detected,
      passMessage: contactPage.detail,
      failMessage: contactPage.detail,
      recommendation: "Add a Contact page with clear ways to reach the business.",
      estimatedGain: 7,
    },
    {
      id: "privacy-policy",
      label: "Privacy policy detected",
      passed: privacyPage.detected,
      passMessage: privacyPage.detail,
      failMessage: privacyPage.detail,
      recommendation: "Publish a privacy policy and link it in the site footer.",
      estimatedGain: 6,
    },
    {
      id: "terms-legal",
      label: "Terms/legal page detected",
      passed: legalPage.detected,
      passMessage: legalPage.detail,
      failMessage: legalPage.detail,
      recommendation: "Add terms of service, legal notice, or imprint page links.",
      estimatedGain: 5,
    },
    {
      id: "business-address",
      label: "Business address detected",
      passed: address.detected,
      partial: address.partial,
      passMessage: address.detail,
      failMessage: address.detail,
      recommendation:
        "Publish a physical business address on Contact/About pages or in Organization schema.",
      estimatedGain: 5,
    },
    {
      id: "email-phone",
      label: "Email or phone detected",
      passed: emailPhone.detected,
      passMessage: emailPhone.detail,
      failMessage: emailPhone.detail,
      recommendation: "Add visible email/phone contact details and mailto/tel links.",
      estimatedGain: 6,
    },
    {
      id: "author-team",
      label: "Author/team/about-person signal detected",
      passed: authorTeam.detected,
      partial: authorTeam.partial,
      passMessage: authorTeam.detail,
      failMessage: authorTeam.detail,
      recommendation:
        "Add team, leadership, or author attribution on About or article pages.",
      estimatedGain: 5,
    },
    {
      id: "external-trust-links",
      label: "External trust links detected",
      passed: externalTrust.detected,
      partial: externalTrust.partial,
      passMessage: externalTrust.detail,
      failMessage: externalTrust.detail,
      recommendation:
        "Link to authoritative external profiles, references, or citations.",
      estimatedGain: 6,
    },
    {
      id: "secure-https",
      label: "Secure HTTPS detected",
      passed: https.detected,
      partial: https.partial,
      passMessage: https.detail,
      failMessage: https.detail,
      recommendation: "Serve the site over HTTPS with a valid TLS certificate.",
      estimatedGain: 8,
    },
  ];
}

function signalToFinding(signal: TrustSignal): AuditFinding {
  const status = signal.passed ? "pass" : signal.partial ? "warning" : "fail";

  return {
    id: signal.id,
    label: signal.label,
    status,
    message: signal.passed || signal.partial ? signal.passMessage : signal.failMessage,
    recommendation: status === "pass" ? undefined : signal.recommendation,
  };
}

function signalToPoints(signal: TrustSignal): number {
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
          ? finding.id === "secure-https" ||
            finding.id === "about-page" ||
            finding.id === "contact-page"
            ? "Critical"
            : "High"
          : "Medium",
      explanation: finding.message,
    }));
}

function buildRecommendations(signals: TrustSignal[]): AuditRecommendation[] {
  return signals
    .filter((signal) => !signal.passed)
    .map((signal) => ({
      title: signal.partial
        ? `Strengthen ${signal.label.toLowerCase()}`
        : `Add ${signal.label.toLowerCase()}`,
      whyThisMatters:
        "AI search systems weigh trust markers such as contact transparency, legal pages, HTTPS, and authority references before citing a site.",
      howToFix: signal.recommendation,
      estimatedGain: signal.estimatedGain,
    }))
    .sort((left, right) => right.estimatedGain - left.estimatedGain);
}

export function runTrustSignalsAudit(
  input: TrustSignalsAuditInput,
  options?: TrustSignalsAuditOptions,
): TrustSignalsAuditResult {
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

export function getTrustSignalsAuditSummary(
  result: TrustSignalsAuditResult,
): string {
  const passedCount = result.findings.filter((finding) => finding.status === "pass").length;

  if (result.status === "good") {
    return `${passedCount}/${SIGNAL_COUNT} trust signals detected; the site looks credible to AI search systems.`;
  }

  if (result.status === "warning") {
    return `${passedCount}/${SIGNAL_COUNT} trust signals detected; contact, legal, or authority markers need improvement.`;
  }

  return `Only ${passedCount}/${SIGNAL_COUNT} trust signals detected; AI systems may treat this site as low trust.`;
}
