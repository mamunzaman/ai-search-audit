import { buildReportView } from "@/lib/audit/audit-to-report";
import { calculateAuditScores } from "@/lib/audit/audit-score";
import {
  getAiVisibilitySignals,
  getEntityAnalysis,
  getReadabilityAnalysis,
} from "@/lib/audit/audit-normalize";
import { loadAuditReportSafe } from "@/lib/audit/storage";
import type { AuditResponse, CategoryScore } from "@/lib/audit/types";
import { reportMeta } from "@/lib/report-data";

export type AiVisibilityKpi = {
  label: string;
  value: string;
  trendLabel: string;
  trendIcon: string;
  trendClassName: string;
  valueClassName?: string;
};

export type AiVisibilityBreakdownItem = {
  icon: string;
  iconWrapClassName: string;
  title: string;
  description: string;
  score: number;
  badge: string;
  badgeClassName: string;
  scoreClassName?: string;
};

export type AiVisibilityRadarDimension = {
  label: string;
  score: number;
};

export type AiVisibilityCriticalIssue = {
  title: string;
  description: string;
  lossScore: number;
  affectedUrls: number;
};

export type AiVisibilityTopRecommendation = {
  title: string;
  description: string;
  potentialGain: number;
  difficulty: string;
};

export type AiVisibilityDetailView = {
  domain: string;
  isRealData: boolean;
  score: number;
  statusLabel: string;
  statusClassName: string;
  title: string;
  summary: string;
  competitorScore: number;
  competitorLabel: string;
  kpis: AiVisibilityKpi[];
  radarDimensions: AiVisibilityRadarDimension[];
  radarInsight: string;
  breakdown: AiVisibilityBreakdownItem[];
  criticalIssue: AiVisibilityCriticalIssue;
  topRecommendation: AiVisibilityTopRecommendation;
  implementationCode: string;
  auditDate: string;
};

const AI_COMPETITOR_BENCHMARK = 85;

function getCategory(categories: CategoryScore[], label: string): CategoryScore | undefined {
  return categories.find((category) => category.label === label);
}

function scoreToStatusLabel(score: number): { label: string; className: string } {
  if (score >= 80) {
    return { label: "OPTIMIZED", className: "bg-green-100 text-green-800" };
  }

  if (score >= 65) {
    return { label: "DEVELOPING", className: "bg-[#FFF9C4] text-[#856404]" };
  }

  return { label: "AT RISK", className: "bg-error-container text-on-error-container" };
}

function buildCitationProbability(audit: AuditResponse): number {
  const entity = getEntityAnalysis(audit);
  const signals = getAiVisibilitySignals(audit);
  const factors = [
    entity.confidence,
    signals.organizationSchema ? 100 : 40,
    entity.primaryEntity ? 100 : 30,
  ];

  return Math.round(factors.reduce((sum, value) => sum + value, 0) / factors.length);
}

function buildKpiTrend(value: number): Pick<AiVisibilityKpi, "trendLabel" | "trendIcon" | "trendClassName" | "valueClassName"> {
  if (value >= 85) {
    return {
      trendLabel: "Peak",
      trendIcon: "check_circle",
      trendClassName: "text-green-600",
    };
  }

  if (value >= 70) {
    return {
      trendLabel: "Stable",
      trendIcon: "trending_flat",
      trendClassName: "text-on-surface-variant",
    };
  }

  return {
    trendLabel: "Low",
    trendIcon: "warning",
    trendClassName: "text-error",
    valueClassName: "text-error",
  };
}

function buildBreakdownBadge(score: number): { badge: string; badgeClassName: string; scoreClassName?: string } {
  if (score >= 85) {
    return {
      badge: "Optimal",
      badgeClassName: "bg-green-100 text-green-800",
    };
  }

  if (score >= 70) {
    return {
      badge: "High Impact",
      badgeClassName: "bg-primary/10 text-primary",
    };
  }

  if (score >= 55) {
    return {
      badge: "Medium Impact",
      badgeClassName: "bg-secondary-container/20 text-secondary",
    };
  }

  return {
    badge: "Critical Delta",
    badgeClassName: "bg-error-container text-error",
    scoreClassName: "text-error",
  };
}

function buildBreakdown(
  aiScore: number,
  entityScore: number,
  answerScore: number,
  faqScore: number,
  contentScore: number,
  trustScore: number,
): AiVisibilityBreakdownItem[] {
  const items = [
    {
      icon: "auto_awesome",
      iconWrapClassName: "bg-primary/10 text-primary",
      title: "LLM Visibility",
      description: "Ability of crawlers to parse semantic intent from content clusters.",
      score: aiScore,
    },
    {
      icon: "hub",
      iconWrapClassName: "bg-secondary-container/10 text-secondary",
      title: "Entity Recognition",
      description: "Machine-readable entity clarity for LLM topic mapping and disambiguation.",
      score: entityScore,
    },
    {
      icon: "psychology",
      iconWrapClassName: "bg-secondary-container/10 text-secondary",
      title: "Answer Extraction",
      description: "Precision of direct answers extracted for zero-click queries.",
      score: answerScore,
    },
    {
      icon: "quiz",
      iconWrapClassName: "bg-error-container text-error",
      title: "FAQ Signals",
      description: "Explicit question-answer mapping via Schema.org templates.",
      score: faqScore,
    },
    {
      icon: "link",
      iconWrapClassName: "bg-surface-container text-primary",
      title: "Citation Readiness",
      description: "Trust, authority, and metadata signals that support LLM citation confidence.",
      score: trustScore,
    },
    {
      icon: "data_object",
      iconWrapClassName: "bg-surface-container text-primary",
      title: "Content Chunking",
      description: "Hierarchical structure and semantic break points for RAG optimization.",
      score: contentScore,
    },
  ];

  return items.map((item) => {
    const badge = buildBreakdownBadge(item.score);
    return { ...item, ...badge };
  });
}

function buildRadarInsight(faqScore: number, trustScore: number, aiScore: number): string {
  if (faqScore < 70 || trustScore < 70) {
    return "Your profile is heavily weighted toward technical readiness, while FAQ/Trust signals lag behind.";
  }

  if (aiScore >= 80) {
    return "AI visibility signals are balanced across readiness, extraction, and trust dimensions.";
  }

  return "Core AI visibility foundations exist, but citation and FAQ signals need strengthening.";
}

function buildSummary(audit: AuditResponse, category: CategoryScore | undefined): string {
  if (category?.summary) {
    return category.summary;
  }

  const entity = getEntityAnalysis(audit);
  const citation = buildCitationProbability(audit);

  return `Our LLM-analysis engine estimates a ${citation}% probability of this page being cited in generative search responses. ${entity.primaryEntity ? `Primary entity "${entity.primaryEntity}" supports semantic clarity.` : "Entity signals are limited for AI citation mapping."}`;
}

function buildImplementationCode(domain: string): string {
  return `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "How does ${domain} optimize for AI Visibility?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Structured headings, Organization schema, FAQPage JSON-LD, and scannable content blocks help LLMs parse and cite this site accurately."
    }
  }]
}`;
}

function buildDemoView(domain: string): AiVisibilityDetailView {
  return {
    domain,
    isRealData: false,
    score: 78,
    statusLabel: "OPTIMIZED",
    statusClassName: "bg-green-100 text-green-800",
    title: "AI Visibility Matrix",
    summary:
      "Our proprietary LLM-analysis engine identifies a 75% probability of your content being cited in top-tier generative search responses. Current semantic structure allows for high-precision answer extraction, though missing metadata signals impact your overall Authority Score.",
    competitorScore: AI_COMPETITOR_BENCHMARK,
    competitorLabel: "AI-First Comp.",
    kpis: [
      {
        label: "AI Readiness",
        value: "82%",
        trendLabel: "4%",
        trendIcon: "arrow_upward",
        trendClassName: "text-green-600",
      },
      {
        label: "Citation Probability",
        value: "75%",
        trendLabel: "Stable",
        trendIcon: "trending_flat",
        trendClassName: "text-on-surface-variant",
      },
      {
        label: "FAQ Signals",
        value: "60%",
        trendLabel: "Low",
        trendIcon: "warning",
        trendClassName: "text-error",
        valueClassName: "text-error",
      },
      {
        label: "Chunking Efficiency",
        value: "90%",
        trendLabel: "Peak",
        trendIcon: "check_circle",
        trendClassName: "text-green-600",
      },
    ],
    radarDimensions: [
      { label: "AI Readiness", score: 82 },
      { label: "Citations", score: 75 },
      { label: "Extraction", score: 88 },
      { label: "Signals", score: 60 },
      { label: "Trust", score: 78 },
    ],
    radarInsight:
      "Your profile is heavily weighted toward technical readiness, while FAQ/Trust signals lag behind.",
    breakdown: buildBreakdown(88, 78, 82, 60, 90, 78),
    criticalIssue: {
      title: "Critical Issue: Missing FAQ Signals",
      description:
        "Primary content clusters lack structured FAQ schema. LLMs are currently inferring relationships instead of relying on authoritative data points, reducing citation confidence by 18%.",
      lossScore: 12,
      affectedUrls: 124,
    },
    topRecommendation: {
      title: "Deploy FAQPage Schema",
      description:
        "Inject JSON-LD FAQ blocks into core service pages to explicitly define entities and their relationships.",
      potentialGain: 8,
      difficulty: "Medium",
    },
    implementationCode: buildImplementationCode(domain),
    auditDate: reportMeta.auditDate,
  };
}

export function buildAiVisibilityDetailView(
  audit: AuditResponse | null,
  fallbackDomain: string,
): AiVisibilityDetailView {
  const view = buildReportView(audit, fallbackDomain);

  if (!view.isRealData || !audit) {
    return buildDemoView(view.domain);
  }

  const scores = calculateAuditScores(audit);
  const aiCategory = getCategory(scores.categories, "AI Visibility");
  const entityCategory = getCategory(scores.categories, "Entity Clarity");
  const answerCategory = getCategory(scores.categories, "AI Answer Readiness");
  const faqCategory = getCategory(scores.categories, "FAQ Readiness");
  const contentCategory = getCategory(scores.categories, "Content Structure");
  const trustCategory = getCategory(scores.categories, "Trust Signals");

  const aiScore = aiCategory?.score ?? 0;
  const entityScore = entityCategory?.score ?? 0;
  const answerScore = answerCategory?.score ?? 0;
  const faqScore = faqCategory?.score ?? 0;
  const contentScore = contentCategory?.score ?? 0;
  const trustScore = trustCategory?.score ?? 0;
  const citationScore = buildCitationProbability(audit);
  const status = scoreToStatusLabel(aiScore);

  const topIssue = scores.priorityIssues.find((issue) =>
    /faq|schema|organization|entity|visibility|ai/i.test(issue.title),
  );
  const topRec = scores.recommendations.find((rec) =>
    /faq|schema|organization|entity|visibility|ai/i.test(rec.title),
  ) ?? scores.recommendations[0];

  const faqTrend = buildKpiTrend(faqScore);
  const chunkTrend = buildKpiTrend(contentScore);
  const readinessTrend = buildKpiTrend(answerScore);

  return {
    domain: view.domain,
    isRealData: true,
    score: aiScore,
    statusLabel: status.label,
    statusClassName: status.className,
    title: "AI Visibility Matrix",
    summary: buildSummary(audit, aiCategory),
    competitorScore: AI_COMPETITOR_BENCHMARK,
    competitorLabel: "AI-First Comp.",
    kpis: [
      {
        label: "AI Readiness",
        value: `${answerScore}%`,
        trendLabel: readinessTrend.trendLabel === "Peak" ? "Strong" : readinessTrend.trendLabel,
        trendIcon: readinessTrend.trendIcon,
        trendClassName: readinessTrend.trendClassName,
      },
      {
        label: "Citation Probability",
        value: `${citationScore}%`,
        trendLabel: citationScore >= 75 ? "Stable" : "At risk",
        trendIcon: citationScore >= 75 ? "trending_flat" : "trending_down",
        trendClassName: citationScore >= 75 ? "text-on-surface-variant" : "text-error",
        valueClassName: citationScore < 75 ? "text-error" : undefined,
      },
      {
        label: "FAQ Signals",
        value: `${faqScore}%`,
        trendLabel: faqTrend.trendLabel,
        trendIcon: faqTrend.trendIcon,
        trendClassName: faqTrend.trendClassName,
        valueClassName: faqTrend.valueClassName,
      },
      {
        label: "Chunking Efficiency",
        value: `${contentScore}%`,
        trendLabel: chunkTrend.trendLabel,
        trendIcon: chunkTrend.trendIcon,
        trendClassName: chunkTrend.trendClassName,
      },
    ],
    radarDimensions: [
      { label: "AI Readiness", score: answerScore },
      { label: "Citations", score: citationScore },
      { label: "Extraction", score: answerScore },
      { label: "Signals", score: faqScore },
      { label: "Trust", score: trustScore },
    ],
    radarInsight: buildRadarInsight(faqScore, trustScore, aiScore),
    breakdown: buildBreakdown(
      aiScore,
      entityScore,
      answerScore,
      faqScore,
      contentScore,
      trustScore,
    ),
    criticalIssue: {
      title: topIssue
        ? `Critical Issue: ${topIssue.title}`
        : faqScore < 70
          ? "Critical Issue: Missing FAQ Signals"
          : "Critical Issue: AI Visibility Gaps",
      description:
        topIssue?.explanation ??
        aiCategory?.problems[0] ??
        "Structured AI visibility signals need improvement to increase citation confidence.",
      lossScore: topIssue?.estimatedGain ?? Math.max(4, Math.round((100 - aiScore) * 0.15)),
      affectedUrls: Math.max(1, getReadabilityAnalysis(audit).paragraphCount),
    },
    topRecommendation: {
      title: topRec?.title ?? "Deploy FAQPage Schema",
      description: topRec?.howToFix ?? "Add structured schema and visible FAQ content for LLM answer extraction.",
      potentialGain: topRec?.estimatedGain ?? 8,
      difficulty: (topRec?.estimatedGain ?? 8) >= 5 ? "Easy" : "Medium",
    },
    implementationCode: buildImplementationCode(view.domain),
    auditDate: view.auditDate,
  };
}

export function getAiVisibilityFallbackView(domain: string): AiVisibilityDetailView {
  return buildDemoView(domain);
}

export function loadAiVisibilityDetailView(domain: string): AiVisibilityDetailView {
  return buildAiVisibilityDetailView(loadAuditReportSafe(), domain);
}
