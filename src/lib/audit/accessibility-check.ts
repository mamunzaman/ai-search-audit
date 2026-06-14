import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import type {
  AccessibilityAnalysis,
  AccessibilityFinding,
  AccessibilityFindingStatus,
  AuditCheck,
  AuditCheckStatus,
} from "./types";

export const defaultAccessibilityAnalysis: AccessibilityAnalysis = {
  score: 0,
  imageCount: 0,
  imagesMissingAlt: 0,
  altTextCoverage: 100,
  buttonCount: 0,
  buttonsWithoutText: 0,
  inputCount: 0,
  inputsMissingLabels: 0,
  headingOrderIssues: 0,
  landmarkCount: 0,
  hasMainLandmark: false,
  hasNavLandmark: false,
  hasHeaderLandmark: false,
  hasFooterLandmark: false,
  hasLangAttribute: false,
  hasTitle: false,
  skipLinkDetected: false,
  ariaLabelCount: 0,
  ariaHiddenCount: 0,
  emptyLinkCount: 0,
  duplicateIdCount: 0,
  findings: [],
};

function cleanText(value: string | undefined | null): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function coveragePercent(total: number, missing: number): number {
  if (total === 0) {
    return 100;
  }

  return Math.round(((total - missing) / total) * 100);
}

function findingStatusFromCoverage(coverage: number, total: number): AccessibilityFindingStatus {
  if (total === 0) {
    return "pass";
  }

  if (coverage >= 90) {
    return "pass";
  }

  if (coverage >= 70) {
    return "warning";
  }

  return "fail";
}

function checkStatusFromFinding(status: AccessibilityFindingStatus): AuditCheckStatus {
  if (status === "pass") {
    return "pass";
  }

  if (status === "warning") {
    return "warn";
  }

  return "fail";
}

function getAccessibleName(
  $: cheerio.CheerioAPI,
  element: Element,
): string {
  const node = $(element);
  const ariaLabel = cleanText(node.attr("aria-label"));
  if (ariaLabel) {
    return ariaLabel;
  }

  const labelledBy = cleanText(node.attr("aria-labelledby"));
  if (labelledBy) {
    const labelText = labelledBy
      .split(/\s+/)
      .map((id) => cleanText($(`#${id}`).text()))
      .filter(Boolean)
      .join(" ");
    if (labelText) {
      return labelText;
    }
  }

  const title = cleanText(node.attr("title"));
  if (title) {
    return title;
  }

  const value = cleanText(node.attr("value"));
  if (value) {
    return value;
  }

  if (node.find("img[alt]").length > 0) {
    return cleanText(node.find("img[alt]").first().attr("alt"));
  }

  return cleanText(node.text());
}

function inputHasLabel($: cheerio.CheerioAPI, element: Element): boolean {
  const node = $(element);
  const id = cleanText(node.attr("id"));

  if (cleanText(node.attr("aria-label"))) {
    return true;
  }

  if (cleanText(node.attr("aria-labelledby"))) {
    return true;
  }

  if (cleanText(node.attr("title"))) {
    return true;
  }

  if (id && $(`label[for="${id}"]`).length > 0) {
    return true;
  }

  if (node.closest("label").length > 0) {
    return true;
  }

  return false;
}

function countHeadingOrderIssues($: cheerio.CheerioAPI): number {
  const levels: number[] = [];

  $("h1, h2, h3, h4, h5, h6").each((_, element) => {
    const tag = element.tagName?.toLowerCase() ?? "";
    const level = Number.parseInt(tag.replace("h", ""), 10);
    if (level >= 1 && level <= 6) {
      levels.push(level);
    }
  });

  let issues = 0;
  let previousLevel = 0;

  for (const level of levels) {
    if (previousLevel > 0 && level > previousLevel + 1) {
      issues += 1;
    }
    previousLevel = level;
  }

  return issues;
}

function detectSkipLink($: cheerio.CheerioAPI): boolean {
  let found = false;

  $("a[href]").each((_, element) => {
    const href = cleanText($(element).attr("href")).toLowerCase();
    const text = cleanText($(element).text()).toLowerCase();

    if (
      /^#(main|content|main-content|primary|skip)/.test(href) ||
      /skip\s*(to)?\s*(main\s*)?(content|navigation)/.test(text)
    ) {
      found = true;
      return false;
    }
  });

  return found;
}

function countLandmarks($: cheerio.CheerioAPI): number {
  return $(
    "main, nav, header, footer, aside, section[aria-label], [role='main'], [role='navigation'], [role='banner'], [role='contentinfo'], [role='complementary']",
  ).length;
}

function countEmptyLinks($: cheerio.CheerioAPI): number {
  let count = 0;

  $("a[href]").each((_, element) => {
    if (!getAccessibleName($, element)) {
      count += 1;
    }
  });

  return count;
}

function countDuplicateIds($: cheerio.CheerioAPI): number {
  const seen = new Map<string, number>();

  $("[id]").each((_, element) => {
    const id = cleanText($(element).attr("id"));
    if (!id) {
      return;
    }

    seen.set(id, (seen.get(id) ?? 0) + 1);
  });

  return [...seen.values()].filter((count) => count > 1).length;
}

function calculateAccessibilityScore(findings: AccessibilityFinding[]): number {
  if (findings.length === 0) {
    return 0;
  }

  const total = findings.reduce((sum, finding) => {
    if (finding.status === "pass") {
      return sum + 100;
    }

    if (finding.status === "warning") {
      return sum + 50;
    }

    return sum;
  }, 0);

  return Math.round(total / findings.length);
}

function buildFindings(metrics: {
  hasLangAttribute: boolean;
  hasTitle: boolean;
  imageCount: number;
  imagesMissingAlt: number;
  altTextCoverage: number;
  buttonCount: number;
  buttonsWithoutText: number;
  buttonCoverage: number;
  inputCount: number;
  inputsMissingLabels: number;
  formCoverage: number;
  headingOrderIssues: number;
  hasMainLandmark: boolean;
  hasNavLandmark: boolean;
  hasHeaderLandmark: boolean;
  hasFooterLandmark: boolean;
  skipLinkDetected: boolean;
  ariaLabelCount: number;
  emptyLinkCount: number;
  duplicateIdCount: number;
}): AccessibilityFinding[] {
  const landmarkCount = [
    metrics.hasMainLandmark,
    metrics.hasNavLandmark,
    metrics.hasHeaderLandmark,
    metrics.hasFooterLandmark,
  ].filter(Boolean).length;

  const landmarkStatus: AccessibilityFindingStatus =
    metrics.hasMainLandmark && metrics.hasNavLandmark
      ? "pass"
      : metrics.hasMainLandmark || metrics.hasNavLandmark
        ? "warning"
        : "fail";

  return [
    {
      id: "lang-attribute",
      label: "HTML lang attribute",
      status: metrics.hasLangAttribute ? "pass" : "fail",
      wcag: "WCAG 3.1.1 Language of Page",
      message: metrics.hasLangAttribute
        ? "HTML lang attribute is present."
        : "No valid HTML lang attribute was detected.",
      recommendation: "Add lang=\"en\" (or the correct language code) to the <html> element.",
    },
    {
      id: "page-title",
      label: "Page title",
      status: metrics.hasTitle ? "pass" : "fail",
      wcag: "WCAG 2.4.2 Page Titled",
      message: metrics.hasTitle
        ? "A page title is present."
        : "No page title was detected.",
      recommendation: "Add a descriptive <title> element to the page head.",
    },
    {
      id: "image-alt-text",
      label: "Image alt text",
      status: findingStatusFromCoverage(metrics.altTextCoverage, metrics.imageCount),
      wcag: "WCAG 1.1.1 Non-text Content",
      message:
        metrics.imageCount === 0
          ? "No images were found on the page."
          : `${metrics.imagesMissingAlt} of ${metrics.imageCount} image(s) are missing alt text (${metrics.altTextCoverage}% coverage).`,
      recommendation: "Add descriptive alt text to meaningful images.",
    },
    {
      id: "button-names",
      label: "Button accessible names",
      status: findingStatusFromCoverage(metrics.buttonCoverage, metrics.buttonCount),
      wcag: "WCAG 4.1.2 Name, Role, Value",
      message:
        metrics.buttonCount === 0
          ? "No buttons were found on the page."
          : `${metrics.buttonsWithoutText} of ${metrics.buttonCount} button(s) lack accessible names (${metrics.buttonCoverage}% coverage).`,
      recommendation: "Provide visible text, aria-label, or aria-labelledby for each button.",
    },
    {
      id: "input-labels",
      label: "Input labels",
      status: findingStatusFromCoverage(metrics.formCoverage, metrics.inputCount),
      wcag: "WCAG 3.3.2 Labels or Instructions",
      message:
        metrics.inputCount === 0
          ? "No form inputs were found on the page."
          : `${metrics.inputsMissingLabels} of ${metrics.inputCount} input(s) lack labels (${metrics.formCoverage}% coverage).`,
      recommendation: "Associate each input with a <label> or provide aria-label / aria-labelledby.",
    },
    {
      id: "heading-order",
      label: "Heading order",
      status: metrics.headingOrderIssues === 0 ? "pass" : "warning",
      wcag: "WCAG 1.3.1 Info and Relationships",
      message:
        metrics.headingOrderIssues === 0
          ? "Heading levels progress without skipped levels."
          : `${metrics.headingOrderIssues} heading order issue(s) detected.`,
      recommendation: "Avoid skipping heading levels (for example, H2 directly to H4).",
    },
    {
      id: "landmarks",
      label: "Page landmarks",
      status: landmarkStatus,
      wcag: "WCAG 1.3.1 / 2.4.1 Bypass Blocks",
      message:
        landmarkCount === 0
          ? "No semantic landmarks were detected."
          : `${landmarkCount} landmark(s) detected (main=${metrics.hasMainLandmark}, nav=${metrics.hasNavLandmark}, header=${metrics.hasHeaderLandmark}, footer=${metrics.hasFooterLandmark}).`,
      recommendation: "Add <main>, <nav>, <header>, and <footer> landmarks where appropriate.",
    },
    {
      id: "skip-link",
      label: "Skip link",
      status: metrics.skipLinkDetected ? "pass" : "warning",
      wcag: "WCAG 2.4.1 Bypass Blocks",
      message: metrics.skipLinkDetected
        ? "A skip link supports keyboard navigation."
        : "No skip link was detected for keyboard users.",
      recommendation: "Add a visible-on-focus skip link that targets the main content area.",
    },
    {
      id: "aria-labels",
      label: "ARIA labels",
      status: metrics.ariaLabelCount > 0 ? "pass" : "warning",
      wcag: "WCAG 4.1.2 Name, Role, Value",
      message:
        metrics.ariaLabelCount > 0
          ? `${metrics.ariaLabelCount} element(s) use aria-label or aria-labelledby.`
          : "No aria-label or aria-labelledby attributes were detected.",
      recommendation: "Use ARIA labels only when native HTML naming is insufficient.",
    },
    {
      id: "empty-links",
      label: "Empty links",
      status: metrics.emptyLinkCount === 0 ? "pass" : "fail",
      wcag: "WCAG 2.4.4 Link Purpose (In Context)",
      message:
        metrics.emptyLinkCount === 0
          ? "All links expose an accessible name."
          : `${metrics.emptyLinkCount} link(s) have no accessible name.`,
      recommendation: "Add descriptive link text or aria-label to links without visible text.",
    },
    {
      id: "duplicate-ids",
      label: "Duplicate IDs",
      status: metrics.duplicateIdCount === 0 ? "pass" : "fail",
      wcag: "WCAG 4.1.1 Parsing",
      message:
        metrics.duplicateIdCount === 0
          ? "No duplicate ID values were detected."
          : `${metrics.duplicateIdCount} duplicate ID value(s) were detected.`,
      recommendation: "Ensure each id attribute value is unique across the page.",
    },
  ];
}

export function analyzeAccessibility(
  html: string,
  pageTitle: string,
): AccessibilityAnalysis {
  const $ = cheerio.load(html);
  let imageCount = 0;
  let imagesMissingAlt = 0;
  let buttonCount = 0;
  let buttonsWithoutText = 0;
  let inputCount = 0;
  let inputsMissingLabels = 0;

  $("img").each((_, element) => {
    imageCount += 1;
    if (!$(element).attr("alt")) {
      imagesMissingAlt += 1;
    }
  });

  $("button, [role='button']").each((_, element) => {
    const tag = element.tagName?.toLowerCase() ?? "";
    const type = cleanText($(element).attr("type")).toLowerCase();
    if (tag === "input" && !["button", "submit", "reset"].includes(type)) {
      return;
    }

    buttonCount += 1;
    if (!getAccessibleName($, element)) {
      buttonsWithoutText += 1;
    }
  });

  $("input, select, textarea").each((_, element) => {
    const tag = element.tagName?.toLowerCase() ?? "";
    const type = cleanText($(element).attr("type")).toLowerCase();

    if (tag === "input" && ["button", "submit", "reset", "hidden", "image"].includes(type)) {
      return;
    }

    inputCount += 1;
    if (!inputHasLabel($, element)) {
      inputsMissingLabels += 1;
    }
  });

  const lang = cleanText($("html").attr("lang"));
  const hasTitle = Boolean(
    cleanText(pageTitle) || cleanText($("title").first().text()),
  );
  const altTextCoverage = coveragePercent(imageCount, imagesMissingAlt);
  const buttonCoverage = coveragePercent(buttonCount, buttonsWithoutText);
  const formCoverage = coveragePercent(inputCount, inputsMissingLabels);
  const headingOrderIssues = countHeadingOrderIssues($);
  const hasMainLandmark = $("main, [role='main']").length > 0;
  const hasNavLandmark = $("nav, [role='navigation']").length > 0;
  const hasHeaderLandmark = $("header, [role='banner']").length > 0;
  const hasFooterLandmark = $("footer, [role='contentinfo']").length > 0;
  const skipLinkDetected = detectSkipLink($);
  const emptyLinkCount = countEmptyLinks($);
  const duplicateIdCount = countDuplicateIds($);
  const ariaLabelCount = $("[aria-label], [aria-labelledby]").length;
  const ariaHiddenCount = $("[aria-hidden='true']").length;

  const findings = buildFindings({
    hasLangAttribute: lang.length >= 2,
    hasTitle,
    imageCount,
    imagesMissingAlt,
    altTextCoverage,
    buttonCount,
    buttonsWithoutText,
    buttonCoverage,
    inputCount,
    inputsMissingLabels,
    formCoverage,
    headingOrderIssues,
    hasMainLandmark,
    hasNavLandmark,
    hasHeaderLandmark,
    hasFooterLandmark,
    skipLinkDetected,
    ariaLabelCount,
    emptyLinkCount,
    duplicateIdCount,
  });

  return {
    score: calculateAccessibilityScore(findings),
    imageCount,
    imagesMissingAlt,
    altTextCoverage,
    buttonCount,
    buttonsWithoutText,
    inputCount,
    inputsMissingLabels,
    headingOrderIssues,
    landmarkCount: countLandmarks($),
    hasMainLandmark,
    hasNavLandmark,
    hasHeaderLandmark,
    hasFooterLandmark,
    hasLangAttribute: lang.length >= 2,
    hasTitle,
    skipLinkDetected,
    ariaLabelCount,
    ariaHiddenCount,
    emptyLinkCount,
    duplicateIdCount,
    findings,
  };
}

export function getAltTextCoverage(analysis: AccessibilityAnalysis): number {
  return analysis.altTextCoverage;
}

export function getFormLabelCoverage(analysis: AccessibilityAnalysis): number {
  return coveragePercent(analysis.inputCount, analysis.inputsMissingLabels);
}

export function getButtonTextCoverage(analysis: AccessibilityAnalysis): number {
  return coveragePercent(analysis.buttonCount, analysis.buttonsWithoutText);
}

export function runAccessibilityChecks(
  analysis: AccessibilityAnalysis,
): AuditCheck[] {
  const byId = Object.fromEntries(analysis.findings.map((finding) => [finding.id, finding]));

  const checkMap: Array<{ id: string; findingId: string; label: string }> = [
    { id: "wcag-lang-attribute", findingId: "lang-attribute", label: "WCAG lang attribute" },
    { id: "wcag-page-title", findingId: "page-title", label: "WCAG page title" },
    { id: "wcag-image-alt-coverage", findingId: "image-alt-text", label: "WCAG image alt coverage" },
    { id: "wcag-button-names", findingId: "button-names", label: "WCAG button names" },
    { id: "wcag-input-labels", findingId: "input-labels", label: "WCAG input labels" },
    { id: "wcag-heading-order", findingId: "heading-order", label: "WCAG heading order" },
    { id: "wcag-landmarks", findingId: "landmarks", label: "WCAG landmarks" },
    { id: "wcag-skip-link", findingId: "skip-link", label: "WCAG skip link" },
    { id: "wcag-empty-links", findingId: "empty-links", label: "WCAG empty links" },
    { id: "wcag-duplicate-ids", findingId: "duplicate-ids", label: "WCAG duplicate IDs" },
  ];

  return checkMap.map(({ id, findingId, label }) => {
    const finding = byId[findingId];
    const status = finding
      ? checkStatusFromFinding(finding.status)
      : "warn";

    return {
      id,
      label,
      status,
      message: finding?.message ?? "Accessibility signal not evaluated.",
    };
  });
}
