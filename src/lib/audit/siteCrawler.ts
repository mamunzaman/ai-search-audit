import * as cheerio from "cheerio";
import { fetchPage } from "./fetch-page";
import { parseHtml } from "./html-parser";
import type { CrawledPage, SiteCrawlResult } from "@/types/audit";

const DEFAULT_MAX_PAGES = 5;

const PRIORITY_PATH_PREFIXES = [
  "/",
  "/about",
  "/services",
  "/contact",
  "/blog",
  "/pricing",
];

const IGNORED_EXTENSIONS =
  /\.(pdf|jpe?g|png|gif|webp|svg|zip|docx?|xlsx?|pptx?|mp4|mp3|wav|css|js|xml|json|ico|woff2?|ttf|eot)$/i;

export type CrawlSiteOptions = {
  maxPages?: number;
};

function cleanText(value: string | undefined | null): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function getOrigin(url: string): string {
  return new URL(url).origin;
}

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === "/") {
    return "/";
  }

  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed || "/";
}

export function normalizeCrawlUrl(url: string, origin: string): string | null {
  if (
    !url ||
    url.startsWith("#") ||
    url.startsWith("mailto:") ||
    url.startsWith("tel:") ||
    url.startsWith("javascript:")
  ) {
    return null;
  }

  try {
    const parsed = new URL(url, origin);

    if (parsed.origin !== origin) {
      return null;
    }

    if (IGNORED_EXTENSIONS.test(parsed.pathname)) {
      return null;
    }

    parsed.hash = "";
    parsed.pathname = normalizePathname(parsed.pathname);

    return parsed.toString();
  } catch {
    return null;
  }
}

function pathPriority(pathname: string): number {
  const normalized = normalizePathname(pathname).toLowerCase();

  for (let index = 0; index < PRIORITY_PATH_PREFIXES.length; index += 1) {
    const prefix = PRIORITY_PATH_PREFIXES[index].toLowerCase();

    if (prefix === "/" && normalized === "/") {
      return index;
    }

    if (prefix !== "/" && (normalized === prefix || normalized.startsWith(`${prefix}/`))) {
      return index;
    }
  }

  return PRIORITY_PATH_PREFIXES.length + 10;
}

function compareUrlPriority(left: string, right: string): number {
  const leftPath = new URL(left).pathname;
  const rightPath = new URL(right).pathname;
  const priorityDiff = pathPriority(leftPath) - pathPriority(rightPath);

  if (priorityDiff !== 0) {
    return priorityDiff;
  }

  return left.localeCompare(right);
}

function extractPageText(html: string): string {
  const $ = cheerio.load(html);
  $("script, style, noscript").remove();
  return cleanText($("body").text());
}

function extractInternalLinks(html: string, pageUrl: string, origin: string): string[] {
  const $ = cheerio.load(html);
  const links = new Set<string>();

  $("a[href]").each((_, element) => {
    const href = cleanText($(element).attr("href"));
    const normalized = normalizeCrawlUrl(href, origin);

    if (normalized) {
      links.add(normalized);
    }
  });

  return Array.from(links).sort((left, right) => compareUrlPriority(left, right));
}

function toCrawledPage(
  url: string,
  statusCode: number,
  html: string,
): CrawledPage {
  const parsed = parseHtml(html, url);

  return {
    url,
    title: parsed.title || undefined,
    statusCode,
    html,
    text: extractPageText(html),
    links: extractInternalLinks(html, url, getOrigin(url)),
  };
}

export function createFallbackSiteCrawl(
  startUrl: string,
  page: { finalUrl: string; statusCode: number; html: string },
  maxPages = DEFAULT_MAX_PAGES,
): SiteCrawlResult {
  const crawledPage = toCrawledPage(page.finalUrl, page.statusCode, page.html);

  return {
    startUrl,
    pages: [crawledPage],
    discoveredUrls: crawledPage.links,
    failedUrls: [],
    maxPages,
  };
}

export async function crawlSite(
  startUrl: string,
  options?: CrawlSiteOptions,
): Promise<SiteCrawlResult> {
  const maxPages = Math.max(1, Math.min(options?.maxPages ?? DEFAULT_MAX_PAGES, 5));
  const origin = getOrigin(startUrl);
  const visited = new Set<string>();
  const failedUrls: string[] = [];
  const discovered = new Set<string>();
  const pages: CrawledPage[] = [];
  const queue: string[] = [];

  const startNormalized = normalizeCrawlUrl(startUrl, origin);

  if (!startNormalized) {
    throw new Error("Invalid start URL for crawl.");
  }

  const startPage = await fetchPage(startNormalized);
  const startFinalUrl =
    normalizeCrawlUrl(startPage.finalUrl, origin) ?? startNormalized;

  visited.add(startFinalUrl);
  discovered.add(startFinalUrl);

  const crawledStart = toCrawledPage(
    startFinalUrl,
    startPage.statusCode,
    startPage.html,
  );
  pages.push(crawledStart);

  for (const link of crawledStart.links) {
    discovered.add(link);

    if (!visited.has(link)) {
      queue.push(link);
    }
  }

  queue.sort(compareUrlPriority);

  while (pages.length < maxPages && queue.length > 0) {
    const nextUrl = queue.shift();

    if (!nextUrl || visited.has(nextUrl)) {
      continue;
    }

    visited.add(nextUrl);

    try {
      const fetched = await fetchPage(nextUrl);
      const finalUrl =
        normalizeCrawlUrl(fetched.finalUrl, origin) ?? nextUrl;

      if (visited.has(finalUrl) && finalUrl !== nextUrl) {
        continue;
      }

      visited.add(finalUrl);
      const crawledPage = toCrawledPage(
        finalUrl,
        fetched.statusCode,
        fetched.html,
      );
      pages.push(crawledPage);

      for (const link of crawledPage.links) {
        discovered.add(link);

        if (!visited.has(link) && !queue.includes(link)) {
          queue.push(link);
        }
      }

      queue.sort(compareUrlPriority);
    } catch {
      failedUrls.push(nextUrl);
    }
  }

  return {
    startUrl,
    pages,
    discoveredUrls: Array.from(discovered).sort(compareUrlPriority),
    failedUrls,
    maxPages,
  };
}

export const defaultSiteCrawl: SiteCrawlResult = {
  startUrl: "",
  pages: [],
  discoveredUrls: [],
  failedUrls: [],
  maxPages: DEFAULT_MAX_PAGES,
};
