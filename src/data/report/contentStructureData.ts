import { buildReportView } from "@/lib/audit/audit-to-report";
import { calculateAuditScores } from "@/lib/audit/audit-score";
import { getReadabilityAnalysis } from "@/lib/audit/audit-normalize";
import { loadAuditReportSafe } from "@/lib/audit/storage";
import type { AuditResponse, CategoryScore } from "@/lib/audit/types";
import { reportMeta } from "@/lib/report-data";

export type ContentKpi = {
  label: string;
  value: string;
  progress: number;
};

export type DensityBar = {
  label: string;
  contentHeight: number;
  headingHeight: number;
  contentOpacity?: "full" | "light" | "medium";
};

export type ContentFinding = {
  icon: string;
  title: string;
  subtitle: string;
  statusLabel: string;
  statusClassName: string;
  rawData: string;
  impact: string;
  impactClassName: string;
};

export type BenchmarkItem = {
  label: string;
  value: number;
  barClassName: string;
  valueClassName: string;
};

export type ContentStructureDetailView = {
  domain: string;
  isRealData: boolean;
  score: number;
  statusLabel: string;
  statusClassName: string;
  title: string;
  summary: string;
  topOpportunity: {
    title: string;
    gain: string;
    description: string;
  };
  kpis: ContentKpi[];
  densityBars: DensityBar[];
  benchmarkItems: BenchmarkItem[];
  benchmarkInsight: string;
  findings: ContentFinding[];
  missingStructureElements: string[];
  implementationCode: string;
  auditDate: string;
};

const INDUSTRY_READABILITY = 65;
const TOP_PERFORMER_READABILITY = 88;

function getCategory(
  categories: CategoryScore[],
  label: string,
): CategoryScore | undefined {
  return categories.find((category) => category.label === label);
}

function scoreToStatus(score: number): { label: string; className: string } {
  if (score >= 80) {
    return { label: "Good", className: "bg-green-100 text-green-700" };
  }

  if (score >= 65) {
    return { label: "Developing", className: "bg-[#FFF9C4] text-[#856404]" };
  }

  return { label: "At Risk", className: "bg-error-container text-on-error-container" };
}

function headingLogicScore(audit: AuditResponse): number {
  const h1 = audit.headings.h1.length === 1 ? 100 : audit.headings.h1.length > 0 ? 70 : 0;
  const h2 = audit.headings.h2.length >= 2 ? 100 : audit.headings.h2.length >= 1 ? 80 : 40;
  const h3 = audit.headings.h3.length >= 1 ? 90 : 50;
  return Math.round((h1 + h2 + h3) / 3);
}

function readabilityIndex(readability: ReturnType<typeof getReadabilityAnalysis>): number {
  const wordScore = Math.min(100, Math.round(readability.wordCount / 15));
  const paragraphScore =
    readability.averageParagraphWords <= 45 && readability.averageParagraphWords >= 12
      ? 90
      : readability.paragraphCount > 0
        ? 65
        : 40;
  return Math.round((wordScore + paragraphScore) / 2);
}

function listUsageScore(readability: ReturnType<typeof getReadabilityAnalysis>): number {
  if (readability.listCount >= 2 || readability.tableCount >= 1) {
    return 100;
  }

  if (readability.listCount === 1) {
    return 75;
  }

  return 40;
}

function contentDepthScore(readability: ReturnType<typeof getReadabilityAnalysis>): number {
  if (readability.wordCount >= 800) {
    return 90;
  }

  if (readability.wordCount >= 400) {
    return 75;
  }

  if (readability.wordCount >= 150) {
    return 55;
  }

  return 30;
}

function buildImplementationCode(domain: string): string {
  return `<main>
  <article>
    <header>
      <h1>The Strategic Value of AI Search Audits</h1>
    </header>
    <section id="semantic-signals">
      <h2>Understanding Semantic Signals</h2>
      <p>High-density information mapping for AI visibility on ${domain}.</p>
    </section>
  </article>
</main>`;
}

function buildFindings(audit: AuditResponse): ContentFinding[] {
  const readability = getReadabilityAnalysis(audit);
  const headingScore = headingLogicScore(audit);
  const paragraphWarn = readability.averageParagraphWords > 40;
  const faqScore = readability.hasFAQText || readability.questionHeadingCount > 0;

  return [
    {
      icon: "title",
      title: "Heading Hierarchy",
      subtitle: "H1-H4 sequencing",
      statusLabel: headingScore >= 80 ? "Optimal" : "Review",
      statusClassName: headingScore >= 80 ? "text-[#2E7D32] font-bold" : "text-[#856404] font-bold",
      rawData: `${audit.headings.h1.length}:${audit.headings.h2.length}:${audit.headings.h3.length}:0 Ratio`,
      impact: headingScore >= 80 ? "High" : "Medium",
      impactClassName: "text-primary font-bold",
    },
    {
      icon: "view_agenda",
      title: "Section Clarity",
      subtitle: "Thematic section breaks",
      statusLabel: audit.headings.h2.length >= 2 ? "Optimal" : "Alert",
      statusClassName:
        audit.headings.h2.length >= 2 ? "text-[#2E7D32] font-bold" : "text-[#FF5A4F] font-bold",
      rawData: `${audit.headings.h2.length} H2 sections`,
      impact: audit.headings.h2.length >= 2 ? "High" : "Medium",
      impactClassName:
        audit.headings.h2.length >= 2 ? "text-primary font-bold" : "text-[#FF5A4F] font-bold",
    },
    {
      icon: "format_align_left",
      title: "Paragraph Chunking",
      subtitle: "Average sentence length",
      statusLabel: paragraphWarn ? "Alert" : "Optimal",
      statusClassName: paragraphWarn ? "text-[#FF5A4F] font-bold" : "text-[#2E7D32] font-bold",
      rawData: `${readability.averageParagraphWords} words/avg`,
      impact: paragraphWarn ? "Medium" : "High",
      impactClassName: paragraphWarn ? "text-[#FF5A4F] font-bold" : "text-primary font-bold",
    },
    {
      icon: "short_text",
      title: "Answer Blocks",
      subtitle: "Short-form answer readiness",
      statusLabel: readability.shortAnswerBlocks > 0 ? "Optimal" : "Review",
      statusClassName:
        readability.shortAnswerBlocks > 0 ? "text-[#2E7D32] font-bold" : "text-[#856404] font-bold",
      rawData: `${readability.shortAnswerBlocks} blocks`,
      impact: readability.shortAnswerBlocks > 0 ? "High" : "Medium",
      impactClassName: "text-primary font-bold",
    },
    {
      icon: "quiz",
      title: "FAQ Coverage",
      subtitle: "Question-led sections",
      statusLabel: faqScore ? "Optimal" : "Alert",
      statusClassName: faqScore ? "text-[#2E7D32] font-bold" : "text-[#FF5A4F] font-bold",
      rawData: `${readability.questionHeadingCount} FAQ signals`,
      impact: faqScore ? "Critical" : "Medium",
      impactClassName: faqScore ? "text-primary font-bold" : "text-[#FF5A4F] font-bold",
    },
    {
      icon: "checklist",
      title: "List/Table Usage",
      subtitle: "Information density",
      statusLabel: listUsageScore(readability) >= 75 ? "Optimal" : "Review",
      statusClassName:
        listUsageScore(readability) >= 75 ? "text-[#2E7D32] font-bold" : "text-[#856404] font-bold",
      rawData: `${readability.listCount} list units`,
      impact: "Critical",
      impactClassName: "text-primary font-bold",
    },
    {
      icon: "menu_book",
      title: "Readability Flow",
      subtitle: "Scannable paragraph rhythm",
      statusLabel:
        readability.averageParagraphWords <= 45 ? "Optimal" : "Alert",
      statusClassName:
        readability.averageParagraphWords <= 45
          ? "text-[#2E7D32] font-bold"
          : "text-[#FF5A4F] font-bold",
      rawData: `${readability.paragraphCount} paragraphs`,
      impact: "High",
      impactClassName: "text-primary font-bold",
    },
    {
      icon: "link",
      title: "Internal Linking",
      subtitle: "Navigation structure",
      statusLabel: audit.links.internal > 0 ? "Optimal" : "Alert",
      statusClassName:
        audit.links.internal > 0 ? "text-[#2E7D32] font-bold" : "text-[#FF5A4F] font-bold",
      rawData: `${audit.links.internal} internal links`,
      impact: audit.links.internal > 0 ? "High" : "Medium",
      impactClassName:
        audit.links.internal > 0 ? "text-primary font-bold" : "text-[#FF5A4F] font-bold",
    },
    {
      icon: "description",
      title: "Content Depth",
      subtitle: "Token count per section",
      statusLabel: contentDepthScore(readability) >= 75 ? "Optimal" : "Review",
      statusClassName:
        contentDepthScore(readability) >= 75 ? "text-[#2E7D32] font-bold" : "text-[#856404] font-bold",
      rawData: `${readability.wordCount} words`,
      impact: "High",
      impactClassName: "text-primary font-bold",
    },
  ];
}

function buildDemoView(domain: string): ContentStructureDetailView {
  return {
    domain,
    isRealData: false,
    score: 81,
    statusLabel: "Good",
    statusClassName: "bg-green-100 text-green-700",
    title: "Content Structure Analysis",
    summary:
      "Your page maintains a high standard of semantic hierarchy. The content is well-structured for both human readability and LLM token chunking, with clear thematic breaks and consistent list usage.",
    topOpportunity: {
      title: "Paragraph Complexity",
      gain: "+5 pts",
      description:
        "Long paragraphs are harder for AI models to chunk into distinct semantic entities.",
    },
    kpis: [
      { label: "Heading Logic", value: "90%", progress: 90 },
      { label: "Readability Index", value: "72", progress: 72 },
      { label: "List Usage", value: "100%", progress: 100 },
      { label: "Content Depth", value: "85%", progress: 85 },
    ],
    densityBars: [
      { label: "H1/Intro", contentHeight: 128, headingHeight: 32, contentOpacity: "light" },
      { label: "Section 1", contentHeight: 192, headingHeight: 48 },
      { label: "Section 2", contentHeight: 224, headingHeight: 40 },
      { label: "Section 3", contentHeight: 160, headingHeight: 24, contentOpacity: "medium" },
      { label: "Summary", contentHeight: 96, headingHeight: 56 },
    ],
    benchmarkItems: [
      {
        label: "Current Page",
        value: 72,
        barClassName: "bg-primary",
        valueClassName: "font-bold text-primary",
      },
      {
        label: "Industry Average",
        value: INDUSTRY_READABILITY,
        barClassName: "bg-outline-variant",
        valueClassName: "font-bold text-on-surface-variant",
      },
      {
        label: "Top 1% Performers",
        value: TOP_PERFORMER_READABILITY,
        barClassName: "bg-secondary",
        valueClassName: "font-bold text-on-secondary-fixed-variant",
      },
    ],
    benchmarkInsight:
      "Pages with scores >75 show 22% higher inclusion in LLM-generated summaries.",
    findings: [
      {
        icon: "title",
        title: "Heading Hierarchy",
        subtitle: "H1-H4 sequencing",
        statusLabel: "Optimal",
        statusClassName: "text-[#2E7D32] font-bold",
        rawData: "1:2:5:8 Ratio",
        impact: "High",
        impactClassName: "text-primary font-bold",
      },
      {
        icon: "format_align_left",
        title: "Paragraph Structure",
        subtitle: "Average sentence length",
        statusLabel: "Alert",
        statusClassName: "text-[#FF5A4F] font-bold",
        rawData: "42 words/avg",
        impact: "Medium",
        impactClassName: "text-[#FF5A4F] font-bold",
      },
      {
        icon: "checklist",
        title: "Lists & Bulletpoints",
        subtitle: "Information density",
        statusLabel: "Optimal",
        statusClassName: "text-[#2E7D32] font-bold",
        rawData: "12 list units",
        impact: "Critical",
        impactClassName: "text-primary font-bold",
      },
      {
        icon: "description",
        title: "Content Depth",
        subtitle: "Token count per section",
        statusLabel: "Optimal",
        statusClassName: "text-[#2E7D32] font-bold",
        rawData: "1,420 words",
        impact: "High",
        impactClassName: "text-primary font-bold",
      },
    ],
    missingStructureElements: [
      "FAQ question headings for answer extraction",
      "Shorter paragraph blocks in mid-page sections",
    ],
    implementationCode: buildImplementationCode(domain),
    auditDate: reportMeta.auditDate,
  };
}

export function buildContentStructureDetailView(
  audit: AuditResponse | null,
  fallbackDomain: string,
): ContentStructureDetailView {
  const view = buildReportView(audit, fallbackDomain);

  if (!view.isRealData || !audit) {
    return buildDemoView(view.domain);
  }

  const scores = calculateAuditScores(audit);
  const category = getCategory(scores.categories, "Content Structure");
  const readability = getReadabilityAnalysis(audit);
  const structureScore = category?.score ?? 0;
  const status = scoreToStatus(structureScore);
  const headingLogic = headingLogicScore(audit);
  const readabilityScore = readabilityIndex(readability);
  const listScore = listUsageScore(readability);
  const depthScore = contentDepthScore(readability);
  const findings = buildFindings(audit);

  const topIssue =
    category?.problems.find((problem) =>
      /paragraph|heading|list|faq|internal|content|structure/i.test(problem),
    ) ?? category?.problems[0];

  const topRec =
    scores.recommendations.find((rec) =>
      /paragraph|heading|list|faq|internal|content|structure/i.test(rec.title),
    ) ?? scores.recommendations[0];

  const missingStructureElements = category?.problems.slice(0, 4) ?? [];

  if (!readability.hasFAQText && readability.questionHeadingCount === 0) {
    missingStructureElements.push("FAQ or question-led headings for answer blocks");
  }

  return {
    domain: view.domain,
    isRealData: true,
    score: structureScore,
    statusLabel: status.label,
    statusClassName: status.className,
    title: "Content Structure Analysis",
    summary:
      category?.summary ??
      "Content structure depends on heading hierarchy, scannable paragraphs, and structured blocks.",
    topOpportunity: {
      title: topRec?.title ?? topIssue?.split(".")[0] ?? "Paragraph Complexity",
      gain: `+${topRec?.estimatedGain ?? 5} pts`,
      description:
        topRec?.howToFix ??
        topIssue ??
        "Long paragraphs are harder for AI models to chunk into distinct semantic entities.",
    },
    kpis: [
      { label: "Heading Logic", value: `${headingLogic}%`, progress: headingLogic },
      { label: "Readability Index", value: String(readabilityScore), progress: readabilityScore },
      { label: "List Usage", value: `${listScore}%`, progress: listScore },
      { label: "Content Depth", value: `${depthScore}%`, progress: depthScore },
    ],
    densityBars: [
      {
        label: "H1/Intro",
        contentHeight: Math.max(64, Math.min(224, audit.headings.h1.length * 80 + 64)),
        headingHeight: 32,
        contentOpacity: audit.headings.h1.length === 0 ? "light" : "full",
      },
      {
        label: "Section 1",
        contentHeight: Math.max(96, Math.min(224, audit.headings.h2.length * 40 + 96)),
        headingHeight: 48,
      },
      {
        label: "Section 2",
        contentHeight: Math.max(80, Math.min(224, readability.paragraphCount * 8 + 80)),
        headingHeight: 40,
      },
      {
        label: "Section 3",
        contentHeight: Math.max(72, Math.min(192, readability.listCount * 24 + 72)),
        headingHeight: 24,
        contentOpacity: readability.listCount === 0 ? "medium" : "full",
      },
      {
        label: "Summary",
        contentHeight: Math.max(64, Math.min(160, Math.round(readability.wordCount / 20))),
        headingHeight: 56,
      },
    ],
    benchmarkItems: [
      {
        label: "Current Page",
        value: readabilityScore,
        barClassName: "bg-primary",
        valueClassName: "font-bold text-primary",
      },
      {
        label: "Industry Average",
        value: INDUSTRY_READABILITY,
        barClassName: "bg-outline-variant",
        valueClassName: "font-bold text-on-surface-variant",
      },
      {
        label: "Top 1% Performers",
        value: TOP_PERFORMER_READABILITY,
        barClassName: "bg-secondary",
        valueClassName: "font-bold text-on-secondary-fixed-variant",
      },
    ],
    benchmarkInsight:
      readabilityScore >= 75
        ? "Pages with scores >75 show 22% higher inclusion in LLM-generated summaries."
        : "Improving readability flow can increase LLM summary inclusion rates.",
    findings,
    missingStructureElements:
      missingStructureElements.length > 0
        ? missingStructureElements
        : buildDemoView(view.domain).missingStructureElements,
    implementationCode: buildImplementationCode(view.domain),
    auditDate: view.auditDate,
  };
}

export function getContentStructureFallbackView(domain: string): ContentStructureDetailView {
  return buildDemoView(domain);
}

export function loadContentStructureDetailView(domain: string): ContentStructureDetailView {
  return buildContentStructureDetailView(loadAuditReportSafe(), domain);
}
