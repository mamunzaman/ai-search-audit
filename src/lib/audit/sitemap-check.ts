import {
  analyzeSitemapsDetailed,
  parseSitemapXml,
} from "./technicalSignals";
import { getRobotsSitemapUrls } from "./robots-check";
import type { AuditCheck, RobotsAnalysis, SitemapAnalysis } from "./types";

export { parseSitemapXml };

export const defaultSitemapAnalysis: SitemapAnalysis = {
  exists: false,
  source: "none",
  sitemapCount: 0,
  urlCount: 0,
  childSitemapCount: 0,
  sampleUrls: [],
  format: "none",
  invalidResponseCount: 0,
};

async function enrichRobotsAnalysis(
  pageUrl: string,
  robotsAnalysis: RobotsAnalysis,
): Promise<RobotsAnalysis> {
  if (
    robotsAnalysis.sitemapUrls.length > 0 ||
    robotsAnalysis.sitemapCount === 0
  ) {
    return robotsAnalysis;
  }

  const sitemapUrls = await getRobotsSitemapUrls(pageUrl);

  return {
    ...robotsAnalysis,
    sitemapUrls,
  };
}

export async function analyzeSitemaps(
  pageUrl: string,
  robotsAnalysis: RobotsAnalysis,
): Promise<SitemapAnalysis> {
  const enriched = await enrichRobotsAnalysis(pageUrl, robotsAnalysis);
  return analyzeSitemapsDetailed(pageUrl, enriched);
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
