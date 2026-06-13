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
