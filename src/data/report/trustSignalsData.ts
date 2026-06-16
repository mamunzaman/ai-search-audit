import { buildReportView } from "@/lib/audit/audit-to-report";
import { calculateAuditScores } from "@/lib/audit/audit-score";
import {
  getSocialMetadata,
  getTrustSignals,
  getTrustSignalsAudit,
} from "@/lib/audit/audit-normalize";
import { hasCompleteOpenGraph, hasTwitterCard } from "@/lib/audit/social-metadata";
import { loadAuditReportSafe } from "@/lib/audit/storage";
import type { AuditResponse, CategoryScore } from "@/lib/audit/types";
import { reportMeta, trustSignalsAuditMock } from "@/lib/report-data";
import type { AuditFindingStatus } from "@/types/audit";

export type TrustStatusTone = "pass" | "warn" | "fail";

export type TrustKpi = {
  label: string;
  value: string;
  icon: string;
  iconClassName: string;
};

export type TrustChecklistItem = {
  icon: string;
  title: string;
  statusLabel: string;
  statusTone: TrustStatusTone;
  confidence: number;
};

export type TrustSeverityIssue = {
  title: string;
  detail: string;
};

export type TrustSignalsDetailView = {
  domain: string;
  isRealData: boolean;
  score: number;
  statusLabel: string;
  statusClassName: string;
  title: string;
  summary: string;
  topRecommendation: {
    title: string;
    description: string;
    impactGain: string;
  };
  kpis: TrustKpi[];
  checklist: TrustChecklistItem[];
  implementationCode: string;
  benchmark: {
    yourScore: number;
    medianScore: number;
    insight: string;
  };
  severityIssues: TrustSeverityIssue[];
  missingTrustElements: string[];
  auditDate: string;
};

const INDUSTRY_MEDIAN = 62;

function getCategory(
  categories: CategoryScore[],
  label: string,
): CategoryScore | undefined {
  return categories.find((category) => category.label === label);
}

function scoreToStatus(score: number): { label: string; className: string } {
  if (score >= 80) {
    return { label: "Strong", className: "bg-green-100 text-green-800" };
  }

  if (score >= 65) {
    return { label: "Developing", className: "bg-[#FFF9C4] text-[#856404]" };
  }

  return { label: "At Risk", className: "bg-error-container text-on-error-container" };
}

function statusLabelFromTone(tone: TrustStatusTone, passLabel: string, warnLabel: string): string {
  if (tone === "pass") {
    return passLabel;
  }

  if (tone === "warn") {
    return warnLabel;
  }

  return "Missing";
}

function buildImplementationCode(domain: string): string {
  return `{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "${domain}",
  "url": "https://${domain}",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "areaServed": "Global",
    "availableLanguage": "en"
  }
}`;
}

function findingIcon(id: string): string {
  switch (id) {
    case "about-page":
      return "info";
    case "contact-page":
      return "contact_mail";
    case "privacy-policy":
    case "terms-legal":
      return "policy";
    case "business-address":
      return "location_on";
    case "email-phone":
      return "contact_phone";
    case "author-team":
      return "person";
    case "external-trust-links":
      return "verified_user";
    case "secure-https":
      return "lock";
    default:
      return "verified";
  }
}

function findingConfidence(status: AuditFindingStatus): number {
  if (status === "pass") {
    return 95;
  }

  if (status === "warning") {
    return 68;
  }

  return 40;
}

function buildChecklistFromAudit(
  audit: AuditResponse | null,
): TrustChecklistItem[] {
  const findings = audit
    ? getTrustSignalsAudit(audit).findings
    : trustSignalsAuditMock.findings;

  return findings.map((finding) => {
    const tone: TrustStatusTone =
      finding.status === "pass"
        ? "pass"
        : finding.status === "warning"
          ? "warn"
          : "fail";

    return {
      icon: findingIcon(finding.id),
      title: finding.label,
      statusTone: tone,
      statusLabel: statusLabelFromTone(
        tone,
        "Verified",
        finding.status === "warning" ? "Partial" : "Missing",
      ),
      confidence: findingConfidence(finding.status),
    };
  });
}

function buildDemoView(domain: string): TrustSignalsDetailView {
  const mock = trustSignalsAuditMock;
  const status = scoreToStatus(mock.score);
  const topRec = mock.recommendations[0];

  return {
    domain,
    isRealData: false,
    score: mock.score,
    statusLabel: status.label,
    statusClassName: status.className,
    title: "Trust Signals & E-E-A-T",
    summary:
      "Core trust markers are strong with About, Contact, Privacy, HTTPS, and contact details present. Terms/legal and external authority links can still improve AI trust confidence.",
    topRecommendation: {
      title: topRec?.title ?? "Strengthen external trust links",
      description:
        topRec?.howToFix ??
        "Link to authoritative external profiles, references, or citations.",
      impactGain: `+${topRec?.estimatedGain ?? 6} Impact Gain`,
    },
    kpis: [
      {
        label: "Passed Signals",
        value: String(mock.findings.filter((f) => f.status === "pass").length),
        icon: "check_circle",
        iconClassName: "text-[#2E7D32]",
      },
      {
        label: "Partial Signals",
        value: String(mock.findings.filter((f) => f.status === "warning").length),
        icon: "warning",
        iconClassName: "text-[#856404]",
      },
      {
        label: "Failed Signals",
        value: String(mock.findings.filter((f) => f.status === "fail").length),
        icon: "error_outline",
        iconClassName: "text-error",
      },
      {
        label: "Open Issues",
        value: String(mock.issues.length),
        icon: "bolt",
        iconClassName: "text-primary",
      },
    ],
    checklist: buildChecklistFromAudit(null),
    implementationCode: buildImplementationCode(domain),
    benchmark: {
      yourScore: mock.score,
      medianScore: INDUSTRY_MEDIAN,
      insight: buildBenchmarkInsight(mock.score),
    },
    severityIssues: mock.issues.map((issue) => ({
      title: issue.title,
      detail: `${issue.impact} • ${issue.explanation}`,
    })),
    missingTrustElements: mock.issues.map((issue) => issue.explanation),
    auditDate: reportMeta.auditDate,
  };
}

function buildBenchmarkInsight(score: number): string {
  if (score >= 80) {
    return "You are performing in the top 15% of tech companies for structured trust signals.";
  }

  if (score >= 65) {
    return "Trust signals are developing but trail top performers in legal and social consolidation.";
  }

  return "Core trust markers need attention before LLM citation confidence can improve.";
}

export function buildTrustSignalsDetailView(
  audit: AuditResponse | null,
  fallbackDomain: string,
): TrustSignalsDetailView {
  const view = buildReportView(audit, fallbackDomain);

  if (!view.isRealData || !audit) {
    return buildDemoView(view.domain);
  }

  const scores = calculateAuditScores(audit);
  const category = getCategory(scores.categories, "Trust Signals");
  const trustScore = category?.score ?? 0;
  const status = scoreToStatus(trustScore);
  const trust = getTrustSignals(audit);
  const trustAudit = getTrustSignalsAudit(audit);
  const social = getSocialMetadata(audit);
  const hasSocialPreview = hasCompleteOpenGraph(social) && hasTwitterCard(social);

  const topRec =
    trustAudit.recommendations[0] ??
    scores.recommendations.find((rec) =>
      /trust|social|privacy|legal|contact|about|schema|organization/i.test(rec.title),
    ) ??
    scores.recommendations[0];

  const severityIssues = scores.priorityIssues
    .filter((issue) =>
      /trust|social|privacy|legal|contact|about|schema|organization|authority/i.test(
        issue.title,
      ),
    )
    .slice(0, 3)
    .map((issue) => ({
      title: issue.title,
      detail: `Priority • ${issue.explanation.slice(0, 60)}${issue.explanation.length > 60 ? "…" : ""}`,
    }));

  if (severityIssues.length === 0 && category?.problems.length) {
    category.problems.slice(0, 2).forEach((problem) => {
      severityIssues.push({
        title: problem.split(".")[0] ?? problem,
        detail: "Low Severity • Review recommended",
      });
    });
  }

  const missingTrustElements =
    trustAudit.issues.length > 0
      ? trustAudit.issues.map((issue) => issue.explanation)
      : category?.problems.slice(0, 4) ?? [];

  if (!trust.socialLinks && hasSocialPreview) {
    missingTrustElements.push("Consolidated social profile references");
  }

  return {
    domain: view.domain,
    isRealData: true,
    score: trustScore,
    statusLabel: status.label,
    statusClassName: status.className,
    title: "Trust Signals & E-E-A-T",
    summary:
      category?.summary ??
      "Trust page coverage, schema metadata, and authority references shape LLM citation confidence.",
    topRecommendation: {
      title: topRec?.title ?? "Standardize Social Footprint",
      description:
        topRec?.howToFix ??
        "Align social profile links and organization schema to improve entity reconciliation.",
      impactGain: `+${topRec?.estimatedGain ?? 3} Impact Gain`,
    },
    kpis: [
      {
        label: "Passed Signals",
        value: String(trustAudit.findings.filter((f) => f.status === "pass").length),
        icon: "check_circle",
        iconClassName: "text-[#2E7D32]",
      },
      {
        label: "Partial Signals",
        value: String(trustAudit.findings.filter((f) => f.status === "warning").length),
        icon: "warning",
        iconClassName: "text-[#856404]",
      },
      {
        label: "Failed Signals",
        value: String(trustAudit.findings.filter((f) => f.status === "fail").length),
        icon: "error_outline",
        iconClassName: "text-error",
      },
      {
        label: "Open Issues",
        value: String(trustAudit.issues.length),
        icon: "bolt",
        iconClassName: "text-primary",
      },
    ],
    checklist: buildChecklistFromAudit(audit),
    implementationCode: buildImplementationCode(view.domain),
    benchmark: {
      yourScore: trustScore,
      medianScore: INDUSTRY_MEDIAN,
      insight: buildBenchmarkInsight(trustScore),
    },
    severityIssues:
      severityIssues.length > 0
        ? severityIssues
        : buildDemoView(view.domain).severityIssues,
    missingTrustElements:
      missingTrustElements.length > 0
        ? missingTrustElements
        : buildDemoView(view.domain).missingTrustElements,
    auditDate: view.auditDate,
  };
}

export function getTrustSignalsFallbackView(domain: string): TrustSignalsDetailView {
  return buildDemoView(domain);
}

export function loadTrustSignalsDetailView(domain: string): TrustSignalsDetailView {
  return buildTrustSignalsDetailView(loadAuditReportSafe(), domain);
}
