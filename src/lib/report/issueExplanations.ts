import { matchRecommendationTemplate } from "@/lib/report/recommendationTemplates";
import type { IssueExampleType, IssueExplanation } from "@/types/audit";

export type IssueExplanationInput = {
  title: string;
  category?: string;
  status?: string;
  severity?: string;
  recommendation?: string;
};

const PASS_STATUS_LABELS = new Set([
  "pass",
  "optimized",
  "good",
  "optimal",
  "strong",
]);

const OG_WHY =
  "Open Graph tags shape how this page appears when shared and how AI systems summarize the URL.";
const OG_WHERE = "Page `<head>`, before `</head>`.";

const TWITTER_WHY =
  "Twitter/X card tags control rich link previews and complement your Open Graph metadata.";
const TWITTER_WHERE = "Page `<head>`, next to Open Graph meta tags.";

const SCHEMA_WHY =
  "Structured data helps search engines and AI parsers understand page type and entity relationships.";
const SCHEMA_WHERE = "JSON-LD in `<head>` or your SEO/schema plugin settings.";

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s@/:-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text: string, phrases: string[]): boolean {
  return phrases.some((phrase) => text.includes(phrase));
}

function isIssueStatement(text: string): boolean {
  const normalized = normalizeText(text);

  return (
    normalized.startsWith("no ") ||
    normalized.includes("not found") ||
    normalized.includes("was not") ||
    normalized.includes("were not") ||
    normalized.includes("missing") ||
    normalized.includes("detected (optional") ||
    (normalized.includes("only ") && normalized.includes("character"))
  );
}

function resolveHowToFix(baseHowToFix: string, recommendation?: string): string {
  const rec = recommendation?.trim();

  if (!rec || isIssueStatement(rec)) {
    return baseHowToFix;
  }

  if (/\b(add|use|set|include|publish|create|validate|ensure|write|keep|link)\b/i.test(rec)) {
    return rec;
  }

  return baseHowToFix;
}

function matchOpenGraphField(text: string): IssueExplanation | undefined {
  if (includesAny(text, ["og site name", "og:site_name"])) {
    return {
      whyItMatters: OG_WHY,
      whereToFix: OG_WHERE,
      howToFix: "Add an og:site_name meta tag with your brand or website name.",
      copyableExample: `<meta property="og:site_name" content="Your Brand Name">`,
      exampleType: "meta",
      expectedGain: 4,
    };
  }

  if (includesAny(text, ["og type", "og:type"])) {
    return {
      whyItMatters: OG_WHY,
      whereToFix: OG_WHERE,
      howToFix: "Add og:type. Use website for homepages and article for articles.",
      copyableExample: `<meta property="og:type" content="website">`,
      exampleType: "meta",
      expectedGain: 4,
    };
  }

  if (includesAny(text, ["og url", "og:url"])) {
    return {
      whyItMatters: OG_WHY,
      whereToFix: OG_WHERE,
      howToFix: "Add the canonical page URL as og:url.",
      copyableExample: `<meta property="og:url" content="https://example.com/page-url">`,
      exampleType: "meta",
      expectedGain: 4,
    };
  }

  if (includesAny(text, ["og title", "og:title"]) && !text.includes("length")) {
    return {
      whyItMatters: OG_WHY,
      whereToFix: OG_WHERE,
      howToFix: "Add og:title with a clear, concise preview title for this page.",
      copyableExample: `<meta property="og:title" content="Clear page title">`,
      exampleType: "meta",
      expectedGain: 5,
    };
  }

  if (includesAny(text, ["og description", "og:description"]) && !text.includes("length")) {
    return {
      whyItMatters: OG_WHY,
      whereToFix: OG_WHERE,
      howToFix: "Add og:description with a short summary of what this page offers.",
      copyableExample: `<meta property="og:description" content="Clear summary of this page.">`,
      exampleType: "meta",
      expectedGain: 5,
    };
  }

  if (includesAny(text, ["og image", "og:image"]) && !text.includes("absolute")) {
    return {
      whyItMatters: OG_WHY,
      whereToFix: OG_WHERE,
      howToFix: "Add og:image with a 1200×630px absolute HTTPS image URL.",
      copyableExample: `<meta property="og:image" content="https://example.com/og-image.jpg">`,
      exampleType: "meta",
      expectedGain: 6,
    };
  }

  if (includesAny(text, ["og title length", "og:title length"])) {
    return {
      whyItMatters: OG_WHY,
      whereToFix: OG_WHERE,
      howToFix: "Keep og:title between 30 and 70 characters for readable previews.",
      expectedGain: 3,
    };
  }

  if (includesAny(text, ["og description length", "og:description length"])) {
    return {
      whyItMatters: OG_WHY,
      whereToFix: OG_WHERE,
      howToFix: "Keep og:description between 70 and 200 characters for complete previews.",
      expectedGain: 3,
    };
  }

  if (includesAny(text, ["og image uses absolute", "og:image uses absolute"])) {
    return {
      whyItMatters: OG_WHY,
      whereToFix: OG_WHERE,
      howToFix: "Use a fully qualified HTTPS URL for og:image instead of a relative path.",
      copyableExample: `<meta property="og:image" content="https://example.com/og-image.jpg">`,
      exampleType: "meta",
      expectedGain: 5,
    };
  }

  return undefined;
}

function matchTwitterField(text: string): IssueExplanation | undefined {
  if (includesAny(text, ["twitter card", "twitter:card"])) {
    return {
      whyItMatters: TWITTER_WHY,
      whereToFix: TWITTER_WHERE,
      howToFix: "Add twitter:card. Use summary_large_image for rich previews.",
      copyableExample: `<meta name="twitter:card" content="summary_large_image">`,
      exampleType: "meta",
      expectedGain: 5,
    };
  }

  if (includesAny(text, ["twitter title", "twitter:title"]) && !text.includes("length")) {
    return {
      whyItMatters: TWITTER_WHY,
      whereToFix: TWITTER_WHERE,
      howToFix: "Add twitter:title matching your page title or og:title.",
      copyableExample: `<meta name="twitter:title" content="Clear page title">`,
      exampleType: "meta",
      expectedGain: 4,
    };
  }

  if (
    includesAny(text, ["twitter description", "twitter:description"]) &&
    !text.includes("length")
  ) {
    return {
      whyItMatters: TWITTER_WHY,
      whereToFix: TWITTER_WHERE,
      howToFix: "Add twitter:description with a concise summary of the page.",
      copyableExample: `<meta name="twitter:description" content="Clear summary of this page.">`,
      exampleType: "meta",
      expectedGain: 4,
    };
  }

  if (includesAny(text, ["twitter image", "twitter:image"]) && !text.includes("absolute")) {
    return {
      whyItMatters: TWITTER_WHY,
      whereToFix: TWITTER_WHERE,
      howToFix: "Add twitter:image with an absolute HTTPS image URL (1200×630 recommended).",
      copyableExample: `<meta name="twitter:image" content="https://example.com/twitter-card.jpg">`,
      exampleType: "meta",
      expectedGain: 5,
    };
  }

  if (includesAny(text, ["twitter site", "twitter:site"])) {
    return {
      whyItMatters: TWITTER_WHY,
      whereToFix: TWITTER_WHERE,
      howToFix: "Add twitter:site with your brand @handle for attribution on X/Twitter.",
      copyableExample: `<meta name="twitter:site" content="@yourbrand">`,
      exampleType: "meta",
      expectedGain: 4,
    };
  }

  if (includesAny(text, ["twitter creator", "twitter:creator"])) {
    return {
      whyItMatters: TWITTER_WHY,
      whereToFix: TWITTER_WHERE,
      howToFix: "Add twitter:creator with the content author @handle when applicable.",
      copyableExample: `<meta name="twitter:creator" content="@authorhandle">`,
      exampleType: "meta",
      expectedGain: 3,
    };
  }

  if (includesAny(text, ["twitter title length", "twitter:title length"])) {
    return {
      whyItMatters: TWITTER_WHY,
      whereToFix: TWITTER_WHERE,
      howToFix: "Keep twitter:title between 30 and 70 characters.",
      expectedGain: 3,
    };
  }

  if (includesAny(text, ["twitter description length", "twitter:description length"])) {
    return {
      whyItMatters: TWITTER_WHY,
      whereToFix: TWITTER_WHERE,
      howToFix: "Keep twitter:description between 70 and 200 characters.",
      expectedGain: 3,
    };
  }

  if (includesAny(text, ["twitter image uses absolute", "twitter:image uses absolute"])) {
    return {
      whyItMatters: TWITTER_WHY,
      whereToFix: TWITTER_WHERE,
      howToFix: "Use a fully qualified HTTPS URL for twitter:image.",
      copyableExample: `<meta name="twitter:image" content="https://example.com/twitter-card.jpg">`,
      exampleType: "meta",
      expectedGain: 5,
    };
  }

  return undefined;
}

function matchSchemaField(text: string): IssueExplanation | undefined {
  if (includesAny(text, ["organization schema", "organization"])) {
    return {
      whyItMatters: SCHEMA_WHY,
      whereToFix: SCHEMA_WHERE,
      howToFix: "Add Organization JSON-LD with name, url, and logo.",
      copyableExample: `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Organization","name":"Your Brand","url":"https://example.com"}
</script>`,
      exampleType: "schema",
      expectedGain: 7,
    };
  }

  if (includesAny(text, ["website schema", "website"])) {
    return {
      whyItMatters: SCHEMA_WHY,
      whereToFix: SCHEMA_WHERE,
      howToFix: "Add WebSite JSON-LD with site name and url.",
      copyableExample: `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebSite","name":"Your Site","url":"https://example.com"}
</script>`,
      exampleType: "schema",
      expectedGain: 6,
    };
  }

  if (includesAny(text, ["webpage schema", "webpage"])) {
    return {
      whyItMatters: SCHEMA_WHY,
      whereToFix: SCHEMA_WHERE,
      howToFix: "Add WebPage JSON-LD describing this page URL and title.",
      copyableExample: `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebPage","name":"Page Title","url":"https://example.com/page"}
</script>`,
      exampleType: "schema",
      expectedGain: 6,
    };
  }

  if (includesAny(text, ["faqpage", "faq page", "faq schema"])) {
    return {
      whyItMatters: SCHEMA_WHY,
      whereToFix: SCHEMA_WHERE,
      howToFix: "Add FAQPage JSON-LD matching visible Q&A content on the page.",
      copyableExample: `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Your question?","acceptedAnswer":{"@type":"Answer","text":"Your answer."}}]}
</script>`,
      exampleType: "schema",
      expectedGain: 7,
    };
  }

  if (includesAny(text, ["breadcrumb", "breadcrumblist"])) {
    return {
      whyItMatters: SCHEMA_WHY,
      whereToFix: SCHEMA_WHERE,
      howToFix: "Add BreadcrumbList JSON-LD matching visible breadcrumb navigation.",
      copyableExample: `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://example.com"}]}
</script>`,
      exampleType: "schema",
      expectedGain: 5,
    };
  }

  if (includesAny(text, ["article", "blogposting", "newsarticle"])) {
    return {
      whyItMatters: SCHEMA_WHY,
      whereToFix: SCHEMA_WHERE,
      howToFix: "Add Article or BlogPosting JSON-LD with headline, author, and dates.",
      copyableExample: `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"Page Title","author":{"@type":"Person","name":"Author Name"}}
</script>`,
      exampleType: "schema",
      expectedGain: 5,
    };
  }

  if (includesAny(text, ["product", "service schema", "product service"])) {
    return {
      whyItMatters: SCHEMA_WHY,
      whereToFix: SCHEMA_WHERE,
      howToFix: "Add Product or Service JSON-LD describing the offering on this page.",
      copyableExample: `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Product","name":"Product Name","description":"Short description"}
</script>`,
      exampleType: "schema",
      expectedGain: 5,
    };
  }

  if (includesAny(text, ["localbusiness", "local business"])) {
    return {
      whyItMatters: SCHEMA_WHY,
      whereToFix: SCHEMA_WHERE,
      howToFix: "Add LocalBusiness JSON-LD with address, phone, and opening hours.",
      copyableExample: `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"LocalBusiness","name":"Business Name","address":{"@type":"PostalAddress","streetAddress":"123 Main St"}}
</script>`,
      exampleType: "schema",
      expectedGain: 5,
    };
  }

  if (includesAny(text, ["@context", "@type", "schema context", "json ld", "json-ld"])) {
    return {
      whyItMatters: SCHEMA_WHY,
      whereToFix: SCHEMA_WHERE,
      howToFix: "Ensure each JSON-LD block includes schema.org @context and a valid @type.",
      copyableExample: `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebPage","name":"Page Title"}
</script>`,
      exampleType: "schema",
      expectedGain: 6,
    };
  }

  return undefined;
}

function matchTrustField(text: string): IssueExplanation | undefined {
  if (includesAny(text, ["contact"])) {
    return {
      whyItMatters: "A contact page signals a real business users and AI systems can reach.",
      whereToFix: "Create `/contact` and link it from the site header or footer.",
      howToFix:
        "Publish a contact page with business name, email or phone, and expected response time.",
      expectedGain: 6,
    };
  }

  if (includesAny(text, ["privacy"])) {
    return {
      whyItMatters: "A privacy policy shows compliance and builds trust with users and AI systems.",
      whereToFix: "Create `/privacy-policy` and link it from the site footer.",
      howToFix:
        "Publish a privacy policy covering data collection, usage, and contact details for privacy requests.",
      expectedGain: 5,
    };
  }

  if (includesAny(text, ["legal", "terms"])) {
    return {
      whyItMatters: "Legal terms clarify site ownership and usage rules for visitors and crawlers.",
      whereToFix: "Create `/terms` (or `/terms-of-service`) and link it from the footer.",
      howToFix:
        "Publish terms of service with usage rules, liability limits, and last-updated date.",
      expectedGain: 5,
    };
  }

  if (includesAny(text, ["about"])) {
    return {
      whyItMatters: "An about page explains who operates the site and why the content is credible.",
      whereToFix: "Create `/about` and link it from the main navigation or footer.",
      howToFix:
        "Describe your organization, mission, team, and what makes your content authoritative.",
      expectedGain: 4,
    };
  }

  if (includesAny(text, ["author", "team", "byline"])) {
    return {
      whyItMatters: "Visible authorship helps AI systems attribute content and assess expertise.",
      whereToFix: "Article header, author bio section, or About page.",
      howToFix:
        "Show author or team name on content pages and include role or credentials where relevant.",
      expectedGain: 6,
    };
  }

  return undefined;
}

function matchFieldSpecificExplanation(
  title: string,
  recommendation: string,
  category: string,
): IssueExplanation | undefined {
  const text = normalizeText(`${title} ${recommendation} ${category}`);

  if (category === "Open Graph" || includesAny(text, ["og:", "open graph"])) {
    const match = matchOpenGraphField(text);
    if (match) {
      return match;
    }
  }

  if (category === "Twitter Card" || includesAny(text, ["twitter:", "twitter card"])) {
    const match = matchTwitterField(text);
    if (match) {
      return match;
    }
  }

  if (
    category === "Schema Markup" ||
    category === "Advanced Schema" ||
    includesAny(text, ["schema", "json-ld", "json ld"])
  ) {
    const match = matchSchemaField(text);
    if (match) {
      return match;
    }
  }

  if (category === "Trust Signals" || includesAny(text, ["trust", "legal", "privacy", "contact"])) {
    const match = matchTrustField(text);
    if (match) {
      return match;
    }
  }

  return undefined;
}

const CATEGORY_FALLBACKS: Record<
  string,
  Pick<IssueExplanation, "whyItMatters" | "whereToFix" | "howToFix">
> = {
  "SEO Health": {
    whyItMatters: "Technical SEO signals affect indexing and how AI systems read page metadata.",
    whereToFix: "Page `<head>`, canonical URL, or main content area.",
    howToFix: "Update the flagged element and re-run the audit to confirm it passes.",
  },
  "Entity Clarity": {
    whyItMatters: "Clear entity signals help AI systems identify who owns and publishes this content.",
    whereToFix: "Homepage `<head>` JSON-LD, H1, and visible brand references.",
    howToFix: "Name the primary entity consistently in schema, titles, and body copy.",
  },
  "Citation Readiness": {
    whyItMatters: "Author and date context helps AI systems cite your content accurately.",
    whereToFix: "Article byline, publish date, and Article JSON-LD in `<head>`.",
    howToFix: "Add visible author, publish date, and matching Article schema fields.",
  },
  "Trust Signals": {
    whyItMatters: "Trust pages signal legitimacy to users and AI ranking systems.",
    whereToFix: "Site footer and dedicated policy/contact pages.",
    howToFix: "Publish the missing trust page and link it from every page footer.",
  },
  "Open Graph": {
    whyItMatters: OG_WHY,
    whereToFix: OG_WHERE,
    howToFix: "Add the missing og:* meta tag in the page head with accurate preview values.",
  },
  "Twitter Card": {
    whyItMatters: TWITTER_WHY,
    whereToFix: TWITTER_WHERE,
    howToFix: "Add the missing twitter:* meta tag alongside matching Open Graph values.",
  },
  "Schema Markup": {
    whyItMatters: SCHEMA_WHY,
    whereToFix: SCHEMA_WHERE,
    howToFix: "Add valid JSON-LD with schema.org @context and the recommended @type.",
  },
  "Advanced Schema": {
    whyItMatters: SCHEMA_WHY,
    whereToFix: SCHEMA_WHERE,
    howToFix: "Add the recommended schema type as JSON-LD and validate with a structured data tester.",
  },
  "Content Structure": {
    whyItMatters: "Scannable structure helps users and AI parsers extract answers quickly.",
    whereToFix: "Main content headings and paragraph blocks.",
    howToFix: "Fix heading hierarchy and break long paragraphs into scannable sections.",
  },
  "WCAG 2.2 Readiness": {
    whyItMatters: "Accessibility markup improves assistive tech and AI semantic parsing.",
    whereToFix: "The flagged HTML element in your template or CMS block.",
    howToFix: "Apply the recommended markup change to meet the cited WCAG criterion.",
  },
};

export function inferExampleType(example?: string): IssueExampleType | undefined {
  if (!example) {
    return undefined;
  }

  const trimmed = example.trim();

  if (trimmed.includes("application/ld+json") || trimmed.includes("@context")) {
    return "schema";
  }

  if (trimmed.includes("<meta")) {
    return "meta";
  }

  if (trimmed.includes("<")) {
    return "html";
  }

  return "text";
}

function buildExplanation(
  base: IssueExplanation,
  recommendation?: string,
): IssueExplanation {
  return {
    ...base,
    howToFix: resolveHowToFix(base.howToFix, recommendation),
    exampleType: base.exampleType ?? inferExampleType(base.copyableExample),
  };
}

export function isExplanationStatus(status?: string): boolean {
  if (!status) {
    return true;
  }

  return !PASS_STATUS_LABELS.has(normalizeText(status));
}

const STRONG_FIX_LABELS = ["fail", "critical", "poor", "high", "error", "missing"];

export function isStrongFixEmphasis(status?: string, severity?: string): boolean {
  const text = normalizeText([status, severity].filter(Boolean).join(" "));
  return STRONG_FIX_LABELS.some((label) => text.includes(label));
}

export function getIssueExplanation(input: IssueExplanationInput): IssueExplanation {
  const impactText = [input.recommendation, input.status, input.severity]
    .filter(Boolean)
    .join(" ");

  const fieldMatch = matchFieldSpecificExplanation(
    input.title,
    input.recommendation ?? "",
    input.category ?? "",
  );

  if (fieldMatch) {
    return buildExplanation(fieldMatch, input.recommendation);
  }

  const template = matchRecommendationTemplate(
    input.title,
    impactText,
    input.category ?? "",
  );

  if (template) {
    return buildExplanation(
      {
        whyItMatters: template.whyItMatters,
        whereToFix: template.whereToFix,
        howToFix: template.howToFix,
        copyableExample: template.copyableExample,
        exampleType: template.exampleType,
        expectedGain: template.expectedGain,
      },
      input.recommendation,
    );
  }

  const categoryFallback = input.category
    ? CATEGORY_FALLBACKS[input.category]
    : undefined;

  if (categoryFallback) {
    return buildExplanation(
      {
        ...categoryFallback,
        expectedGain:
          input.severity === "Critical" ? 8 : input.severity === "High" ? 6 : 4,
      },
      input.recommendation,
    );
  }

  const normalizedStatus = normalizeText(input.status ?? "");
  const isCritical =
    normalizedStatus.includes("fail") ||
    normalizedStatus.includes("critical") ||
    normalizedStatus.includes("poor") ||
    input.severity === "Critical";

  return buildExplanation(
    {
      whyItMatters: isCritical
        ? "This issue reduces how reliably search engines and AI systems trust this page."
        : "This warning may reduce preview quality or machine-readable context.",
      whereToFix: "The audited page template, CMS field, or `<head>` metadata.",
      howToFix: "Apply the recommended metadata or content change for this signal.",
      expectedGain: isCritical ? 6 : 4,
    },
    input.recommendation,
  );
}
