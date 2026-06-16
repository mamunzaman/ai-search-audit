import { buildReportView } from "@/lib/audit/audit-to-report";
import { calculateAuditScores } from "@/lib/audit/audit-score";
import { getOpenGraphAudit } from "@/lib/audit/audit-normalize";
import { loadAuditReportSafe } from "@/lib/audit/storage";
import type { AuditResponse, CategoryScore } from "@/lib/audit/types";
import { openGraphAuditMock, reportMeta } from "@/lib/report-data";
import type { AuditFindingStatus } from "@/types/audit";

export type OpenGraphKpi = {
  label: string;
  value: string;
  detail: string;
};

export type OpenGraphFindingRow = {
  id: string;
  label: string;
  status: AuditFindingStatus;
  statusLabel: string;
  statusClassName: string;
  message: string;
};

export type OpenGraphDetailView = {
  domain: string;
  isRealData: boolean;
  score: number;
  statusLabel: string;
  statusClassName: string;
  title: string;
  summary: string;
  kpis: OpenGraphKpi[];
  findings: OpenGraphFindingRow[];
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
  auditFindings: ReturnType<typeof getOpenGraphAudit>["findings"],
): OpenGraphFindingRow[] {
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

function buildDemoView(domain: string): OpenGraphDetailView {
  const mock = openGraphAuditMock;
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
    title: "Open Graph",
    summary:
      "Core Open Graph tags are present, but site name, title length, and image URL format need refinement for reliable social previews.",
    kpis: [
      { label: "Passed Signals", value: String(passed), detail: "Preview-ready metadata" },
      { label: "Partial Signals", value: String(warnings), detail: "Needs refinement" },
      { label: "Failed Signals", value: String(failed), detail: "Missing preview tags" },
      { label: "Open Issues", value: String(mock.issues.length), detail: "Priority fixes" },
    ],
    findings,
    issues: mock.issues.map((issue) => issue.explanation),
    recommendation: {
      title: topRec?.title ?? "Add og:site_name",
      description:
        topRec?.howToFix ??
        "Add og:site_name with your brand name for consistent link previews.",
      impactGain: `+${topRec?.estimatedGain ?? 4} Score Gain`,
      priority: (topRec?.estimatedGain ?? 4) >= 6 ? "High" : "Medium",
      effort: "Easy",
    },
    auditDate: reportMeta.auditDate,
  };
}

export function buildOpenGraphDetailView(
  audit: AuditResponse | null,
  fallbackDomain: string,
): OpenGraphDetailView {
  const view = buildReportView(audit, fallbackDomain);

  if (!view.isRealData || !audit) {
    return buildDemoView(view.domain);
  }

  const scores = calculateAuditScores(audit);
  const category = getCategory(scores.categories, "Open Graph");
  const ogAudit = getOpenGraphAudit(audit);
  const ogScore = category?.score ?? ogAudit.score;
  const status = scoreToStatus(ogScore);
  const findings = mapFindings(ogAudit.findings);
  const passed = findings.filter((finding) => finding.status === "pass").length;
  const warnings = findings.filter((finding) => finding.status === "warning").length;
  const failed = findings.filter((finding) => finding.status === "fail").length;
  const topRec = ogAudit.recommendations[0];

  return {
    domain: view.domain,
    isRealData: true,
    score: ogScore,
    statusLabel: status.label,
    statusClassName: status.className,
    title: "Open Graph",
    summary:
      category?.summary ??
      "Open Graph metadata controls how social platforms and AI systems render link previews.",
    kpis: [
      { label: "Passed Signals", value: String(passed), detail: "Preview-ready metadata" },
      { label: "Partial Signals", value: String(warnings), detail: "Needs refinement" },
      { label: "Failed Signals", value: String(failed), detail: "Missing preview tags" },
      { label: "Open Issues", value: String(ogAudit.issues.length), detail: "Priority fixes" },
    ],
    findings,
    issues:
      ogAudit.issues.length > 0
        ? ogAudit.issues.map((issue) => issue.explanation)
        : category?.problems.slice(0, 4) ?? [],
    recommendation: {
      title: topRec?.title ?? "Improve Open Graph metadata",
      description:
        topRec?.howToFix ??
        category?.recommendations[0] ??
        "Add complete og:title, og:description, og:image, and og:url tags.",
      impactGain: `+${topRec?.estimatedGain ?? 5} Score Gain`,
      priority: (topRec?.estimatedGain ?? 5) >= 6 ? "High" : "Medium",
      effort: (topRec?.estimatedGain ?? 5) >= 6 ? "Medium" : "Easy",
    },
    auditDate: view.auditDate,
  };
}

export function getOpenGraphFallbackView(domain: string): OpenGraphDetailView {
  return buildDemoView(domain);
}

export function loadOpenGraphDetailView(domain: string): OpenGraphDetailView {
  return buildOpenGraphDetailView(loadAuditReportSafe(), domain);
}
