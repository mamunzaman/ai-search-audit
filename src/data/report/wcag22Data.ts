import { buildReportView } from "@/lib/audit/audit-to-report";
import { calculateAuditScores } from "@/lib/audit/audit-score";
import { getAccessibilityAnalysis } from "@/lib/audit/audit-normalize";
import { loadAuditReportSafe } from "@/lib/audit/storage";
import type {
  AccessibilityAnalysis,
  AccessibilityFinding,
  AuditResponse,
  CategoryScore,
} from "@/lib/audit/types";
import { reportMeta } from "@/lib/report-data";

export type WcagBenchmarkRow = {
  label: string;
  value: number;
  barClassName: string;
  labelClassName: string;
  valueClassName: string;
  barOpacityClassName?: string;
};

export type WcagPourKpi = {
  principle: string;
  value: number;
  trendLabel: string;
  trendClassName: string;
  icon: string;
  iconClassName: string;
  iconFilled?: boolean;
  borderClassName?: string;
};

export type WcagMatrixRow = {
  label: string;
  value: number;
};

export type WcagCriticalIssue = {
  severity: string;
  severityClassName: string;
  instanceLabel: string;
  title: string;
  description: string;
  borderClassName: string;
};

export type WcagAiReadinessCard = {
  icon: string;
  title: string;
  description: string;
};

export type WcagRecommendation = {
  icon: string;
  title: string;
  subtitle: string;
  gainLabel: string;
};

export type WcagAccordionItem = {
  title: string;
  code: string;
};

export type Wcag22DetailView = {
  domain: string;
  isRealData: boolean;
  score: number;
  statusLabel: string;
  statusClassName: string;
  summary: string;
  benchmarkRows: WcagBenchmarkRow[];
  pourKpis: WcagPourKpi[];
  matrixRows: WcagMatrixRow[];
  criticalIssues: WcagCriticalIssue[];
  aiReadinessCards: WcagAiReadinessCard[];
  recommendations: WcagRecommendation[];
  accordionItems: WcagAccordionItem[];
  footerQuote: string;
  auditDate: string;
};

const INDUSTRY_AVG = 72;
const TOP_COMPETITOR = 91;

const PERCEIVABLE_IDS = ["lang-attribute", "page-title", "image-alt-text"];
const OPERABLE_IDS = ["landmarks", "skip-link", "empty-links", "button-names"];
const UNDERSTANDABLE_IDS = ["input-labels", "heading-order", "page-title"];
const ROBUST_IDS = ["aria-labels", "duplicate-ids", "button-names"];

function getCategory(
  categories: CategoryScore[],
  label: string,
): CategoryScore | undefined {
  return categories.find((category) => category.label === label);
}

function findingScore(findings: AccessibilityFinding[], ids: string[]): number {
  const subset = findings.filter((finding) => ids.includes(finding.id));
  if (subset.length === 0) {
    return 85;
  }

  const points = subset.map((finding) => {
    if (finding.status === "pass") return 100;
    if (finding.status === "warning") return 70;
    return 40;
  });

  return Math.round(points.reduce((sum, value) => sum + value, 0) / points.length);
}

function scoreToStatus(score: number): { label: string; className: string } {
  if (score >= 85) {
    return {
      label: "High Readiness",
      className: "border border-green-200 bg-green-100 text-green-700",
    };
  }

  if (score >= 70) {
    return {
      label: "Developing",
      className: "border border-[#FFF9C4] bg-[#FFF9C4] text-[#856404]",
    };
  }

  return {
    label: "Needs Attention",
    className: "bg-error-container text-on-error-container",
  };
}

function pourTrend(value: number): Pick<WcagPourKpi, "trendLabel" | "trendClassName" | "icon" | "iconClassName" | "iconFilled" | "borderClassName"> {
  if (value >= 90) {
    return {
      trendLabel: "On track",
      trendClassName: "text-green-500",
      icon: "check_circle",
      iconClassName: "text-green-500",
      iconFilled: true,
    };
  }

  if (value >= 80) {
    return {
      trendLabel: "Review",
      trendClassName: "text-yellow-600",
      icon: "warning",
      iconClassName: "text-yellow-500",
      borderClassName: "border-l-4 border-l-yellow-400",
    };
  }

  return {
    trendLabel: "Needs Attention",
    trendClassName: "text-[#FF5A4F]",
    icon: "error",
    iconClassName: "text-[#FF5A4F]",
    borderClassName: "border-l-4 border-l-[#FF5A4F]",
  };
}

function buildPourKpis(findings: AccessibilityFinding[]): WcagPourKpi[] {
  const values = {
    Perceivable: findingScore(findings, PERCEIVABLE_IDS),
    Operable: findingScore(findings, OPERABLE_IDS),
    Understandable: findingScore(findings, UNDERSTANDABLE_IDS),
    Robust: findingScore(findings, ROBUST_IDS),
  };

  return (Object.keys(values) as Array<keyof typeof values>).map((principle) => {
    const value = values[principle];
    const trend = pourTrend(value);
    return {
      principle,
      value,
      ...trend,
    };
  });
}

function buildMatrixRows(pourKpis: WcagPourKpi[]): WcagMatrixRow[] {
  return [
    { label: "Perceivable (Visual/Audio)", value: pourKpis[0]?.value ?? 0 },
    { label: "Operable (Navigable)", value: pourKpis[1]?.value ?? 0 },
    { label: "Understandable (Predictable)", value: pourKpis[2]?.value ?? 0 },
    { label: "Robust (Compatible)", value: pourKpis[3]?.value ?? 0 },
  ];
}

function severityMeta(status: AccessibilityFinding["status"]): {
  severity: string;
  severityClassName: string;
  borderClassName: string;
} {
  if (status === "fail") {
    return {
      severity: "Critical",
      severityClassName: "bg-red-100 text-red-700",
      borderClassName: "border-t-[#FF5A4F]",
    };
  }

  if (status === "warning") {
    return {
      severity: "High",
      severityClassName: "bg-orange-100 text-orange-700",
      borderClassName: "border-t-orange-400",
    };
  }

  return {
    severity: "Medium",
    severityClassName: "bg-yellow-100 text-yellow-700",
    borderClassName: "border-t-yellow-400",
  };
}

function instanceLabel(finding: AccessibilityFinding, analysis: AccessibilityAnalysis): string {
  if (finding.id === "image-alt-text" && analysis.imagesMissingAlt > 0) {
    return `${analysis.imagesMissingAlt} Elements`;
  }

  if (finding.id === "landmarks") {
    const missing = [
      !analysis.hasMainLandmark && "main",
      !analysis.hasNavLandmark && "nav",
      !analysis.hasHeaderLandmark && "header",
      !analysis.hasFooterLandmark && "footer",
    ].filter(Boolean).length;
    return missing > 0 ? `${missing} Landmarks` : "Resolved";
  }

  if (finding.id === "heading-order" && analysis.headingOrderIssues > 0) {
    return `${analysis.headingOrderIssues} Issues`;
  }

  if (finding.id === "input-labels" && analysis.inputsMissingLabels > 0) {
    return `${analysis.inputsMissingLabels} Inputs`;
  }

  if (finding.id === "empty-links" && analysis.emptyLinkCount > 0) {
    return `${analysis.emptyLinkCount} Links`;
  }

  if (finding.id === "duplicate-ids" && analysis.duplicateIdCount > 0) {
    return `${analysis.duplicateIdCount} IDs`;
  }

  return "1 Page";
}

function buildCriticalIssues(
  analysis: AccessibilityAnalysis,
): WcagCriticalIssue[] {
  const failing = analysis.findings
    .filter((finding) => finding.status !== "pass")
    .sort((left, right) => {
      const order = { fail: 0, warning: 1, pass: 2 };
      return order[left.status] - order[right.status];
    })
    .slice(0, 3);

  if (failing.length === 0) {
    return buildDemoView("example.com").criticalIssues;
  }

  return failing.map((finding) => {
    const meta = severityMeta(finding.status);
    return {
      severity: meta.severity,
      severityClassName: meta.severityClassName,
      instanceLabel: instanceLabel(finding, analysis),
      title: finding.label,
      description: finding.message,
      borderClassName: meta.borderClassName,
    };
  });
}

function buildRecommendations(
  analysis: AccessibilityAnalysis,
  scores: ReturnType<typeof calculateAuditScores>,
): WcagRecommendation[] {
  const recs = scores.recommendations
    .filter((rec) =>
      /alt|landmark|heading|label|lang|skip|accessible|aria|contrast/i.test(rec.title),
    )
    .slice(0, 3);

  if (recs.length >= 3) {
    return recs.map((rec, index) => ({
      icon: ["image", "palette", "format_list_numbered"][index] ?? "check_circle",
      title: rec.title,
      subtitle: rec.howToFix,
      gainLabel: `+${rec.estimatedGain} Points`,
    }));
  }

  const fromFindings = analysis.findings
    .filter((finding) => finding.status !== "pass")
    .slice(0, 3)
    .map((finding, index) => ({
      icon: ["image", "palette", "format_list_numbered"][index] ?? "check_circle",
      title: finding.recommendation.split(".")[0],
      subtitle: finding.message,
      gainLabel: `+${finding.status === "fail" ? 5 : 3} Points`,
    }));

  return fromFindings.length > 0
    ? fromFindings
    : buildDemoView("example.com").recommendations;
}

function buildAccordionItems(): WcagAccordionItem[] {
  return [
    {
      title: "Semantic Landmark Implementation",
      code: `<header role="banner">...</header>
<main role="main">...</main>
<footer role="contentinfo">...</footer>`,
    },
    {
      title: "ARIA-Live Region Pattern",
      code: `<div aria-live="polite">
  Updated search results...
</div>`,
    },
    {
      title: "Accessible Form Labeling",
      code: `<label for="email">Email Address</label>
<input type="email" id="email" />`,
    },
  ];
}

function buildBenchmark(score: number): WcagBenchmarkRow[] {
  return [
    {
      label: "YOU",
      value: score,
      barClassName: "bg-primary",
      labelClassName: "font-bold text-primary",
      valueClassName: "text-primary",
    },
    {
      label: "INDUSTRY AVG",
      value: INDUSTRY_AVG,
      barClassName: "bg-outline-variant",
      labelClassName: "text-outline",
      valueClassName: "text-outline",
    },
    {
      label: "TOP COMPETITOR",
      value: TOP_COMPETITOR,
      barClassName: "bg-[#FF5A4F]",
      labelClassName: "font-bold text-[#FF5A4F]",
      valueClassName: "text-[#FF5A4F]",
      barOpacityClassName: "opacity-60",
    },
  ];
}

function buildDemoView(domain: string): Wcag22DetailView {
  const pourKpis: WcagPourKpi[] = [
    {
      principle: "Perceivable",
      value: 92,
      trendLabel: "+4% vs prev",
      trendClassName: "text-green-500",
      icon: "check_circle",
      iconClassName: "text-green-500",
      iconFilled: true,
    },
    {
      principle: "Operable",
      value: 84,
      trendLabel: "-2% vs prev",
      trendClassName: "text-yellow-600",
      icon: "warning",
      iconClassName: "text-yellow-500",
      borderClassName: "border-l-4 border-l-yellow-400",
    },
    {
      principle: "Understandable",
      value: 95,
      trendLabel: "+1% vs prev",
      trendClassName: "text-green-500",
      icon: "check_circle",
      iconClassName: "text-green-500",
      iconFilled: true,
    },
    {
      principle: "Robust",
      value: 78,
      trendLabel: "Needs Attention",
      trendClassName: "text-[#FF5A4F]",
      icon: "error",
      iconClassName: "text-[#FF5A4F]",
      borderClassName: "border-l-4 border-l-[#FF5A4F]",
    },
  ];

  return {
    domain,
    isRealData: false,
    score: 88,
    statusLabel: "High Readiness",
    statusClassName: "border border-green-200 bg-green-100 text-green-700",
    summary:
      "Accessibility signals help both users and AI systems understand, navigate, and trust your website.",
    benchmarkRows: buildBenchmark(88),
    pourKpis,
    matrixRows: buildMatrixRows(pourKpis),
    criticalIssues: [
      {
        severity: "Critical",
        severityClassName: "bg-red-100 text-red-700",
        instanceLabel: "8 Instances",
        title: "Incomplete ARIA landmarks",
        description:
          "Structural roles are missing on key layout elements, hindering assistive technologies and AI scrapers.",
        borderClassName: "border-t-[#FF5A4F]",
      },
      {
        severity: "High",
        severityClassName: "bg-orange-100 text-orange-700",
        instanceLabel: "12 Elements",
        title: "Missing alt text",
        description:
          "Informative images lack text descriptions, reducing contextual understanding for non-visual agents.",
        borderClassName: "border-t-orange-400",
      },
      {
        severity: "Medium",
        severityClassName: "bg-yellow-100 text-yellow-700",
        instanceLabel: "4 Pages",
        title: "Low color contrast",
        description:
          "Text-to-background ratios fall below the 4.5:1 requirement on landing page sections.",
        borderClassName: "border-t-yellow-400",
      },
    ],
    aiReadinessCards: [
      {
        icon: "account_tree",
        title: "Semantic Landmarks",
        description: "Defines the logical layout for AI parsing.",
      },
      {
        icon: "label",
        title: "Readable Labels",
        description: "Explicit context for interactive elements.",
      },
      {
        icon: "video_library",
        title: "Descriptive Media",
        description: "Alternative signals for multi-modal AI.",
      },
    ],
    recommendations: [
      {
        icon: "image",
        title: "Add descriptive alt text",
        subtitle: "Impacts 12 critical visual assets",
        gainLabel: "+5 Points",
      },
      {
        icon: "palette",
        title: "Improve contrast ratios",
        subtitle: "Global typography update needed",
        gainLabel: "+3 Points",
      },
      {
        icon: "format_list_numbered",
        title: "Fix heading hierarchy",
        subtitle: "Structural sequencing on 4 templates",
        gainLabel: "+4 Points",
      },
    ],
    accordionItems: buildAccordionItems(),
    footerQuote:
      "Improving WCAG 2.2 compliance improves usability, trust, and AI interpretation quality.",
    auditDate: reportMeta.auditDate,
  };
}

export function buildWcag22DetailView(
  audit: AuditResponse | null,
  fallbackDomain: string,
): Wcag22DetailView {
  const view = buildReportView(audit, fallbackDomain);

  if (!view.isRealData || !audit) {
    return buildDemoView(view.domain);
  }

  const scores = calculateAuditScores(audit);
  const category = getCategory(scores.categories, "WCAG 2.2 Readiness");
  const analysis = getAccessibilityAnalysis(audit);
  const score = category?.score ?? analysis.score;
  const status = scoreToStatus(score);
  const pourKpis = buildPourKpis(analysis.findings);

  return {
    domain: view.domain,
    isRealData: true,
    score,
    statusLabel: status.label,
    statusClassName: status.className,
    summary:
      category?.summary ??
      "Accessibility signals help both users and AI systems understand, navigate, and trust your website.",
    benchmarkRows: buildBenchmark(score),
    pourKpis,
    matrixRows: buildMatrixRows(pourKpis),
    criticalIssues: buildCriticalIssues(analysis),
    aiReadinessCards: buildDemoView(view.domain).aiReadinessCards,
    recommendations: buildRecommendations(analysis, scores),
    accordionItems: buildAccordionItems(),
    footerQuote: buildDemoView(view.domain).footerQuote,
    auditDate: view.auditDate,
  };
}

export function getWcag22FallbackView(domain: string): Wcag22DetailView {
  return buildDemoView(domain);
}

export function loadWcag22DetailView(domain: string): Wcag22DetailView {
  return buildWcag22DetailView(loadAuditReportSafe(), domain);
}
