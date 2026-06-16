import * as cheerio from "cheerio";
import { detectSchemaTypes } from "./schema-detector";
import { parseHtml } from "./html-parser";
import { detectTrustSignals } from "./trust-signals";
import type {
  AuditFinding,
  AuditIssue,
  AuditRecommendation,
  AIAuditStatus,
  CitationReadinessAuditResult,
} from "@/types/audit";
import type { AuditHeadings, AuditLinks, ParsedAnchor, TrustSignals } from "./types";

const SIGNAL_COUNT = 9;

const GENERIC_TITLES = /^(home|homepage|welcome|index|untitled|page)$/i;

const REFERENCE_HEADING_PATTERN =
  /\b(references?|sources?|citations?|bibliography|footnotes?|further reading|works cited)\b/i;

const EXPERT_REVIEWER_PATTERN =
  /\b(reviewed by|fact[\s-]?check(?:ed)?|medically reviewed|editorial team|expert review|verified by|peer[\s-]?reviewed)\b/i;

const STATISTIC_PATTERN =
  /\b\d+(?:\.\d+)?%|\b\d{1,3}(?:,\d{3})+\b|\b(?:according to|study found|research shows|survey|reported that|data shows)\b/i;

const AUTHORITY_HOSTS = [
  "wikipedia.org",
  "wikidata.org",
  "nytimes.com",
  "bbc.com",
  "reuters.com",
  "nature.com",
  "sciencedirect.com",
  "pubmed",
  "doi.org",
  "arxiv.org",
  "gov",
  "edu",
];

type CitationSignal = {
  id: string;
  label: string;
  passed: boolean;
  partial?: boolean;
  passMessage: string;
  failMessage: string;
  recommendation: string;
  estimatedGain: number;
};

export type CitationReadinessSitePage = {
  url: string;
  html: string;
  text: string;
  links: string[];
};

export type CitationReadinessAuditOptions = {
  sitePages?: CitationReadinessSitePage[];
  primaryPageUrl?: string;
};

type SiteContext = {
  combinedHtml: string;
  combinedText: string;
  combinedLinks: string[];
  pageUrls: string[];
  sitePages: CitationReadinessSitePage[];
  usesSiteCrawl: boolean;
};

type DetectionResult = {
  detected: boolean;
  partial: boolean;
  detail: string;
};

export type CitationReadinessAuditInput = {
  html: string;
  title: string;
  metaDescription: string;
  schemaTypes: string[];
  headings: AuditHeadings;
  links: AuditLinks;
  trustSignals: TrustSignals;
  anchors: ParsedAnchor[];
  pageUrl: string;
};

export const defaultCitationReadinessAudit: CitationReadinessAuditResult = {
  score: 0,
  status: "poor",
  findings: [],
  issues: [],
  recommendations: [],
};

function cleanText(value: string | undefined | null): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function extractBodyText(html: string): string {
  const $ = cheerio.load(html);
  $("script, style, noscript").remove();
  return cleanText($("body").text());
}

function buildSiteContext(
  input: CitationReadinessAuditInput,
  options?: CitationReadinessAuditOptions,
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

function urlsMatch(left: string, right: string): boolean {
  try {
    const a = new URL(left);
    const b = new URL(right);
    a.hash = "";
    b.hash = "";
    return a.toString() === b.toString();
  } catch {
    return left === right;
  }
}

function formatPageEvidence(
  detail: string,
  pageUrl: string,
  primaryPageUrl?: string,
): string {
  if (primaryPageUrl && urlsMatch(pageUrl, primaryPageUrl)) {
    return detail;
  }

  return `${detail} Detected on crawled page: ${pageUrl}`;
}

function findSitewideHtmlSignal(
  siteContext: SiteContext,
  primaryPageUrl: string | undefined,
  detect: (html: string) => DetectionResult,
  notFoundDetail: string,
): DetectionResult {
  let bestPartial: DetectionResult | null = null;

  for (const page of siteContext.sitePages) {
    const result = detect(page.html);

    if (result.detected) {
      return {
        ...result,
        detail: formatPageEvidence(result.detail, page.url, primaryPageUrl),
      };
    }

    if (result.partial) {
      bestPartial = {
        ...result,
        detail: formatPageEvidence(result.detail, page.url, primaryPageUrl),
      };
    }
  }

  return (
    bestPartial ?? {
      detected: false,
      partial: false,
      detail: notFoundDetail,
    }
  );
}

function findSitewideSchemaSignal(
  siteContext: SiteContext,
  primaryPageUrl: string | undefined,
  detect: (html: string, schemaTypes: string[]) => DetectionResult,
  notFoundDetail: string,
): DetectionResult {
  let bestPartial: DetectionResult | null = null;

  for (const page of siteContext.sitePages) {
    const result = detect(page.html, detectSchemaTypes(page.html));

    if (result.detected) {
      return {
        ...result,
        detail: formatPageEvidence(result.detail, page.url, primaryPageUrl),
      };
    }

    if (result.partial) {
      bestPartial = {
        ...result,
        detail: formatPageEvidence(result.detail, page.url, primaryPageUrl),
      };
    }
  }

  return (
    bestPartial ?? {
      detected: false,
      partial: false,
      detail: notFoundDetail,
    }
  );
}

function findSitewideReferencesSignal(
  siteContext: SiteContext,
  primaryPageUrl: string | undefined,
): DetectionResult {
  let bestPartial: DetectionResult | null = null;

  for (const page of siteContext.sitePages) {
    const parsed = parseHtml(page.html, page.url);
    const result = detectReferencesSection(parsed.headings, page.html);

    if (result.detected) {
      return {
        ...result,
        detail: formatPageEvidence(result.detail, page.url, primaryPageUrl),
      };
    }

    if (result.partial) {
      bestPartial = {
        ...result,
        detail: formatPageEvidence(result.detail, page.url, primaryPageUrl),
      };
    }
  }

  return (
    bestPartial ?? {
      detected: false,
      partial: false,
      detail: "No references, sources, or citations section was detected.",
    }
  );
}

function detectExternalSourcesSitewide(
  input: CitationReadinessAuditInput,
  siteContext: SiteContext,
  primaryPageUrl?: string,
): DetectionResult {
  if (!siteContext.usesSiteCrawl) {
    return detectExternalSources(
      input.links,
      input.trustSignals,
      input.anchors,
      input.pageUrl,
    );
  }

  let bestPartial: DetectionResult | null = null;

  for (const page of siteContext.sitePages) {
    const parsed = parseHtml(page.html, page.url);
    const pageTrust = detectTrustSignals({
      pageUrl: page.url,
      anchors: parsed.anchors ?? [],
    });
    const result = detectExternalSources(
      parsed.links,
      pageTrust,
      parsed.anchors ?? [],
      page.url,
    );

    if (result.detected) {
      return {
        ...result,
        detail: formatPageEvidence(result.detail, page.url, primaryPageUrl),
      };
    }

    if (result.partial) {
      bestPartial = {
        ...result,
        detail: formatPageEvidence(result.detail, page.url, primaryPageUrl),
      };
    }
  }

  return (
    bestPartial ?? {
      detected: false,
      partial: false,
      detail: "No meaningful external source links were detected.",
    }
  );
}

function hasSchemaType(schemaTypes: string[], type: string): boolean {
  return schemaTypes.some(
    (schemaType) => schemaType.toLowerCase() === type.toLowerCase(),
  );
}

function visitJsonNodes(node: unknown, visitor: (record: Record<string, unknown>) => void): void {
  if (!node || typeof node !== "object") {
    return;
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      visitJsonNodes(item, visitor);
    }
    return;
  }

  const record = node as Record<string, unknown>;
  visitor(record);

  const graph = record["@graph"];

  if (Array.isArray(graph)) {
    for (const item of graph) {
      visitJsonNodes(item, visitor);
    }
  }
}

function hasSchemaField(html: string, field: string): boolean {
  const $ = cheerio.load(html);
  let found = false;

  $('script[type="application/ld+json"]').each((_, element) => {
    if (found) {
      return;
    }

    const raw = $(element).html()?.trim();

    if (!raw) {
      return;
    }

    try {
      visitJsonNodes(JSON.parse(raw) as unknown, (record) => {
        if (found) {
          return;
        }

        const value = record[field];

        if (typeof value === "string" && value.trim()) {
          found = true;
        }
      });
    } catch {
      return;
    }
  });

  return found;
}

function detectAuthor(
  html: string,
  schemaTypes: string[],
): { detected: boolean; partial: boolean; detail: string } {
  const $ = cheerio.load(html);

  if (
    hasSchemaType(schemaTypes, "Person") ||
    /rel=["']author["']/i.test(html) ||
    $('meta[name="author"], meta[property="article:author"]').length > 0 ||
    $('[itemprop="author"], [class*="author"], [rel="author"]').length > 0
  ) {
    const authorMeta = cleanText(
      $('meta[name="author"]').attr("content") ||
        $('meta[property="article:author"]').attr("content"),
    );
    const byline = cleanText(
      $('[class*="byline"], [class*="author-name"], .author').first().text(),
    );

    return {
      detected: true,
      partial: false,
      detail: authorMeta
        ? `Author detected: ${authorMeta}.`
        : byline
          ? `Author byline detected: ${byline}.`
          : "Author markup or schema was detected.",
    };
  }

  const bodyText = cleanText($("body").text());

  if (/\bby\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\b/.test(bodyText)) {
    return {
      detected: false,
      partial: true,
      detail: "Possible author byline found, but structured author markup is missing.",
    };
  }

  return {
    detected: false,
    partial: false,
    detail: "No author name or author markup was detected.",
  };
}

function detectPublishDate(html: string): { detected: boolean; partial: boolean; detail: string } {
  if (
    /property=["']article:published_time["']/i.test(html) ||
    /name=["'](?:date|pubdate|publish(?:ed)?_date)["']/i.test(html) ||
    hasSchemaField(html, "datePublished") ||
    /<time[^>]+datetime=/i.test(html)
  ) {
    return {
      detected: true,
      partial: false,
      detail: "A publish date signal was detected in metadata or markup.",
    };
  }

  const $ = cheerio.load(html);
  const bodyText = cleanText($("body").text());

  if (/\b(?:published|posted)\s+(?:on\s+)?(?:\w+\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2})\b/i.test(bodyText)) {
    return {
      detected: false,
      partial: true,
      detail: "Publish date text found, but no machine-readable date markup detected.",
    };
  }

  return {
    detected: false,
    partial: false,
    detail: "No publish date was detected.",
  };
}

function detectLastUpdated(html: string): { detected: boolean; partial: boolean; detail: string } {
  if (
    /property=["']article:modified_time["']/i.test(html) ||
    /name=["'](?:last-modified|revised|updated)["']/i.test(html) ||
    hasSchemaField(html, "dateModified")
  ) {
    return {
      detected: true,
      partial: false,
      detail: "A last updated date signal was detected.",
    };
  }

  const $ = cheerio.load(html);
  const bodyText = cleanText($("body").text());

  if (/\b(?:updated|last updated|revised)\s+(?:on\s+)?(?:\w+\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2})\b/i.test(bodyText)) {
    return {
      detected: false,
      partial: true,
      detail: "Updated date text found, but no machine-readable modified date detected.",
    };
  }

  return {
    detected: false,
    partial: false,
    detail: "No last updated date was detected.",
  };
}

function isAuthorityHost(hostname: string): boolean {
  const host = hostname.toLowerCase();

  return AUTHORITY_HOSTS.some(
    (authority) => host === authority || host.endsWith(`.${authority}`) || host.includes(authority),
  );
}

function detectExternalSources(
  links: AuditLinks,
  trustSignals: TrustSignals,
  anchors: ParsedAnchor[],
  pageUrl: string,
): { detected: boolean; partial: boolean; detail: string } {
  let authorityCount = trustSignals.externalAuthorityLinks;

  for (const anchor of anchors) {
    if (!anchor.href || anchor.href.startsWith("#")) {
      continue;
    }

    try {
      const resolved = new URL(anchor.href, pageUrl);

      if (isAuthorityHost(resolved.hostname)) {
        authorityCount += 1;
      }
    } catch {
      continue;
    }
  }

  if (authorityCount >= 2) {
    return {
      detected: true,
      partial: false,
      detail: `${authorityCount} external source or authority link(s) detected.`,
    };
  }

  if (links.external >= 2 || authorityCount >= 1) {
    return {
      detected: false,
      partial: true,
      detail: `${links.external} external link(s) found, but few authoritative source references.`,
    };
  }

  return {
    detected: false,
    partial: false,
    detail: "No meaningful external source links were detected.",
  };
}

function detectStatistics(html: string): { detected: boolean; partial: boolean; detail: string } {
  const $ = cheerio.load(html);
  const bodyText = cleanText($("article, main, body").first().text());
  const matches = bodyText.match(new RegExp(STATISTIC_PATTERN.source, "gi")) ?? [];

  if (matches.length >= 2) {
    return {
      detected: true,
      partial: false,
      detail: `${matches.length} statistic or numeric evidence pattern(s) detected.`,
    };
  }

  if (matches.length === 1) {
    return {
      detected: false,
      partial: true,
      detail: "One numeric or statistical pattern found; more sourced data would strengthen citation value.",
    };
  }

  return {
    detected: false,
    partial: false,
    detail: "No statistics or numeric evidence patterns were detected.",
  };
}

function detectReferencesSection(
  headings: AuditHeadings,
  html: string,
): { detected: boolean; partial: boolean; detail: string } {
  const allHeadings = [...headings.h2, ...headings.h3];
  const referenceHeading = allHeadings.find((heading) =>
    REFERENCE_HEADING_PATTERN.test(heading),
  );

  if (referenceHeading) {
    return {
      detected: true,
      partial: false,
      detail: `References section detected: "${referenceHeading}".`,
    };
  }

  if (
    /id=["'][^"']*(?:references|sources|citations|bibliography)[^"']*["']/i.test(html) ||
    /class=["'][^"']*(?:references|sources|citations|bibliography)[^"']*["']/i.test(html)
  ) {
    return {
      detected: false,
      partial: true,
      detail: "Reference-like section markup found without a clear heading.",
    };
  }

  return {
    detected: false,
    partial: false,
    detail: "No references, sources, or citations section was detected.",
  };
}

function detectExpertReviewer(
  html: string,
  schemaTypes: string[],
): { detected: boolean; partial: boolean; detail: string } {
  const $ = cheerio.load(html);
  const bodyText = cleanText($("body").text());

  if (
    EXPERT_REVIEWER_PATTERN.test(bodyText) ||
    hasSchemaType(schemaTypes, "Review") ||
    /itemprop=["'](?:reviewedBy|editor)["']/i.test(html)
  ) {
    return {
      detected: true,
      partial: false,
      detail: "Expert, reviewer, or fact-check signal detected.",
    };
  }

  if (/\b(?:editor|editorial|contributor|written by)\b/i.test(bodyText)) {
    return {
      detected: false,
      partial: true,
      detail: "Editorial attribution language found, but no explicit reviewer signal detected.",
    };
  }

  return {
    detected: false,
    partial: false,
    detail: "No expert or reviewer signal was detected.",
  };
}

function detectCitationFriendlyTitle(title: string): {
  detected: boolean;
  partial: boolean;
  detail: string;
} {
  const normalized = cleanText(title);

  if (!normalized) {
    return {
      detected: false,
      partial: false,
      detail: "Page title is missing.",
    };
  }

  const wordCount = normalized.split(/\s+/).length;
  const isGeneric = GENERIC_TITLES.test(normalized);

  if (!isGeneric && normalized.length >= 25 && normalized.length <= 70 && wordCount >= 4) {
    return {
      detected: true,
      partial: false,
      detail: "Page title is descriptive and citation-friendly.",
    };
  }

  if (!isGeneric && normalized.length >= 15 && wordCount >= 3) {
    return {
      detected: false,
      partial: true,
      detail: "Page title exists but could be more descriptive for AI citation snippets.",
    };
  }

  return {
    detected: false,
    partial: isGeneric,
    detail: isGeneric
      ? "Page title is too generic for reliable AI citation."
      : "Page title is missing or too short for citation-friendly summaries.",
  };
}

function detectCitationFriendlyMeta(metaDescription: string): {
  detected: boolean;
  partial: boolean;
  detail: string;
} {
  const normalized = cleanText(metaDescription);

  if (!normalized) {
    return {
      detected: false,
      partial: false,
      detail: "Meta description is missing.",
    };
  }

  if (normalized.length >= 70 && normalized.length <= 160) {
    return {
      detected: true,
      partial: false,
      detail: "Meta description length is citation-friendly.",
    };
  }

  if (normalized.length >= 40) {
    return {
      detected: false,
      partial: true,
      detail: "Meta description exists but is outside the ideal citation-friendly length.",
    };
  }

  return {
    detected: false,
    partial: false,
    detail: "Meta description is too short for useful AI citation context.",
  };
}

function buildSignals(
  input: CitationReadinessAuditInput,
  options?: CitationReadinessAuditOptions,
): CitationSignal[] {
  const siteContext = buildSiteContext(input, options);
  const primaryPageUrl = options?.primaryPageUrl ?? input.pageUrl;

  const author = siteContext.usesSiteCrawl
    ? findSitewideSchemaSignal(
        siteContext,
        primaryPageUrl,
        detectAuthor,
        "No author name or author markup was detected.",
      )
    : detectAuthor(input.html, input.schemaTypes);
  const publishDate = siteContext.usesSiteCrawl
    ? findSitewideHtmlSignal(
        siteContext,
        primaryPageUrl,
        detectPublishDate,
        "No publish date was detected.",
      )
    : detectPublishDate(input.html);
  const lastUpdated = siteContext.usesSiteCrawl
    ? findSitewideHtmlSignal(
        siteContext,
        primaryPageUrl,
        detectLastUpdated,
        "No last updated date was detected.",
      )
    : detectLastUpdated(input.html);
  const externalSources = detectExternalSourcesSitewide(
    input,
    siteContext,
    primaryPageUrl,
  );
  const statistics = siteContext.usesSiteCrawl
    ? findSitewideHtmlSignal(
        siteContext,
        primaryPageUrl,
        detectStatistics,
        "No statistics or numeric evidence patterns were detected.",
      )
    : detectStatistics(input.html);
  const references = siteContext.usesSiteCrawl
    ? findSitewideReferencesSignal(siteContext, primaryPageUrl)
    : detectReferencesSection(input.headings, input.html);
  const expertReviewer = siteContext.usesSiteCrawl
    ? findSitewideSchemaSignal(
        siteContext,
        primaryPageUrl,
        detectExpertReviewer,
        "No expert or reviewer signal was detected.",
      )
    : detectExpertReviewer(input.html, input.schemaTypes);
  const titleSignal = detectCitationFriendlyTitle(input.title);
  const metaSignal = detectCitationFriendlyMeta(input.metaDescription);

  return [
    {
      id: "author-detected",
      label: "Author detected",
      passed: author.detected,
      partial: author.partial,
      passMessage: author.detail,
      failMessage: author.detail,
      recommendation:
        "Add visible author bylines plus meta author tags or Person/Author schema.",
      estimatedGain: 8,
    },
    {
      id: "publish-date-detected",
      label: "Publish date detected",
      passed: publishDate.detected,
      partial: publishDate.partial,
      passMessage: publishDate.detail,
      failMessage: publishDate.detail,
      recommendation:
        "Add article:published_time meta tags, visible publish dates, and datePublished schema.",
      estimatedGain: 7,
    },
    {
      id: "last-updated-detected",
      label: "Last updated date detected",
      passed: lastUpdated.detected,
      partial: lastUpdated.partial,
      passMessage: lastUpdated.detail,
      failMessage: lastUpdated.detail,
      recommendation:
        "Show last updated dates and add article:modified_time or dateModified schema.",
      estimatedGain: 6,
    },
    {
      id: "external-sources-detected",
      label: "External source links detected",
      passed: externalSources.detected,
      partial: externalSources.partial,
      passMessage: externalSources.detail,
      failMessage: externalSources.detail,
      recommendation:
        "Link to authoritative external sources that support claims on the page.",
      estimatedGain: 7,
    },
    {
      id: "statistics-detected",
      label: "Statistics/numbers detected",
      passed: statistics.detected,
      partial: statistics.partial,
      passMessage: statistics.detail,
      failMessage: statistics.detail,
      recommendation:
        "Include sourced statistics, percentages, or numeric evidence that AI systems can cite.",
      estimatedGain: 5,
    },
    {
      id: "references-section-detected",
      label: "References or citations section detected",
      passed: references.detected,
      partial: references.partial,
      passMessage: references.detail,
      failMessage: references.detail,
      recommendation:
        "Add a References or Sources section with outbound links to supporting materials.",
      estimatedGain: 6,
    },
    {
      id: "expert-reviewer-detected",
      label: "Expert/reviewer signal detected",
      passed: expertReviewer.detected,
      partial: expertReviewer.partial,
      passMessage: expertReviewer.detail,
      failMessage: expertReviewer.detail,
      recommendation:
        "Add reviewer, editor, or fact-check attribution for expert credibility.",
      estimatedGain: 5,
    },
    {
      id: "citation-friendly-title",
      label: "Page title is citation-friendly",
      passed: titleSignal.detected,
      partial: titleSignal.partial,
      passMessage: titleSignal.detail,
      failMessage: titleSignal.detail,
      recommendation:
        "Use a descriptive title with topic, entity, and context instead of a generic homepage label.",
      estimatedGain: 6,
    },
    {
      id: "citation-friendly-meta",
      label: "Meta description is citation-friendly",
      passed: metaSignal.detected,
      partial: metaSignal.partial,
      passMessage: metaSignal.detail,
      failMessage: metaSignal.detail,
      recommendation:
        "Write a 70–160 character meta description that summarizes the page for AI citation.",
      estimatedGain: 5,
    },
  ];
}

function signalToFinding(signal: CitationSignal): AuditFinding {
  const status = signal.passed ? "pass" : signal.partial ? "warning" : "fail";

  return {
    id: signal.id,
    label: signal.label,
    status,
    message: signal.passed || signal.partial ? signal.passMessage : signal.failMessage,
    recommendation: status === "pass" ? undefined : signal.recommendation,
  };
}

function signalToPoints(signal: CitationSignal): number {
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
          ? finding.id === "author-detected" ||
            finding.id === "publish-date-detected" ||
            finding.id === "external-sources-detected"
            ? "Critical"
            : "High"
          : "Medium",
      explanation: finding.message,
    }));
}

function buildRecommendations(signals: CitationSignal[]): AuditRecommendation[] {
  return signals
    .filter((signal) => !signal.passed)
    .map((signal) => ({
      title: signal.partial
        ? `Strengthen ${signal.label.toLowerCase()}`
        : `Add ${signal.label.toLowerCase()}`,
      whyThisMatters:
        "LLM search systems prefer pages with clear authorship, dates, references, and update signals before citing them.",
      howToFix: signal.recommendation,
      estimatedGain: signal.estimatedGain,
    }))
    .sort((left, right) => right.estimatedGain - left.estimatedGain);
}

export function runCitationReadinessAudit(
  input: CitationReadinessAuditInput,
  options?: CitationReadinessAuditOptions,
): CitationReadinessAuditResult {
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

export function getCitationReadinessSummary(result: CitationReadinessAuditResult): string {
  const passedCount = result.findings.filter((finding) => finding.status === "pass").length;

  if (result.status === "good") {
    return `${passedCount}/${SIGNAL_COUNT} citation readiness signals detected; this page looks safe for AI citation.`;
  }

  if (result.status === "warning") {
    return `${passedCount}/${SIGNAL_COUNT} citation readiness signals detected; authorship, dates, or source evidence need improvement.`;
  }

  return `Only ${passedCount}/${SIGNAL_COUNT} citation readiness signals detected; AI systems may avoid citing this page.`;
}
