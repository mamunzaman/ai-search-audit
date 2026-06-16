import * as cheerio from "cheerio";
import type {
  AuditFinding,
  AuditIssue,
  AuditRecommendation,
  AIAuditStatus,
  AnswerExtractionAuditResult,
} from "@/types/audit";
import type { AuditHeadings, ReadabilityAnalysis } from "./types";
import {
  hasScannableParagraphs,
} from "./readability-check";

const SIGNAL_COUNT = 9;

const FAQ_TEXT_PATTERN =
  /\b(faq|frequently asked questions|häufig gestellte fragen|questions and answers)\b/i;

const SUMMARY_HEADING_PATTERN =
  /\b(summary|conclusion|key takeaways|final thoughts|wrapping up|in summary|tl;dr|overview)\b/i;

const DEFINITION_PATTERN =
  /\b(?:is defined as|refers to|means that|can be defined as|is a type of|is an?)\b/i;

type ExtractionSignal = {
  id: string;
  label: string;
  passed: boolean;
  partial?: boolean;
  passMessage: string;
  failMessage: string;
  recommendation: string;
  estimatedGain: number;
};

export type AnswerExtractionAuditInput = {
  html: string;
  headings: AuditHeadings;
  schemaTypes: string[];
  readabilityAnalysis: ReadabilityAnalysis;
};

export const defaultAnswerExtractionAudit: AnswerExtractionAuditResult = {
  score: 0,
  status: "poor",
  findings: [],
  issues: [],
  recommendations: [],
};

function cleanText(value: string | undefined | null): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function hasSchemaType(schemaTypes: string[], type: string): boolean {
  return schemaTypes.some(
    (schemaType) => schemaType.toLowerCase() === type.toLowerCase(),
  );
}

function getContentRoot($: cheerio.CheerioAPI) {
  const main = $("main, article, [role='main']").first();
  return main.length > 0 ? main : $("body");
}

function detectFaqSection(
  html: string,
  headings: AuditHeadings,
  schemaTypes: string[],
): { detected: boolean; partial: boolean; detail: string } {
  const $ = cheerio.load(html);
  const root = getContentRoot($);
  const detailsCount = root.find("details").length;
  const faqSectionMarkup =
    /(?:id|class)=["'][^"']*faq[^"']*["']/i.test(html) ||
    root.find("[itemtype*='FAQPage']").length > 0;

  if (
    hasSchemaType(schemaTypes, "FAQPage") ||
    FAQ_TEXT_PATTERN.test(html) ||
    faqSectionMarkup ||
    detailsCount >= 2
  ) {
    return {
      detected: true,
      partial: false,
      detail:
        detailsCount >= 2
          ? `FAQ-style accordion content detected (${detailsCount} expandable blocks).`
          : hasSchemaType(schemaTypes, "FAQPage")
            ? "FAQPage schema and FAQ content signals detected."
            : "A visible FAQ section or FAQ-related heading was detected.",
    };
  }

  const faqHeading = [...headings.h2, ...headings.h3].find((heading) =>
    FAQ_TEXT_PATTERN.test(heading),
  );

  if (faqHeading) {
    return {
      detected: false,
      partial: true,
      detail: `FAQ heading found ("${faqHeading}"), but no structured FAQ blocks detected.`,
    };
  }

  return {
    detected: false,
    partial: false,
    detail: "No FAQ section or FAQ-style content was detected.",
  };
}

function detectQuestionHeadings(
  readability: ReadabilityAnalysis,
): { detected: boolean; partial: boolean; detail: string } {
  if (readability.questionHeadingCount >= 2) {
    return {
      detected: true,
      partial: false,
      detail: `${readability.questionHeadingCount} question-style headings support direct answer extraction.`,
    };
  }

  if (readability.questionHeadingCount === 1) {
    return {
      detected: false,
      partial: true,
      detail: "One question-style heading found; more Q&A headings would improve extraction.",
    };
  }

  return {
    detected: false,
    partial: false,
    detail: "No question-style headings were detected.",
  };
}

function detectShortAnswerParagraphs(
  readability: ReadabilityAnalysis,
): { detected: boolean; partial: boolean; detail: string } {
  if (readability.shortAnswerBlocks >= 2) {
    return {
      detected: true,
      partial: false,
      detail: `${readability.shortAnswerBlocks} short answer paragraph(s) detected (15–100 words).`,
    };
  }

  if (readability.shortAnswerBlocks === 1) {
    return {
      detected: false,
      partial: true,
      detail: "One short answer paragraph found; add more concise answer blocks.",
    };
  }

  return {
    detected: false,
    partial: false,
    detail: "No short answer paragraphs were detected.",
  };
}

function detectDefinitionContent(
  html: string,
): { detected: boolean; partial: boolean; detail: string } {
  const $ = cheerio.load(html);
  const root = getContentRoot($);
  const definitionLists = root.find("dl").length;

  if (definitionLists > 0) {
    return {
      detected: true,
      partial: false,
      detail: `${definitionLists} definition list(s) detected for term explanations.`,
    };
  }

  const paragraphs = root
    .find("p")
    .toArray()
    .map((element) => cleanText($(element).text()))
    .filter(Boolean);

  const definitionParagraphs = paragraphs.filter((paragraph) =>
    DEFINITION_PATTERN.test(paragraph),
  );

  if (definitionParagraphs.length >= 2) {
    return {
      detected: true,
      partial: false,
      detail: `${definitionParagraphs.length} definition-style paragraph(s) detected.`,
    };
  }

  if (definitionParagraphs.length === 1) {
    return {
      detected: false,
      partial: true,
      detail: "One definition-style sentence found; add clearer term definitions.",
    };
  }

  return {
    detected: false,
    partial: false,
    detail: "No definition-style content was detected.",
  };
}

function detectListAnswers(
  html: string,
  readability: ReadabilityAnalysis,
): { detected: boolean; partial: boolean; detail: string } {
  const $ = cheerio.load(html);
  const root = getContentRoot($);
  let richLists = 0;

  root.find("ul, ol").each((_, element) => {
    const items = $(element).find("li").length;

    if (items >= 3) {
      richLists += 1;
    }
  });

  if (richLists >= 1) {
    return {
      detected: true,
      partial: false,
      detail: `${richLists} list(s) with 3+ items support list-based answer extraction.`,
    };
  }

  if (readability.listCount > 0) {
    return {
      detected: false,
      partial: true,
      detail: `${readability.listCount} list(s) found, but items are too shallow for strong answer extraction.`,
    };
  }

  return {
    detected: false,
    partial: false,
    detail: "No list-based answer structures were detected.",
  };
}

function detectTableAnswers(
  html: string,
  readability: ReadabilityAnalysis,
): { detected: boolean; partial: boolean; detail: string } {
  const $ = cheerio.load(html);
  const root = getContentRoot($);
  let dataTables = 0;

  root.find("table").each((_, element) => {
    const cells = $(element).find("th, td").length;

    if (cells >= 4) {
      dataTables += 1;
    }
  });

  if (dataTables >= 1) {
    return {
      detected: true,
      partial: false,
      detail: `${dataTables} data table(s) detected for structured answer extraction.`,
    };
  }

  if (readability.tableCount > 0) {
    return {
      detected: false,
      partial: true,
      detail: "Table markup found, but tables lack enough cells for useful answer extraction.",
    };
  }

  return {
    detected: false,
    partial: false,
    detail: "No table-based answer structures were detected.",
  };
}

function detectSummarySection(
  headings: AuditHeadings,
): { detected: boolean; partial: boolean; detail: string } {
  const summaryHeading = [...headings.h2, ...headings.h3].find((heading) =>
    SUMMARY_HEADING_PATTERN.test(heading),
  );

  if (summaryHeading) {
    return {
      detected: true,
      partial: false,
      detail: `Summary section detected: "${summaryHeading}".`,
    };
  }

  return {
    detected: false,
    partial: false,
    detail: "No summary or conclusion section heading was detected.",
  };
}

function detectHeadingHierarchy(
  headings: AuditHeadings,
): { detected: boolean; partial: boolean; detail: string } {
  const hasH1 = headings.h1.length === 1;
  const hasH2 = headings.h2.length >= 1;
  const hasH3 = headings.h3.length >= 1;

  if (hasH1 && hasH2 && hasH3) {
    return {
      detected: true,
      partial: false,
      detail: `Clear hierarchy with H1 (${headings.h1.length}), H2 (${headings.h2.length}), H3 (${headings.h3.length}).`,
    };
  }

  if (hasH1 && hasH2) {
    return {
      detected: false,
      partial: true,
      detail: "H1 and H2 headings exist, but deeper H3 subheadings are missing.",
    };
  }

  if (hasH1 || headings.h2.length > 0) {
    return {
      detected: false,
      partial: true,
      detail: "Heading structure exists but is not fully hierarchical for answer parsing.",
    };
  }

  return {
    detected: false,
    partial: false,
    detail: "No clear H2/H3 heading hierarchy was detected.",
  };
}

function detectScannableParagraphs(
  readability: ReadabilityAnalysis,
): { detected: boolean; partial: boolean; detail: string } {
  if (hasScannableParagraphs(readability)) {
    return {
      detected: true,
      partial: false,
      detail: `${readability.paragraphCount} paragraphs average ${readability.averageParagraphWords} words (scannable).`,
    };
  }

  if (readability.paragraphCount > 0) {
    return {
      detected: false,
      partial: true,
      detail: `Paragraphs average ${readability.averageParagraphWords} words; shorter blocks improve AI extraction.`,
    };
  }

  return {
    detected: false,
    partial: false,
    detail: "No scannable paragraph blocks were detected.",
  };
}

function buildSignals(input: AnswerExtractionAuditInput): ExtractionSignal[] {
  const readability = input.readabilityAnalysis;
  const faq = detectFaqSection(input.html, input.headings, input.schemaTypes);
  const questions = detectQuestionHeadings(readability);
  const shortAnswers = detectShortAnswerParagraphs(readability);
  const definitions = detectDefinitionContent(input.html);
  const lists = detectListAnswers(input.html, readability);
  const tables = detectTableAnswers(input.html, readability);
  const summary = detectSummarySection(input.headings);
  const hierarchy = detectHeadingHierarchy(input.headings);
  const scannable = detectScannableParagraphs(readability);

  return [
    {
      id: "faq-section",
      label: "FAQ section detected",
      passed: faq.detected,
      partial: faq.partial,
      passMessage: faq.detail,
      failMessage: faq.detail,
      recommendation:
        "Add a visible FAQ section with question headings and concise answers.",
      estimatedGain: 8,
    },
    {
      id: "question-headings",
      label: "Question-style headings detected",
      passed: questions.detected,
      partial: questions.partial,
      passMessage: questions.detail,
      failMessage: questions.detail,
      recommendation:
        "Use H2/H3 headings phrased as user questions ending with question marks.",
      estimatedGain: 7,
    },
    {
      id: "short-answer-paragraphs",
      label: "Short answer paragraphs detected",
      passed: shortAnswers.detected,
      partial: shortAnswers.partial,
      passMessage: shortAnswers.detail,
      failMessage: shortAnswers.detail,
      recommendation:
        "Add concise 15–100 word paragraphs that directly answer each subtopic.",
      estimatedGain: 7,
    },
    {
      id: "definition-content",
      label: "Definition-style content detected",
      passed: definitions.detected,
      partial: definitions.partial,
      passMessage: definitions.detail,
      failMessage: definitions.detail,
      recommendation:
        "Define key terms with clear 'X is…' or definition list markup.",
      estimatedGain: 5,
    },
    {
      id: "list-answers",
      label: "List-based answers detected",
      passed: lists.detected,
      partial: lists.partial,
      passMessage: lists.detail,
      failMessage: lists.detail,
      recommendation:
        "Use bullet or numbered lists to present step-by-step or multi-point answers.",
      estimatedGain: 6,
    },
    {
      id: "table-answers",
      label: "Table-based answers detected",
      passed: tables.detected,
      partial: tables.partial,
      passMessage: tables.detail,
      failMessage: tables.detail,
      recommendation:
        "Add comparison or data tables when answers benefit from structured rows and columns.",
      estimatedGain: 5,
    },
    {
      id: "summary-section",
      label: "Summary/conclusion section detected",
      passed: summary.detected,
      partial: summary.partial,
      passMessage: summary.detail,
      failMessage: summary.detail,
      recommendation:
        "Add a Summary or Conclusion section with a direct takeaway paragraph.",
      estimatedGain: 6,
    },
    {
      id: "heading-hierarchy",
      label: "Clear H2/H3 hierarchy detected",
      passed: hierarchy.detected,
      partial: hierarchy.partial,
      passMessage: hierarchy.detail,
      failMessage: hierarchy.detail,
      recommendation:
        "Use one H1 plus nested H2/H3 headings to segment answer blocks.",
      estimatedGain: 6,
    },
    {
      id: "scannable-paragraphs",
      label: "Scannable paragraph length detected",
      passed: scannable.detected,
      partial: scannable.partial,
      passMessage: scannable.detail,
      failMessage: scannable.detail,
      recommendation:
        "Break long paragraphs into scannable blocks under 120 words each.",
      estimatedGain: 5,
    },
  ];
}

function signalToFinding(signal: ExtractionSignal): AuditFinding {
  const status = signal.passed ? "pass" : signal.partial ? "warning" : "fail";

  return {
    id: signal.id,
    label: signal.label,
    status,
    message: signal.passed || signal.partial ? signal.passMessage : signal.failMessage,
    recommendation: status === "pass" ? undefined : signal.recommendation,
  };
}

function signalToPoints(signal: ExtractionSignal): number {
  if (signal.passed) {
    return 100;
  }

  if (signal.partial) {
    return 55;
  }

  return 0;
}

function deriveStatus(score: number): AIAuditStatus {
  if (score >= 80) {
    return "good";
  }

  if (score >= 50) {
    return "warning";
  }

  return "poor";
}

function buildIssues(findings: AuditFinding[]): AuditIssue[] {
  return findings
    .filter((finding) => finding.status !== "pass")
    .map((finding) => ({
      title: finding.label,
      impact:
        finding.status === "fail"
          ? finding.id === "faq-section" ||
            finding.id === "question-headings" ||
            finding.id === "short-answer-paragraphs"
            ? "Critical"
            : "High"
          : "Medium",
      explanation: finding.message,
    }));
}

function buildRecommendations(signals: ExtractionSignal[]): AuditRecommendation[] {
  return signals
    .filter((signal) => !signal.passed)
    .map((signal) => ({
      title: signal.partial
        ? `Strengthen ${signal.label.toLowerCase()}`
        : `Add ${signal.label.toLowerCase()}`,
      whyThisMatters:
        "AI systems extract direct answers more reliably from FAQ blocks, concise paragraphs, lists, tables, and clear heading hierarchy.",
      howToFix: signal.recommendation,
      estimatedGain: signal.estimatedGain,
    }))
    .sort((left, right) => right.estimatedGain - left.estimatedGain);
}

export function runAnswerExtractionAudit(
  input: AnswerExtractionAuditInput,
): AnswerExtractionAuditResult {
  const signals = buildSignals(input);
  const findings = signals.map(signalToFinding);
  const score = Math.round(
    signals.reduce((total, signal) => total + signalToPoints(signal), 0) /
      SIGNAL_COUNT,
  );

  return {
    score,
    status: deriveStatus(score),
    findings,
    issues: buildIssues(findings),
    recommendations: buildRecommendations(signals),
  };
}

export function getAnswerExtractionSummary(
  result: AnswerExtractionAuditResult,
): string {
  const passedCount = result.findings.filter((finding) => finding.status === "pass").length;

  if (result.status === "good") {
    return `${passedCount}/${SIGNAL_COUNT} answer extraction signals detected; content is structured for AI direct answers.`;
  }

  if (result.status === "warning") {
    return `${passedCount}/${SIGNAL_COUNT} answer extraction signals detected; FAQ, lists, or scannable blocks need improvement.`;
  }

  return `Only ${passedCount}/${SIGNAL_COUNT} answer extraction signals detected; AI systems may struggle to extract direct answers.`;
}
