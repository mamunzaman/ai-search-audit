export type AuditFindingStatus = "pass" | "warning" | "fail";

export type AuditFinding = {
  id: string;
  label: string;
  status: AuditFindingStatus;
  message: string;
  recommendation?: string;
};

export type AuditIssueImpact = "Critical" | "High" | "Medium";

export type AuditIssue = {
  title: string;
  impact: AuditIssueImpact;
  explanation: string;
};

export type AuditRecommendation = {
  title: string;
  whyThisMatters: string;
  howToFix: string;
  estimatedGain: number;
  copyableExample?: string;
};

export type EnrichedRecommendationFields = {
  whyItMatters?: string;
  howToFix?: string;
  copyableExample?: string;
};

export type DetailPageRecommendation = {
  title: string;
  description: string;
  impactGain: string;
  priority: string;
  effort: string;
} & EnrichedRecommendationFields;

export type AIAuditStatus = "good" | "warning" | "poor";

export type EntityClarityAuditResult = {
  score: number;
  status: AIAuditStatus;
  findings: AuditFinding[];
  issues: AuditIssue[];
  recommendations: AuditRecommendation[];
};

export type CitationReadinessAuditResult = {
  score: number;
  status: AIAuditStatus;
  findings: AuditFinding[];
  issues: AuditIssue[];
  recommendations: AuditRecommendation[];
};

export type AnswerExtractionAuditResult = {
  score: number;
  status: AIAuditStatus;
  findings: AuditFinding[];
  issues: AuditIssue[];
  recommendations: AuditRecommendation[];
};

export type TrustSignalsAuditResult = {
  score: number;
  status: AIAuditStatus;
  findings: AuditFinding[];
  issues: AuditIssue[];
  recommendations: AuditRecommendation[];
};

export type OpenGraphAuditResult = {
  score: number;
  status: AIAuditStatus;
  findings: AuditFinding[];
  issues: AuditIssue[];
  recommendations: AuditRecommendation[];
};

export type TwitterCardAuditResult = {
  score: number;
  status: AIAuditStatus;
  findings: AuditFinding[];
  issues: AuditIssue[];
  recommendations: AuditRecommendation[];
};

export type AdvancedSchemaAuditResult = {
  score: number;
  status: AIAuditStatus;
  findings: AuditFinding[];
  issues: AuditIssue[];
  recommendations: AuditRecommendation[];
};

export type CrawledPage = {
  url: string;
  title?: string;
  statusCode?: number;
  html: string;
  text: string;
  links: string[];
};

export type SiteCrawlResult = {
  startUrl: string;
  pages: CrawledPage[];
  discoveredUrls: string[];
  failedUrls: string[];
  maxPages: number;
};

export type ExecutiveSummary = {
  overallSummary: string;
  strengths: string[];
  opportunities: string[];
  potentialGain: number;
};

export type ScoreExplanation = {
  scoreLabel: string;
  summary: string;
  strengths: string[];
  blockers: string[];
  quickWins: string[];
};

export type FixPlanAction = {
  title: string;
  estimatedGain: number;
  category: string;
  why: string;
};

export type FixPlan = {
  actions: FixPlanAction[];
  totalPotentialGain: number;
};

export type HeadingStructureInsight = {
  h1: number;
  h2: number;
  h3: number;
  h4: number;
  h5: number;
  h6: number;
};

export type AIVisibilityBreakdownItem = {
  label: string;
  score: number;
};

export type SchemaCoverageItem = {
  label: string;
  present: boolean;
};

export type SocialMetadataCoverageBlock = {
  score: number;
  present: number;
  total: number;
};

export type SocialMetadataCoverage = {
  openGraph: SocialMetadataCoverageBlock;
  twitterCard: SocialMetadataCoverageBlock;
};

export type VisualInsights = {
  headingStructure: HeadingStructureInsight;
  aiVisibilityBreakdown: AIVisibilityBreakdownItem[];
  schemaCoverage: SchemaCoverageItem[];
  socialMetadataCoverage: SocialMetadataCoverage;
};

export type PriorityIssueSeverity = "Critical" | "High" | "Medium" | "Low";

export type RankedPriorityIssue = {
  title: string;
  category: string;
  severity: PriorityIssueSeverity;
  impact: string;
  recommendation: string;
  estimatedGain: number;
  detailHref: string;
  whyItMatters?: string;
  howToFix?: string;
  copyableExample?: string;
};
