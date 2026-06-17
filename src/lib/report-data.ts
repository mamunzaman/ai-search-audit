import type {
  AnswerExtractionAuditResult,
  AuditFinding,
  AuditIssue,
  AuditRecommendation,
  CitationReadinessAuditResult,
  EntityClarityAuditResult,
  TrustSignalsAuditResult,
  OpenGraphAuditResult,
  TwitterCardAuditResult,
  AdvancedSchemaAuditResult,
  SiteCrawlResult,
} from "@/types/audit";

export type ReportCategory = {
  icon: string;
  title: string;
  score: number;
  critical?: boolean;
  summary?: string;
  issueCount?: number;
};

export type ReportIssue = {
  title: string;
  impact: "Critical" | "High" | "Medium";
  difficulty: string;
  gain: number;
  explanation?: string;
};

export type ReportRecommendation = {
  title: string;
  whyThisMatters: string;
  howToFix: string;
  estimatedGain: number;
  copyableExample?: string;
};

export type SidebarNavItem = {
  icon: string;
  label: string;
  slug?: string;
  active?: boolean;
};

export const reportMeta = {
  domain: "coinarchive.eu",
  status: "Good",
  auditDate: "13 June 2026",
  score: 82,
  projectName: "Project Alpha",
  lastAudit: "2h ago",
};

export const reportDataMode = {
  real: "Real audit data",
  demo: "Demo report data",
} as const;

export const sidebarNav: SidebarNavItem[] = [
  { icon: "dashboard", label: "Overview", slug: "overview" },
  { icon: "health_and_safety", label: "SEO Health", slug: "seo-health" },
  { icon: "visibility", label: "AI Visibility", slug: "ai-visibility" },
  { icon: "category", label: "Entity Clarity", slug: "entity-clarity" },
  { icon: "format_quote", label: "Citation Readiness", slug: "citation-readiness" },
  { icon: "psychology", label: "Answer Extraction", slug: "answer-extraction" },
  { icon: "verified", label: "Trust Signals", slug: "trust-signals" },
  { icon: "share", label: "Open Graph", slug: "open-graph" },
  { icon: "tag", label: "Twitter Card", slug: "twitter-card" },
  { icon: "article", label: "Content Structure", slug: "content-structure" },
  { icon: "code", label: "Schema Markup", slug: "schema-markup" },
  { icon: "data_object", label: "Advanced Schema", slug: "advanced-schema" },
  { icon: "accessibility_new", label: "WCAG 2.2", slug: "wcag-2.2" },
];

export const strengths = [
  {
    title: "Clear structure:",
    text: "Crawlers easily identify primary content hierarchy.",
  },
  {
    title: "Trust signals:",
    text: "High volume of high-quality citations detected.",
  },
  {
    title: "Entity recognition:",
    text: 'Domain is firmly mapped to "Historical Numismatics".',
  },
];

export const criticalIssues = [
  {
    title: "Missing FAQ schema:",
    text: "Reduces eligibility for AI answer snippets.",
  },
  {
    title: "Weak author signals:",
    text: "Attribution profiles lack external validation.",
  },
  {
    title: "Missing org schema:",
    text: "LLMs struggle to verify entity ownership.",
  },
];

export const categories: ReportCategory[] = [
  { icon: "health_and_safety", title: "SEO Health", score: 85 },
  { icon: "visibility", title: "AI Visibility", score: 82 },
  { icon: "category", title: "Entity Clarity", score: 78 },
  { icon: "format_quote", title: "Citation Readiness", score: 72, critical: true },
  { icon: "psychology", title: "Answer Extraction", score: 76, critical: true },
  { icon: "verified", title: "Trust Signals", score: 81 },
  { icon: "share", title: "Open Graph", score: 74, critical: true },
  { icon: "tag", title: "Twitter Card", score: 68, critical: true },
  { icon: "article", title: "Content Structure", score: 80 },
  { icon: "code", title: "Schema Markup", score: 70, critical: true },
  { icon: "data_object", title: "Advanced Schema", score: 79 },
  { icon: "quiz", title: "FAQ Readiness", score: 65, critical: true },
  { icon: "smart_toy", title: "AI Answer Readiness", score: 75 },
  { icon: "accessibility_new", title: "WCAG 2.2 Readiness", score: 72 },
];

export const priorityIssues: ReportIssue[] = [
  {
    title: "Missing Organization Schema",
    impact: "High",
    difficulty: "Easy",
    gain: 6,
  },
  {
    title: "Broken Semantic Links (Primary Nav)",
    impact: "Medium",
    difficulty: "Moderate",
    gain: 4,
  },
  {
    title: "Incomplete Author Profiles",
    impact: "High",
    difficulty: "Moderate",
    gain: 5,
  },
];

export const topFixes = [
  "Org Schema Implementation",
  "Semantic FAQ Integration",
  "LinkedIn/Wiki Citation Linking",
];

export const avatarUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBqtXL4zEgoj8JHAOjPv4_tBpc7O7bNU-elgbEHacwXOpoQMi0-b3b-_BAIirhp6kGHizJ_18VAMMBecewsgqGHr8IiEGmz4C00yOKnK8ErNVxzveLxFvCoaiP62cWqPGZuuwqH7RLhZUgHxQHIFFMbYZQ01qqpO4Wn7ZPjh4Z-aNoyZ6hhvab8Eigctf6fHRBVuYDMWDopTNxcl-wk_bn3vsWfu2rec-wGFd13dWD50bzzuea6mZf7E_uZDuQZf6DR39xhXlIh4vU";

export const entityClarityAuditMock: EntityClarityAuditResult = {
  score: 78,
  status: "warning",
  findings: [
    {
      id: "organization-name",
      label: "Organization name detected",
      status: "pass",
      message: "Organization name detected: CoinArchive EU.",
    },
    {
      id: "organization-schema",
      label: "Organization schema detected",
      status: "warning",
      message: "Organization schema was not detected.",
      recommendation:
        "Add JSON-LD Organization markup with name, url, logo, and sameAs links.",
    },
    {
      id: "about-page",
      label: "About page link detected",
      status: "pass",
      message: "An About page link was detected in site navigation.",
    },
    {
      id: "contact-page",
      label: "Contact page link detected",
      status: "pass",
      message: "A Contact page link was detected.",
    },
    {
      id: "email-detected",
      label: "Email detected",
      status: "pass",
      message: "A contact email address was detected on the page.",
    },
    {
      id: "phone-detected",
      label: "Phone detected",
      status: "fail",
      message: "No phone number was detected.",
      recommendation:
        "Add a phone number for local or service businesses where phone contact matters.",
    },
    {
      id: "location-detected",
      label: "Location detected",
      status: "warning",
      message: "No location or address signals were detected.",
      recommendation:
        "Add address details in LocalBusiness or Organization schema and on your Contact page.",
    },
    {
      id: "product-service-keywords",
      label: "Product/service keywords detected",
      status: "pass",
      message: "Product or service keywords were found in headings or metadata.",
    },
    {
      id: "business-description",
      label: "Business description detected",
      status: "pass",
      message: "A substantive business description was detected.",
    },
  ] satisfies AuditFinding[],
  issues: [
    {
      title: "Organization schema detected",
      impact: "High",
      explanation: "Organization schema was not detected.",
    },
    {
      title: "Phone detected",
      impact: "High",
      explanation: "No phone number was detected.",
    },
    {
      title: "Location detected",
      impact: "Medium",
      explanation: "No location or address signals were detected.",
    },
  ] satisfies AuditIssue[],
  recommendations: [
    {
      title: "Add organization schema detected",
      whyThisMatters:
        "AI systems use explicit entity signals to understand who you are, what you offer, and how to cite you.",
      howToFix:
        "Add JSON-LD Organization markup with name, url, logo, and sameAs links.",
      estimatedGain: 7,
    },
    {
      title: "Add product/service keywords detected",
      whyThisMatters:
        "AI systems use explicit entity signals to understand who you are, what you offer, and how to cite you.",
      howToFix:
        "Use explicit product/service terms in H2 headings, meta description, and service pages.",
      estimatedGain: 5,
    },
    {
      title: "Add location detected",
      whyThisMatters:
        "AI systems use explicit entity signals to understand who you are, what you offer, and how to cite you.",
      howToFix:
        "Add address details in LocalBusiness or Organization schema and on your Contact page.",
      estimatedGain: 4,
    },
    {
      title: "Add phone detected",
      whyThisMatters:
        "AI systems use explicit entity signals to understand who you are, what you offer, and how to cite you.",
      howToFix:
        "Add a phone number for local or service businesses where phone contact matters.",
      estimatedGain: 3,
    },
  ] satisfies AuditRecommendation[],
};

export const citationReadinessAuditMock: CitationReadinessAuditResult = {
  score: 72,
  status: "warning",
  findings: [
    {
      id: "author-detected",
      label: "Author detected",
      status: "pass",
      message: "Author byline detected: Dr. Elena Markovic.",
    },
    {
      id: "publish-date-detected",
      label: "Publish date detected",
      status: "pass",
      message: "A publish date signal was detected in metadata or markup.",
    },
    {
      id: "last-updated-detected",
      label: "Last updated date detected",
      status: "warning",
      message: "Updated date text found, but no machine-readable modified date detected.",
      recommendation:
        "Show last updated dates and add article:modified_time or dateModified schema.",
    },
    {
      id: "external-sources-detected",
      label: "External source links detected",
      status: "warning",
      message: "3 external link(s) found, but few authoritative source references.",
      recommendation:
        "Link to authoritative external sources that support claims on the page.",
    },
    {
      id: "statistics-detected",
      label: "Statistics/numbers detected",
      status: "pass",
      message: "4 statistic or numeric evidence pattern(s) detected.",
    },
    {
      id: "references-section-detected",
      label: "References or citations section detected",
      status: "fail",
      message: "No references, sources, or citations section was detected.",
      recommendation:
        "Add a References or Sources section with outbound links to supporting materials.",
    },
    {
      id: "expert-reviewer-detected",
      label: "Expert/reviewer signal detected",
      status: "warning",
      message: "Editorial attribution language found, but no explicit reviewer signal detected.",
      recommendation:
        "Add reviewer, editor, or fact-check attribution for expert credibility.",
    },
    {
      id: "citation-friendly-title",
      label: "Page title is citation-friendly",
      status: "pass",
      message: "Page title is descriptive and citation-friendly.",
    },
    {
      id: "citation-friendly-meta",
      label: "Meta description is citation-friendly",
      status: "pass",
      message: "Meta description length is citation-friendly.",
    },
  ] satisfies AuditFinding[],
  issues: [
    {
      title: "Last updated date detected",
      impact: "Medium",
      explanation:
        "Updated date text found, but no machine-readable modified date detected.",
    },
    {
      title: "External source links detected",
      impact: "Medium",
      explanation:
        "3 external link(s) found, but few authoritative source references.",
    },
    {
      title: "References or citations section detected",
      impact: "High",
      explanation: "No references, sources, or citations section was detected.",
    },
    {
      title: "Expert/reviewer signal detected",
      impact: "Medium",
      explanation:
        "Editorial attribution language found, but no explicit reviewer signal detected.",
    },
  ] satisfies AuditIssue[],
  recommendations: [
    {
      title: "Add references or citations section detected",
      whyThisMatters:
        "LLM search systems prefer pages with clear authorship, dates, references, and update signals before citing them.",
      howToFix:
        "Add a References or Sources section with outbound links to supporting materials.",
      estimatedGain: 6,
    },
    {
      title: "Strengthen external source links detected",
      whyThisMatters:
        "LLM search systems prefer pages with clear authorship, dates, references, and update signals before citing them.",
      howToFix:
        "Link to authoritative external sources that support claims on the page.",
      estimatedGain: 7,
    },
    {
      title: "Strengthen last updated date detected",
      whyThisMatters:
        "LLM search systems prefer pages with clear authorship, dates, references, and update signals before citing them.",
      howToFix:
        "Show last updated dates and add article:modified_time or dateModified schema.",
      estimatedGain: 6,
    },
    {
      title: "Strengthen expert/reviewer signal detected",
      whyThisMatters:
        "LLM search systems prefer pages with clear authorship, dates, references, and update signals before citing them.",
      howToFix:
        "Add reviewer, editor, or fact-check attribution for expert credibility.",
      estimatedGain: 5,
    },
  ] satisfies AuditRecommendation[],
};

export const answerExtractionAuditMock: AnswerExtractionAuditResult = {
  score: 76,
  status: "warning",
  findings: [
    {
      id: "faq-section",
      label: "FAQ section detected",
      status: "pass",
      message: "A visible FAQ section or FAQ-related heading was detected.",
    },
    {
      id: "question-headings",
      label: "Question-style headings detected",
      status: "pass",
      message: "3 question-style headings support direct answer extraction.",
    },
    {
      id: "short-answer-paragraphs",
      label: "Short answer paragraphs detected",
      status: "warning",
      message: "One short answer paragraph found; add more concise answer blocks.",
      recommendation:
        "Add concise 15–100 word paragraphs that directly answer each subtopic.",
    },
    {
      id: "definition-content",
      label: "Definition-style content detected",
      status: "pass",
      message: "2 definition-style paragraph(s) detected.",
    },
    {
      id: "list-answers",
      label: "List-based answers detected",
      status: "pass",
      message: "2 list(s) with 3+ items support list-based answer extraction.",
    },
    {
      id: "table-answers",
      label: "Table-based answers detected",
      status: "fail",
      message: "No table-based answer structures were detected.",
      recommendation:
        "Add comparison or data tables when answers benefit from structured rows and columns.",
    },
    {
      id: "summary-section",
      label: "Summary/conclusion section detected",
      status: "warning",
      message: "No summary or conclusion section heading was detected.",
      recommendation:
        "Add a Summary or Conclusion section with a direct takeaway paragraph.",
    },
    {
      id: "heading-hierarchy",
      label: "Clear H2/H3 hierarchy detected",
      status: "pass",
      message: "Clear hierarchy with H1 (1), H2 (4), H3 (6).",
    },
    {
      id: "scannable-paragraphs",
      label: "Scannable paragraph length detected",
      status: "pass",
      message: "8 paragraphs average 72 words (scannable).",
    },
  ] satisfies AuditFinding[],
  issues: [
    {
      title: "Short answer paragraphs detected",
      impact: "Medium",
      explanation: "One short answer paragraph found; add more concise answer blocks.",
    },
    {
      title: "Table-based answers detected",
      impact: "High",
      explanation: "No table-based answer structures were detected.",
    },
    {
      title: "Summary/conclusion section detected",
      impact: "Medium",
      explanation: "No summary or conclusion section heading was detected.",
    },
  ] satisfies AuditIssue[],
  recommendations: [
    {
      title: "Add table-based answers detected",
      whyThisMatters:
        "AI systems extract direct answers more reliably from FAQ blocks, concise paragraphs, lists, tables, and clear heading hierarchy.",
      howToFix:
        "Add comparison or data tables when answers benefit from structured rows and columns.",
      estimatedGain: 5,
    },
    {
      title: "Strengthen short answer paragraphs detected",
      whyThisMatters:
        "AI systems extract direct answers more reliably from FAQ blocks, concise paragraphs, lists, tables, and clear heading hierarchy.",
      howToFix:
        "Add concise 15–100 word paragraphs that directly answer each subtopic.",
      estimatedGain: 7,
    },
    {
      title: "Add summary/conclusion section detected",
      whyThisMatters:
        "AI systems extract direct answers more reliably from FAQ blocks, concise paragraphs, lists, tables, and clear heading hierarchy.",
      howToFix:
        "Add a Summary or Conclusion section with a direct takeaway paragraph.",
      estimatedGain: 6,
    },
  ] satisfies AuditRecommendation[],
};

export const trustSignalsAuditMock: TrustSignalsAuditResult = {
  score: 81,
  status: "good",
  findings: [
    {
      id: "about-page",
      label: "About page detected",
      status: "pass",
      message: "An About page link was detected in site navigation.",
    },
    {
      id: "contact-page",
      label: "Contact page detected",
      status: "pass",
      message: "A Contact page link was detected.",
    },
    {
      id: "privacy-policy",
      label: "Privacy policy detected",
      status: "pass",
      message: "A privacy policy link was detected.",
    },
    {
      id: "terms-legal",
      label: "Terms/legal page detected",
      status: "warning",
      message: "No terms or legal/imprint page link was detected.",
      recommendation: "Add terms of service, legal notice, or imprint page links.",
    },
    {
      id: "business-address",
      label: "Business address detected",
      status: "pass",
      message: "Business address or postal address markup was detected.",
    },
    {
      id: "email-phone",
      label: "Email or phone detected",
      status: "pass",
      message: "A contact email address or phone number was detected.",
    },
    {
      id: "author-team",
      label: "Author/team/about-person signal detected",
      status: "pass",
      message: "Author, team, or leadership attribution signal was detected.",
    },
    {
      id: "external-trust-links",
      label: "External trust links detected",
      status: "warning",
      message: "2 social profile link(s) found, but no authority references detected.",
      recommendation: "Link to authoritative external profiles, references, or citations.",
    },
    {
      id: "secure-https",
      label: "Secure HTTPS detected",
      status: "pass",
      message: "Site is served over secure HTTPS.",
    },
  ] satisfies AuditFinding[],
  issues: [
    {
      title: "Terms/legal page detected",
      impact: "Medium",
      explanation: "No terms or legal/imprint page link was detected.",
    },
    {
      title: "External trust links detected",
      impact: "Medium",
      explanation: "2 social profile link(s) found, but no authority references detected.",
    },
  ] satisfies AuditIssue[],
  recommendations: [
    {
      title: "Add terms/legal page detected",
      whyThisMatters:
        "AI search systems weigh trust markers such as contact transparency, legal pages, HTTPS, and authority references before citing a site.",
      howToFix: "Add terms of service, legal notice, or imprint page links.",
      estimatedGain: 5,
    },
    {
      title: "Strengthen external trust links detected",
      whyThisMatters:
        "AI search systems weigh trust markers such as contact transparency, legal pages, HTTPS, and authority references before citing a site.",
      howToFix: "Link to authoritative external profiles, references, or citations.",
      estimatedGain: 6,
    },
  ] satisfies AuditRecommendation[],
};

export const openGraphAuditMock: OpenGraphAuditResult = {
  score: 74,
  status: "warning",
  findings: [
    {
      id: "og-title",
      label: "og:title detected",
      status: "pass",
      message: 'og:title found: "CoinArchive — Historical Numismatics Collection".',
    },
    {
      id: "og-description",
      label: "og:description detected",
      status: "pass",
      message: "og:description found (58 characters).",
    },
    {
      id: "og-image",
      label: "og:image detected",
      status: "pass",
      message: "og:image tag found for rich link previews.",
    },
    {
      id: "og-url",
      label: "og:url detected",
      status: "pass",
      message: "og:url set to https://coinarchive.eu/.",
    },
    {
      id: "og-type",
      label: "og:type detected",
      status: "pass",
      message: 'og:type set to "website".',
    },
    {
      id: "og-site-name",
      label: "og:site_name detected",
      status: "fail",
      message: "No og:site_name meta tag was found.",
      recommendation: "Add og:site_name with your brand or site name for consistent previews.",
    },
    {
      id: "og-title-length",
      label: "og:title length is healthy",
      status: "warning",
      message: "og:title is only 22 characters; aim for 30-70 characters.",
      recommendation: "Keep og:title between 30 and 70 characters for optimal previews.",
    },
    {
      id: "og-description-length",
      label: "og:description length is healthy",
      status: "warning",
      message: "og:description is only 58 characters; aim for 70-200 characters.",
      recommendation: "Keep og:description between 70 and 200 characters.",
    },
    {
      id: "og-image-absolute-url",
      label: "og:image uses absolute URL",
      status: "warning",
      message: "og:image uses a relative URL; social platforms require an absolute HTTPS URL.",
      recommendation: "Use a fully qualified HTTPS URL for og:image (not a relative path).",
    },
  ] satisfies AuditFinding[],
  issues: [
    {
      title: "og:site_name detected",
      impact: "Medium",
      explanation: "No og:site_name meta tag was found.",
    },
    {
      title: "og:description length is healthy",
      impact: "Medium",
      explanation: "og:description is only 58 characters; aim for 70-200 characters.",
    },
    {
      title: "og:title length is healthy",
      impact: "Medium",
      explanation: "og:title is only 22 characters; aim for 30-70 characters.",
    },
    {
      title: "og:image uses absolute URL",
      impact: "Medium",
      explanation: "og:image uses a relative URL; social platforms require an absolute HTTPS URL.",
    },
  ] satisfies AuditIssue[],
  recommendations: [
    {
      title: "Add og:site_name detected",
      whyThisMatters:
        "Open Graph metadata controls how LinkedIn, Facebook, Slack, WhatsApp, and AI systems render link previews.",
      howToFix: "Add og:site_name with your brand or site name for consistent previews.",
      estimatedGain: 4,
    },
    {
      title: "Improve og:image uses absolute URL",
      whyThisMatters:
        "Open Graph metadata controls how LinkedIn, Facebook, Slack, WhatsApp, and AI systems render link previews.",
      howToFix: "Use a fully qualified HTTPS URL for og:image (not a relative path).",
      estimatedGain: 6,
    },
    {
      title: "Improve og:title length is healthy",
      whyThisMatters:
        "Open Graph metadata controls how LinkedIn, Facebook, Slack, WhatsApp, and AI systems render link previews.",
      howToFix: "Keep og:title between 30 and 70 characters for optimal previews.",
      estimatedGain: 5,
    },
  ] satisfies AuditRecommendation[],
};

export const twitterCardAuditMock: TwitterCardAuditResult = {
  score: 68,
  status: "warning",
  findings: [
    {
      id: "twitter-card",
      label: "twitter:card detected",
      status: "pass",
      message: 'twitter:card set to "summary_large_image".',
    },
    {
      id: "twitter-title",
      label: "twitter:title detected",
      status: "pass",
      message: 'twitter:title found: "CoinArchive — Historical Numismatics Collection".',
    },
    {
      id: "twitter-description",
      label: "twitter:description detected",
      status: "pass",
      message: "twitter:description found (52 characters).",
    },
    {
      id: "twitter-image",
      label: "twitter:image detected",
      status: "pass",
      message: "twitter:image tag found for rich X/Twitter previews.",
    },
    {
      id: "twitter-site",
      label: "twitter:site detected",
      status: "fail",
      message: "No twitter:site meta tag was found.",
      recommendation: "Add twitter:site with your brand @handle for attribution on X/Twitter.",
    },
    {
      id: "twitter-creator",
      label: "twitter:creator detected",
      status: "fail",
      message: "No twitter:creator meta tag was found.",
      recommendation: "Add twitter:creator with the content author @handle when applicable.",
    },
    {
      id: "twitter-title-length",
      label: "twitter:title length is healthy",
      status: "pass",
      message: "twitter:title length is 45 characters (healthy range 30-70).",
    },
    {
      id: "twitter-description-length",
      label: "twitter:description length is healthy",
      status: "warning",
      message: "twitter:description is only 52 characters; aim for 70-200 characters.",
      recommendation: "Keep twitter:description between 70 and 200 characters.",
    },
    {
      id: "twitter-image-absolute-url",
      label: "twitter:image uses absolute URL",
      status: "warning",
      message: "twitter:image uses a relative URL; X/Twitter requires an absolute HTTPS URL.",
      recommendation: "Use a fully qualified HTTPS URL for twitter:image (not a relative path).",
    },
  ] satisfies AuditFinding[],
  issues: [
    {
      title: "twitter:site detected",
      impact: "Medium",
      explanation: "No twitter:site meta tag was found.",
    },
    {
      title: "twitter:creator detected",
      impact: "Medium",
      explanation: "No twitter:creator meta tag was found.",
    },
    {
      title: "twitter:description length is healthy",
      impact: "Medium",
      explanation: "twitter:description is only 52 characters; aim for 70-200 characters.",
    },
    {
      title: "twitter:image uses absolute URL",
      impact: "Medium",
      explanation: "twitter:image uses a relative URL; X/Twitter requires an absolute HTTPS URL.",
    },
  ] satisfies AuditIssue[],
  recommendations: [
    {
      title: "Improve twitter:image uses absolute URL",
      whyThisMatters:
        "Twitter Card metadata controls how links render on X/Twitter and complements Open Graph previews.",
      howToFix: "Use a fully qualified HTTPS URL for twitter:image (not a relative path).",
      estimatedGain: 6,
    },
    {
      title: "Add twitter:site detected",
      whyThisMatters:
        "Twitter Card metadata controls how links render on X/Twitter and complements Open Graph previews.",
      howToFix: "Add twitter:site with your brand @handle for attribution on X/Twitter.",
      estimatedGain: 5,
    },
    {
      title: "Improve twitter:description length is healthy",
      whyThisMatters:
        "Twitter Card metadata controls how links render on X/Twitter and complements Open Graph previews.",
      howToFix: "Keep twitter:description between 70 and 200 characters.",
      estimatedGain: 5,
    },
  ] satisfies AuditRecommendation[],
};

export const advancedSchemaAuditMock: AdvancedSchemaAuditResult = {
  score: 79,
  status: "warning",
  findings: [
    {
      id: "organization-schema",
      label: "Organization schema detected",
      status: "pass",
      message: "Organization schema is present in JSON-LD.",
    },
    {
      id: "website-schema",
      label: "WebSite schema detected",
      status: "pass",
      message: "WebSite schema is present in JSON-LD.",
    },
    {
      id: "webpage-schema",
      label: "WebPage schema detected",
      status: "pass",
      message: "WebPage schema is present in JSON-LD.",
    },
    {
      id: "article-schema",
      label: "Article/BlogPosting schema detected",
      status: "warning",
      message: "No Article or BlogPosting schema detected (optional for non-article pages).",
      recommendation:
        "Add Article or BlogPosting schema when the page publishes editorial content.",
    },
    {
      id: "faq-schema",
      label: "FAQPage schema detected",
      status: "pass",
      message: "FAQPage schema is present in JSON-LD.",
    },
    {
      id: "breadcrumb-schema",
      label: "BreadcrumbList schema detected",
      status: "pass",
      message: "BreadcrumbList schema is present in JSON-LD.",
    },
    {
      id: "product-service-schema",
      label: "Product/Service schema detected",
      status: "warning",
      message: "No Product or Service schema detected (optional unless offering pages are present).",
      recommendation:
        "Add Product or Service schema on commercial or offering-focused pages.",
    },
    {
      id: "local-business-schema",
      label: "LocalBusiness schema detected",
      status: "fail",
      message: "No LocalBusiness schema detected (optional unless local presence applies).",
      recommendation:
        "Add LocalBusiness schema with address, geo, and opening hours when relevant.",
    },
    {
      id: "schema-context-type",
      label: "Schema has valid @context and @type",
      status: "pass",
      message: "2 JSON-LD block(s) include valid schema.org @context and @type.",
    },
  ] satisfies AuditFinding[],
  issues: [
    {
      title: "Article/BlogPosting schema detected",
      impact: "Medium",
      explanation: "No Article or BlogPosting schema detected (optional for non-article pages).",
    },
    {
      title: "Product/Service schema detected",
      impact: "Medium",
      explanation: "No Product or Service schema detected (optional unless offering pages are present).",
    },
    {
      title: "LocalBusiness schema detected",
      impact: "Medium",
      explanation: "No LocalBusiness schema detected (optional unless local presence applies).",
    },
  ] satisfies AuditIssue[],
  recommendations: [
    {
      title: "Strengthen article/blogposting schema detected",
      whyThisMatters:
        "Rich structured data helps Google and AI systems understand entities, page type, and content relationships.",
      howToFix:
        "Add Article or BlogPosting schema when the page publishes editorial content.",
      estimatedGain: 5,
    },
    {
      title: "Strengthen product/service schema detected",
      whyThisMatters:
        "Rich structured data helps Google and AI systems understand entities, page type, and content relationships.",
      howToFix:
        "Add Product or Service schema on commercial or offering-focused pages.",
      estimatedGain: 5,
    },
    {
      title: "Add localbusiness schema detected",
      whyThisMatters:
        "Rich structured data helps Google and AI systems understand entities, page type, and content relationships.",
      howToFix:
        "Add LocalBusiness schema with address, geo, and opening hours when relevant.",
      estimatedGain: 5,
    },
  ] satisfies AuditRecommendation[],
};

const crawlDomain = reportMeta.domain;

export const siteCrawlMock: SiteCrawlResult = {
  startUrl: `https://${crawlDomain}/`,
  maxPages: 5,
  pages: [
    {
      url: `https://${crawlDomain}/`,
      title: "CoinArchive — Historical Numismatics Collection",
      statusCode: 200,
      html: "<html><body><h1>CoinArchive</h1></body></html>",
      text: "CoinArchive Historical Numismatics Collection",
      links: [
        `https://${crawlDomain}/about`,
        `https://${crawlDomain}/services`,
        `https://${crawlDomain}/contact`,
        `https://${crawlDomain}/blog`,
      ],
    },
    {
      url: `https://${crawlDomain}/about`,
      title: "About CoinArchive",
      statusCode: 200,
      html: "<html><body><h1>About</h1></body></html>",
      text: "About CoinArchive team and mission",
      links: [`https://${crawlDomain}/`, `https://${crawlDomain}/contact`],
    },
    {
      url: `https://${crawlDomain}/services`,
      title: "Services",
      statusCode: 200,
      html: "<html><body><h1>Services</h1></body></html>",
      text: "Cataloging appraisal and research services",
      links: [`https://${crawlDomain}/`, `https://${crawlDomain}/pricing`],
    },
    {
      url: `https://${crawlDomain}/contact`,
      title: "Contact",
      statusCode: 200,
      html: "<html><body><h1>Contact</h1></body></html>",
      text: "Contact CoinArchive by email or phone",
      links: [`https://${crawlDomain}/`, `https://${crawlDomain}/about`],
    },
    {
      url: `https://${crawlDomain}/blog`,
      title: "Blog",
      statusCode: 200,
      html: "<html><body><h1>Blog</h1></body></html>",
      text: "Latest numismatics articles and research notes",
      links: [`https://${crawlDomain}/`, `https://${crawlDomain}/about`],
    },
  ],
  discoveredUrls: [
    `https://${crawlDomain}/`,
    `https://${crawlDomain}/about`,
    `https://${crawlDomain}/services`,
    `https://${crawlDomain}/contact`,
    `https://${crawlDomain}/blog`,
    `https://${crawlDomain}/pricing`,
  ],
  failedUrls: [],
};
