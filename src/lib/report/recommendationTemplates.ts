import type {
  DetailPageRecommendation,
  EnrichedRecommendationFields,
  IssueExampleType,
  RankedPriorityIssue,
} from "@/types/audit";

export type RecommendationTemplate = {
  issue: string;
  whyItMatters: string;
  whereToFix: string;
  howToFix: string;
  expectedGain: number;
  copyableExample?: string;
  exampleType?: IssueExampleType;
};

type TemplateMatcher = {
  matches: (title: string, impact: string, category: string) => boolean;
  template: RecommendationTemplate;
};

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

const TEMPLATE_MATCHERS: TemplateMatcher[] = [
  {
    matches: (title, impact, category) => {
      const text = normalizeText(`${title} ${impact} ${category}`);
      return includesAny(text, [
        "organization schema",
        "missing organization",
        "add organization schema",
      ]);
    },
    template: {
      issue: "Organization schema missing",
      whyItMatters:
        "AI systems use Organization schema to identify the website owner and connect the brand to trusted entities.",
      whereToFix: "Homepage `<head>` — add a JSON-LD `<script>` before `</head>`.",
      howToFix:
        "Add JSON-LD Organization schema with name, url, logo, and sameAs social profiles.",
      expectedGain: 7,
      exampleType: "schema",
      copyableExample: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Brand",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "sameAs": [
    "https://www.linkedin.com/company/your-brand",
    "https://twitter.com/yourbrand"
  ]
}
</script>`,
    },
  },
  {
    matches: (title, impact) => {
      const text = normalizeText(`${title} ${impact}`);
      return (
        includesAny(text, ["og image", "og:image", "open graph image"]) &&
        !text.includes("absolute url")
      );
    },
    template: {
      issue: "Open Graph image missing",
      whyItMatters:
        "Social previews and AI link cards rely on og:image to show a trustworthy visual when your URL is shared or cited.",
      whereToFix: "Page `<head>` — add og:image and dimension tags next to other Open Graph meta tags.",
      howToFix:
        "Add og:image with a 1200×630px absolute HTTPS URL, plus og:title and og:description.",
      expectedGain: 6,
      exampleType: "meta",
      copyableExample: `<meta property="og:image" content="https://example.com/images/og-default.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />`,
    },
  },
  {
    matches: (title, impact) => {
      const text = normalizeText(`${title} ${impact}`);
      return includesAny(text, [
        "twitter image",
        "twitter:image",
        "twitter card image",
      ]);
    },
    template: {
      issue: "Twitter image missing",
      whyItMatters:
        "Twitter/X cards need twitter:image to render rich previews; missing images reduce click-through and brand recognition.",
      whereToFix: "Page `<head>` — place twitter:* tags alongside your Open Graph meta tags.",
      howToFix:
        "Add twitter:card, twitter:image, twitter:title, and twitter:description tags.",
      expectedGain: 5,
      exampleType: "meta",
      copyableExample: `<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://example.com/images/twitter-card.jpg" />
<meta name="twitter:title" content="Your Page Title" />`,
    },
  },
  {
    matches: (title, impact) => {
      const text = normalizeText(`${title} ${impact}`);
      return includesAny(text, [
        "meta description",
        "og description",
        "og:description",
        "citation friendly meta description",
        "improve meta description",
      ]);
    },
    template: {
      issue: "Meta description missing or weak",
      whyItMatters:
        "Search engines and AI summarizers use the meta description as the default snippet when no better excerpt exists.",
      whereToFix: "Page `<head>` — add or edit the `<meta name=\"description\">` tag.",
      howToFix:
        "Write a unique 140–160 character description that states the page topic, audience benefit, and primary entity.",
      expectedGain: 6,
      exampleType: "meta",
      copyableExample: `<meta name="description" content="AuditMetric helps SEO teams measure AI search visibility with actionable schema, citation, and trust signal checks." />`,
    },
  },
  {
    matches: (title, impact) => {
      const text = normalizeText(`${title} ${impact}`);
      return includesAny(text, ["contact page", "contact page detected"]);
    },
    template: {
      issue: "Contact page missing",
      whyItMatters:
        "AI and search systems treat a dedicated contact page as a core trust signal for legitimate businesses.",
      whereToFix: "Create `/contact` and link it from the site header or footer navigation.",
      howToFix:
        "Publish a contact page with business name, email or phone, and response expectations.",
      expectedGain: 6,
      exampleType: "html",
      copyableExample: `<!-- Link from header/footer -->
<a href="/contact">Contact</a>

<!-- Minimum contact page content -->
<h1>Contact Us</h1>
<p>Email: hello@example.com</p>
<p>Phone: +1 (555) 123-4567</p>`,
    },
  },
  {
    matches: (title, impact) => {
      const text = normalizeText(`${title} ${impact}`);
      return includesAny(text, [
        "privacy policy",
        "terms legal",
        "terms/legal",
        "legal page",
        "privacy legal",
      ]);
    },
    template: {
      issue: "Privacy or legal page missing",
      whyItMatters:
        "Privacy and terms pages signal compliance and accountability, which AI systems weigh when assessing source trust.",
      whereToFix: "Site footer — add links to `/privacy-policy` and `/terms` on every page.",
      howToFix:
        "Publish policy pages and include last-updated dates on each document.",
      expectedGain: 5,
      exampleType: "html",
      copyableExample: `<!-- Footer links -->
<a href="/privacy-policy">Privacy Policy</a>
<a href="/terms">Terms of Service</a>`,
    },
  },
  {
    matches: (title, impact) => {
      const text = normalizeText(`${title} ${impact}`);
      return includesAny(text, [
        "author detected",
        "author byline",
        "publish date",
        "last updated date",
        "author team",
        "incomplete author",
        "missing author",
      ]);
    },
    template: {
      issue: "Author or publish date missing",
      whyItMatters:
        "Visible author and date metadata help AI systems judge content freshness and attribute citations correctly.",
      whereToFix: "Article header/byline in the body and Article JSON-LD in `<head>`.",
      howToFix:
        "Show author name and published/updated dates on the page, plus datePublished in JSON-LD.",
      expectedGain: 6,
      exampleType: "schema",
      copyableExample: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Page Title",
  "author": { "@type": "Person", "name": "Jane Doe" },
  "datePublished": "2026-01-15",
  "dateModified": "2026-06-01"
}
</script>`,
    },
  },
  {
    matches: (title, impact) => {
      const text = normalizeText(`${title} ${impact}`);
      return includesAny(text, [
        "faq section",
        "faqpage",
        "faq page",
        "faq readiness",
        "faq style",
        "add faqpage",
      ]);
    },
    template: {
      issue: "FAQ section or schema missing",
      whyItMatters:
        "FAQ content gives AI systems ready-made Q&A pairs that map directly to conversational search queries.",
      whereToFix: "Page body FAQ section plus matching FAQPage JSON-LD in `<head>`.",
      howToFix:
        "Add visible question headings with concise answers, then mirror them in FAQPage JSON-LD.",
      expectedGain: 7,
      exampleType: "schema",
      copyableExample: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What does this tool audit?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "It checks schema, citations, trust signals, and AI visibility readiness."
    }
  }]
}
</script>`,
    },
  },
  {
    matches: (title, impact) => {
      const text = normalizeText(`${title} ${impact}`);
      return includesAny(text, [
        "heading hierarchy",
        "heading order",
        "h2 h3",
        "multiple h1",
        "missing h1",
        "clear hierarchy",
        "no clear h2",
        "fix heading order",
        "one clear h1",
      ]);
    },
    template: {
      issue: "Heading hierarchy weak",
      whyItMatters:
        "Logical H1→H2→H3 structure helps crawlers and AI parsers segment content into scannable answer blocks.",
      whereToFix: "Main content area — update heading tags in the page body or CMS editor.",
      howToFix:
        "Use exactly one H1, section topics as H2, and sub-points as H3 without skipping levels.",
      expectedGain: 5,
      exampleType: "html",
      copyableExample: `<h1>AI Search Audit Guide</h1>
<h2>Why Schema Matters</h2>
<h3>Organization Markup</h3>
<h3>FAQ Markup</h3>
<h2>Trust Signals Checklist</h2>`,
    },
  },
  {
    matches: (title, impact) => {
      const text = normalizeText(`${title} ${impact}`);
      return includesAny(text, [
        "@context",
        "@type",
        "schema context type",
        "schema has valid",
        "invalid schema",
        "malformed schema",
        "json ld",
      ]);
    },
    template: {
      issue: "Schema @context or @type invalid",
      whyItMatters:
        "Invalid JSON-LD is ignored by Google and AI parsers, wasting structured data effort and leaving entities undefined.",
      whereToFix: "Existing JSON-LD `<script>` block in `<head>` or your CMS schema output.",
      howToFix:
        "Validate JSON-LD with Google's Rich Results Test; ensure @context is https://schema.org and @type matches your entity.",
      expectedGain: 6,
      exampleType: "schema",
      copyableExample: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Page Title",
  "url": "https://example.com/page"
}
</script>`,
    },
  },
];

export function matchRecommendationTemplate(
  title: string,
  impact = "",
  category = "",
): RecommendationTemplate | undefined {
  for (const matcher of TEMPLATE_MATCHERS) {
    if (matcher.matches(title, impact, category)) {
      return matcher.template;
    }
  }

  return undefined;
}

export function enrichRecommendationFields(
  title: string,
  description = "",
  category = "",
): EnrichedRecommendationFields {
  const template = matchRecommendationTemplate(title, description, category);

  if (!template) {
    return {};
  }

  return {
    whyItMatters: template.whyItMatters,
    howToFix: template.howToFix,
    copyableExample: template.copyableExample,
  };
}

export function buildDetailPageRecommendation(input: {
  title: string;
  description: string;
  category: string;
  impactGain: string;
  priority: string;
  effort: string;
}): DetailPageRecommendation {
  const enriched = enrichRecommendationFields(
    input.title,
    input.description,
    input.category,
  );

  return {
    title: input.title,
    description: enriched.howToFix ?? input.description,
    impactGain: input.impactGain,
    priority: input.priority,
    effort: input.effort,
    ...enriched,
  };
}

export function buildCriticalRecommendation(input: {
  title: string;
  description: string;
  category: string;
  gainLabel: string;
}) {
  const enriched = enrichRecommendationFields(
    input.title,
    input.description,
    input.category,
  );

  return {
    title: input.title,
    description: enriched.howToFix ?? input.description,
    gainLabel: input.gainLabel,
    ...enriched,
  };
}

export function enrichPriorityIssue(issue: RankedPriorityIssue): RankedPriorityIssue {
  const template = matchRecommendationTemplate(
    issue.title,
    issue.impact,
    issue.category,
  );

  if (!template) {
    return issue;
  }

  return {
    ...issue,
    whyItMatters: template.whyItMatters,
    howToFix: template.howToFix,
    copyableExample: template.copyableExample,
    recommendation: template.howToFix,
    impact: template.whyItMatters,
    estimatedGain: Math.max(issue.estimatedGain, template.expectedGain),
  };
}
