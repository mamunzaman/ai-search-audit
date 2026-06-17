import { calculateAuditScores } from "@/lib/audit/audit-score";
import {
  getAdvancedSchemaAudit,
  getOpenGraphAudit,
  getTwitterCardAudit,
  normalizeAuditResponse,
} from "@/lib/audit/audit-normalize";
import type { AuditHeadings, AuditResponse, CategoryScore } from "@/lib/audit/types";
import {
  advancedSchemaAuditMock,
  openGraphAuditMock,
  twitterCardAuditMock,
} from "@/lib/report-data";
import type {
  AIVisibilityBreakdownItem,
  AuditFinding,
  HeadingStructureInsight,
  OpenGraphAuditResult,
  SchemaCoverageItem,
  SocialMetadataCoverage,
  SocialMetadataCoverageBlock,
  TwitterCardAuditResult,
  VisualInsights,
} from "@/types/audit";

const AI_VISIBILITY_BREAKDOWN_LABELS = [
  "Entity Clarity",
  "Citation Readiness",
  "Answer Extraction",
  "Trust Signals",
] as const;

const SCHEMA_COVERAGE_ITEMS: { label: string; findingId: string }[] = [
  { label: "Organization", findingId: "organization-schema" },
  { label: "WebSite", findingId: "website-schema" },
  { label: "WebPage", findingId: "webpage-schema" },
  { label: "Article", findingId: "article-schema" },
  { label: "FAQ", findingId: "faq-schema" },
  { label: "Breadcrumb", findingId: "breadcrumb-schema" },
  { label: "Product/Service", findingId: "product-service-schema" },
  { label: "LocalBusiness", findingId: "local-business-schema" },
];

function countHeadingLevel(
  headings: AuditHeadings,
  level: keyof HeadingStructureInsight,
): number {
  return headings[level]?.length ?? 0;
}

function getCategoryScore(categories: CategoryScore[], label: string): number {
  return categories.find((category) => category.label === label)?.score ?? 0;
}

function buildAIVisibilityBreakdown(categories: CategoryScore[]): AIVisibilityBreakdownItem[] {
  return AI_VISIBILITY_BREAKDOWN_LABELS.map((label) => ({
    label,
    score: getCategoryScore(categories, label),
  }));
}

function buildSchemaCoverage(findings: AuditFinding[]): SchemaCoverageItem[] {
  const findingById = new Map(findings.map((finding) => [finding.id, finding]));

  return SCHEMA_COVERAGE_ITEMS.map(({ label, findingId }) => {
    const finding = findingById.get(findingId);

    return {
      label,
      present: finding?.status === "pass",
    };
  });
}

function buildSocialMetadataBlock(
  audit: OpenGraphAuditResult | TwitterCardAuditResult,
  categoryScore: number,
): SocialMetadataCoverageBlock {
  const findings = audit.findings;
  const total = findings.length;
  const present = findings.filter((finding) => finding.status === "pass").length;

  return {
    score: categoryScore > 0 ? categoryScore : audit.score,
    present,
    total,
  };
}

function buildSocialMetadataCoverage(
  openGraphAudit: OpenGraphAuditResult,
  twitterCardAudit: TwitterCardAuditResult,
  categories: CategoryScore[],
): SocialMetadataCoverage {
  return {
    openGraph: buildSocialMetadataBlock(
      openGraphAudit,
      getCategoryScore(categories, "Open Graph"),
    ),
    twitterCard: buildSocialMetadataBlock(
      twitterCardAudit,
      getCategoryScore(categories, "Twitter Card"),
    ),
  };
}

export function generateVisualInsights(audit: AuditResponse): VisualInsights {
  const normalized = normalizeAuditResponse(audit);

  if (!normalized) {
    return buildPlaceholderVisualInsights();
  }

  const { headings } = normalized;
  const categories = calculateAuditScores(normalized).categories;
  const schemaFindings = getAdvancedSchemaAudit(normalized).findings;

  return {
    headingStructure: {
      h1: countHeadingLevel(headings, "h1"),
      h2: countHeadingLevel(headings, "h2"),
      h3: countHeadingLevel(headings, "h3"),
      h4: countHeadingLevel(headings, "h4"),
      h5: countHeadingLevel(headings, "h5"),
      h6: countHeadingLevel(headings, "h6"),
    },
    aiVisibilityBreakdown: buildAIVisibilityBreakdown(categories),
    schemaCoverage: buildSchemaCoverage(schemaFindings),
    socialMetadataCoverage: buildSocialMetadataCoverage(
      getOpenGraphAudit(normalized),
      getTwitterCardAudit(normalized),
      categories,
    ),
  };
}

export const defaultHeadingStructureInsight: HeadingStructureInsight = {
  h1: 1,
  h2: 8,
  h3: 12,
  h4: 0,
  h5: 0,
  h6: 0,
};

export const defaultAIVisibilityBreakdown: AIVisibilityBreakdownItem[] = [
  { label: "Entity Clarity", score: 78 },
  { label: "Citation Readiness", score: 72 },
  { label: "Answer Extraction", score: 76 },
  { label: "Trust Signals", score: 81 },
];

function buildPlaceholderSocialMetadataCoverage(): SocialMetadataCoverage {
  return {
    openGraph: buildSocialMetadataBlock(openGraphAuditMock, openGraphAuditMock.score),
    twitterCard: buildSocialMetadataBlock(twitterCardAuditMock, twitterCardAuditMock.score),
  };
}

export function buildPlaceholderVisualInsights(): VisualInsights {
  return {
    headingStructure: { ...defaultHeadingStructureInsight },
    aiVisibilityBreakdown: [...defaultAIVisibilityBreakdown],
    schemaCoverage: buildSchemaCoverage(advancedSchemaAuditMock.findings),
    socialMetadataCoverage: buildPlaceholderSocialMetadataCoverage(),
  };
}
