import * as cheerio from "cheerio";
import type { AuditCheck, SocialMetadata } from "./types";

function cleanText(value: string | undefined | null): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function getMetaContent(
  $: cheerio.CheerioAPI,
  selectors: string[],
): string | undefined {
  for (const selector of selectors) {
    const content = cleanText($(selector).attr("content"));
    if (content) {
      return content;
    }
  }

  return undefined;
}

export const defaultSocialMetadata: SocialMetadata = {
  openGraph: {},
  twitter: {},
};

export function extractSocialMetadata(html: string): SocialMetadata {
  const $ = cheerio.load(html);

  return {
    openGraph: {
      title: getMetaContent($, ['meta[property="og:title"]']),
      description: getMetaContent($, ['meta[property="og:description"]']),
      image: getMetaContent($, ['meta[property="og:image"]']),
      url: getMetaContent($, ['meta[property="og:url"]']),
      type: getMetaContent($, ['meta[property="og:type"]']),
      siteName: getMetaContent($, ['meta[property="og:site_name"]']),
    },
    twitter: {
      card: getMetaContent($, [
        'meta[name="twitter:card"]',
        'meta[property="twitter:card"]',
      ]),
      title: getMetaContent($, [
        'meta[name="twitter:title"]',
        'meta[property="twitter:title"]',
      ]),
      description: getMetaContent($, [
        'meta[name="twitter:description"]',
        'meta[property="twitter:description"]',
      ]),
      image: getMetaContent($, [
        'meta[name="twitter:image"]',
        'meta[property="twitter:image"]',
      ]),
      site: getMetaContent($, [
        'meta[name="twitter:site"]',
        'meta[property="twitter:site"]',
      ]),
      creator: getMetaContent($, [
        'meta[name="twitter:creator"]',
        'meta[property="twitter:creator"]',
      ]),
    },
  };
}

export function hasCompleteOpenGraph(socialMetadata: SocialMetadata): boolean {
  const { openGraph } = socialMetadata;
  return Boolean(openGraph.title && openGraph.description && openGraph.image);
}

export function hasTwitterCard(socialMetadata: SocialMetadata): boolean {
  return Boolean(socialMetadata.twitter.card);
}

export function runSocialMetadataChecks(
  socialMetadata: SocialMetadata,
): AuditCheck[] {
  const { openGraph, twitter } = socialMetadata;

  return [
    {
      id: "open-graph-title-detected",
      label: "Open Graph title detected",
      status: openGraph.title ? "pass" : "warn",
      message: openGraph.title
        ? "og:title tag found for social and AI link previews."
        : "No og:title tag was found.",
    },
    {
      id: "open-graph-description-detected",
      label: "Open Graph description detected",
      status: openGraph.description ? "pass" : "warn",
      message: openGraph.description
        ? "og:description tag found for social and AI summaries."
        : "No og:description tag was found.",
    },
    {
      id: "open-graph-image-detected",
      label: "Open Graph image detected",
      status: openGraph.image ? "pass" : "warn",
      message: openGraph.image
        ? "og:image tag found for rich link previews."
        : "No og:image tag was found.",
    },
    {
      id: "twitter-card-detected",
      label: "Twitter Card detected",
      status: twitter.card ? "pass" : "warn",
      message: twitter.card
        ? `twitter:card set to "${twitter.card}".`
        : "No twitter:card tag was found.",
    },
  ];
}
