import type { ParsedAnchor, TrustSignals } from "./types";

const ABOUT_PATTERNS = [
  /about/i,
  /über-uns/i,
  /ueber-uns/i,
  /who-we-are/i,
  /unternehmen/i,
];

const CONTACT_PATTERNS = [/contact/i, /kontakt/i, /get-in-touch/i];

const PRIVACY_PATTERNS = [
  /privacy/i,
  /datenschutz/i,
  /datenschutzerklärung/i,
  /datenschutzerklaerung/i,
  /data-protection/i,
];

const LEGAL_PATTERNS = [
  /terms/i,
  /imprint/i,
  /impressum/i,
  /legal/i,
  /agb/i,
  /rechtliches/i,
  /nutzungsbedingungen/i,
  /disclaimer/i,
];

const SOCIAL_HOSTS = [
  "facebook.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "instagram.com",
  "youtube.com",
  "tiktok.com",
  "pinterest.com",
];

const AUTHORITY_HOSTS = [
  "wikipedia.org",
  "wikidata.org",
  "google.com/maps",
  "maps.google.com",
];

type DetectTrustSignalsInput = {
  pageUrl: string;
  anchors: ParsedAnchor[];
};

function matchesPatterns(
  href: string,
  text: string,
  patterns: RegExp[],
): boolean {
  const combined = `${href} ${text}`;

  return patterns.some((pattern) => pattern.test(combined));
}

function resolveAnchorUrl(href: string, pageUrl: string): URL | null {
  try {
    return new URL(href, pageUrl);
  } catch {
    return null;
  }
}

function isSkippableHref(href: string): boolean {
  return (
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("javascript:")
  );
}

function isSocialHost(hostname: string): boolean {
  const host = hostname.toLowerCase();

  return SOCIAL_HOSTS.some(
    (socialHost) => host === socialHost || host.endsWith(`.${socialHost}`),
  );
}

function isAuthorityHost(hostname: string): boolean {
  const host = hostname.toLowerCase();

  if (AUTHORITY_HOSTS.some((authorityHost) => host.includes(authorityHost))) {
    return true;
  }

  return /\.(gov|edu)(\.|$)/i.test(host);
}

export function detectTrustSignals(
  input: DetectTrustSignalsInput,
): TrustSignals {
  const base = new URL(input.pageUrl);
  let aboutPage = false;
  let contactPage = false;
  let privacyPage = false;
  let legalPage = false;
  let socialLinks = 0;
  let externalAuthorityLinks = 0;
  const seenSocialHosts = new Set<string>();
  const seenAuthorityHosts = new Set<string>();

  for (const anchor of input.anchors) {
    const { href, text } = anchor;

    if (!href || isSkippableHref(href)) {
      continue;
    }

    if (matchesPatterns(href, text, ABOUT_PATTERNS)) {
      aboutPage = true;
    }

    if (matchesPatterns(href, text, CONTACT_PATTERNS)) {
      contactPage = true;
    }

    if (matchesPatterns(href, text, PRIVACY_PATTERNS)) {
      privacyPage = true;
    }

    if (matchesPatterns(href, text, LEGAL_PATTERNS)) {
      legalPage = true;
    }

    const resolved = resolveAnchorUrl(href, input.pageUrl);

    if (!resolved) {
      continue;
    }

    if (resolved.hostname !== base.hostname) {
      if (isSocialHost(resolved.hostname)) {
        const socialKey = resolved.hostname.toLowerCase();

        if (!seenSocialHosts.has(socialKey)) {
          seenSocialHosts.add(socialKey);
          socialLinks += 1;
        }
      }

      if (isAuthorityHost(resolved.hostname)) {
        const authorityKey = resolved.hostname.toLowerCase();

        if (!seenAuthorityHosts.has(authorityKey)) {
          seenAuthorityHosts.add(authorityKey);
          externalAuthorityLinks += 1;
        }
      }
    }
  }

  return {
    aboutPage,
    contactPage,
    privacyPage,
    legalPage,
    socialLinks,
    externalAuthorityLinks,
  };
}

export function hasTrustPages(trustSignals: TrustSignals): boolean {
  return (
    trustSignals.aboutPage ||
    trustSignals.contactPage ||
    trustSignals.privacyPage ||
    trustSignals.legalPage
  );
}
