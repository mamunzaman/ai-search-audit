import { buildReportView } from "@/lib/audit/audit-to-report";
import { calculateAuditScores } from "@/lib/audit/audit-score";
import { getAnswerExtractionAudit } from "@/lib/audit/audit-normalize";
import { loadAuditReportSafe } from "@/lib/audit/storage";
import type { AuditResponse, CategoryScore } from "@/lib/audit/types";
import { answerExtractionAuditMock, reportMeta } from "@/lib/report-data";
import type { AuditFindingStatus } from "@/types/audit";

export type ExtractionKpi = {
  label: string;
  value: string;
  detail: string;
};

export type ExtractionFindingRow = {
  id: string;
  label: string;
  status: AuditFindingStatus;
  statusLabel: string;
  statusClassName: string;
  message: string;
};

export type AnswerExtractionDetailView = {
  domain: string;
  isRealData: boolean;
  score: number;
  statusLabel: string;
  statusClassName: string;
  title: string;
  summary: string;
  kpis: ExtractionKpi[];
  findings: ExtractionFindingRow[];
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
  auditFindings: ReturnType<typeof getAnswerExtractionAudit>["findings"],
): ExtractionFindingRow[] {
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

function buildDemoView(domain: string): AnswerExtractionDetailView {
  const mock = answerExtractionAuditMock;
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
    title: "Answer Extraction",
    summary:
      "FAQ blocks, question headings, and list-based answers are present, but tables and a summary section would improve AI answer extraction.",
    kpis: [
      { label: "Passed Signals", value: String(passed), detail: "Extractable answer blocks" },
      { label: "Partial Signals", value: String(warnings), detail: "Needs strengthening" },
      { label: "Failed Signals", value: String(failed), detail: "Missing structures" },
      { label: "Open Issues", value: String(mock.issues.length), detail: "Priority fixes" },
    ],
    findings,
    issues: mock.issues.map((issue) => issue.explanation),
    recommendation: {
      title: topRec?.title ?? "Improve answer extraction",
      description:
        topRec?.howToFix ??
        "Add FAQ blocks, concise paragraphs, and structured lists for AI answer extraction.",
      impactGain: `+${topRec?.estimatedGain ?? 6} Score Gain`,
      priority: (topRec?.estimatedGain ?? 6) >= 6 ? "High" : "Medium",
      effort: "Easy",
    },
    auditDate: reportMeta.auditDate,
  };
}

export function buildAnswerExtractionDetailView(
  audit: AuditResponse | null,
  fallbackDomain: string,
): AnswerExtractionDetailView {
  const view = buildReportView(audit, fallbackDomain);

  if (!view.isRealData || !audit) {
    return buildDemoView(view.domain);
  }

  const scores = calculateAuditScores(audit);
  const category = getCategory(scores.categories, "Answer Extraction");
  const extractionAudit = getAnswerExtractionAudit(audit);
  const extractionScore = category?.score ?? extractionAudit.score;
  const status = scoreToStatus(extractionScore);
  const findings = mapFindings(extractionAudit.findings);
  const passed = findings.filter((finding) => finding.status === "pass").length;
  const warnings = findings.filter((finding) => finding.status === "warning").length;
  const failed = findings.filter((finding) => finding.status === "fail").length;
  const topRec = extractionAudit.recommendations[0];

  return {
    domain: view.domain,
    isRealData: true,
    score: extractionScore,
    statusLabel: status.label,
    statusClassName: status.className,
    title: "Answer Extraction",
    summary:
      category?.summary ??
      "Answer extraction depends on FAQ blocks, concise paragraphs, lists, tables, and scannable heading hierarchy.",
    kpis: [
      { label: "Passed Signals", value: String(passed), detail: "Extractable answer blocks" },
      { label: "Partial Signals", value: String(warnings), detail: "Needs strengthening" },
      { label: "Failed Signals", value: String(failed), detail: "Missing structures" },
      { label: "Open Issues", value: String(extractionAudit.issues.length), detail: "Priority fixes" },
    ],
    findings,
    issues:
      extractionAudit.issues.length > 0
        ? extractionAudit.issues.map((issue) => issue.explanation)
        : category?.problems.slice(0, 4) ?? [],
    recommendation: {
      title: topRec?.title ?? "Improve answer extraction",
      description:
        topRec?.howToFix ??
        category?.recommendations[0] ??
        "Add FAQ blocks, concise paragraphs, and structured lists for AI answer extraction.",
      impactGain: `+${topRec?.estimatedGain ?? 5} Score Gain`,
      priority: (topRec?.estimatedGain ?? 5) >= 6 ? "High" : "Medium",
      effort: (topRec?.estimatedGain ?? 5) >= 6 ? "Medium" : "Easy",
    },
    auditDate: view.auditDate,
  };
}

export function getAnswerExtractionFallbackView(
  domain: string,
): AnswerExtractionDetailView {
  return buildDemoView(domain);
}

export function loadAnswerExtractionDetailView(
  domain: string,
): AnswerExtractionDetailView {
  return buildAnswerExtractionDetailView(loadAuditReportSafe(), domain);
}
