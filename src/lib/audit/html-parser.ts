import * as cheerio from "cheerio";
import type { AuditLinks, ParsedAnchor, ParsedPageData } from "./types";

function cleanText(value: string | undefined | null): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

function extractHeadings($: cheerio.CheerioAPI, tag: HeadingTag): string[] {
  const headings: string[] = [];

  $(tag).each((_, element) => {
    const text = cleanText($(element).text());
    if (text) {
      headings.push(text);
    }
  });

  return headings;
}

function countLinks($: cheerio.CheerioAPI, baseUrl: string): AuditLinks {
  const base = new URL(baseUrl);
  let internal = 0;
  let external = 0;

  $("a[href]").each((_, element) => {
    const href = cleanText($(element).attr("href"));

    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:")
    ) {
      return;
    }

    try {
      const resolved = new URL(href, baseUrl);

      if (resolved.hostname === base.hostname) {
        internal += 1;
      } else {
        external += 1;
      }
    } catch {
      return;
    }
  });

  return { internal, external };
}

function extractAnchors($: cheerio.CheerioAPI): ParsedAnchor[] {
  const anchors: ParsedAnchor[] = [];

  $("a[href]").each((_, element) => {
    const href = cleanText($(element).attr("href"));
    const text = cleanText($(element).text());

    if (href) {
      anchors.push({ href, text });
    }
  });

  return anchors;
}

export function parseHtml(html: string, pageUrl: string): ParsedPageData {
  const $ = cheerio.load(html);

  const title = cleanText($("title").first().text()) ||
    cleanText($('meta[property="og:title"]').attr("content"));

  const metaDescription =
    cleanText($('meta[name="description"]').attr("content")) ||
    cleanText($('meta[property="og:description"]').attr("content"));

  const canonical = cleanText($('link[rel="canonical"]').attr("href"));
  const robotsMeta = cleanText($('meta[name="robots"]').attr("content"));

  return {
    title,
    metaDescription,
    headings: {
      h1: extractHeadings($, "h1"),
      h2: extractHeadings($, "h2"),
      h3: extractHeadings($, "h3"),
      h4: extractHeadings($, "h4"),
      h5: extractHeadings($, "h5"),
      h6: extractHeadings($, "h6"),
    },
    canonical,
    robotsMeta,
    links: countLinks($, pageUrl),
    anchors: extractAnchors($),
  };
}
