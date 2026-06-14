import { buildReportView } from "@/lib/audit/audit-to-report";
import { calculateAuditScores } from "@/lib/audit/audit-score";
import {
  getAiVisibilitySignals,
  getEntityAnalysis,
  getRobotsAnalysis,
  getSocialMetadata,
  getTrustSignals,
} from "@/lib/audit/audit-normalize";
import { hasCompleteOpenGraph, hasTwitterCard } from "@/lib/audit/social-metadata";
import { loadAuditReportSafe } from "@/lib/audit/storage";
import type { AuditResponse, CategoryScore } from "@/lib/audit/types";
import { reportMeta } from "@/lib/report-data";

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

function toneFromScore(score: number): TrustStatusTone {
  if (score >= 80) {
    return "pass";
  }

  if (score >= 65) {
    return "warn";
  }

  return "fail";
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

function buildDemoView(domain: string): TrustSignalsDetailView {
  return {
    domain,
    isRealData: false,
    score: 84,
    statusLabel: "Strong",
    statusClassName: "bg-green-100 text-green-800",
    title: "Trust Signals & E-E-A-T",
    summary:
      "Your organization demonstrates high authority in technical auditing categories. LLM visibility is boosted by well-structured organization metadata and clear attribution across key institutional pages. Improvement in social consolidation would finalize the \"Trust Anchor\" status.",
    topRecommendation: {
      title: "Standardize Social Footprint",
      description:
        "Synchronizing your social handles across LinkedIn, X, and Crunchbase will improve LLM entity reconciliation scores by approx. 3.2%.",
      impactGain: "+3.2 Impact Gain",
    },
    kpis: [
      {
        label: "Org Schema",
        value: "100%",
        icon: "check_circle",
        iconClassName: "text-[#2E7D32]",
      },
      {
        label: "Contact Info",
        value: "100%",
        icon: "check_circle",
        iconClassName: "text-[#2E7D32]",
      },
      {
        label: "Legal Coverage",
        value: "75%",
        icon: "warning",
        iconClassName: "text-[#856404]",
      },
      {
        label: "Authority Signals",
        value: "82%",
        icon: "bolt",
        iconClassName: "text-primary",
      },
    ],
    checklist: [
      {
        icon: "account_tree",
        title: "Organization Schema",
        statusLabel: "Valid",
        statusTone: "pass",
        confidence: 98,
      },
      {
        icon: "contact_mail",
        title: "Contact Transparency",
        statusLabel: "Verified",
        statusTone: "pass",
        confidence: 100,
      },
      {
        icon: "info",
        title: "About Page Signals",
        statusLabel: "Excellent",
        statusTone: "pass",
        confidence: 92,
      },
      {
        icon: "person",
        title: "Author Credibility",
        statusLabel: "Valid",
        statusTone: "pass",
        confidence: 88,
      },
      {
        icon: "policy",
        title: "Privacy & Legal Signals",
        statusLabel: "Update Advised",
        statusTone: "warn",
        confidence: 75,
      },
      {
        icon: "share",
        title: "Reviews / Social Proof",
        statusLabel: "Discrepancies",
        statusTone: "warn",
        confidence: 68,
      },
      {
        icon: "verified_user",
        title: "External Citations",
        statusLabel: "Valid",
        statusTone: "pass",
        confidence: 82,
      },
      {
        icon: "lock",
        title: "HTTPS / Security",
        statusLabel: "Verified",
        statusTone: "pass",
        confidence: 100,
      },
      {
        icon: "verified",
        title: "Brand Consistency",
        statusLabel: "Valid",
        statusTone: "pass",
        confidence: 86,
      },
    ],
    implementationCode: buildImplementationCode(domain),
    benchmark: {
      yourScore: 84,
      medianScore: INDUSTRY_MEDIAN,
      insight:
        "You are performing in the top 15% of tech companies for structured trust signals.",
    },
    severityIssues: [
      {
        title: "Social Profile Consolidation",
        detail: "Low Severity • 2 missing links",
      },
      {
        title: "Privacy Policy Schema",
        detail: "Low Severity • Missing @id reference",
      },
    ],
    missingTrustElements: [
      "Unified social profile schema references",
      "Privacy policy structured data @id",
    ],
    auditDate: reportMeta.auditDate,
  };
}

function buildChecklist(audit: AuditResponse): TrustChecklistItem[] {
  const trust = getTrustSignals(audit);
  const ai = getAiVisibilitySignals(audit);
  const entity = getEntityAnalysis(audit);
  const robots = getRobotsAnalysis(audit);
  const isHttps = audit.finalUrl.startsWith("https://");

  const orgScore = ai.organizationSchema ? 98 : 45;
  const contactScore = trust.contactPage ? 100 : 50;
  const aboutScore = trust.aboutPage ? 92 : 50;
  const authorScore = entity.primaryEntity
    ? Math.max(60, entity.confidence)
    : 40;
  const legalScore =
    trust.privacyPage && trust.legalPage ? 100 : trust.privacyPage || trust.legalPage ? 75 : 45;
  const socialScore = trust.socialLinks >= 3 ? 90 : trust.socialLinks > 0 ? 68 : 40;
  const citationScore = trust.externalAuthorityLinks >= 2 ? 90 : trust.externalAuthorityLinks > 0 ? 82 : 45;
  const httpsScore =
    isHttps && audit.canonical && audit.robotsMeta ? 100 : isHttps ? 80 : 30;
  const brandScore =
    ai.organizationSchema && trust.socialLinks > 0 ? 86 : ai.organizationSchema ? 70 : 45;

  const items: Array<Omit<TrustChecklistItem, "statusLabel" | "statusTone"> & { confidence: number; passLabel: string; warnLabel: string }> = [
    { icon: "account_tree", title: "Organization Schema", confidence: orgScore, passLabel: "Valid", warnLabel: "Incomplete" },
    { icon: "contact_mail", title: "Contact Transparency", confidence: contactScore, passLabel: "Verified", warnLabel: "Limited" },
    { icon: "info", title: "About Page Signals", confidence: aboutScore, passLabel: "Excellent", warnLabel: "Weak" },
    { icon: "person", title: "Author Credibility", confidence: authorScore, passLabel: "Valid", warnLabel: "Unclear" },
    { icon: "policy", title: "Privacy & Legal Signals", confidence: legalScore, passLabel: "Complete", warnLabel: "Update Advised" },
    { icon: "share", title: "Reviews / Social Proof", confidence: socialScore, passLabel: "Verified", warnLabel: "Discrepancies" },
    { icon: "verified_user", title: "External Citations", confidence: citationScore, passLabel: "Valid", warnLabel: "Limited" },
    { icon: "lock", title: "HTTPS / Security", confidence: httpsScore, passLabel: "Verified", warnLabel: "Review" },
    { icon: "verified", title: "Brand Consistency", confidence: brandScore, passLabel: "Valid", warnLabel: "Inconsistent" },
  ];

  if (!robots.exists) {
    items.push({
      icon: "smart_toy",
      title: "Crawl Transparency",
      confidence: 50,
      passLabel: "Available",
      warnLabel: "Missing",
    });
  }

  return items.map((item) => {
    const tone = toneFromScore(item.confidence);
    return {
      icon: item.icon,
      title: item.title,
      confidence: item.confidence,
      statusTone: tone,
      statusLabel: statusLabelFromTone(tone, item.passLabel, item.warnLabel),
    };
  });
}

function buildKpis(audit: AuditResponse): TrustKpi[] {
  const trust = getTrustSignals(audit);
  const ai = getAiVisibilitySignals(audit);
  const orgValue = ai.organizationSchema ? 100 : 50;
  const contactValue = trust.contactPage ? 100 : 50;
  const legalValue =
    trust.privacyPage && trust.legalPage ? 100 : trust.privacyPage || trust.legalPage ? 75 : 50;
  const authorityValue = trust.externalAuthorityLinks > 0 ? 82 : 50;

  function kpiIcon(value: number): { icon: string; iconClassName: string } {
    if (value >= 90) {
      return { icon: "check_circle", iconClassName: "text-[#2E7D32]" };
    }

    if (value >= 70) {
      return { icon: "warning", iconClassName: "text-[#856404]" };
    }

    return { icon: "bolt", iconClassName: "text-primary" };
  }

  const orgIcon = kpiIcon(orgValue);
  const contactIcon = kpiIcon(contactValue);
  const legalIcon = kpiIcon(legalValue);
  const authorityIcon = kpiIcon(authorityValue);

  return [
    { label: "Org Schema", value: `${orgValue}%`, ...orgIcon },
    { label: "Contact Info", value: `${contactValue}%`, ...contactIcon },
    { label: "Legal Coverage", value: `${legalValue}%`, ...legalIcon },
    { label: "Authority Signals", value: `${authorityValue}%`, ...authorityIcon },
  ];
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
  const social = getSocialMetadata(audit);
  const hasSocialPreview = hasCompleteOpenGraph(social) && hasTwitterCard(social);

  const topRec =
    scores.recommendations.find((rec) =>
      /trust|social|privacy|legal|contact|about|schema|organization/i.test(rec.title),
    ) ?? scores.recommendations[0];

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

  const missingTrustElements = category?.problems.slice(0, 4) ?? [];

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
    kpis: buildKpis(audit),
    checklist: buildChecklist(audit),
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
