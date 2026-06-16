import { buildReportView } from "@/lib/audit/audit-to-report";
import { calculateAuditScores } from "@/lib/audit/audit-score";
import { getCitationReadinessAudit } from "@/lib/audit/audit-normalize";
import { loadAuditReportSafe } from "@/lib/audit/storage";
import type { AuditResponse, CategoryScore } from "@/lib/audit/types";
import { citationReadinessAuditMock, reportMeta } from "@/lib/report-data";
import type { AuditFindingStatus } from "@/types/audit";

export type CitationKpi = {
  label: string;
  value: string;
  detail: string;
};

export type CitationFindingRow = {
  id: string;
  label: string;
  status: AuditFindingStatus;
  statusLabel: string;
  statusClassName: string;
  message: string;
};

export type CitationReadinessDetailView = {
  domain: string;
  isRealData: boolean;
  score: number;
  statusLabel: string;
  statusClassName: string;
  title: string;
  summary: string;
  kpis: CitationKpi[];
  findings: CitationFindingRow[];
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
  auditFindings: ReturnType<typeof getCitationReadinessAudit>["findings"],
): CitationFindingRow[] {
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

function buildDemoView(domain: string): CitationReadinessDetailView {
  const mock = citationReadinessAuditMock;
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
    title: "Citation Readiness",
    summary:
      "This page has solid authorship and descriptive metadata, but missing references and weak source authority reduce AI citation confidence.",
    kpis: [
      { label: "Passed Signals", value: String(passed), detail: "Ready for AI citation" },
      { label: "Partial Signals", value: String(warnings), detail: "Needs strengthening" },
      { label: "Failed Signals", value: String(failed), detail: "Blocks citation trust" },
      { label: "Open Issues", value: String(mock.issues.length), detail: "Priority fixes" },
    ],
    findings,
    issues: mock.issues.map((issue) => issue.explanation),
    recommendation: {
      title: topRec?.title ?? "Add references section",
      description:
        topRec?.howToFix ??
        "Add a References or Sources section with outbound links to supporting materials.",
      impactGain: `+${topRec?.estimatedGain ?? 6} Score Gain`,
      priority: (topRec?.estimatedGain ?? 6) >= 6 ? "High" : "Medium",
      effort: "Easy",
    },
    auditDate: reportMeta.auditDate,
  };
}

export function buildCitationReadinessDetailView(
  audit: AuditResponse | null,
  fallbackDomain: string,
): CitationReadinessDetailView {
  const view = buildReportView(audit, fallbackDomain);

  if (!view.isRealData || !audit) {
    return buildDemoView(view.domain);
  }

  const scores = calculateAuditScores(audit);
  const category = getCategory(scores.categories, "Citation Readiness");
  const citationAudit = getCitationReadinessAudit(audit);
  const citationScore = category?.score ?? citationAudit.score;
  const status = scoreToStatus(citationScore);
  const findings = mapFindings(citationAudit.findings);
  const passed = findings.filter((finding) => finding.status === "pass").length;
  const warnings = findings.filter((finding) => finding.status === "warning").length;
  const failed = findings.filter((finding) => finding.status === "fail").length;
  const topRec = citationAudit.recommendations[0];

  return {
    domain: view.domain,
    isRealData: true,
    score: citationScore,
    statusLabel: status.label,
    statusClassName: status.className,
    title: "Citation Readiness",
    summary:
      category?.summary ??
      "Citation readiness depends on authorship, dates, references, and source evidence for AI systems.",
    kpis: [
      { label: "Passed Signals", value: String(passed), detail: "Ready for AI citation" },
      { label: "Partial Signals", value: String(warnings), detail: "Needs strengthening" },
      { label: "Failed Signals", value: String(failed), detail: "Blocks citation trust" },
      { label: "Open Issues", value: String(citationAudit.issues.length), detail: "Priority fixes" },
    ],
    findings,
    issues:
      citationAudit.issues.length > 0
        ? citationAudit.issues.map((issue) => issue.explanation)
        : category?.problems.slice(0, 4) ?? [],
    recommendation: {
      title: topRec?.title ?? "Improve citation readiness",
      description:
        topRec?.howToFix ??
        category?.recommendations[0] ??
        "Add author, date, and reference signals so AI systems can safely cite this page.",
      impactGain: `+${topRec?.estimatedGain ?? 5} Score Gain`,
      priority: (topRec?.estimatedGain ?? 5) >= 6 ? "High" : "Medium",
      effort: (topRec?.estimatedGain ?? 5) >= 6 ? "Medium" : "Easy",
    },
    auditDate: view.auditDate,
  };
}

export function getCitationReadinessFallbackView(
  domain: string,
): CitationReadinessDetailView {
  return buildDemoView(domain);
}

export function loadCitationReadinessDetailView(
  domain: string,
): CitationReadinessDetailView {
  return buildCitationReadinessDetailView(loadAuditReportSafe(), domain);
}
