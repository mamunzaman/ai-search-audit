import type {
  AuditCheck,
  AuditCheckStatus,
  RobotsAnalysis,
  SitemapAnalysis,
  TechnicalSignal,
  TechnicalSignalStatus,
} from "./types";

const FETCH_TIMEOUT_MS = 10_000;
const MAX_SITEMAPS_TO_FETCH = 3;
const MAX_SAMPLE_URLS = 10;

type ParsedSitemapXml = {
  isUrlSet: boolean;
  isSitemapIndex: boolean;
  locs: string[];
};

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

export const AI_CRAWLER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "Google-Extended",
  "ClaudeBot",
  "PerplexityBot",
  "CCBot",
] as const;

const FALLBACK_SITEMAP_PATHS = [
  "/sitemap.xml",
  "/sitemap_index.xml",
  "/sitemap-index.xml",
];

type RobotsGroup = {
  userAgents: string[];
  disallows: string[];
  allows: string[];
};

export type ParsedRobotsTxt = {
  sitemapCount: number;
  sitemapUrls: string[];
  disallowCount: number;
  userAgentGroupCount: number;
  groups: RobotsGroup[];
  rootDisallowed: boolean;
  blockedAiCrawlers: string[];
};

function getOrigin(pageUrl: string): string {
  return new URL(pageUrl).origin;
}

function getRobotsTxtUrl(pageUrl: string): string {
  return `${getOrigin(pageUrl)}/robots.txt`;
}

function uniqueUrls(urls: string[]): string[] {
  return [...new Set(urls.filter(Boolean))];
}

function mapSignalStatusToCheck(status: TechnicalSignalStatus): AuditCheckStatus {
  if (status === "warning") {
    return "warn";
  }

  return status;
}

function parseRobotsGroups(content: string): RobotsGroup[] {
  const groups: RobotsGroup[] = [];
  let current: RobotsGroup = { userAgents: [], disallows: [], allows: [] };

  const flush = () => {
    if (current.userAgents.length > 0) {
      groups.push({
        userAgents: [...current.userAgents],
        disallows: [...current.disallows],
        allows: [...current.allows],
      });
    }

    current = { userAgents: [], disallows: [], allows: [] };
  };

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed) {
      flush();
      continue;
    }

    if (trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf(":");

    if (separatorIndex === -1) {
      continue;
    }

    const directive = trimmed.slice(0, separatorIndex).trim().toLowerCase();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (directive === "user-agent") {
      if (value) {
        current.userAgents.push(value);
      }
      continue;
    }

    if (directive === "disallow") {
      current.disallows.push(value);
      continue;
    }

    if (directive === "allow") {
      current.allows.push(value);
      continue;
    }
  }

  flush();
  return groups;
}

function groupAppliesToAgent(group: RobotsGroup, agent: string): boolean {
  return group.userAgents.some(
    (userAgent) => userAgent.toLowerCase() === agent.toLowerCase(),
  );
}

function groupAppliesToWildcard(group: RobotsGroup): boolean {
  return group.userAgents.some((userAgent) => userAgent === "*");
}

function isRootDisallow(disallows: string[]): boolean {
  return disallows.some((rule) => rule === "/" || rule === "/*");
}

function getAgentGroup(groups: RobotsGroup[], agent: string): RobotsGroup | undefined {
  const specific = groups.find((group) => groupAppliesToAgent(group, agent));
  if (specific) {
    return specific;
  }

  return groups.find((group) => groupAppliesToWildcard(group));
}

function detectBlockedAiCrawlers(groups: RobotsGroup[]): string[] {
  const blocked: string[] = [];

  for (const agent of AI_CRAWLER_AGENTS) {
    const group = getAgentGroup(groups, agent);
    if (group && isRootDisallow(group.disallows)) {
      blocked.push(agent);
    }
  }

  return blocked;
}

function detectRootDisallowed(groups: RobotsGroup[]): boolean {
  const wildcard = groups.find((group) => groupAppliesToWildcard(group));
  return wildcard ? isRootDisallow(wildcard.disallows) : false;
}

export function parseRobotsTxt(content: string): ParsedRobotsTxt {
  const sitemapUrls: string[] = [];
  let disallowCount = 0;

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
      sitemapUrls.push(value);
    }

    if (directive === "disallow" && value) {
      disallowCount += 1;
    }
  }

  const groups = parseRobotsGroups(content);

  return {
    sitemapCount: sitemapUrls.length,
    sitemapUrls: uniqueUrls(sitemapUrls),
    disallowCount,
    userAgentGroupCount: groups.length,
    groups,
    rootDisallowed: detectRootDisallowed(groups),
    blockedAiCrawlers: detectBlockedAiCrawlers(groups),
  };
}

export function extractSitemapUrls(content: string): string[] {
  return parseRobotsTxt(content).sitemapUrls;
}

async function fetchRobotsTxt(
  pageUrl: string,
): Promise<{ content: string | null; statusCode: number | null }> {
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

    if (response.status === 404) {
      return { content: null, statusCode: 404 };
    }

    if (!response.ok) {
      return { content: null, statusCode: response.status };
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (
      contentType &&
      !contentType.toLowerCase().includes("text") &&
      !contentType.toLowerCase().includes("plain")
    ) {
      return { content: null, statusCode: response.status };
    }

    const content = (await response.text()).trim();
    return { content: content || null, statusCode: response.status };
  } catch {
    return { content: null, statusCode: null };
  } finally {
    clearTimeout(timeout);
  }
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

function buildRobotsReachability(
  statusCode: number | null,
  content: string | null,
): RobotsAnalysis["reachability"] {
  if (content) {
    return "reachable";
  }

  if (statusCode === 404) {
    return "not_found";
  }

  return "error";
}

export async function analyzeRobotsTxtDetailed(pageUrl: string): Promise<RobotsAnalysis> {
  const { content, statusCode } = await fetchRobotsTxt(pageUrl);
  const reachability = buildRobotsReachability(statusCode, content);

  if (!content) {
    return {
      exists: false,
      reachability,
      statusCode,
      sitemapCount: 0,
      sitemapUrls: [],
      disallowCount: 0,
      userAgentGroupCount: 0,
      rootDisallowed: false,
      blockedAiCrawlers: [],
    };
  }

  const parsed = parseRobotsTxt(content);

  return {
    exists: true,
    reachability,
    statusCode,
    sitemapCount: parsed.sitemapCount,
    sitemapUrls: parsed.sitemapUrls,
    disallowCount: parsed.disallowCount,
    userAgentGroupCount: parsed.userAgentGroupCount,
    rootDisallowed: parsed.rootDisallowed,
    blockedAiCrawlers: parsed.blockedAiCrawlers,
  };
}

function getFallbackSitemapUrls(pageUrl: string): string[] {
  const origin = getOrigin(pageUrl);
  return FALLBACK_SITEMAP_PATHS.map((path) => `${origin}${path}`);
}

async function resolveSitemapCandidates(
  pageUrl: string,
  robotsAnalysis: RobotsAnalysis,
): Promise<{ urls: string[]; source: SitemapAnalysis["source"] }> {
  if (robotsAnalysis.sitemapUrls.length > 0) {
    return {
      urls: uniqueUrls(robotsAnalysis.sitemapUrls).slice(0, MAX_SITEMAPS_TO_FETCH),
      source: "robots",
    };
  }

  return {
    urls: getFallbackSitemapUrls(pageUrl).slice(0, MAX_SITEMAPS_TO_FETCH),
    source: "default",
  };
}

export async function analyzeSitemapsDetailed(
  pageUrl: string,
  robotsAnalysis: RobotsAnalysis,
): Promise<SitemapAnalysis> {
  const { urls, source } = await resolveSitemapCandidates(pageUrl, robotsAnalysis);

  let fetchedSitemapCount = 0;
  let urlCount = 0;
  let childSitemapCount = 0;
  let invalidResponseCount = 0;
  let format: SitemapAnalysis["format"] = "none";
  const sampleUrls: string[] = [];

  for (const sitemapUrl of urls) {
    const xml = await fetchSitemapXml(sitemapUrl);

    if (!xml) {
      invalidResponseCount += 1;
      continue;
    }

    const parsed = parseSitemapXml(xml);

    if (!parsed.isUrlSet && !parsed.isSitemapIndex) {
      invalidResponseCount += 1;
      continue;
    }

    fetchedSitemapCount += 1;
    format = parsed.isSitemapIndex ? "sitemapindex" : "urlset";

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
    return {
      exists: false,
      source: "none",
      sitemapCount: 0,
      urlCount: 0,
      childSitemapCount: 0,
      sampleUrls: [],
      format: invalidResponseCount > 0 ? "invalid" : "none",
      invalidResponseCount,
    };
  }

  return {
    exists: true,
    source,
    sitemapCount: fetchedSitemapCount,
    urlCount,
    childSitemapCount,
    sampleUrls,
    format,
    invalidResponseCount,
  };
}

export function buildTechnicalSignals(
  robotsAnalysis: RobotsAnalysis,
  sitemapAnalysis: SitemapAnalysis,
): TechnicalSignal[] {
  const signals: TechnicalSignal[] = [
    {
      id: "robots-txt-reachable",
      label: "robots.txt reachable",
      status:
        robotsAnalysis.reachability === "reachable"
          ? "pass"
          : robotsAnalysis.reachability === "not_found"
            ? "warning"
            : "fail",
      scoreImpact:
        robotsAnalysis.reachability === "reachable"
          ? 4
          : robotsAnalysis.reachability === "not_found"
            ? -2
            : -3,
      summary:
        robotsAnalysis.reachability === "reachable"
          ? "robots.txt is reachable for crawler discovery."
          : robotsAnalysis.reachability === "not_found"
            ? "No robots.txt file was found for this domain."
            : "robots.txt could not be fetched reliably.",
      recommendation:
        robotsAnalysis.reachability === "reachable"
          ? "Keep robots.txt available and up to date for crawler guidance."
          : "Publish a robots.txt file at the site root with crawl and sitemap guidance.",
    },
    {
      id: "robots-sitemap-declared",
      label: "Sitemap declared in robots.txt",
      status:
        robotsAnalysis.sitemapCount > 0
          ? "pass"
          : robotsAnalysis.exists
            ? "warning"
            : "warning",
      scoreImpact: robotsAnalysis.sitemapCount > 0 ? 3 : -2,
      summary:
        robotsAnalysis.sitemapCount > 0
          ? `Found ${robotsAnalysis.sitemapCount} sitemap declaration(s) in robots.txt.`
          : robotsAnalysis.exists
            ? "robots.txt exists but no Sitemap directive was found."
            : "No robots.txt sitemap declarations were available.",
      recommendation:
        robotsAnalysis.sitemapCount > 0
          ? "Ensure declared sitemap URLs stay valid and current."
          : "Add Sitemap: directives in robots.txt pointing to your XML sitemap.",
    },
    {
      id: "robots-root-disallow",
      label: "Root path crawlable",
      status: robotsAnalysis.rootDisallowed ? "fail" : "pass",
      scoreImpact: robotsAnalysis.rootDisallowed ? -6 : 2,
      summary: robotsAnalysis.rootDisallowed
        ? 'robots.txt disallows "/" for all user-agents, blocking broad crawling.'
        : "robots.txt does not block the site root for all user-agents.",
      recommendation: robotsAnalysis.rootDisallowed
        ? 'Review Disallow: / rules so key pages remain crawlable.'
        : "Maintain targeted disallow rules instead of blocking the entire site.",
    },
    {
      id: "robots-ai-crawler-access",
      label: "AI crawler access",
      status:
        robotsAnalysis.blockedAiCrawlers.length > 0 ? "warning" : "pass",
      scoreImpact: robotsAnalysis.blockedAiCrawlers.length > 0 ? -4 : 3,
      summary:
        robotsAnalysis.blockedAiCrawlers.length > 0
          ? `AI crawlers blocked in robots.txt: ${robotsAnalysis.blockedAiCrawlers.join(", ")}.`
          : "No common AI crawler blocks detected in robots.txt.",
      recommendation:
        robotsAnalysis.blockedAiCrawlers.length > 0
          ? "If AI visibility matters, allow relevant AI crawlers or use targeted disallow rules."
          : "Keep AI crawler policies intentional as new agents emerge.",
    },
    {
      id: "sitemap-discovered",
      label: "XML sitemap discovered",
      status: sitemapAnalysis.exists ? "pass" : "warning",
      scoreImpact: sitemapAnalysis.exists ? 4 : -3,
      summary: sitemapAnalysis.exists
        ? `Sitemap fetched from ${sitemapAnalysis.source} source.`
        : "No valid XML sitemap could be discovered.",
      recommendation: sitemapAnalysis.exists
        ? "Submit sitemap URLs in Search Console and keep them updated."
        : "Publish sitemap.xml and declare it in robots.txt.",
    },
    {
      id: "sitemap-valid-xml",
      label: "Sitemap XML validity",
      status:
        sitemapAnalysis.format === "invalid"
          ? "fail"
          : sitemapAnalysis.exists
            ? "pass"
            : sitemapAnalysis.invalidResponseCount > 0
              ? "warning"
              : "warning",
      scoreImpact:
        sitemapAnalysis.format === "invalid"
          ? -4
          : sitemapAnalysis.exists
            ? 3
            : -2,
      summary:
        sitemapAnalysis.format === "urlset"
          ? "Sitemap uses a valid urlset structure."
          : sitemapAnalysis.format === "sitemapindex"
            ? "Sitemap index structure detected."
            : sitemapAnalysis.invalidResponseCount > 0
              ? "Sitemap candidate URLs returned invalid or non-XML responses."
              : "No valid sitemap XML structure was found.",
      recommendation:
        sitemapAnalysis.exists
          ? "Keep sitemap XML well-formed and reachable over HTTPS."
          : "Serve valid sitemap XML at /sitemap.xml or declare one in robots.txt.",
    },
    {
      id: "sitemap-url-count",
      label: "Sitemap URL coverage",
      status:
        sitemapAnalysis.urlCount > 0 || sitemapAnalysis.childSitemapCount > 0
          ? "pass"
          : sitemapAnalysis.exists
            ? "warning"
            : "warning",
      scoreImpact:
        sitemapAnalysis.urlCount > 0 || sitemapAnalysis.childSitemapCount > 0
          ? 3
          : -2,
      summary:
        sitemapAnalysis.urlCount > 0
          ? `Sitemap contains ${sitemapAnalysis.urlCount} URL(s).`
          : sitemapAnalysis.childSitemapCount > 0
            ? `Sitemap index references ${sitemapAnalysis.childSitemapCount} child sitemap(s).`
            : sitemapAnalysis.exists
              ? "Sitemap was found but no URLs were discovered."
              : "No sitemap URLs were discovered.",
      recommendation:
        sitemapAnalysis.urlCount > 0 || sitemapAnalysis.childSitemapCount > 0
          ? "Include priority landing pages and keep lastmod values fresh."
          : "Populate the sitemap with indexable URLs for discovery.",
    },
  ];

  return signals;
}

export function technicalSignalsToChecks(signals: TechnicalSignal[]): AuditCheck[] {
  return signals.map((signal) => ({
    id: signal.id,
    label: signal.label,
    status: mapSignalStatusToCheck(signal.status),
    message: signal.summary,
  }));
}

export async function analyzeTechnicalDiscovery(pageUrl: string): Promise<{
  robotsAnalysis: RobotsAnalysis;
  sitemapAnalysis: SitemapAnalysis;
  technicalSignals: TechnicalSignal[];
  checks: AuditCheck[];
}> {
  const robotsAnalysis = await analyzeRobotsTxtDetailed(pageUrl);
  const sitemapAnalysis = await analyzeSitemapsDetailed(pageUrl, robotsAnalysis);
  const technicalSignals = buildTechnicalSignals(robotsAnalysis, sitemapAnalysis);
  const checks = technicalSignalsToChecks(technicalSignals);

  return {
    robotsAnalysis,
    sitemapAnalysis,
    technicalSignals,
    checks,
  };
}

export function getTechnicalSignalNarratives(signals: TechnicalSignal[]): {
  positives: string[];
  problems: string[];
  recommendations: string[];
} {
  const positives: string[] = [];
  const problems: string[] = [];
  const recommendations: string[] = [];

  for (const signal of signals) {
    if (signal.status === "pass") {
      positives.push(signal.summary);
      continue;
    }

    problems.push(signal.summary);

    if (signal.recommendation) {
      recommendations.push(signal.recommendation);
    }
  }

  return { positives, problems, recommendations };
}
