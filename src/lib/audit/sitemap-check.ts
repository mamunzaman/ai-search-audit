import { getRobotsSitemapUrls } from "./robots-check";
import type { AuditCheck, RobotsAnalysis, SitemapAnalysis } from "./types";

const FETCH_TIMEOUT_MS = 10_000;
const MAX_SITEMAPS_TO_FETCH = 3;
const MAX_SAMPLE_URLS = 10;

export const defaultSitemapAnalysis: SitemapAnalysis = {
  exists: false,
  source: "none",
  sitemapCount: 0,
  urlCount: 0,
  childSitemapCount: 0,
  sampleUrls: [],
};

type ParsedSitemapXml = {
  isUrlSet: boolean;
  isSitemapIndex: boolean;
  locs: string[];
};

function getDefaultSitemapUrl(pageUrl: string): string {
  return `${new URL(pageUrl).origin}/sitemap.xml`;
}

function uniqueUrls(urls: string[]): string[] {
  return [...new Set(urls.filter(Boolean))];
}

function stripCdataSections(xml: string): string {
  return xml.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1");
}

function extractLocTags(xml: string): string[] {
  const locs: string[] = [];
  const regex = /<loc>\s*([^<]+?)\s*<\/loc>/gi;
  const content = stripCdataSections(xml);
  let match = regex.exec(content);

  while (match) {
    locs.push(match[1].trim());
    match = regex.exec(content);
  }

  return locs;
}

export function parseSitemapXml(xml: string): ParsedSitemapXml {
  const normalized = xml.trim();

  if (!normalized.includes("<")) {
    return {
      isUrlSet: false,
      isSitemapIndex: false,
      locs: [],
    };
  }

  const isSitemapIndex = /<sitemapindex\b/i.test(normalized);
  const isUrlSet = /<urlset\b/i.test(normalized);

  return {
    isUrlSet,
    isSitemapIndex,
    locs: extractLocTags(normalized),
  };
}

async function fetchSitemapXml(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/xml,text/xml,text/plain,*/*",
        "User-Agent": "AI-Search-Audit/1.0 (+https://aisearchaudit.local)",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "";
    const content = (await response.text()).trim();

    if (!content) {
      return null;
    }

    if (
      contentType &&
      !contentType.toLowerCase().includes("xml") &&
      !contentType.toLowerCase().includes("text") &&
      !content.includes("<")
    ) {
      return null;
    }

    return content;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function resolveSitemapCandidates(
  pageUrl: string,
  robotsAnalysis: RobotsAnalysis,
): Promise<{ urls: string[]; source: SitemapAnalysis["source"] }> {
  const robotsUrls =
    robotsAnalysis.sitemapCount > 0
      ? await getRobotsSitemapUrls(pageUrl)
      : [];

  if (robotsUrls.length > 0) {
    return {
      urls: uniqueUrls(robotsUrls).slice(0, MAX_SITEMAPS_TO_FETCH),
      source: "robots",
    };
  }

  return {
    urls: [getDefaultSitemapUrl(pageUrl)],
    source: "default",
  };
}

export async function analyzeSitemaps(
  pageUrl: string,
  robotsAnalysis: RobotsAnalysis,
): Promise<SitemapAnalysis> {
  const { urls, source } = await resolveSitemapCandidates(
    pageUrl,
    robotsAnalysis,
  );

  let fetchedSitemapCount = 0;
  let urlCount = 0;
  let childSitemapCount = 0;
  const sampleUrls: string[] = [];

  for (const sitemapUrl of urls) {
    const xml = await fetchSitemapXml(sitemapUrl);

    if (!xml) {
      continue;
    }

    const parsed = parseSitemapXml(xml);

    if (!parsed.isUrlSet && !parsed.isSitemapIndex) {
      continue;
    }

    fetchedSitemapCount += 1;

    if (parsed.isSitemapIndex) {
      childSitemapCount += parsed.locs.length;
    } else {
      urlCount += parsed.locs.length;

      for (const loc of parsed.locs) {
        if (sampleUrls.length >= MAX_SAMPLE_URLS) {
          break;
        }

        sampleUrls.push(loc);
      }
    }
  }

  if (fetchedSitemapCount === 0) {
    return { ...defaultSitemapAnalysis };
  }

  return {
    exists: true,
    source,
    sitemapCount: fetchedSitemapCount,
    urlCount,
    childSitemapCount,
    sampleUrls,
  };
}

export function runSitemapChecks(
  sitemapAnalysis: SitemapAnalysis,
): AuditCheck[] {
  return [
    {
      id: "sitemap-xml-detected",
      label: "sitemap.xml detected",
      status: sitemapAnalysis.exists ? "pass" : "warn",
      message: sitemapAnalysis.exists
        ? `Fetched ${sitemapAnalysis.sitemapCount} sitemap file(s) from ${sitemapAnalysis.source} source.`
        : "No sitemap.xml file could be fetched for this domain.",
    },
    {
      id: "sitemap-contains-urls",
      label: "Sitemap contains URLs",
      status:
        sitemapAnalysis.urlCount > 0 || sitemapAnalysis.childSitemapCount > 0
          ? "pass"
          : "warn",
      message:
        sitemapAnalysis.urlCount > 0
          ? `Sitemap contains ${sitemapAnalysis.urlCount} URL(s).`
          : sitemapAnalysis.childSitemapCount > 0
            ? `Sitemap index references ${sitemapAnalysis.childSitemapCount} child sitemap(s).`
            : sitemapAnalysis.exists
              ? "Sitemap was found but no URLs were discovered."
              : "No sitemap URLs were discovered.",
    },
  ];
}
