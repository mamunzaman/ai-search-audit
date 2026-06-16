import { buildReportView } from "@/lib/audit/audit-to-report";
import { calculateAuditScores } from "@/lib/audit/audit-score";
import { getTwitterCardAudit } from "@/lib/audit/audit-normalize";
import { loadAuditReportSafe } from "@/lib/audit/storage";
import type { AuditResponse, CategoryScore } from "@/lib/audit/types";
import { reportMeta, twitterCardAuditMock } from "@/lib/report-data";
import type { AuditFindingStatus } from "@/types/audit";

export type TwitterCardKpi = {
  label: string;
  value: string;
  detail: string;
};

export type TwitterCardFindingRow = {
  id: string;
  label: string;
  status: AuditFindingStatus;
  statusLabel: string;
  statusClassName: string;
  message: string;
};

export type TwitterCardDetailView = {
  domain: string;
  isRealData: boolean;
  score: number;
  statusLabel: string;
  statusClassName: string;
  title: string;
  summary: string;
  kpis: TwitterCardKpi[];
  findings: TwitterCardFindingRow[];
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
  auditFindings: ReturnType<typeof getTwitterCardAudit>["findings"],
): TwitterCardFindingRow[] {
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

function buildDemoView(domain: string): TwitterCardDetailView {
  const mock = twitterCardAuditMock;
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
    title: "Twitter Card",
    summary:
      "Core Twitter Card tags are present, but site/creator handles, description length, and image URL format need improvement for X/Twitter previews.",
    kpis: [
      { label: "Passed Signals", value: String(passed), detail: "Preview-ready metadata" },
      { label: "Partial Signals", value: String(warnings), detail: "Needs refinement" },
      { label: "Failed Signals", value: String(failed), detail: "Missing preview tags" },
      { label: "Open Issues", value: String(mock.issues.length), detail: "Priority fixes" },
    ],
    findings,
    issues: mock.issues.map((issue) => issue.explanation),
    recommendation: {
      title: topRec?.title ?? "Improve twitter:image URL",
      description:
        topRec?.howToFix ??
        "Use a fully qualified HTTPS URL for twitter:image (not a relative path).",
      impactGain: `+${topRec?.estimatedGain ?? 6} Score Gain`,
      priority: (topRec?.estimatedGain ?? 6) >= 6 ? "High" : "Medium",
      effort: "Easy",
    },
    auditDate: reportMeta.auditDate,
  };
}

export function buildTwitterCardDetailView(
  audit: AuditResponse | null,
  fallbackDomain: string,
): TwitterCardDetailView {
  const view = buildReportView(audit, fallbackDomain);

  if (!view.isRealData || !audit) {
    return buildDemoView(view.domain);
  }

  const scores = calculateAuditScores(audit);
  const category = getCategory(scores.categories, "Twitter Card");
  const twitterAudit = getTwitterCardAudit(audit);
  const twitterScore = category?.score ?? twitterAudit.score;
  const status = scoreToStatus(twitterScore);
  const findings = mapFindings(twitterAudit.findings);
  const passed = findings.filter((finding) => finding.status === "pass").length;
  const warnings = findings.filter((finding) => finding.status === "warning").length;
  const failed = findings.filter((finding) => finding.status === "fail").length;
  const topRec = twitterAudit.recommendations[0];

  return {
    domain: view.domain,
    isRealData: true,
    score: twitterScore,
    statusLabel: status.label,
    statusClassName: status.className,
    title: "Twitter Card",
    summary:
      category?.summary ??
      "Twitter Card metadata controls how links render on X/Twitter and complements Open Graph previews.",
    kpis: [
      { label: "Passed Signals", value: String(passed), detail: "Preview-ready metadata" },
      { label: "Partial Signals", value: String(warnings), detail: "Needs refinement" },
      { label: "Failed Signals", value: String(failed), detail: "Missing preview tags" },
      { label: "Open Issues", value: String(twitterAudit.issues.length), detail: "Priority fixes" },
    ],
    findings,
    issues:
      twitterAudit.issues.length > 0
        ? twitterAudit.issues.map((issue) => issue.explanation)
        : category?.problems.slice(0, 4) ?? [],
    recommendation: {
      title: topRec?.title ?? "Improve Twitter Card metadata",
      description:
        topRec?.howToFix ??
        category?.recommendations[0] ??
        "Add complete twitter:card, twitter:title, twitter:description, and twitter:image tags.",
      impactGain: `+${topRec?.estimatedGain ?? 5} Score Gain`,
      priority: (topRec?.estimatedGain ?? 5) >= 6 ? "High" : "Medium",
      effort: (topRec?.estimatedGain ?? 5) >= 6 ? "Medium" : "Easy",
    },
    auditDate: view.auditDate,
  };
}

export function getTwitterCardFallbackView(domain: string): TwitterCardDetailView {
  return buildDemoView(domain);
}

export function loadTwitterCardDetailView(domain: string): TwitterCardDetailView {
  return buildTwitterCardDetailView(loadAuditReportSafe(), domain);
}
