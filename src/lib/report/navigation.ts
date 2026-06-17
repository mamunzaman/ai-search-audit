const SLUG_TO_PATH: Record<string, string> = {
  overview: "report",
  "seo-health": "seo-health",
  "ai-visibility": "ai-visibility",
  "entity-clarity": "entity-clarity",
  "citation-readiness": "citation-readiness",
  "answer-extraction": "answer-extraction",
  "trust-signals": "trust-signals",
  "open-graph": "open-graph",
  "twitter-card": "twitter-card",
  "content-structure": "content-structure",
  "schema-markup": "schema-markup",
  "advanced-schema": "advanced-schema",
  "wcag-2.2": "wcag-22",
};

export function reportOverviewHref(domain: string): string {
  return `/report?domain=${encodeURIComponent(domain)}`;
}

export function reportDetailHref(pathSlug: string, domain: string): string {
  return `/report/${pathSlug}?domain=${encodeURIComponent(domain)}`;
}

export function buildReportNavHref(slug: string | undefined, domain: string): string {
  if (!slug || slug === "overview") {
    return reportOverviewHref(domain);
  }

  const pathSlug = SLUG_TO_PATH[slug];

  if (!pathSlug) {
    return reportOverviewHref(domain);
  }

  if (pathSlug === "report") {
    return reportOverviewHref(domain);
  }

  return reportDetailHref(pathSlug, domain);
}
