import { buildReportView } from "@/lib/audit/audit-to-report";
import { calculateAuditScores } from "@/lib/audit/audit-score";
import {
  getRobotsAnalysis,
  getSitemapAnalysis,
  getSocialMetadata,
} from "@/lib/audit/audit-normalize";
import { loadAuditReportSafe } from "@/lib/audit/storage";
import {
  hasCompleteOpenGraph,
  hasTwitterCard,
} from "@/lib/audit/social-metadata";
import type { AuditCheck, AuditResponse } from "@/lib/audit/types";
import { reportMeta } from "@/lib/report-data";
import { enrichRecommendationFields } from "@/lib/report/recommendationTemplates";

export type FindingStatus = "optimized" | "needs_attention" | "critical";

export type CategoryFinding = {
  id: string;
  label: string;
  icon: string;
  status: FindingStatus;
  optimization: number;
  detail: string;
};

export type CategoryIssue = {
  title: string;
  impact: "Critical" | "High" | "Medium";
  explanation: string;
  recommendation?: string;
  estimatedGain?: number;
};

export type CategoryRecommendation = {
  title: string;
  description: string;
  estimatedGain?: number;
  whyItMatters?: string;
  howToFix?: string;
  copyableExample?: string;
};

export type CategoryKpi = {
  label: string;
  value: string;
};

export type ImplementationExample = {
  label: string;
  code: string;
};

export type SeoHealthDetailView = {
  domain: string;
  isRealData: boolean;
  score: number;
  statusLabel: string;
  statusTone: "excellent" | "good" | "fair" | "poor";
  summary: string;
  industryAvg: number;
  benchmarkMessage: string;
  kpis: CategoryKpi[];
  findings: CategoryFinding[];
  issues: CategoryIssue[];
  recommendations: CategoryRecommendation[];
  implementationExamples: ImplementationExample[];
  auditDate: string;
  title: string;
  metaDescription: string;
  h1Count: number;
  canonical: string;
  robotsMeta: string;
  internalLinks: number;
};

const SEO_ISSUE_KEYWORDS = [
  "title",
  "meta",
  "h1",
  "canonical",
  "robots",
  "sitemap",
  "open graph",
  "twitter",
  "internal link",
  "seo",
  "description",
  "index",
  "crawl",
];

function getCheck(audit: AuditResponse, id: string): AuditCheck | undefined {
  return audit.checks.find((check) => check.id === id);
}

function checkToFindingStatus(
  status: AuditCheck["status"] | undefined,
): FindingStatus {
  if (status === "pass") {
    return "optimized";
  }

  if (status === "warn") {
    return "needs_attention";
  }

  return "critical";
}

function checkToOptimization(status: AuditCheck["status"] | undefined): number {
  if (status === "pass") {
    return 100;
  }

  if (status === "warn") {
    return 75;
  }

  return 0;
}

function boolToFinding(present: boolean, warnIfMissing = true): FindingStatus {
  if (present) {
    return "optimized";
  }

  return warnIfMissing ? "needs_attention" : "critical";
}

function boolToOptimization(present: boolean): number {
  return present ? 100 : 0;
}

function scoreToTone(score: number): SeoHealthDetailView["statusTone"] {
  if (score >= 90) {
    return "excellent";
  }

  if (score >= 80) {
    return "good";
  }

  if (score >= 60) {
    return "fair";
  }

  return "poor";
}

function scoreToHealthLabel(score: number): string {
  if (score >= 90) {
    return "Excellent Health";
  }

  if (score >= 80) {
    return "Good Health";
  }

  if (score >= 60) {
    return "Fair Health";
  }

  return "Needs Improvement";
}

function isSeoRelated(text: string): boolean {
  const lower = text.toLowerCase();
  return SEO_ISSUE_KEYWORDS.some((keyword) => lower.includes(keyword));
}

function buildIndexabilityScore(audit: AuditResponse): number {
  const robotsAnalysis = getRobotsAnalysis(audit);
  const sitemapAnalysis = getSitemapAnalysis(audit);
  const signals = [
    Boolean(audit.canonical),
    Boolean(audit.robotsMeta),
    robotsAnalysis.exists,
    sitemapAnalysis.exists,
  ];

  return Math.round(
    (signals.filter(Boolean).length / signals.length) * 100,
  );
}

function buildMetadataScore(audit: AuditResponse): number {
  const titleCheck = getCheck(audit, "title-exists");
  const metaCheck = getCheck(audit, "meta-description-exists");
  const scores = [titleCheck, metaCheck].map((check) =>
    checkToOptimization(check?.status),
  );

  return Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
}

function buildCrawlScore(audit: AuditResponse): number {
  const robotsAnalysis = getRobotsAnalysis(audit);
  const sitemapAnalysis = getSitemapAnalysis(audit);
  const signals = [
    robotsAnalysis.exists,
    robotsAnalysis.sitemapCount > 0 || sitemapAnalysis.exists,
    sitemapAnalysis.urlCount > 0 || sitemapAnalysis.childSitemapCount > 0,
  ];

  return Math.round(
    (signals.filter(Boolean).length / signals.length) * 100,
  );
}

function buildLinkScore(audit: AuditResponse): number {
  const internalLinks = audit.links.internal;

  if (internalLinks >= 20) {
    return 100;
  }

  if (internalLinks >= 5) {
    return 85;
  }

  if (internalLinks > 0) {
    return 70;
  }

  return 40;
}

function buildFindings(audit: AuditResponse): CategoryFinding[] {
  const robotsAnalysis = getRobotsAnalysis(audit);
  const sitemapAnalysis = getSitemapAnalysis(audit);
  const socialMetadata = getSocialMetadata(audit);
  const hasOg = hasCompleteOpenGraph(socialMetadata);
  const hasTwitter = hasTwitterCard(socialMetadata);

  const titleCheck = getCheck(audit, "title-exists");
  const metaCheck = getCheck(audit, "meta-description-exists");
  const h1Check = getCheck(audit, "one-h1-exists");
  const canonicalCheck = getCheck(audit, "canonical-exists");
  const robotsMetaCheck = getCheck(audit, "robots-meta-detected");
  const internalLinksCheck = getCheck(audit, "internal-links-found");

  const sitemapStatus: FindingStatus = sitemapAnalysis.exists
    ? sitemapAnalysis.urlCount > 0 || sitemapAnalysis.childSitemapCount > 0
      ? "optimized"
      : "needs_attention"
    : "critical";

  const sitemapOptimization = sitemapAnalysis.exists
    ? sitemapAnalysis.urlCount > 0 || sitemapAnalysis.childSitemapCount > 0
      ? 100
      : 60
    : 0;

  const robotsTxtStatus: FindingStatus = robotsAnalysis.exists
    ? "optimized"
    : "needs_attention";

  return [
    {
      id: "title",
      label: "Title Tags",
      icon: "title",
      status: checkToFindingStatus(titleCheck?.status),
      optimization: checkToOptimization(titleCheck?.status),
      detail: audit.title || titleCheck?.message || "No title detected.",
    },
    {
      id: "meta-description",
      label: "Meta Description",
      icon: "description",
      status: checkToFindingStatus(metaCheck?.status),
      optimization: checkToOptimization(metaCheck?.status),
      detail:
        audit.metaDescription || metaCheck?.message || "No meta description.",
    },
    {
      id: "h1",
      label: "H1 Heading",
      icon: "format_h1",
      status: checkToFindingStatus(h1Check?.status),
      optimization: checkToOptimization(h1Check?.status),
      detail:
        audit.headings.h1.length === 1
          ? audit.headings.h1[0]
          : h1Check?.message ?? `Found ${audit.headings.h1.length} H1 headings.`,
    },
    {
      id: "canonical",
      label: "Canonical Tags",
      icon: "link",
      status: checkToFindingStatus(canonicalCheck?.status),
      optimization: checkToOptimization(canonicalCheck?.status),
      detail: audit.canonical || canonicalCheck?.message || "No canonical URL.",
    },
    {
      id: "robots-meta",
      label: "Robots Meta",
      icon: "smart_toy",
      status: checkToFindingStatus(robotsMetaCheck?.status),
      optimization: checkToOptimization(robotsMetaCheck?.status),
      detail: audit.robotsMeta || robotsMetaCheck?.message || "Not detected.",
    },
    {
      id: "robots-txt",
      label: "Robots.txt",
      icon: "block",
      status: robotsTxtStatus,
      optimization: boolToOptimization(robotsAnalysis.exists),
      detail: robotsAnalysis.exists
        ? `${robotsAnalysis.disallowCount} disallow rule(s), ${robotsAnalysis.sitemapCount} sitemap declaration(s).`
        : "No robots.txt file found.",
    },
    {
      id: "sitemap",
      label: "XML Sitemap",
      icon: "account_tree",
      status: sitemapStatus,
      optimization: sitemapOptimization,
      detail: sitemapAnalysis.exists
        ? `${sitemapAnalysis.urlCount} URL(s) from ${sitemapAnalysis.source} source.`
        : "No sitemap.xml could be fetched.",
    },
    {
      id: "internal-links",
      label: "Internal Links",
      icon: "mediation",
      status: checkToFindingStatus(internalLinksCheck?.status),
      optimization: checkToOptimization(internalLinksCheck?.status),
      detail: `${audit.links.internal} internal link(s) detected on the page.`,
    },
    {
      id: "open-graph",
      label: "Open Graph",
      icon: "share",
      status: boolToFinding(hasOg),
      optimization: hasOg ? 100 : socialMetadata.openGraph.title ? 60 : 0,
      detail: hasOg
        ? "Complete og:title, og:description, and og:image present."
        : "Open Graph metadata is incomplete.",
    },
    {
      id: "twitter-card",
      label: "Twitter Card",
      icon: "tag",
      status: boolToFinding(hasTwitter),
      optimization: hasTwitter ? 100 : 0,
      detail: hasTwitter
        ? `twitter:card set to "${socialMetadata.twitter.card}".`
        : "No twitter:card tag found.",
    },
  ];
}

function buildIssuesFromCategory(
  audit: AuditResponse,
  scores: ReturnType<typeof calculateAuditScores>,
): CategoryIssue[] {
  const seoCategory = scores.categories.find(
    (category) => category.label === "SEO Health",
  );
  const issues: CategoryIssue[] = [];

  if (seoCategory) {
    for (const problem of seoCategory.problems) {
      issues.push({
        title: problem.replace(/\.$/, ""),
        impact: seoCategory.status === "fail" ? "High" : "Medium",
        explanation: problem,
      });
    }
  }

  for (const issue of scores.priorityIssues) {
    if (!isSeoRelated(issue.title) && !isSeoRelated(issue.explanation)) {
      continue;
    }

    if (issues.some((entry) => entry.title === issue.title)) {
      continue;
    }

    issues.push({
      title: issue.title,
      impact: issue.impact,
      explanation: issue.explanation,
      estimatedGain: issue.estimatedGain,
    });
  }

  const robotsAnalysis = getRobotsAnalysis(audit);
  const sitemapAnalysis = getSitemapAnalysis(audit);
  const socialMetadata = getSocialMetadata(audit);

  if (!robotsAnalysis.exists) {
    issues.push({
      title: "Missing robots.txt",
      impact: "Medium",
      explanation: "No robots.txt file was found for this domain.",
      recommendation: "Publish a robots.txt with crawl directives and sitemap reference.",
    });
  }

  if (!sitemapAnalysis.exists) {
    issues.push({
      title: "Missing XML Sitemap",
      impact: "High",
      explanation: "No sitemap.xml could be fetched for this domain.",
      recommendation: "Add and submit an XML sitemap for crawl discovery.",
    });
  }

  if (!hasCompleteOpenGraph(socialMetadata)) {
    issues.push({
      title: "Incomplete Open Graph",
      impact: "Medium",
      explanation: "Open Graph title, description, or image is missing.",
      recommendation: "Add og:title, og:description, and og:image meta tags.",
    });
  }

  if (!hasTwitterCard(socialMetadata)) {
    issues.push({
      title: "Missing Twitter Card",
      impact: "Medium",
      explanation: "No twitter:card meta tag was detected.",
      recommendation: "Add twitter:card and related Twitter meta tags.",
    });
  }

  return issues.slice(0, 6);
}

function buildRecommendationsFromCategory(
  scores: ReturnType<typeof calculateAuditScores>,
): CategoryRecommendation[] {
  const seoCategory = scores.categories.find(
    (category) => category.label === "SEO Health",
  );
  const recommendations: CategoryRecommendation[] = [];

  if (seoCategory) {
    for (const rec of seoCategory.recommendations) {
      const title = rec.replace(/\.$/, "");
      const enriched = enrichRecommendationFields(title, rec, "SEO Health");

      recommendations.push({
        title,
        description: enriched.howToFix ?? rec,
        estimatedGain: 4,
        ...enriched,
      });
    }
  }

  for (const rec of scores.recommendations) {
    if (!isSeoRelated(rec.title) && !isSeoRelated(rec.howToFix)) {
      continue;
    }

    if (recommendations.some((entry) => entry.title === rec.title)) {
      continue;
    }

    const enriched = enrichRecommendationFields(
      rec.title,
      `${rec.whyThisMatters} ${rec.howToFix}`,
      "SEO Health",
    );

    recommendations.push({
      title: rec.title,
      description: enriched.howToFix ?? rec.howToFix,
      estimatedGain: rec.estimatedGain,
      whyItMatters: enriched.whyItMatters ?? rec.whyThisMatters,
      howToFix: enriched.howToFix ?? rec.howToFix,
      copyableExample: enriched.copyableExample,
    });
  }

  return recommendations.slice(0, 5);
}

function buildImplementationExamples(
  audit: AuditResponse,
  domain: string,
): ImplementationExample[] {
  const title =
    audit.title || `SEO Health Audit | ${domain} | AuditMetric`;
  const description =
    audit.metaDescription ||
    `Technical SEO health audit for ${domain}. Optimize crawlability, metadata, and indexing for AI search visibility.`;

  return [
    {
      label: "Ideal Title Tag",
      code: `<title>${title}</title>`,
    },
    {
      label: "Ideal Meta Description",
      code: `<meta name="description" content="${description}">`,
    },
  ];
}

function buildDemoView(domain: string): SeoHealthDetailView {
  return {
    domain,
    isRealData: false,
    score: 92,
    statusLabel: "Excellent Health",
    statusTone: "excellent",
    summary:
      "Your domain demonstrates superior crawlability and indexing hygiene. Core pages are discoverable by LLM crawlers. Minor optimizations in metadata length could further enhance entity clarity in semantic search contexts.",
    industryAvg: 78,
    benchmarkMessage:
      "You're performing in the top 5% of your industry segment for Technical SEO readiness.",
    kpis: [
      { label: "Indexability", value: "100%" },
      { label: "Metadata", value: "88%" },
      { label: "Crawl Access", value: "94%" },
      { label: "Internal Links", value: "95%" },
    ],
    findings: [
      {
        id: "title",
        label: "Title Tags",
        icon: "title",
        status: "optimized",
        optimization: 98,
        detail: "Page title tag is present and descriptive.",
      },
      {
        id: "meta-description",
        label: "Meta Description",
        icon: "description",
        status: "needs_attention",
        optimization: 83,
        detail: "Meta description exceeds recommended length.",
      },
      {
        id: "h1",
        label: "H1 Heading",
        icon: "format_h1",
        status: "optimized",
        optimization: 100,
        detail: "Exactly one H1 heading was found.",
      },
      {
        id: "canonical",
        label: "Canonical Tags",
        icon: "link",
        status: "optimized",
        optimization: 100,
        detail: "Canonical link tag is present.",
      },
      {
        id: "robots-meta",
        label: "Robots Meta",
        icon: "smart_toy",
        status: "optimized",
        optimization: 100,
        detail: "Robots directive: index, follow.",
      },
      {
        id: "robots-txt",
        label: "Robots.txt",
        icon: "block",
        status: "optimized",
        optimization: 100,
        detail: "0 disallow rules, 1 sitemap declaration.",
      },
      {
        id: "sitemap",
        label: "XML Sitemap",
        icon: "account_tree",
        status: "optimized",
        optimization: 100,
        detail: "248 URL(s) from robots source.",
      },
      {
        id: "internal-links",
        label: "Internal Links",
        icon: "mediation",
        status: "optimized",
        optimization: 95,
        detail: "42 internal link(s) detected on the page.",
      },
      {
        id: "open-graph",
        label: "Open Graph",
        icon: "share",
        status: "optimized",
        optimization: 92,
        detail: "Complete og:title, og:description, and og:image present.",
      },
      {
        id: "twitter-card",
        label: "Twitter Card",
        icon: "tag",
        status: "optimized",
        optimization: 100,
        detail: 'twitter:card set to "summary_large_image".',
      },
    ],
    issues: [
      {
        title: "Meta Description Length",
        impact: "Medium",
        explanation:
          "Meta description may exceed the 160-character limit, causing truncation in search results.",
        recommendation: "Optimize Meta Descriptions",
        estimatedGain: 4,
      },
    ],
    recommendations: [
      {
        title: "Optimize Meta Descriptions",
        description:
          "Keep meta descriptions between 120–160 characters for optimal display.",
        estimatedGain: 4,
      },
      {
        title: "Add a canonical URL",
        description: "Set a canonical link tag to the preferred page version.",
        estimatedGain: 3,
      },
    ],
    implementationExamples: [
      {
        label: "Ideal Title Tag",
        code: "<title>SEO Health Audit | AI Search Visibility | AuditMetric</title>",
      },
      {
        label: "Ideal Meta Description",
        code: '<meta name="description" content="Discover in-depth technical SEO health audits for AI-driven search. Optimize your crawlability and indexing for LLM visibility.">',
      },
    ],
    auditDate: reportMeta.auditDate,
    title: "",
    metaDescription: "",
    h1Count: 1,
    canonical: "",
    robotsMeta: "",
    internalLinks: 42,
  };
}

export function buildSeoHealthDetailView(
  audit: AuditResponse | null,
  fallbackDomain: string,
): SeoHealthDetailView {
  const view = buildReportView(audit, fallbackDomain);

  if (!view.isRealData || !audit) {
    return buildDemoView(view.domain);
  }

  const scores = calculateAuditScores(audit);
  const seoCategory = scores.categories.find(
    (category) => category.label === "SEO Health",
  );
  const score = seoCategory?.score ?? view.score;
  const findings = buildFindings(audit);
  const issues = buildIssuesFromCategory(audit, scores);
  const recommendations = buildRecommendationsFromCategory(scores);

  return {
    domain: view.domain,
    isRealData: true,
    score,
    statusLabel: scoreToHealthLabel(score),
    statusTone: scoreToTone(score),
    summary:
      seoCategory?.summary ??
      "Core SEO signals evaluated from live audit data for this page.",
    industryAvg: 78,
    benchmarkMessage:
      score >= 80
        ? "You're performing above industry average for Technical SEO readiness."
        : "Addressing core SEO gaps could move you above industry average.",
    kpis: [
      { label: "Indexability", value: `${buildIndexabilityScore(audit)}%` },
      { label: "Metadata", value: `${buildMetadataScore(audit)}%` },
      { label: "Crawl Access", value: `${buildCrawlScore(audit)}%` },
      { label: "Internal Links", value: `${buildLinkScore(audit)}%` },
    ],
    findings,
    issues,
    recommendations,
    implementationExamples: buildImplementationExamples(audit, view.domain),
    auditDate: view.auditDate,
    title: audit.title,
    metaDescription: audit.metaDescription,
    h1Count: audit.headings.h1.length,
    canonical: audit.canonical,
    robotsMeta: audit.robotsMeta,
    internalLinks: audit.links.internal,
  };
}

export function loadSeoHealthDetailView(domain: string): SeoHealthDetailView {
  return buildSeoHealthDetailView(loadAuditReportSafe(), domain);
}
