export type AuditCheckStatus = "pass" | "fail" | "warn";

export type AuditCheck = {
  id: string;
  label: string;
  status: AuditCheckStatus;
  message: string;
};

export type CategoryScoreStatus = "pass" | "warning" | "fail";

export type CategoryScore = {
  id: string;
  label: string;
  score: number;
  status: CategoryScoreStatus;
  issueCount: number;
  summary: string;
  positives: string[];
  problems: string[];
  recommendations: string[];
};

export type PriorityImpact = "Critical" | "High" | "Medium";

export type PriorityIssue = {
  title: string;
  impact: PriorityImpact;
  difficulty: string;
  estimatedGain: number;
  explanation: string;
};

export type AuditRecommendation = {
  title: string;
  whyThisMatters: string;
  howToFix: string;
  estimatedGain: number;
};

export type AuditScoreResult = {
  overallScore: number;
  overallStatus: CategoryScoreStatus;
  categories: CategoryScore[];
  priorityIssues: PriorityIssue[];
  recommendations: AuditRecommendation[];
};

export type AuditRequest = {
  url: string;
};

export type AuditHeadings = {
  h1: string[];
  h2: string[];
  h3: string[];
};

export type AuditLinks = {
  internal: number;
  external: number;
};

export type ParsedAnchor = {
  href: string;
  text: string;
};

export type RobotsAnalysis = {
  exists: boolean;
  sitemapCount: number;
  disallowCount: number;
};

export type SitemapSource = "robots" | "default" | "none";

export type SitemapAnalysis = {
  exists: boolean;
  source: SitemapSource;
  sitemapCount: number;
  urlCount: number;
  childSitemapCount: number;
  sampleUrls: string[];
};

export type TrustSignals = {
  aboutPage: boolean;
  contactPage: boolean;
  privacyPage: boolean;
  legalPage: boolean;
  socialLinks: number;
  externalAuthorityLinks: number;
};

export type AiVisibilitySignals = {
  organizationSchema: boolean;
  faqSchema: boolean;
  clearH1: boolean;
  metaDescription: boolean;
  structuredHeadings: boolean;
  internalLinks: boolean;
  trustPages: boolean;
  visibleFaqHints: boolean;
};

export type OpenGraphMetadata = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
};

export type TwitterCardMetadata = {
  card?: string;
  title?: string;
  description?: string;
  image?: string;
};

export type SocialMetadata = {
  openGraph: OpenGraphMetadata;
  twitter: TwitterCardMetadata;
};

export type EntityType =
  | "Organization"
  | "Website"
  | "Event"
  | "LocalBusiness"
  | "Article"
  | "Unknown";

export type EntityAnalysis = {
  primaryEntity: string | null;
  entityType: EntityType;
  confidence: number;
  sources: string[];
  relatedEntities: string[];
};

export type ReadabilityAnalysis = {
  wordCount: number;
  paragraphCount: number;
  averageParagraphWords: number;
  listCount: number;
  tableCount: number;
  questionHeadingCount: number;
  hasFAQText: boolean;
  shortAnswerBlocks: number;
};

export type AccessibilityFindingStatus = "pass" | "warning" | "fail";

export type AccessibilityFinding = {
  id: string;
  label: string;
  status: AccessibilityFindingStatus;
  wcag: string;
  message: string;
  recommendation: string;
};

export type AccessibilityAnalysis = {
  score: number;
  imageCount: number;
  imagesMissingAlt: number;
  altTextCoverage: number;
  buttonCount: number;
  buttonsWithoutText: number;
  inputCount: number;
  inputsMissingLabels: number;
  headingOrderIssues: number;
  landmarkCount: number;
  hasMainLandmark: boolean;
  hasNavLandmark: boolean;
  hasHeaderLandmark: boolean;
  hasFooterLandmark: boolean;
  hasLangAttribute: boolean;
  hasTitle: boolean;
  skipLinkDetected: boolean;
  ariaLabelCount: number;
  ariaHiddenCount: number;
  emptyLinkCount: number;
  duplicateIdCount: number;
  findings: AccessibilityFinding[];
};

export type AuditResponse = {
  url: string;
  finalUrl: string;
  statusCode: number;
  title: string;
  metaDescription: string;
  headings: AuditHeadings;
  canonical: string;
  robotsMeta: string;
  schemaTypes: string[];
  links: AuditLinks;
  trustSignals: TrustSignals;
  aiVisibilitySignals: AiVisibilitySignals;
  robotsAnalysis: RobotsAnalysis;
  sitemapAnalysis: SitemapAnalysis;
  socialMetadata: SocialMetadata;
  entityAnalysis: EntityAnalysis;
  readabilityAnalysis: ReadabilityAnalysis;
  accessibilityAnalysis: AccessibilityAnalysis;
  checks: AuditCheck[];
};

export type StoredAuditReport = AuditResponse & {
  schemaVersion?: number;
};

export type ParsedPageData = {
  title: string;
  metaDescription: string;
  headings: AuditHeadings;
  canonical: string;
  robotsMeta: string;
  links: AuditLinks;
  anchors: ParsedAnchor[];
};
