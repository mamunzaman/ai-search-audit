import { buildReportView } from "@/lib/audit/audit-to-report";
import { calculateAuditScores } from "@/lib/audit/audit-score";
import {
  getAiVisibilitySignals,
  getEntityAnalysis,
} from "@/lib/audit/audit-normalize";
import { loadAuditReportSafe } from "@/lib/audit/storage";
import type { AuditResponse, CategoryScore } from "@/lib/audit/types";
import { reportMeta, entityClarityAuditMock } from "@/lib/report-data";
import { buildDetailPageRecommendation } from "@/lib/report/recommendationTemplates";
import type { DetailPageRecommendation } from "@/types/audit";

export type EntityKpi = {
  label: string;
  value: string;
  trendLabel: string;
  trendIcon: string;
  trendClassName: string;
};

export type EntitySignalItem = {
  label: string;
  score: number;
  detail: string;
};

export type EntityRelationshipNode = {
  label: string;
  x: number;
  y: number;
};

export type EntityBenchmarkRow = {
  entity: string;
  kgStrength: number;
  consistency: number;
  highlight?: boolean;
};

export type EntityClarityDetailView = {
  domain: string;
  isRealData: boolean;
  score: number;
  statusLabel: string;
  statusClassName: string;
  title: string;
  summary: string;
  kpis: EntityKpi[];
  primaryEntity: string;
  entityType: string;
  kgSignals: string[];
  consistencyScore: number;
  consistencyNote: string;
  relationshipPrimaryLabel: string;
  relationshipNodes: EntityRelationshipNode[];
  recommendation: DetailPageRecommendation;
  benchmarkRows: EntityBenchmarkRow[];
  entitySignals: EntitySignalItem[];
  missingEntities: string[];
  implementationCode: string;
  auditDate: string;
};

function getCategory(
  categories: CategoryScore[],
  label: string,
): CategoryScore | undefined {
  return categories.find((category) => category.label === label);
}

function scoreToStatus(score: number): { label: string; className: string } {
  if (score >= 90) {
    return { label: "Exceptional", className: "bg-green-100 text-green-700" };
  }

  if (score >= 80) {
    return { label: "Strong", className: "bg-green-100 text-green-800" };
  }

  if (score >= 65) {
    return { label: "Developing", className: "bg-[#FFF9C4] text-[#856404]" };
  }

  return { label: "At Risk", className: "bg-error-container text-on-error-container" };
}

function buildTrend(value: number): Pick<EntityKpi, "trendLabel" | "trendIcon" | "trendClassName"> {
  if (value >= 85) {
    return { trendLabel: "Stable", trendIcon: "trending_flat", trendClassName: "text-on-surface-variant" };
  }

  if (value >= 70) {
    return { trendLabel: "1%", trendIcon: "trending_down", trendClassName: "text-error" };
  }

  return { trendLabel: "Low", trendIcon: "trending_down", trendClassName: "text-error" };
}

function buildImplementationCode(domain: string, entityName: string): string {
  return `{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "${entityName}",
  "url": "https://${domain}",
  "logo": "https://${domain}/logo.png",
  "sameAs": [
    "https://www.wikidata.org/wiki/Q123456789",
    "https://www.linkedin.com/company/${domain.replace(/\./g, "")}",
    "https://twitter.com/${domain.replace(/\./g, "")}"
  ],
  "description": "AI Search Audit and LLM Visibility Analytics platform."
}`;
}

function defaultRelationshipNodes(): EntityRelationshipNode[] {
  return [
    { label: "SEO Tools", x: 150, y: 100 },
    { label: "AI Search", x: 450, y: 100 },
    { label: "SaaS", x: 150, y: 300 },
    { label: "Analytics", x: 450, y: 300 },
  ];
}

function buildRelationshipNodes(relatedEntities: string[]): EntityRelationshipNode[] {
  const positions = defaultRelationshipNodes();

  if (relatedEntities.length === 0) {
    return positions;
  }

  return relatedEntities.slice(0, 4).map((label, index) => ({
    label: label.length > 16 ? `${label.slice(0, 14)}…` : label,
    x: positions[index]?.x ?? 150,
    y: positions[index]?.y ?? 100,
  }));
}

function buildEntitySignals(audit: AuditResponse): EntitySignalItem[] {
  const entity = getEntityAnalysis(audit);
  const orgSchema = getAiVisibilitySignals(audit).organizationSchema;
  const primaryScore = entity.primaryEntity ? Math.max(70, entity.confidence) : 30;
  const orgScore = orgSchema && entity.entityType === "Organization" ? 95 : orgSchema ? 80 : 45;
  const personScore = entity.relatedEntities.some((term) => /author|person|team|ceo|founder/i.test(term))
    ? 78
    : 50;
  const locationScore = entity.entityType === "LocalBusiness" ? 90 : 55;
  const topicScore = Math.min(100, 60 + entity.relatedEntities.length * 10);
  const kgScore = Math.min(100, entity.confidence + entity.sources.length * 5);
  const relationScore = Math.min(100, 50 + entity.relatedEntities.length * 12);
  const consistencyScore = entity.confidence;

  return [
    {
      label: "Primary Entity Detection",
      score: primaryScore,
      detail: entity.primaryEntity ?? "No primary entity detected",
    },
    {
      label: "Organization Recognition",
      score: orgScore,
      detail: orgSchema ? "Organization schema detected" : "Organization schema missing",
    },
    {
      label: "Person Recognition",
      score: personScore,
      detail: personScore >= 70 ? "Person-related terms found" : "Limited person attribution signals",
    },
    {
      label: "Location Recognition",
      score: locationScore,
      detail:
        entity.entityType === "LocalBusiness"
          ? "Local business entity mapped"
          : "No local business entity detected",
    },
    {
      label: "Topic Coverage",
      score: topicScore,
      detail: `${entity.relatedEntities.length} related topic term(s) extracted`,
    },
    {
      label: "Knowledge Graph Readiness",
      score: kgScore,
      detail: entity.sources.length > 0 ? entity.sources.join(", ") : "Limited KG source signals",
    },
    {
      label: "Entity Relationships",
      score: relationScore,
      detail:
        entity.relatedEntities.length > 0
          ? entity.relatedEntities.slice(0, 3).join(", ")
          : "No relational terms detected",
    },
    {
      label: "Entity Consistency",
      score: consistencyScore,
      detail: `${consistencyScore}% confidence across extracted sources`,
    },
  ];
}

function buildDemoView(domain: string): EntityClarityDetailView {
  const mock = entityClarityAuditMock;
  const entitySignals: EntitySignalItem[] = mock.findings.map((finding) => ({
    label: finding.label,
    score: finding.status === "pass" ? 95 : finding.status === "warning" ? 65 : 35,
    detail: finding.message,
  }));

  return {
    domain,
    isRealData: false,
    score: mock.score,
    statusLabel: mock.status === "good" ? "Strong" : mock.status === "warning" ? "Developing" : "At Risk",
    statusClassName:
      mock.status === "good"
        ? "bg-green-100 text-green-800"
        : mock.status === "warning"
          ? "bg-[#FFF9C4] text-[#856404]"
          : "bg-error-container text-on-error-container",
    title: "Entity Clarity",
    summary:
      "Entity clarity audit shows strong organization identity signals, but schema and location details can still improve AI understanding.",
    kpis: [
      {
        label: "Entity Confidence",
        value: "98%",
        trendLabel: "2%",
        trendIcon: "trending_up",
        trendClassName: "text-green-600",
      },
      {
        label: "KG Signal Strength",
        value: "92%",
        trendLabel: "5%",
        trendIcon: "trending_up",
        trendClassName: "text-green-600",
      },
      {
        label: "Consistency",
        value: "95%",
        trendLabel: "Stable",
        trendIcon: "trending_flat",
        trendClassName: "text-on-surface-variant",
      },
      {
        label: "Relational Depth",
        value: "88%",
        trendLabel: "1%",
        trendIcon: "trending_down",
        trendClassName: "text-error",
      },
    ],
    primaryEntity: "AuditMetric Corp",
    entityType: "Organization / SoftwareApplication",
    kgSignals: ["Crunchbase", "LinkedIn", "WikiData", "G2 Crowd"],
    consistencyScore: 95,
    consistencyNote: "Verified on 24/25 global citations.",
    relationshipPrimaryLabel: "AuditMetric",
    relationshipNodes: defaultRelationshipNodes(),
    recommendation: buildDetailPageRecommendation({
      category: "Entity Clarity",
      title: "Refine Wikipedia/WikiData Linking",
      description:
        "Strengthen the \"sameAs\" properties in your Organization schema to point directly to your verified WikiData entity.",
      impactGain: "+2 Score Gain",
      priority: "Medium",
      effort: "Easy",
    }),
    benchmarkRows: [
      { entity: "AuditMetric (You)", kgStrength: 92, consistency: 95, highlight: true },
      { entity: "Competitor Alpha", kgStrength: 88, consistency: 91 },
      { entity: "Competitor Beta", kgStrength: 76, consistency: 82 },
    ],
    entitySignals,
    missingEntities: mock.issues.map((issue) => issue.explanation),
    implementationCode: buildImplementationCode(domain, "CoinArchive EU"),
    auditDate: reportMeta.auditDate,
  };
}

export function buildEntityClarityDetailView(
  audit: AuditResponse | null,
  fallbackDomain: string,
): EntityClarityDetailView {
  const view = buildReportView(audit, fallbackDomain);

  if (!view.isRealData || !audit) {
    return buildDemoView(view.domain);
  }

  const scores = calculateAuditScores(audit);
  const category = getCategory(scores.categories, "Entity Clarity");
  const entity = getEntityAnalysis(audit);
  const entityClarity = audit.entityClarityAudit;
  const ai = getAiVisibilitySignals(audit);
  const entityScore = category?.score ?? entityClarity?.score ?? entity.confidence;
  const status = scoreToStatus(entityScore);
  const entitySignals =
    entityClarity?.findings.length > 0
      ? entityClarity.findings.map((finding) => ({
          label: finding.label,
          score:
            finding.status === "pass" ? 95 : finding.status === "warning" ? 65 : 35,
          detail: finding.message,
        }))
      : buildEntitySignals(audit);
  const consistencyScore = entity.confidence;
  const kgStrength = Math.min(100, entity.confidence + entity.sources.length * 4);
  const relationalDepth = Math.min(
    100,
    50 + entity.relatedEntities.length * 10 + (entity.primaryEntity ? 10 : 0),
  );

  const topRec =
    entityClarity?.recommendations[0] ??
    scores.recommendations.find((rec) =>
      /entity|organization|schema|wikidata|sameas|kg/i.test(rec.title),
    ) ??
    scores.recommendations[0];

  const kgSignals = [
    ...entity.sources.map((source) => source.replace(/ schema/i, "")),
    ...(entity.relatedEntities.length > 0 ? ["Topic Terms"] : []),
  ].slice(0, 4);

  if (kgSignals.length === 0) {
    kgSignals.push("Schema", "Metadata", "Headings");
  }

  const primaryLabel = entity.primaryEntity ?? view.domain;
  const missingEntities =
    entityClarity?.issues.map((issue) => issue.explanation).slice(0, 4) ??
    category?.problems.slice(0, 4) ??
    [];

  if (entity.relatedEntities.length < 2) {
    missingEntities.push("Additional related entity terms for topic coverage");
  }

  return {
    domain: view.domain,
    isRealData: true,
    score: entityScore,
    statusLabel: status.label,
    statusClassName: status.className,
    title: "Entity Clarity",
    summary:
      category?.summary ??
      "Entity clarity depends on schema metadata, primary entity detection, and relational topic signals.",
    kpis: [
      {
        label: "Entity Confidence",
        value: `${entity.confidence}%`,
        trendLabel: entity.confidence >= 80 ? "Strong" : "Review",
        trendIcon: entity.confidence >= 80 ? "trending_up" : "trending_flat",
        trendClassName:
          entity.confidence >= 80 ? "text-green-600" : "text-on-surface-variant",
      },
      {
        label: "KG Signal Strength",
        value: `${kgStrength}%`,
        trendLabel: kgStrength >= 80 ? "Stable" : "Low",
        trendIcon: kgStrength >= 80 ? "trending_up" : "trending_down",
        trendClassName: kgStrength >= 80 ? "text-green-600" : "text-error",
      },
      {
        label: "Consistency",
        value: `${consistencyScore}%`,
        trendLabel: "Stable",
        trendIcon: "trending_flat",
        trendClassName: "text-on-surface-variant",
      },
      {
        label: "Relational Depth",
        value: `${relationalDepth}%`,
        ...buildTrend(relationalDepth),
      },
    ],
    primaryEntity: entity.primaryEntity ?? "Not detected",
    entityType:
      entity.entityType === "Unknown"
        ? "Organization"
        : `${entity.entityType}${ai.organizationSchema ? " / SoftwareApplication" : ""}`,
    kgSignals,
    consistencyScore,
    consistencyNote:
      entity.confidence >= 80
        ? `Verified across ${Math.max(1, entity.sources.length)} source signal(s).`
        : "Consistency needs stronger schema and metadata alignment.",
    relationshipPrimaryLabel: primaryLabel.length > 14 ? primaryLabel.slice(0, 12) : primaryLabel,
    relationshipNodes: buildRelationshipNodes(entity.relatedEntities),
    recommendation: buildDetailPageRecommendation({
      category: "Entity Clarity",
      title: topRec?.title ?? "Refine Wikipedia/WikiData Linking",
      description:
        topRec?.howToFix ??
        "Strengthen sameAs properties in Organization schema for knowledge graph alignment.",
      impactGain: `+${topRec?.estimatedGain ?? 2} Score Gain`,
      priority: (topRec?.estimatedGain ?? 2) >= 5 ? "High" : "Medium",
      effort: (topRec?.estimatedGain ?? 2) >= 5 ? "Medium" : "Easy",
    }),
    benchmarkRows: [
      {
        entity: `${primaryLabel} (You)`,
        kgStrength,
        consistency: consistencyScore,
        highlight: true,
      },
      { entity: "Industry Median", kgStrength: 76, consistency: 82 },
      { entity: "Top Performer", kgStrength: 92, consistency: 95 },
    ],
    entitySignals,
    missingEntities:
      missingEntities.length > 0
        ? missingEntities
        : buildDemoView(view.domain).missingEntities,
    implementationCode: buildImplementationCode(
      view.domain,
      entity.primaryEntity ?? view.domain,
    ),
    auditDate: view.auditDate,
  };
}

export function getEntityClarityFallbackView(domain: string): EntityClarityDetailView {
  return buildDemoView(domain);
}

export function loadEntityClarityDetailView(domain: string): EntityClarityDetailView {
  return buildEntityClarityDetailView(loadAuditReportSafe(), domain);
}
