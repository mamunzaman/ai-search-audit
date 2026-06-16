import * as cheerio from "cheerio";
import type {
  AuditFinding,
  AuditIssue,
  AuditRecommendation,
  AIAuditStatus,
  AdvancedSchemaAuditResult,
} from "@/types/audit";

const SIGNAL_COUNT = 9;

type AdvancedSchemaSignal = {
  id: string;
  label: string;
  passed: boolean;
  partial?: boolean;
  passMessage: string;
  failMessage: string;
  recommendation: string;
  estimatedGain: number;
};

export type AdvancedSchemaAuditInput = {
  html: string;
  schemaTypes: string[];
};

export const defaultAdvancedSchemaAudit: AdvancedSchemaAuditResult = {
  score: 0,
  status: "poor",
  findings: [],
  issues: [],
  recommendations: [],
};

type SchemaBlockAnalysis = {
  totalBlocks: number;
  validBlocks: number;
  invalidBlocks: number;
};

function hasSchemaType(schemaTypes: string[], candidates: string[]): boolean {
  const normalized = new Set(schemaTypes.map((type) => type.toLowerCase()));

  return candidates.some((candidate) => normalized.has(candidate.toLowerCase()));
}

function hasAnyDetectedSchema(
  schemaTypes: string[],
  blockAnalysis: SchemaBlockAnalysis,
): boolean {
  return schemaTypes.length > 0 || blockAnalysis.validBlocks > 0;
}

function isValidSchemaContext(context: unknown): boolean {
  if (typeof context === "string") {
    return /schema\.org/i.test(context);
  }

  if (Array.isArray(context)) {
    return context.some(
      (entry) => typeof entry === "string" && /schema\.org/i.test(entry),
    );
  }

  if (context && typeof context === "object") {
    const record = context as Record<string, unknown>;
    return Object.values(record).some(
      (value) => typeof value === "string" && /schema\.org/i.test(value),
    );
  }

  return false;
}

function hasValidTypeField(typeValue: unknown): boolean {
  if (typeof typeValue === "string" && typeValue.trim()) {
    return true;
  }

  if (Array.isArray(typeValue)) {
    return typeValue.some((entry) => typeof entry === "string" && entry.trim());
  }

  return false;
}

function visitJsonNodes(
  node: unknown,
  visitor: (record: Record<string, unknown>) => void,
): void {
  if (!node || typeof node !== "object") {
    return;
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      visitJsonNodes(item, visitor);
    }
    return;
  }

  const record = node as Record<string, unknown>;
  visitor(record);

  const graph = record["@graph"];

  if (Array.isArray(graph)) {
    for (const item of graph) {
      visitJsonNodes(item, visitor);
    }
  }
}

function nodeIsValidSchemaRecord(record: Record<string, unknown>): boolean {
  return (
    hasValidTypeField(record["@type"]) &&
    isValidSchemaContext(record["@context"])
  );
}

function analyzeSchemaBlocks(html: string): SchemaBlockAnalysis {
  const $ = cheerio.load(html);
  let totalBlocks = 0;
  let validBlocks = 0;
  let invalidBlocks = 0;

  $('script[type="application/ld+json"]').each((_, element) => {
    const raw = $(element).html()?.trim();

    if (!raw) {
      return;
    }

    totalBlocks += 1;

    try {
      const parsed = JSON.parse(raw) as unknown;
      let blockValid = false;

      visitJsonNodes(parsed, (record) => {
        if (nodeIsValidSchemaRecord(record)) {
          blockValid = true;
        }
      });

      if (blockValid) {
        validBlocks += 1;
      } else {
        invalidBlocks += 1;
      }
    } catch {
      invalidBlocks += 1;
    }
  });

  return { totalBlocks, validBlocks, invalidBlocks };
}

function classifyCoreSignal(
  detected: boolean,
  anySchema: boolean,
): { passed: boolean; partial: boolean } {
  if (detected) {
    return { passed: true, partial: false };
  }

  if (anySchema) {
    return { passed: false, partial: true };
  }

  return { passed: false, partial: false };
}

function classifyOptionalSignal(detected: boolean): {
  passed: boolean;
  partial: boolean;
} {
  if (detected) {
    return { passed: true, partial: false };
  }

  return { passed: false, partial: true };
}

function assessContextAndType(
  blockAnalysis: SchemaBlockAnalysis,
  anySchema: boolean,
): { passed: boolean; partial: boolean; detail: string } {
  if (blockAnalysis.validBlocks > 0 && blockAnalysis.invalidBlocks === 0) {
    return {
      passed: true,
      partial: false,
      detail: `${blockAnalysis.validBlocks} JSON-LD block(s) include valid schema.org @context and @type.`,
    };
  }

  if (blockAnalysis.validBlocks > 0 && blockAnalysis.invalidBlocks > 0) {
    return {
      passed: false,
      partial: true,
      detail: `${blockAnalysis.validBlocks} valid and ${blockAnalysis.invalidBlocks} invalid JSON-LD block(s); fix blocks missing @context or @type.`,
    };
  }

  if (blockAnalysis.totalBlocks > 0) {
    return {
      passed: false,
      partial: true,
      detail: "JSON-LD blocks were found, but none include valid schema.org @context and @type.",
    };
  }

  if (anySchema) {
    return {
      passed: false,
      partial: true,
      detail: "Schema types were inferred, but no parseable JSON-LD blocks with @context and @type were found.",
    };
  }

  return {
    passed: false,
    partial: false,
    detail: "No JSON-LD blocks with valid schema.org @context and @type were detected.",
  };
}

function buildSignals(input: AdvancedSchemaAuditInput): AdvancedSchemaSignal[] {
  const blockAnalysis = analyzeSchemaBlocks(input.html);
  const anySchema = hasAnyDetectedSchema(input.schemaTypes, blockAnalysis);
  const organization = hasSchemaType(input.schemaTypes, ["Organization"]);
  const website = hasSchemaType(input.schemaTypes, ["WebSite"]);
  const webpage = hasSchemaType(input.schemaTypes, ["WebPage"]);
  const article = hasSchemaType(input.schemaTypes, [
    "Article",
    "BlogPosting",
    "NewsArticle",
  ]);
  const faq = hasSchemaType(input.schemaTypes, ["FAQPage"]);
  const breadcrumb = hasSchemaType(input.schemaTypes, ["BreadcrumbList"]);
  const productOrService = hasSchemaType(input.schemaTypes, ["Product", "Service"]);
  const localBusiness = hasSchemaType(input.schemaTypes, ["LocalBusiness"]);
  const contextSignal = assessContextAndType(blockAnalysis, anySchema);

  const orgState = classifyCoreSignal(organization, anySchema);
  const websiteState = classifyCoreSignal(website, anySchema);
  const webpageState = classifyCoreSignal(webpage, anySchema);
  const articleState = classifyOptionalSignal(article);
  const faqState = classifyOptionalSignal(faq);
  const breadcrumbState = classifyOptionalSignal(breadcrumb);
  const productState = classifyOptionalSignal(productOrService);
  const localState = classifyOptionalSignal(localBusiness);

  return [
    {
      id: "organization-schema",
      label: "Organization schema detected",
      passed: orgState.passed,
      partial: orgState.partial,
      passMessage: "Organization schema is present in JSON-LD.",
      failMessage: anySchema
        ? "Other schema types were found, but Organization schema is missing."
        : "No Organization schema was detected.",
      recommendation:
        "Add JSON-LD Organization markup with name, url, logo, and sameAs links.",
      estimatedGain: 8,
    },
    {
      id: "website-schema",
      label: "WebSite schema detected",
      passed: websiteState.passed,
      partial: websiteState.partial,
      passMessage: "WebSite schema is present in JSON-LD.",
      failMessage: anySchema
        ? "Other schema types were found, but WebSite schema is missing."
        : "No WebSite schema was detected.",
      recommendation:
        "Add WebSite schema with site name, url, and optional SearchAction.",
      estimatedGain: 7,
    },
    {
      id: "webpage-schema",
      label: "WebPage schema detected",
      passed: webpageState.passed,
      partial: webpageState.partial,
      passMessage: "WebPage schema is present in JSON-LD.",
      failMessage: anySchema
        ? "Other schema types were found, but WebPage schema is missing."
        : "No WebPage schema was detected.",
      recommendation: "Add WebPage schema describing this page URL and primary entity.",
      estimatedGain: 6,
    },
    {
      id: "article-schema",
      label: "Article/BlogPosting schema detected",
      passed: articleState.passed,
      partial: articleState.partial,
      passMessage: "Article or BlogPosting schema is present in JSON-LD.",
      failMessage:
        "No Article or BlogPosting schema detected (optional for non-article pages).",
      recommendation:
        "Add Article or BlogPosting schema when the page publishes editorial content.",
      estimatedGain: 5,
    },
    {
      id: "faq-schema",
      label: "FAQPage schema detected",
      passed: faqState.passed,
      partial: faqState.partial,
      passMessage: "FAQPage schema is present in JSON-LD.",
      failMessage: "No FAQPage schema detected (optional unless FAQ content exists).",
      recommendation:
        "Add FAQPage JSON-LD when visible FAQ questions and answers are on the page.",
      estimatedGain: 6,
    },
    {
      id: "breadcrumb-schema",
      label: "BreadcrumbList schema detected",
      passed: breadcrumbState.passed,
      partial: breadcrumbState.partial,
      passMessage: "BreadcrumbList schema is present in JSON-LD.",
      failMessage:
        "No BreadcrumbList schema detected (optional but helpful for navigation context).",
      recommendation: "Add BreadcrumbList schema matching visible breadcrumb navigation.",
      estimatedGain: 5,
    },
    {
      id: "product-service-schema",
      label: "Product/Service schema detected",
      passed: productState.passed,
      partial: productState.partial,
      passMessage: "Product or Service schema is present in JSON-LD.",
      failMessage:
        "No Product or Service schema detected (optional unless offering pages are present).",
      recommendation:
        "Add Product or Service schema on commercial or offering-focused pages.",
      estimatedGain: 5,
    },
    {
      id: "local-business-schema",
      label: "LocalBusiness schema detected",
      passed: localState.passed,
      partial: localState.partial,
      passMessage: "LocalBusiness schema is present in JSON-LD.",
      failMessage:
        "No LocalBusiness schema detected (optional unless local presence applies).",
      recommendation:
        "Add LocalBusiness schema with address, geo, and opening hours when relevant.",
      estimatedGain: 5,
    },
    {
      id: "schema-context-type",
      label: "Schema has valid @context and @type",
      passed: contextSignal.passed,
      partial: contextSignal.partial,
      passMessage: contextSignal.detail,
      failMessage: contextSignal.detail,
      recommendation:
        "Ensure each JSON-LD block includes schema.org @context and a valid @type value.",
      estimatedGain: 8,
    },
  ];
}

function signalToFinding(signal: AdvancedSchemaSignal): AuditFinding {
  const status = signal.passed ? "pass" : signal.partial ? "warning" : "fail";

  return {
    id: signal.id,
    label: signal.label,
    status,
    message: signal.passed || signal.partial ? signal.passMessage : signal.failMessage,
    recommendation: status === "pass" ? undefined : signal.recommendation,
  };
}

function signalToPoints(signal: AdvancedSchemaSignal): number {
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
          ? finding.id === "schema-context-type" ||
            finding.id === "organization-schema"
            ? "High"
            : "Medium"
          : "Medium",
      explanation: finding.message,
    }));
}

function buildRecommendations(
  signals: AdvancedSchemaSignal[],
): AuditRecommendation[] {
  return signals
    .filter((signal) => !signal.passed)
    .map((signal) => ({
      title: signal.partial
        ? `Strengthen ${signal.label.toLowerCase()}`
        : `Add ${signal.label.toLowerCase()}`,
      whyThisMatters:
        "Rich structured data helps Google and AI systems understand entities, page type, and content relationships.",
      howToFix: signal.recommendation,
      estimatedGain: signal.estimatedGain,
    }))
    .sort((left, right) => right.estimatedGain - left.estimatedGain);
}

export function runAdvancedSchemaAudit(
  input: AdvancedSchemaAuditInput,
): AdvancedSchemaAuditResult {
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

export function getAdvancedSchemaAuditSummary(
  result: AdvancedSchemaAuditResult,
): string {
  const passedCount = result.findings.filter((finding) => finding.status === "pass").length;

  if (result.status === "good") {
    return `${passedCount}/${SIGNAL_COUNT} advanced schema signals detected; structured data coverage is strong.`;
  }

  if (result.status === "warning") {
    return `${passedCount}/${SIGNAL_COUNT} advanced schema signals detected; add core or page-specific schema types to improve coverage.`;
  }

  return `Only ${passedCount}/${SIGNAL_COUNT} advanced schema signals detected; JSON-LD structured data needs attention.`;
}
