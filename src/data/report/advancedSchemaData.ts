import { buildReportView } from "@/lib/audit/audit-to-report";
import { calculateAuditScores } from "@/lib/audit/audit-score";
import { getAdvancedSchemaAudit } from "@/lib/audit/audit-normalize";
import { loadAuditReportSafe } from "@/lib/audit/storage";
import type { AuditResponse, CategoryScore } from "@/lib/audit/types";
import { advancedSchemaAuditMock, reportMeta } from "@/lib/report-data";
import type { AuditFindingStatus } from "@/types/audit";

export type AdvancedSchemaKpi = {
  label: string;
  value: string;
  detail: string;
};

export type AdvancedSchemaFindingRow = {
  id: string;
  label: string;
  status: AuditFindingStatus;
  statusLabel: string;
  statusClassName: string;
  message: string;
};

export type AdvancedSchemaDetailView = {
  domain: string;
  isRealData: boolean;
  score: number;
  statusLabel: string;
  statusClassName: string;
  title: string;
  summary: string;
  kpis: AdvancedSchemaKpi[];
  findings: AdvancedSchemaFindingRow[];
  issues: string[];
  recommendation: {
    title: string;
    description: string;
    impactGain: string;
    priority: string;
    effort: string;
  };
  auditDate: string;
};

function getCategory(
  categories: CategoryScore[],
  label: string,
): CategoryScore | undefined {
  return categories.find((category) => category.label === label);
}

function statusToLabel(status: AuditFindingStatus): {
  label: string;
  className: string;
} {
  if (status === "pass") {
    return { label: "Pass", className: "bg-green-100 text-green-800" };
  }

  if (status === "warning") {
    return { label: "Partial", className: "bg-[#FFF9C4] text-[#856404]" };
  }

  return { label: "Fail", className: "bg-error-container text-on-error-container" };
}

function scoreToStatus(score: number): { label: string; className: string } {
  if (score >= 80) {
    return { label: "Good", className: "bg-green-100 text-green-800" };
  }

  if (score >= 50) {
    return { label: "Warning", className: "bg-[#FFF9C4] text-[#856404]" };
  }

  return { label: "Poor", className: "bg-error-container text-on-error-container" };
}

function mapFindings(
  auditFindings: ReturnType<typeof getAdvancedSchemaAudit>["findings"],
): AdvancedSchemaFindingRow[] {
  return auditFindings.map((finding) => {
    const status = statusToLabel(finding.status);

    return {
      id: finding.id,
      label: finding.label,
      status: finding.status,
      statusLabel: status.label,
      statusClassName: status.className,
      message: finding.message,
    };
  });
}

function buildDemoView(domain: string): AdvancedSchemaDetailView {
  const mock = advancedSchemaAuditMock;
  const status = scoreToStatus(mock.score);
  const findings = mapFindings(mock.findings);
  const passed = findings.filter((finding) => finding.status === "pass").length;
  const warnings = findings.filter((finding) => finding.status === "warning").length;
  const failed = findings.filter((finding) => finding.status === "fail").length;
  const topRec = mock.recommendations[0];

  return {
    domain,
    isRealData: false,
    score: mock.score,
    statusLabel: status.label,
    statusClassName: status.className,
    title: "Advanced Schema",
    summary:
      "Core Organization, WebSite, and WebPage schema are present, but page-specific schema types can still be expanded.",
    kpis: [
      { label: "Passed Signals", value: String(passed), detail: "Structured data ready" },
      { label: "Partial Signals", value: String(warnings), detail: "Optional enrichment" },
      { label: "Failed Signals", value: String(failed), detail: "Missing schema types" },
      { label: "Open Issues", value: String(mock.issues.length), detail: "Priority fixes" },
    ],
    findings,
    issues: mock.issues.map((issue) => issue.explanation),
    recommendation: {
      title: topRec?.title ?? "Expand schema coverage",
      description:
        topRec?.howToFix ??
        "Add page-specific JSON-LD types such as Article, Product, or LocalBusiness when relevant.",
      impactGain: `+${topRec?.estimatedGain ?? 5} Score Gain`,
      priority: (topRec?.estimatedGain ?? 5) >= 6 ? "High" : "Medium",
      effort: "Medium",
    },
    auditDate: reportMeta.auditDate,
  };
}

export function buildAdvancedSchemaDetailView(
  audit: AuditResponse | null,
  fallbackDomain: string,
): AdvancedSchemaDetailView {
  const view = buildReportView(audit, fallbackDomain);

  if (!view.isRealData || !audit) {
    return buildDemoView(view.domain);
  }

  const scores = calculateAuditScores(audit);
  const category = getCategory(scores.categories, "Advanced Schema");
  const schemaAudit = getAdvancedSchemaAudit(audit);
  const schemaScore = category?.score ?? schemaAudit.score;
  const status = scoreToStatus(schemaScore);
  const findings = mapFindings(schemaAudit.findings);
  const passed = findings.filter((finding) => finding.status === "pass").length;
  const warnings = findings.filter((finding) => finding.status === "warning").length;
  const failed = findings.filter((finding) => finding.status === "fail").length;
  const topRec = schemaAudit.recommendations[0];

  return {
    domain: view.domain,
    isRealData: true,
    score: schemaScore,
    statusLabel: status.label,
    statusClassName: status.className,
    title: "Advanced Schema",
    summary:
      category?.summary ??
      "Advanced schema coverage helps Google and AI systems interpret entities, page type, and relationships.",
    kpis: [
      { label: "Passed Signals", value: String(passed), detail: "Structured data ready" },
      { label: "Partial Signals", value: String(warnings), detail: "Optional enrichment" },
      { label: "Failed Signals", value: String(failed), detail: "Missing schema types" },
      { label: "Open Issues", value: String(schemaAudit.issues.length), detail: "Priority fixes" },
    ],
    findings,
    issues:
      schemaAudit.issues.length > 0
        ? schemaAudit.issues.map((issue) => issue.explanation)
        : category?.problems.slice(0, 4) ?? [],
    recommendation: {
      title: topRec?.title ?? "Improve schema coverage",
      description:
        topRec?.howToFix ??
        category?.recommendations[0] ??
        "Add JSON-LD blocks with schema.org @context and relevant @type values.",
      impactGain: `+${topRec?.estimatedGain ?? 6} Score Gain`,
      priority: (topRec?.estimatedGain ?? 6) >= 6 ? "High" : "Medium",
      effort: (topRec?.estimatedGain ?? 6) >= 6 ? "Medium" : "Easy",
    },
    auditDate: view.auditDate,
  };
}

export function getAdvancedSchemaFallbackView(domain: string): AdvancedSchemaDetailView {
  return buildDemoView(domain);
}

export function loadAdvancedSchemaDetailView(domain: string): AdvancedSchemaDetailView {
  return buildAdvancedSchemaDetailView(loadAuditReportSafe(), domain);
}
