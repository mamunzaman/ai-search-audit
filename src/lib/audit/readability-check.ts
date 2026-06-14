import * as cheerio from "cheerio";
import type { AuditCheck, AuditHeadings, ReadabilityAnalysis } from "./types";

const MIN_PARAGRAPH_WORDS = 5;
const SHORT_ANSWER_MIN_WORDS = 15;
const SHORT_ANSWER_MAX_WORDS = 100;
const ENOUGH_CONTENT_WORDS = 300;
const SCANNABLE_PARAGRAPH_WORDS = 120;

const FAQ_TEXT_PATTERN =
  /\b(faq|frequently asked questions|häufig gestellte fragen|questions and answers)\b/i;

const QUESTION_HEADING_PATTERN = /\?/;

export const defaultReadabilityAnalysis: ReadabilityAnalysis = {
  wordCount: 0,
  paragraphCount: 0,
  averageParagraphWords: 0,
  listCount: 0,
  tableCount: 0,
  questionHeadingCount: 0,
  hasFAQText: false,
  shortAnswerBlocks: 0,
};

function cleanText(value: string | undefined | null): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function countWords(text: string): number {
  if (!text) {
    return 0;
  }

  return text.split(/\s+/).filter(Boolean).length;
}

function getContentRoot($: cheerio.CheerioAPI) {
  const main = $("main, article, [role='main']").first();

  if (main.length > 0) {
    return main;
  }

  return $("body");
}

function extractParagraphTexts($: cheerio.CheerioAPI): string[] {
  const root = getContentRoot($);
  const paragraphs: string[] = [];

  root.find("p").each((_, element) => {
    const text = cleanText($(element).text());

    if (countWords(text) >= MIN_PARAGRAPH_WORDS) {
      paragraphs.push(text);
    }
  });

  return paragraphs;
}

function countQuestionHeadings(headings: AuditHeadings): number {
  return [...headings.h1, ...headings.h2, ...headings.h3].filter((heading) =>
    QUESTION_HEADING_PATTERN.test(heading),
  ).length;
}

function detectFaqText(html: string, headings: AuditHeadings): boolean {
  if (FAQ_TEXT_PATTERN.test(html)) {
    return true;
  }

  return [...headings.h2, ...headings.h3].some((heading) =>
    FAQ_TEXT_PATTERN.test(heading),
  );
}

export function analyzeReadability(
  html: string,
  headings: AuditHeadings,
): ReadabilityAnalysis {
  const $ = cheerio.load(html);
  const root = getContentRoot($);
  const bodyText = cleanText(root.text());
  const paragraphs = extractParagraphTexts($);
  const paragraphWordCounts = paragraphs.map((paragraph) => countWords(paragraph));
  const totalParagraphWords = paragraphWordCounts.reduce(
    (sum, count) => sum + count,
    0,
  );

  return {
    wordCount: countWords(bodyText),
    paragraphCount: paragraphs.length,
    averageParagraphWords:
      paragraphs.length > 0
        ? Math.round(totalParagraphWords / paragraphs.length)
        : 0,
    listCount: root.find("ul, ol").length,
    tableCount: root.find("table").length,
    questionHeadingCount: countQuestionHeadings(headings),
    hasFAQText: detectFaqText(html, headings),
    shortAnswerBlocks: paragraphWordCounts.filter(
      (count) =>
        count >= SHORT_ANSWER_MIN_WORDS && count <= SHORT_ANSWER_MAX_WORDS,
    ).length,
  };
}

export function hasEnoughBodyContent(
  analysis: ReadabilityAnalysis,
): boolean {
  return analysis.wordCount >= ENOUGH_CONTENT_WORDS;
}

export function hasScannableParagraphs(
  analysis: ReadabilityAnalysis,
): boolean {
  return (
    analysis.paragraphCount >= 2 &&
    analysis.averageParagraphWords > 0 &&
    analysis.averageParagraphWords <= SCANNABLE_PARAGRAPH_WORDS
  );
}

export function hasStructuredContentBlocks(
  analysis: ReadabilityAnalysis,
): boolean {
  return analysis.listCount + analysis.tableCount > 0;
}

export function isEasyForAiAnswerExtraction(
  analysis: ReadabilityAnalysis,
): boolean {
  return (
    hasEnoughBodyContent(analysis) &&
    hasScannableParagraphs(analysis) &&
    (hasStructuredContentBlocks(analysis) || analysis.shortAnswerBlocks >= 2)
  );
}

export function runReadabilityChecks(
  analysis: ReadabilityAnalysis,
): AuditCheck[] {
  const enoughContent = hasEnoughBodyContent(analysis);
  const scannableParagraphs = hasScannableParagraphs(analysis);
  const structuredBlocks = hasStructuredContentBlocks(analysis);

  return [
    {
      id: "enough-body-content",
      label: "Enough body content",
      status: enoughContent ? "pass" : analysis.wordCount >= 100 ? "warn" : "fail",
      message: enoughContent
        ? `Body contains ${analysis.wordCount} words for AI answer extraction.`
        : analysis.wordCount > 0
          ? `Only ${analysis.wordCount} words detected; more body content improves AI answer depth.`
          : "Very little body content was detected on the page.",
    },
    {
      id: "scannable-paragraphs",
      label: "Scannable paragraphs",
      status: scannableParagraphs
        ? "pass"
        : analysis.paragraphCount > 0
          ? "warn"
          : "fail",
      message: scannableParagraphs
        ? `${analysis.paragraphCount} paragraphs average ${analysis.averageParagraphWords} words each.`
        : analysis.paragraphCount > 0
          ? `Paragraphs average ${analysis.averageParagraphWords} words; shorter blocks are easier for AI parsing.`
          : "No scannable paragraph blocks were detected.",
    },
    {
      id: "lists-or-tables-detected",
      label: "Lists or tables detected",
      status: structuredBlocks ? "pass" : "warn",
      message: structuredBlocks
        ? `Found ${analysis.listCount} list(s) and ${analysis.tableCount} table(s) for structured content.`
        : "No lists or tables were detected for structured answer extraction.",
    },
    {
      id: "question-style-headings-detected",
      label: "Question-style headings detected",
      status: analysis.questionHeadingCount > 0 ? "pass" : "warn",
      message:
        analysis.questionHeadingCount > 0
          ? `${analysis.questionHeadingCount} question-style heading(s) support FAQ-style answer extraction.`
          : "No question-style headings were detected.",
    },
    {
      id: "visible-faq-text-detected",
      label: "Visible FAQ text detected",
      status: analysis.hasFAQText ? "pass" : "warn",
      message: analysis.hasFAQText
        ? "Visible FAQ-related text or headings were detected."
        : "No visible FAQ-related text was detected on the page.",
    },
  ];
}
