import type { AuditCheck, RobotsAnalysis } from "./types";

const FETCH_TIMEOUT_MS = 10_000;

export const defaultRobotsAnalysis: RobotsAnalysis = {
  exists: false,
  sitemapCount: 0,
  disallowCount: 0,
};

function getRobotsTxtUrl(pageUrl: string): string {
  const origin = new URL(pageUrl).origin;
  return `${origin}/robots.txt`;
}

export function parseRobotsTxt(content: string): Pick<
  RobotsAnalysis,
  "sitemapCount" | "disallowCount"
> & { sitemapUrls: string[] } {
  let sitemapCount = 0;
  let disallowCount = 0;
  const sitemapUrls: string[] = [];

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf(":");

    if (separatorIndex === -1) {
      continue;
    }

    const directive = trimmed.slice(0, separatorIndex).trim().toLowerCase();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (directive === "sitemap" && value) {
      sitemapCount += 1;
      sitemapUrls.push(value);
    }

    if (directive === "disallow" && value) {
      disallowCount += 1;
    }
  }

  return { sitemapCount, disallowCount, sitemapUrls };
}

export function extractSitemapUrls(content: string): string[] {
  return parseRobotsTxt(content).sitemapUrls;
}

async function fetchRobotsTxtContent(pageUrl: string): Promise<string | null> {
  const robotsUrl = getRobotsTxtUrl(pageUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(robotsUrl, {
      signal: controller.signal,
      headers: {
        Accept: "text/plain,text/*,*/*",
        "User-Agent": "AI-Search-Audit/1.0 (+https://aisearchaudit.local)",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (
      contentType &&
      !contentType.toLowerCase().includes("text") &&
      !contentType.toLowerCase().includes("plain")
    ) {
      return null;
    }

    const content = (await response.text()).trim();
    return content || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getRobotsSitemapUrls(pageUrl: string): Promise<string[]> {
  const content = await fetchRobotsTxtContent(pageUrl);
  return content ? extractSitemapUrls(content) : [];
}

export async function analyzeRobotsTxt(pageUrl: string): Promise<RobotsAnalysis> {
  const content = await fetchRobotsTxtContent(pageUrl);

  if (!content) {
    return { ...defaultRobotsAnalysis };
  }

  const parsed = parseRobotsTxt(content);

  return {
    exists: true,
    sitemapCount: parsed.sitemapCount,
    disallowCount: parsed.disallowCount,
  };
}

export function runRobotsChecks(robotsAnalysis: RobotsAnalysis): AuditCheck[] {
  return [
    {
      id: "robots-txt-detected",
      label: "robots.txt detected",
      status: robotsAnalysis.exists ? "pass" : "warn",
      message: robotsAnalysis.exists
        ? "A robots.txt file was found for this domain."
        : "No robots.txt file was found for this domain.",
    },
    {
      id: "sitemap-declared-in-robots-txt",
      label: "Sitemap declared in robots.txt",
      status: robotsAnalysis.sitemapCount > 0 ? "pass" : "warn",
      message:
        robotsAnalysis.sitemapCount > 0
          ? `Found ${robotsAnalysis.sitemapCount} sitemap declaration(s) in robots.txt.`
          : robotsAnalysis.exists
            ? "robots.txt exists but no Sitemap directive was found."
            : "No robots.txt file available to declare sitemaps.",
    },
  ];
}
