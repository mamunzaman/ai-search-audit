import { buildReportView } from "@/lib/audit/audit-to-report";
import { calculateAuditScores } from "@/lib/audit/audit-score";
import { loadAuditReportSafe } from "@/lib/audit/storage";
import type { AuditResponse, CategoryScore } from "@/lib/audit/types";
import { reportMeta } from "@/lib/report-data";

export type SchemaKpi = {
  label: string;
  value: string;
  subLabel?: string;
  subLabelClassName?: string;
  progress?: number;
};

export type SchemaDistributionSegment = {
  label: string;
  percent: number;
  strokeClassName: string;
  description: string;
};

export type SchemaFindingRow = {
  icon: string;
  iconClassName: string;
  label: string;
  value: string;
};

export type SchemaTypeSignal = {
  label: string;
  detected: boolean;
  detail: string;
};

export type SchemaIssue = {
  title: string;
  description: string;
  status: string;
  statusClassName: string;
};

export type SchemaAccordionItem = {
  icon: string;
  title: string;
  code: string;
};

export type SchemaMarkupDetailView = {
  domain: string;
  isRealData: boolean;
  score: number;
  healthTier: string;
  statusBadge: string;
  statusBadgeClassName: string;
  summary: string;
  kpis: SchemaKpi[];
  distributionSegments: SchemaDistributionSegment[];
  distributionCenterLabel: string;
  distributionCenterSubLabel: string;
  findingRows: SchemaFindingRow[];
  criticalRecommendation: {
    title: string;
    description: string;
    gainLabel: string;
  };
  lowSeverityIssues: SchemaIssue[];
  schemaTypeSignals: SchemaTypeSignal[];
  missingRecommendedSchema: string[];
  validationIssues: string[];
  accordionItems: SchemaAccordionItem[];
  auditDate: string;
};

const DONUT_CIRCUMFERENCE = 251.2;

const RECOMMENDED_SCHEMA_TYPES = [
  "Organization",
  "WebSite",
  "Article",
  "BreadcrumbList",
  "FAQPage",
  "Person",
  "Product",
] as const;

function getCategory(
  categories: CategoryScore[],
  label: string,
): CategoryScore | undefined {
  return categories.find((category) => category.label === label);
}

function hasSchemaType(schemaTypes: string[], type: string): boolean {
  return schemaTypes.some(
    (schemaType) => schemaType.toLowerCase() === type.toLowerCase(),
  );
}

function hasArticleOrPage(schemaTypes: string[]): boolean {
  return (
    hasSchemaType(schemaTypes, "Article") ||
    hasSchemaType(schemaTypes, "WebPage") ||
    hasSchemaType(schemaTypes, "NewsArticle") ||
    hasSchemaType(schemaTypes, "BlogPosting")
  );
}

function hasProductOrService(schemaTypes: string[]): boolean {
  return (
    hasSchemaType(schemaTypes, "Product") ||
    hasSchemaType(schemaTypes, "Service") ||
    hasSchemaType(schemaTypes, "SoftwareApplication")
  );
}

function hasPersonOrAuthor(schemaTypes: string[]): boolean {
  return hasSchemaType(schemaTypes, "Person") || hasSchemaType(schemaTypes, "Author");
}

function scoreToHealthTier(score: number): {
  tier: string;
  badge: string;
  badgeClassName: string;
} {
  if (score >= 90) {
    return {
      tier: "Advanced",
      badge: "Optimized",
      badgeClassName: "bg-primary-container text-white",
    };
  }

  if (score >= 75) {
    return {
      tier: "Strong",
      badge: "Healthy",
      badgeClassName: "bg-green-100 text-green-700",
    };
  }

  if (score >= 50) {
    return {
      tier: "Developing",
      badge: "In Progress",
      badgeClassName: "bg-[#FFF9C4] text-[#856404]",
    };
  }

  return {
    tier: "At Risk",
    badge: "Needs Work",
    badgeClassName: "bg-error-container text-on-error-container",
  };
}

function computeCoverage(schemaTypes: string[]): number {
  let detected = 0;

  if (schemaTypes.length > 0) {
    detected += 1;
  }

  if (hasSchemaType(schemaTypes, "Organization")) detected += 1;
  if (hasSchemaType(schemaTypes, "WebSite")) detected += 1;
  if (hasArticleOrPage(schemaTypes)) detected += 1;
  if (hasSchemaType(schemaTypes, "BreadcrumbList")) detected += 1;
  if (hasSchemaType(schemaTypes, "FAQPage")) detected += 1;
  if (hasPersonOrAuthor(schemaTypes)) detected += 1;
  if (hasProductOrService(schemaTypes)) detected += 1;

  return Math.min(100, Math.round((detected / 8) * 100));
}

function computeSemanticNesting(schemaTypes: string[]): number {
  const base = Math.min(88, schemaTypes.length * 18);
  const bonus =
    (hasSchemaType(schemaTypes, "Organization") ? 8 : 0) +
    (hasSchemaType(schemaTypes, "WebSite") ? 6 : 0) +
    (hasArticleOrPage(schemaTypes) ? 6 : 0);

  return Math.min(100, base + bonus);
}

function buildDistribution(schemaTypes: string[]): SchemaDistributionSegment[] {
  if (schemaTypes.length === 0) {
    return [
      {
        label: "No Schema",
        percent: 100,
        strokeClassName: "text-outline-variant",
        description: "JSON-LD not detected on this page",
      },
    ];
  }

  const weights = schemaTypes.map((type) => {
    if (/article|webpage|blog|news/i.test(type)) {
      return { type, weight: 64 };
    }

    if (/organization|website|localbusiness/i.test(type)) {
      return { type, weight: 24 };
    }

    return { type, weight: 12 };
  });

  const total = weights.reduce((sum, item) => sum + item.weight, 0) || 1;

  const grouped = new Map<string, { weight: number; description: string }>();

  for (const item of weights) {
    let key = item.type;
    let description = "Structured entity signal";

    if (/article|webpage|blog|news/i.test(item.type)) {
      key = "Article";
      description = "High visibility in LLM context windows";
    } else if (/organization|website|localbusiness/i.test(item.type)) {
      key = "Organization";
      description = "Authoritative entity signals";
    } else if (/faq|howto|question/i.test(item.type)) {
      key = "FAQ / HowTo";
      description = "Rich snippet eligibility";
    }

    const existing = grouped.get(key);
    grouped.set(key, {
      weight: (existing?.weight ?? 0) + item.weight,
      description: existing?.description ?? description,
    });
  }

  const strokeClasses = ["text-primary", "text-[#FF5A4F]", "text-secondary-container"];
  let index = 0;

  return Array.from(grouped.entries()).map(([label, data]) => ({
    label,
    percent: Math.round((data.weight / total) * 100),
    strokeClassName: strokeClasses[index++ % strokeClasses.length],
    description: data.description,
  }));
}

function buildSchemaTypeSignals(schemaTypes: string[]): SchemaTypeSignal[] {
  const jsonLdDetected = schemaTypes.length > 0;

  return [
    {
      label: "JSON-LD Detection",
      detected: jsonLdDetected,
      detail: jsonLdDetected
        ? `${schemaTypes.length} schema type(s) found`
        : "No JSON-LD blocks detected",
    },
    {
      label: "Organization Schema",
      detected: hasSchemaType(schemaTypes, "Organization"),
      detail: hasSchemaType(schemaTypes, "Organization")
        ? "Organization entity mapped"
        : "Missing Organization schema",
    },
    {
      label: "Website Schema",
      detected: hasSchemaType(schemaTypes, "WebSite"),
      detail: hasSchemaType(schemaTypes, "WebSite")
        ? "WebSite entity present"
        : "Missing WebSite schema",
    },
    {
      label: "Article/Page Schema",
      detected: hasArticleOrPage(schemaTypes),
      detail: hasArticleOrPage(schemaTypes)
        ? "Page type schema detected"
        : "No Article or WebPage schema",
    },
    {
      label: "Breadcrumb Schema",
      detected: hasSchemaType(schemaTypes, "BreadcrumbList"),
      detail: hasSchemaType(schemaTypes, "BreadcrumbList")
        ? "BreadcrumbList present"
        : "Missing BreadcrumbList schema",
    },
    {
      label: "FAQ Schema",
      detected: hasSchemaType(schemaTypes, "FAQPage"),
      detail: hasSchemaType(schemaTypes, "FAQPage")
        ? "FAQPage ready for answer surfaces"
        : "FAQPage schema not detected",
    },
    {
      label: "Person/Author Schema",
      detected: hasPersonOrAuthor(schemaTypes),
      detail: hasPersonOrAuthor(schemaTypes)
        ? "Author entity mapped"
        : "No Person or Author schema",
    },
    {
      label: "Product/Service Schema",
      detected: hasProductOrService(schemaTypes),
      detail: hasProductOrService(schemaTypes)
        ? "Commercial entity schema found"
        : "No Product or Service schema",
    },
  ];
}

function buildMissingRecommended(schemaTypes: string[]): string[] {
  const missing: string[] = [];

  for (const type of RECOMMENDED_SCHEMA_TYPES) {
    if (type === "Article" && hasArticleOrPage(schemaTypes)) {
      continue;
    }

    if (type === "Product" && hasProductOrService(schemaTypes)) {
      continue;
    }

    if (type === "Person" && hasPersonOrAuthor(schemaTypes)) {
      continue;
    }

    if (!hasSchemaType(schemaTypes, type)) {
      missing.push(type);
    }
  }

  if (!hasSchemaType(schemaTypes, "AggregateRating") && hasSchemaType(schemaTypes, "Product")) {
    missing.push("AggregateRating");
  }

  return missing;
}

function buildValidationIssues(schemaTypes: string[], problems: string[]): string[] {
  const issues: string[] = [];

  if (schemaTypes.length === 0) {
    issues.push("No JSON-LD schema detected on page");
  }

  if (!hasSchemaType(schemaTypes, "Organization") && schemaTypes.length > 0) {
    issues.push("Organization schema missing for entity disambiguation");
  }

  if (!hasSchemaType(schemaTypes, "FAQPage")) {
    issues.push("FAQPage schema not present");
  }

  for (const problem of problems.slice(0, 2)) {
    if (!issues.includes(problem)) {
      issues.push(problem);
    }
  }

  return issues.slice(0, 4);
}

function buildAccordionItems(domain: string): SchemaAccordionItem[] {
  return [
    {
      icon: "description",
      title: "Article Markup",
      code: `{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "AI Search Audit Optimization Strategies",
  "author": {
    "@type": "Person",
    "name": "Alex Rivier",
    "jobTitle": "Chief Data Scientist"
  },
  "publisher": {
    "@type": "Organization",
    "name": "AuditMetric",
    "logo": "https://${domain}/logo.png"
  },
  "datePublished": "2024-05-20T08:00:00+08:00",
  "description": "Deep dive into the algorithmic shifts in AI-driven search engines."
}`,
    },
    {
      icon: "corporate_fare",
      title: "Organization Identity",
      code: `{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AuditMetric",
  "url": "https://${domain}",
  "sameAs": [
    "https://twitter.com/auditmetric",
    "https://linkedin.com/company/auditmetric"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-800-555-0199",
    "contactType": "customer service"
  }
}`,
    },
    {
      icon: "quiz",
      title: "FAQ Rich Snippet",
      code: `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "How does AI Search Audit work?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "AuditMetric uses neural network emulation to predict how LLMs rank content based on structured data signals."
    }
  }]
}`,
    },
  ];
}

function buildDemoView(domain: string): SchemaMarkupDetailView {
  return {
    domain,
    isRealData: false,
    score: 91,
    healthTier: "Advanced",
    statusBadge: "Optimized",
    statusBadgeClassName: "bg-primary-container text-white",
    summary:
      "Structured data coverage is exceptionally high. Your technical entity mapping is providing strong disambiguation signals to LLMs like GPT-4 and Claude 3, ensuring precise indexing of your core product specifications and expert content.",
    kpis: [
      { label: "Detected Types", value: "4", subLabel: "+1 this month" },
      {
        label: "Validation Errors",
        value: "0",
        subLabel: "Perfect State",
        subLabelClassName: "text-[#059669]",
      },
      { label: "Coverage", value: "95%", progress: 95 },
      { label: "Semantic Nesting", value: "88%", subLabel: "High Depth" },
    ],
    distributionSegments: [
      {
        label: "Article",
        percent: 64,
        strokeClassName: "text-primary",
        description: "High visibility in LLM context windows",
      },
      {
        label: "Organization",
        percent: 24,
        strokeClassName: "text-[#FF5A4F]",
        description: "Authoritative entity signals",
      },
      {
        label: "FAQ / HowTo",
        percent: 12,
        strokeClassName: "text-secondary-container",
        description: "Rich snippet eligibility",
      },
    ],
    distributionCenterLabel: "100%",
    distributionCenterSubLabel: "Validated",
    findingRows: [
      {
        icon: "check_circle",
        iconClassName: "text-primary",
        label: "Detected Schema",
        value: "Organization, Article, Breadcrumb, WebSite",
      },
      {
        icon: "warning",
        iconClassName: "text-[#FF5A4F]",
        label: "Missing Schema",
        value: "Product, AggregateRating",
      },
      {
        icon: "analytics",
        iconClassName: "text-primary",
        label: "Coverage",
        value: "95.4% of URLs",
      },
      {
        icon: "lightbulb",
        iconClassName: "text-primary",
        label: "Opportunities",
        value: "5 New Entities",
      },
    ],
    criticalRecommendation: {
      title: "Implement JSON-LD for Related Entities",
      description:
        "Adding 'mentions' and 'about' properties will increase thematic relevance by 24% for LLM indexing.",
      gainLabel: "+6 Visibility Gain",
    },
    lowSeverityIssues: [
      {
        title: "Missing Product Aggregate Rating",
        description:
          "Product pages contain price data but lack review aggregations. LLMs often prioritize products with social proof signals.",
        status: "Incomplete",
        statusClassName: "font-bold text-[#FF5A4F]",
      },
    ],
    schemaTypeSignals: buildSchemaTypeSignals([
      "Organization",
      "Article",
      "BreadcrumbList",
      "WebSite",
    ]),
    missingRecommendedSchema: ["Product", "AggregateRating"],
    validationIssues: [],
    accordionItems: buildAccordionItems(domain),
    auditDate: reportMeta.auditDate,
  };
}

export function buildSchemaMarkupDetailView(
  audit: AuditResponse | null,
  fallbackDomain: string,
): SchemaMarkupDetailView {
  const view = buildReportView(audit, fallbackDomain);

  if (!view.isRealData || !audit) {
    return buildDemoView(view.domain);
  }

  const scores = calculateAuditScores(audit);
  const category = getCategory(scores.categories, "Schema Markup");
  const schemaTypes = audit.schemaTypes;
  const structureScore = category?.score ?? 0;
  const health = scoreToHealthTier(structureScore);
  const coverage = computeCoverage(schemaTypes);
  const nesting = computeSemanticNesting(schemaTypes);
  const missing = buildMissingRecommended(schemaTypes);
  const validationIssues = buildValidationIssues(schemaTypes, category?.problems ?? []);
  const validationErrorCount = validationIssues.length;
  const distribution = buildDistribution(schemaTypes);

  const topRec =
    scores.recommendations.find((rec) =>
      /schema|json-ld|organization|faq|structured/i.test(rec.title),
    ) ?? scores.recommendations[0];

  const detectedLabel =
    schemaTypes.length > 0 ? schemaTypes.join(", ") : "None detected";
  const missingLabel =
    missing.length > 0 ? missing.join(", ") : "None";

  const lowIssues: SchemaIssue[] = [];

  if (missing.includes("Product") || missing.includes("AggregateRating")) {
    lowIssues.push({
      title: "Missing Product Aggregate Rating",
      description:
        "Product-related schema is incomplete. Adding AggregateRating improves social proof signals for LLM product answers.",
      status: "Incomplete",
      statusClassName: "font-bold text-[#FF5A4F]",
    });
  }

  for (const problem of category?.problems ?? []) {
    if (lowIssues.length >= 2) {
      break;
    }

    if (/aggregate|product|breadcrumb|person|author/i.test(problem)) {
      lowIssues.push({
        title: problem.split(".")[0],
        description: problem,
        status: "Review",
        statusClassName: "font-bold text-[#856404]",
      });
    }
  }

  if (lowIssues.length === 0 && validationIssues.length > 0) {
    lowIssues.push({
      title: validationIssues[0],
      description: validationIssues.slice(1).join(" ") || validationIssues[0],
      status: "Review",
      statusClassName: "font-bold text-[#FF5A4F]",
    });
  }

  return {
    domain: view.domain,
    isRealData: true,
    score: structureScore,
    healthTier: health.tier,
    statusBadge: health.badge,
    statusBadgeClassName: health.badgeClassName,
    summary:
      category?.summary ??
      "Schema markup helps LLMs interpret page entities, content type, and relationships.",
    kpis: [
      {
        label: "Detected Types",
        value: String(schemaTypes.length),
        subLabel: schemaTypes.length > 0 ? "On this page" : "None found",
      },
      {
        label: "Validation Errors",
        value: String(validationErrorCount),
        subLabel: validationErrorCount === 0 ? "Perfect State" : "Needs review",
      },
      {
        label: "Coverage",
        value: `${coverage}%`,
        progress: coverage,
      },
      {
        label: "Semantic Nesting",
        value: `${nesting}%`,
        subLabel: nesting >= 80 ? "High Depth" : "Moderate",
      },
    ],
    distributionSegments: distribution,
    distributionCenterLabel: validationErrorCount === 0 ? "100%" : `${coverage}%`,
    distributionCenterSubLabel: validationErrorCount === 0 ? "Validated" : "Coverage",
    findingRows: [
      {
        icon: schemaTypes.length > 0 ? "check_circle" : "error",
        iconClassName: schemaTypes.length > 0 ? "text-primary" : "text-[#FF5A4F]",
        label: "Detected Schema",
        value: detectedLabel,
      },
      {
        icon: missing.length > 0 ? "warning" : "check_circle",
        iconClassName: missing.length > 0 ? "text-[#FF5A4F]" : "text-primary",
        label: "Missing Schema",
        value: missingLabel,
      },
      {
        icon: "analytics",
        iconClassName: "text-primary",
        label: "Coverage",
        value: `${coverage}% of recommended types`,
      },
      {
        icon: "lightbulb",
        iconClassName: "text-primary",
        label: "Opportunities",
        value: `${missing.length} New Entities`,
      },
    ],
    criticalRecommendation: {
      title: topRec?.title ?? "Implement JSON-LD for Related Entities",
      description:
        topRec?.howToFix ??
        "Add structured data blocks for Organization, WebSite, and page-specific schema types.",
      gainLabel: `+${topRec?.estimatedGain ?? 6} Visibility Gain`,
    },
    lowSeverityIssues:
      lowIssues.length > 0
        ? lowIssues
        : buildDemoView(view.domain).lowSeverityIssues,
    schemaTypeSignals: buildSchemaTypeSignals(schemaTypes),
    missingRecommendedSchema:
      missing.length > 0 ? missing : buildDemoView(view.domain).missingRecommendedSchema,
    validationIssues,
    accordionItems: buildAccordionItems(view.domain),
    auditDate: view.auditDate,
  };
}

export function getSchemaMarkupFallbackView(domain: string): SchemaMarkupDetailView {
  return buildDemoView(domain);
}

export function loadSchemaMarkupDetailView(domain: string): SchemaMarkupDetailView {
  return buildSchemaMarkupDetailView(loadAuditReportSafe(), domain);
}

export { DONUT_CIRCUMFERENCE };
