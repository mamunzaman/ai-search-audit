import {
  analyzeRobotsTxtDetailed,
  extractSitemapUrls,
  parseRobotsTxt,
} from "./technicalSignals";
import type { AuditCheck, RobotsAnalysis } from "./types";

export const defaultRobotsAnalysis: RobotsAnalysis = {
  exists: false,
  reachability: "not_found",
  statusCode: null,
  sitemapCount: 0,
  sitemapUrls: [],
  disallowCount: 0,
  userAgentGroupCount: 0,
  rootDisallowed: false,
  blockedAiCrawlers: [],
};

export { parseRobotsTxt, extractSitemapUrls };

export async function getRobotsSitemapUrls(pageUrl: string): Promise<string[]> {
  const analysis = await analyzeRobotsTxt(pageUrl);
  return analysis.sitemapUrls;
}

export async function analyzeRobotsTxt(pageUrl: string): Promise<RobotsAnalysis> {
  return analyzeRobotsTxtDetailed(pageUrl);
}

export function runRobotsChecks(robotsAnalysis: RobotsAnalysis): AuditCheck[] {
  const reachable = robotsAnalysis.reachability === "reachable";

  return [
    {
      id: "robots-txt-detected",
      label: "robots.txt detected",
      status: reachable ? "pass" : "warn",
      message: reachable
        ? "A robots.txt file was found for this domain."
        : robotsAnalysis.reachability === "not_found"
          ? "No robots.txt file was found for this domain."
          : "robots.txt could not be fetched reliably.",
    },
    {
      id: "sitemap-declared-in-robots-txt",
      label: "Sitemap declared in robots.txt",
      status: robotsAnalysis.sitemapCount > 0 ? "pass" : "warn",
      message:
        robotsAnalysis.sitemapCount > 0
          ? `Found ${robotsAnalysis.sitemapCount} sitemap declaration(s) in robots.txt.`
          : reachable
            ? "robots.txt exists but no Sitemap directive was found."
            : "No robots.txt file available to declare sitemaps.",
    },
  ];
}
