import { hasTrustPages } from "./trust-signals";
import type {
  AiVisibilitySignals,
  AuditCheck,
  AuditHeadings,
  AuditLinks,
  TrustSignals,
} from "./types";

type DetectAiVisibilitySignalsInput = {
  title: string;
  metaDescription: string;
  headings: AuditHeadings;
  links: AuditLinks;
  schemaTypes: string[];
  trustSignals: TrustSignals;
  html?: string;
};

const FAQ_TEXT_PATTERN =
  /\b(faq|frequently asked questions|häufig gestellte fragen|questions and answers)\b/i;

function hasSchemaType(schemaTypes: string[], type: string): boolean {
  return schemaTypes.some(
    (schemaType) => schemaType.toLowerCase() === type.toLowerCase(),
  );
}

function hasStructuredHeadings(headings: AuditHeadings): boolean {
  const totalHeadings =
    headings.h1.length + headings.h2.length + headings.h3.length;

  return headings.h1.length === 1 && headings.h2.length >= 1 && totalHeadings >= 3;
}

export function hasVisibleFaqHints(
  html: string | undefined,
  headings: AuditHeadings,
): boolean {
  if (html && FAQ_TEXT_PATTERN.test(html)) {
    return true;
  }

  return [...headings.h2, ...headings.h3].some((heading) => heading.includes("?"));
}

export function detectAiVisibilitySignals(
  input: DetectAiVisibilitySignalsInput,
): AiVisibilitySignals {
  const visibleFaqHints = hasVisibleFaqHints(input.html, input.headings);

  return {
    organizationSchema: hasSchemaType(input.schemaTypes, "Organization"),
    faqSchema: hasSchemaType(input.schemaTypes, "FAQPage"),
    clearH1: input.headings.h1.length === 1,
    metaDescription: Boolean(input.metaDescription),
    structuredHeadings: hasStructuredHeadings(input.headings),
    internalLinks: input.links.internal > 0,
    trustPages: hasTrustPages(input.trustSignals),
    visibleFaqHints,
  };
}

type RunTrustAndAiChecksInput = {
  trustSignals: TrustSignals;
  aiVisibilitySignals: AiVisibilitySignals;
  visibleFaqHints: boolean;
};

export function runTrustAndAiChecks(
  input: RunTrustAndAiChecksInput,
): AuditCheck[] {
  const { trustSignals, aiVisibilitySignals, visibleFaqHints } = input;

  return [
    {
      id: "about-page-detected",
      label: "About page detected",
      status: trustSignals.aboutPage ? "pass" : "warn",
      message: trustSignals.aboutPage
        ? "A link to an About page was detected."
        : "No About page link was detected.",
    },
    {
      id: "contact-page-detected",
      label: "Contact page detected",
      status: trustSignals.contactPage ? "pass" : "warn",
      message: trustSignals.contactPage
        ? "A link to a Contact page was detected."
        : "No Contact page link was detected.",
    },
    {
      id: "privacy-legal-page-detected",
      label: "Privacy/legal page detected",
      status:
        trustSignals.privacyPage || trustSignals.legalPage ? "pass" : "warn",
      message:
        trustSignals.privacyPage || trustSignals.legalPage
          ? `Detected ${[
              trustSignals.privacyPage ? "privacy" : null,
              trustSignals.legalPage ? "legal/imprint" : null,
            ]
              .filter(Boolean)
              .join(" and ")} page link(s).`
          : "No privacy or legal/imprint page link was detected.",
    },
    {
      id: "social-links-detected",
      label: "Social links detected",
      status: trustSignals.socialLinks > 0 ? "pass" : "warn",
      message:
        trustSignals.socialLinks > 0
          ? `Found ${trustSignals.socialLinks} social profile link(s).`
          : "No social profile links were detected.",
    },
    {
      id: "organization-schema-detected",
      label: "Organization schema detected",
      status: aiVisibilitySignals.organizationSchema ? "pass" : "warn",
      message: aiVisibilitySignals.organizationSchema
        ? "Organization schema is present in JSON-LD."
        : "Organization schema was not detected.",
    },
    {
      id: "faq-schema-detected",
      label: "FAQ schema detected",
      status: aiVisibilitySignals.faqSchema ? "pass" : "warn",
      message: aiVisibilitySignals.faqSchema
        ? "FAQPage schema is present in JSON-LD."
        : visibleFaqHints
          ? "FAQ-style content hints were found, but FAQPage schema is missing."
          : "FAQPage schema was not detected.",
    },
  ];
}
