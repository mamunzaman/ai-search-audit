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
};

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

export type PriorityIssueSeverity = "Critical" | "High" | "Medium" | "Low";

export type RankedPriorityIssue = {
  title: string;
  category: string;
  severity: PriorityIssueSeverity;
  impact: string;
  recommendation: string;
  estimatedGain: number;
  detailHref: string;
};
