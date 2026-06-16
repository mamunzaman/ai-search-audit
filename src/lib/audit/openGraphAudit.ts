import type {
  AuditFinding,
  AuditIssue,
  AuditRecommendation,
  AIAuditStatus,
  OpenGraphAuditResult,
} from "@/types/audit";
import type { SocialMetadata } from "./types";

const SIGNAL_COUNT = 9;

const TITLE_MIN = 30;
const TITLE_MAX = 70;
const DESCRIPTION_MIN = 70;
const DESCRIPTION_MAX = 200;

type OpenGraphSignal = {
  id: string;
  label: string;
  passed: boolean;
  partial?: boolean;
  passMessage: string;
  failMessage: string;
  recommendation: string;
  estimatedGain: number;
};

export type OpenGraphAuditInput = {
  socialMetadata: SocialMetadata;
};

export const defaultOpenGraphAudit: OpenGraphAuditResult = {
  score: 0,
  status: "poor",
  findings: [],
  issues: [],
  recommendations: [],
};

function cleanText(value: string | undefined | null): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function isProtocolRelativeUrl(value: string): boolean {
  return value.startsWith("//");
}

function assessTitleLength(title: string): {
  passed: boolean;
  partial: boolean;
  detail: string;
} {
  if (!title) {
    return {
      passed: false,
      partial: false,
      detail: "No og:title value is available to evaluate length.",
    };
  }

  const length = title.length;

  if (length >= TITLE_MIN && length <= TITLE_MAX) {
    return {
      passed: true,
      partial: false,
      detail: `og:title length is ${length} characters (healthy range ${TITLE_MIN}-${TITLE_MAX}).`,
    };
  }

  if (length < TITLE_MIN) {
    return {
      passed: false,
      partial: true,
      detail: `og:title is only ${length} characters; aim for ${TITLE_MIN}-${TITLE_MAX} characters.`,
    };
  }

  return {
    passed: false,
    partial: true,
    detail: `og:title is ${length} characters; trim toward ${TITLE_MIN}-${TITLE_MAX} characters.`,
  };
}

function assessDescriptionLength(description: string): {
  passed: boolean;
  partial: boolean;
  detail: string;
} {
  if (!description) {
    return {
      passed: false,
      partial: false,
      detail: "No og:description value is available to evaluate length.",
    };
  }

  const length = description.length;

  if (length >= DESCRIPTION_MIN && length <= DESCRIPTION_MAX) {
    return {
      passed: true,
      partial: false,
      detail: `og:description length is ${length} characters (healthy range ${DESCRIPTION_MIN}-${DESCRIPTION_MAX}).`,
    };
  }

  if (length < DESCRIPTION_MIN) {
    return {
      passed: false,
      partial: true,
      detail: `og:description is only ${length} characters; aim for ${DESCRIPTION_MIN}-${DESCRIPTION_MAX} characters.`,
    };
  }

  return {
    passed: false,
    partial: true,
    detail: `og:description is ${length} characters; trim toward ${DESCRIPTION_MAX} characters.`,
  };
}

function assessImageUrl(image: string): {
  passed: boolean;
  partial: boolean;
  detail: string;
} {
  if (!image) {
    return {
      passed: false,
      partial: false,
      detail: "No og:image value is available to validate URL format.",
    };
  }

  if (isAbsoluteUrl(image)) {
    return {
      passed: true,
      partial: false,
      detail: "og:image uses an absolute URL suitable for social and AI previews.",
    };
  }

  if (isProtocolRelativeUrl(image) || image.startsWith("/")) {
    return {
      passed: false,
      partial: true,
      detail: "og:image uses a relative URL; social platforms require an absolute HTTPS URL.",
    };
  }

  return {
    passed: false,
    partial: true,
    detail: "og:image URL format may not resolve correctly in link previews.",
  };
}

function buildSignals(input: OpenGraphAuditInput): OpenGraphSignal[] {
  const { openGraph } = input.socialMetadata;
  const title = cleanText(openGraph.title);
  const description = cleanText(openGraph.description);
  const image = cleanText(openGraph.image);
  const url = cleanText(openGraph.url);
  const type = cleanText(openGraph.type);
  const siteName = cleanText(openGraph.siteName);
  const titleLength = assessTitleLength(title);
  const descriptionLength = assessDescriptionLength(description);
  const imageUrl = assessImageUrl(image);

  return [
    {
      id: "og-title",
      label: "og:title detected",
      passed: Boolean(title),
      passMessage: `og:title found: "${title.slice(0, 80)}${title.length > 80 ? "…" : ""}".`,
      failMessage: "No og:title meta tag was found.",
      recommendation: "Add a unique og:title that matches the page headline for social previews.",
      estimatedGain: 7,
    },
    {
      id: "og-description",
      label: "og:description detected",
      passed: Boolean(description),
      passMessage: `og:description found (${description.length} characters).`,
      failMessage: "No og:description meta tag was found.",
      recommendation:
        "Add og:description with a concise summary for LinkedIn, Slack, and AI link cards.",
      estimatedGain: 7,
    },
    {
      id: "og-image",
      label: "og:image detected",
      passed: Boolean(image),
      passMessage: "og:image tag found for rich link previews.",
      failMessage: "No og:image meta tag was found.",
      recommendation: "Add og:image pointing to a 1200×630 preview image.",
      estimatedGain: 8,
    },
    {
      id: "og-url",
      label: "og:url detected",
      passed: Boolean(url),
      passMessage: url
        ? `og:url set to ${url}.`
        : "og:url canonical URL was detected.",
      failMessage: "No og:url meta tag was found.",
      recommendation: "Add og:url with the canonical page URL to avoid duplicate preview URLs.",
      estimatedGain: 5,
    },
    {
      id: "og-type",
      label: "og:type detected",
      passed: Boolean(type),
      passMessage: type ? `og:type set to "${type}".` : "og:type was detected.",
      failMessage: "No og:type meta tag was found.",
      recommendation: "Add og:type (for example website or article) to classify the page for previews.",
      estimatedGain: 4,
    },
    {
      id: "og-site-name",
      label: "og:site_name detected",
      passed: Boolean(siteName),
      passMessage: siteName
        ? `og:site_name set to "${siteName}".`
        : "og:site_name was detected.",
      failMessage: "No og:site_name meta tag was found.",
      recommendation: "Add og:site_name with your brand or site name for consistent previews.",
      estimatedGain: 4,
    },
    {
      id: "og-title-length",
      label: "og:title length is healthy",
      passed: titleLength.passed,
      partial: titleLength.partial,
      passMessage: titleLength.detail,
      failMessage: titleLength.detail,
      recommendation: `Keep og:title between ${TITLE_MIN} and ${TITLE_MAX} characters for optimal previews.`,
      estimatedGain: 5,
    },
    {
      id: "og-description-length",
      label: "og:description length is healthy",
      passed: descriptionLength.passed,
      partial: descriptionLength.partial,
      passMessage: descriptionLength.detail,
      failMessage: descriptionLength.detail,
      recommendation: `Keep og:description between ${DESCRIPTION_MIN} and ${DESCRIPTION_MAX} characters.`,
      estimatedGain: 5,
    },
    {
      id: "og-image-absolute-url",
      label: "og:image uses absolute URL",
      passed: imageUrl.passed,
      partial: imageUrl.partial,
      passMessage: imageUrl.detail,
      failMessage: imageUrl.detail,
      recommendation: "Use a fully qualified HTTPS URL for og:image (not a relative path).",
      estimatedGain: 6,
    },
  ];
}

function signalToFinding(signal: OpenGraphSignal): AuditFinding {
  const status = signal.passed ? "pass" : signal.partial ? "warning" : "fail";

  return {
    id: signal.id,
    label: signal.label,
    status,
    message: signal.passed || signal.partial ? signal.passMessage : signal.failMessage,
    recommendation: status === "pass" ? undefined : signal.recommendation,
  };
}

function signalToPoints(signal: OpenGraphSignal): number {
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
          ? finding.id === "og-image" || finding.id === "og-title"
            ? "High"
            : "Medium"
          : "Medium",
      explanation: finding.message,
    }));
}

function buildRecommendations(signals: OpenGraphSignal[]): AuditRecommendation[] {
  return signals
    .filter((signal) => !signal.passed)
    .map((signal) => ({
      title: signal.partial
        ? `Improve ${signal.label.toLowerCase()}`
        : `Add ${signal.label.toLowerCase()}`,
      whyThisMatters:
        "Open Graph metadata controls how LinkedIn, Facebook, Slack, WhatsApp, and AI systems render link previews.",
      howToFix: signal.recommendation,
      estimatedGain: signal.estimatedGain,
    }))
    .sort((left, right) => right.estimatedGain - left.estimatedGain);
}

export function runOpenGraphAudit(input: OpenGraphAuditInput): OpenGraphAuditResult {
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

export function getOpenGraphAuditSummary(result: OpenGraphAuditResult): string {
  const passedCount = result.findings.filter((finding) => finding.status === "pass").length;

  if (result.status === "good") {
    return `${passedCount}/${SIGNAL_COUNT} Open Graph signals are healthy for social and AI previews.`;
  }

  if (result.status === "warning") {
    return `${passedCount}/${SIGNAL_COUNT} Open Graph signals detected; preview metadata needs refinement.`;
  }

  return `Only ${passedCount}/${SIGNAL_COUNT} Open Graph signals detected; link previews will be incomplete.`;
}
