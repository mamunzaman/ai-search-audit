import type {
  AuditFinding,
  AuditIssue,
  AuditRecommendation,
  AIAuditStatus,
  TwitterCardAuditResult,
} from "@/types/audit";
import type { SocialMetadata } from "./types";

const SIGNAL_COUNT = 9;

const TITLE_MIN = 30;
const TITLE_MAX = 70;
const DESCRIPTION_MIN = 70;
const DESCRIPTION_MAX = 200;

type TwitterCardSignal = {
  id: string;
  label: string;
  passed: boolean;
  partial?: boolean;
  passMessage: string;
  failMessage: string;
  recommendation: string;
  estimatedGain: number;
};

export type TwitterCardAuditInput = {
  socialMetadata: SocialMetadata;
};

export const defaultTwitterCardAudit: TwitterCardAuditResult = {
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
      detail: "No twitter:title value is available to evaluate length.",
    };
  }

  const length = title.length;

  if (length >= TITLE_MIN && length <= TITLE_MAX) {
    return {
      passed: true,
      partial: false,
      detail: `twitter:title length is ${length} characters (healthy range ${TITLE_MIN}-${TITLE_MAX}).`,
    };
  }

  if (length < TITLE_MIN) {
    return {
      passed: false,
      partial: true,
      detail: `twitter:title is only ${length} characters; aim for ${TITLE_MIN}-${TITLE_MAX} characters.`,
    };
  }

  return {
    passed: false,
    partial: true,
    detail: `twitter:title is ${length} characters; trim toward ${TITLE_MIN}-${TITLE_MAX} characters.`,
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
      detail: "No twitter:description value is available to evaluate length.",
    };
  }

  const length = description.length;

  if (length >= DESCRIPTION_MIN && length <= DESCRIPTION_MAX) {
    return {
      passed: true,
      partial: false,
      detail: `twitter:description length is ${length} characters (healthy range ${DESCRIPTION_MIN}-${DESCRIPTION_MAX}).`,
    };
  }

  if (length < DESCRIPTION_MIN) {
    return {
      passed: false,
      partial: true,
      detail: `twitter:description is only ${length} characters; aim for ${DESCRIPTION_MIN}-${DESCRIPTION_MAX} characters.`,
    };
  }

  return {
    passed: false,
    partial: true,
    detail: `twitter:description is ${length} characters; trim toward ${DESCRIPTION_MAX} characters.`,
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
      detail: "No twitter:image value is available to validate URL format.",
    };
  }

  if (isAbsoluteUrl(image)) {
    return {
      passed: true,
      partial: false,
      detail: "twitter:image uses an absolute URL suitable for X/Twitter previews.",
    };
  }

  if (isProtocolRelativeUrl(image) || image.startsWith("/")) {
    return {
      passed: false,
      partial: true,
      detail: "twitter:image uses a relative URL; X/Twitter requires an absolute HTTPS URL.",
    };
  }

  return {
    passed: false,
    partial: true,
    detail: "twitter:image URL format may not resolve correctly in X/Twitter previews.",
  };
}

function buildSignals(input: TwitterCardAuditInput): TwitterCardSignal[] {
  const { twitter } = input.socialMetadata;
  const card = cleanText(twitter.card);
  const title = cleanText(twitter.title);
  const description = cleanText(twitter.description);
  const image = cleanText(twitter.image);
  const site = cleanText(twitter.site);
  const creator = cleanText(twitter.creator);
  const titleLength = assessTitleLength(title);
  const descriptionLength = assessDescriptionLength(description);
  const imageUrl = assessImageUrl(image);

  return [
    {
      id: "twitter-card",
      label: "twitter:card detected",
      passed: Boolean(card),
      passMessage: card ? `twitter:card set to "${card}".` : "twitter:card was detected.",
      failMessage: "No twitter:card meta tag was found.",
      recommendation: 'Add twitter:card (for example summary_large_image or summary).',
      estimatedGain: 8,
    },
    {
      id: "twitter-title",
      label: "twitter:title detected",
      passed: Boolean(title),
      passMessage: `twitter:title found: "${title.slice(0, 80)}${title.length > 80 ? "…" : ""}".`,
      failMessage: "No twitter:title meta tag was found.",
      recommendation: "Add twitter:title for X/Twitter link preview headlines.",
      estimatedGain: 7,
    },
    {
      id: "twitter-description",
      label: "twitter:description detected",
      passed: Boolean(description),
      passMessage: `twitter:description found (${description.length} characters).`,
      failMessage: "No twitter:description meta tag was found.",
      recommendation: "Add twitter:description with a concise summary for X/Twitter cards.",
      estimatedGain: 7,
    },
    {
      id: "twitter-image",
      label: "twitter:image detected",
      passed: Boolean(image),
      passMessage: "twitter:image tag found for rich X/Twitter previews.",
      failMessage: "No twitter:image meta tag was found.",
      recommendation: "Add twitter:image pointing to a 1200×675 or 800×418 preview image.",
      estimatedGain: 8,
    },
    {
      id: "twitter-site",
      label: "twitter:site detected",
      passed: Boolean(site),
      passMessage: site ? `twitter:site set to ${site}.` : "twitter:site was detected.",
      failMessage: "No twitter:site meta tag was found.",
      recommendation: "Add twitter:site with your brand @handle for attribution on X/Twitter.",
      estimatedGain: 5,
    },
    {
      id: "twitter-creator",
      label: "twitter:creator detected",
      passed: Boolean(creator),
      passMessage: creator ? `twitter:creator set to ${creator}.` : "twitter:creator was detected.",
      failMessage: "No twitter:creator meta tag was found.",
      recommendation: "Add twitter:creator with the content author @handle when applicable.",
      estimatedGain: 4,
    },
    {
      id: "twitter-title-length",
      label: "twitter:title length is healthy",
      passed: titleLength.passed,
      partial: titleLength.partial,
      passMessage: titleLength.detail,
      failMessage: titleLength.detail,
      recommendation: `Keep twitter:title between ${TITLE_MIN} and ${TITLE_MAX} characters for optimal previews.`,
      estimatedGain: 5,
    },
    {
      id: "twitter-description-length",
      label: "twitter:description length is healthy",
      passed: descriptionLength.passed,
      partial: descriptionLength.partial,
      passMessage: descriptionLength.detail,
      failMessage: descriptionLength.detail,
      recommendation: `Keep twitter:description between ${DESCRIPTION_MIN} and ${DESCRIPTION_MAX} characters.`,
      estimatedGain: 5,
    },
    {
      id: "twitter-image-absolute-url",
      label: "twitter:image uses absolute URL",
      passed: imageUrl.passed,
      partial: imageUrl.partial,
      passMessage: imageUrl.detail,
      failMessage: imageUrl.detail,
      recommendation: "Use a fully qualified HTTPS URL for twitter:image (not a relative path).",
      estimatedGain: 6,
    },
  ];
}

function signalToFinding(signal: TwitterCardSignal): AuditFinding {
  const status = signal.passed ? "pass" : signal.partial ? "warning" : "fail";

  return {
    id: signal.id,
    label: signal.label,
    status,
    message: signal.passed || signal.partial ? signal.passMessage : signal.failMessage,
    recommendation: status === "pass" ? undefined : signal.recommendation,
  };
}

function signalToPoints(signal: TwitterCardSignal): number {
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
          ? finding.id === "twitter-image" ||
            finding.id === "twitter-card" ||
            finding.id === "twitter-title"
            ? "High"
            : "Medium"
          : "Medium",
      explanation: finding.message,
    }));
}

function buildRecommendations(signals: TwitterCardSignal[]): AuditRecommendation[] {
  return signals
    .filter((signal) => !signal.passed)
    .map((signal) => ({
      title: signal.partial
        ? `Improve ${signal.label.toLowerCase()}`
        : `Add ${signal.label.toLowerCase()}`,
      whyThisMatters:
        "Twitter Card metadata controls how links render on X/Twitter and complements Open Graph previews.",
      howToFix: signal.recommendation,
      estimatedGain: signal.estimatedGain,
    }))
    .sort((left, right) => right.estimatedGain - left.estimatedGain);
}

export function runTwitterCardAudit(
  input: TwitterCardAuditInput,
): TwitterCardAuditResult {
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

export function getTwitterCardAuditSummary(result: TwitterCardAuditResult): string {
  const passedCount = result.findings.filter((finding) => finding.status === "pass").length;

  if (result.status === "good") {
    return `${passedCount}/${SIGNAL_COUNT} Twitter Card signals are healthy for X/Twitter previews.`;
  }

  if (result.status === "warning") {
    return `${passedCount}/${SIGNAL_COUNT} Twitter Card signals detected; preview metadata needs refinement.`;
  }

  return `Only ${passedCount}/${SIGNAL_COUNT} Twitter Card signals detected; X/Twitter previews will be incomplete.`;
}
