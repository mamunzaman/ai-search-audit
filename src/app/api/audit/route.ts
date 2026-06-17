import {
  detectAiVisibilitySignals,
  runTrustAndAiChecks,
} from "@/lib/audit/ai-visibility-checks";
import { AuditFetchError, fetchPage } from "@/lib/audit/fetch-page";
import { parseHtml } from "@/lib/audit/html-parser";
import { analyzeTechnicalDiscovery } from "@/lib/audit/technicalSignals";
import { runAnswerExtractionAudit } from "@/lib/audit/answerExtractionAudit";
import { runCitationReadinessAudit } from "@/lib/audit/citationReadinessAudit";
import { runEntityClarityAudit } from "@/lib/audit/entityClarityAudit";
import type { EntityClaritySitePage } from "@/lib/audit/entityClarityAudit";
import {
  extractEntityAnalysis,
  runEntityChecks,
} from "@/lib/audit/entity-extraction";
import {
  extractSocialMetadata,
  runSocialMetadataChecks,
} from "@/lib/audit/social-metadata";
import { detectSchemaTypes } from "@/lib/audit/schema-detector";
import {
  analyzeAccessibility,
  runAccessibilityChecks,
} from "@/lib/audit/accessibility-check";
import {
  analyzeReadability,
  runReadabilityChecks,
} from "@/lib/audit/readability-check";
import { runSeoChecks } from "@/lib/audit/seo-checks";
import { detectTrustSignals } from "@/lib/audit/trust-signals";
import { runAdvancedSchemaAudit } from "@/lib/audit/advancedSchemaAudit";
import { runTwitterCardAudit } from "@/lib/audit/twitterCardAudit";
import { runOpenGraphAudit } from "@/lib/audit/openGraphAudit";
import { runTrustSignalsAudit } from "@/lib/audit/trustSignalsAudit";
import {
  crawlSite,
  createFallbackSiteCrawl,
} from "@/lib/audit/siteCrawler";
import type { SiteCrawlResult } from "@/types/audit";
import type { AuditRequest, AuditResponse } from "@/lib/audit/types";
import { validateAuditUrl } from "@/lib/audit/url-validator";
import { NextResponse } from "next/server";

function mapEntityClaritySitePages(
  siteCrawl: SiteCrawlResult,
): EntityClaritySitePage[] | undefined {
  if (!siteCrawl.pages.length) {
    return undefined;
  }

  return siteCrawl.pages.map((page) => ({
    url: page.url,
    html: page.html,
    text: page.text,
    links: page.links,
  }));
}

async function buildAuditResponse(
  url: string,
  page: { finalUrl: string; statusCode: number; html: string },
  siteCrawl: SiteCrawlResult,
): Promise<AuditResponse> {
  const parsed = parseHtml(page.html, page.finalUrl);
  const schemaTypes = detectSchemaTypes(page.html) ?? [];
  const readabilityAnalysis = analyzeReadability(page.html, parsed.headings);
  const accessibilityAnalysis = analyzeAccessibility(
    page.html,
    parsed.title ?? "",
  );
  const trustSignals = detectTrustSignals({
    pageUrl: page.finalUrl,
    anchors: parsed.anchors ?? [],
  });
  const technicalDiscovery = await analyzeTechnicalDiscovery(page.finalUrl);
  const robotsAnalysis = technicalDiscovery.robotsAnalysis;
  const sitemapAnalysis = technicalDiscovery.sitemapAnalysis;
  const technicalSignals = technicalDiscovery.technicalSignals;
  const socialMetadata = extractSocialMetadata(page.html);
  const entityAnalysis = extractEntityAnalysis({
    title: parsed.title ?? "",
    metaDescription: parsed.metaDescription ?? "",
    headings: parsed.headings,
    schemaTypes,
    socialMetadata,
    pageUrl: page.finalUrl,
    html: page.html,
  });
  const entityClarityAudit = runEntityClarityAudit(
    {
      html: page.html,
      title: parsed.title ?? "",
      metaDescription: parsed.metaDescription ?? "",
      schemaTypes,
      headings: parsed.headings,
      trustSignals,
      entityAnalysis,
      socialMetadata,
    },
    {
      sitePages: mapEntityClaritySitePages(siteCrawl),
      primaryPageUrl: page.finalUrl,
    },
  );
  const citationReadinessAudit = runCitationReadinessAudit(
    {
      html: page.html,
      title: parsed.title ?? "",
      metaDescription: parsed.metaDescription ?? "",
      schemaTypes,
      headings: parsed.headings,
      links: {
        internal: parsed.links?.internal ?? 0,
        external: parsed.links?.external ?? 0,
      },
      trustSignals,
      anchors: parsed.anchors ?? [],
      pageUrl: page.finalUrl,
    },
    {
      sitePages: mapEntityClaritySitePages(siteCrawl),
      primaryPageUrl: page.finalUrl,
    },
  );
  const answerExtractionAudit = runAnswerExtractionAudit({
    html: page.html,
    headings: parsed.headings,
    schemaTypes,
    readabilityAnalysis,
  });
  const trustSignalsAudit = runTrustSignalsAudit(
    {
      html: page.html,
      pageUrl: page.finalUrl,
      finalUrl: page.finalUrl,
      trustSignals,
      anchors: parsed.anchors ?? [],
    },
    {
      sitePages: mapEntityClaritySitePages(siteCrawl),
    },
  );
  const openGraphAudit = runOpenGraphAudit({ socialMetadata });
  const twitterCardAudit = runTwitterCardAudit({ socialMetadata });
  const advancedSchemaAudit = runAdvancedSchemaAudit({
    html: page.html,
    schemaTypes,
  });
  const aiVisibilitySignals = detectAiVisibilitySignals({
    title: parsed.title ?? "",
    metaDescription: parsed.metaDescription ?? "",
    headings: parsed.headings,
    links: parsed.links,
    schemaTypes,
    trustSignals,
    html: page.html,
  });
  const seoChecks = runSeoChecks({
    ...parsed,
    statusCode: page.statusCode,
    schemaTypes,
  });
  const trustAndAiChecks = runTrustAndAiChecks({
    trustSignals,
    aiVisibilitySignals,
    visibleFaqHints: aiVisibilitySignals.visibleFaqHints,
  });
  const robotsChecks = technicalDiscovery.checks;
  const socialChecks = runSocialMetadataChecks(socialMetadata);
  const entityChecks = runEntityChecks(entityAnalysis);
  const readabilityChecks = runReadabilityChecks(readabilityAnalysis);
  const accessibilityChecks = runAccessibilityChecks(accessibilityAnalysis);

  return {
    url,
    finalUrl: page.finalUrl,
    statusCode: page.statusCode,
    title: parsed.title ?? "",
    metaDescription: parsed.metaDescription ?? "",
    headings: parsed.headings,
    canonical: parsed.canonical ?? "",
    robotsMeta: parsed.robotsMeta ?? "",
    schemaTypes,
    links: {
      internal: parsed.links?.internal ?? 0,
      external: parsed.links?.external ?? 0,
    },
    trustSignals,
    aiVisibilitySignals,
    robotsAnalysis,
    sitemapAnalysis,
    technicalSignals,
    socialMetadata,
    entityAnalysis,
    entityClarityAudit,
    citationReadinessAudit,
    answerExtractionAudit,
    trustSignalsAudit,
    openGraphAudit,
    twitterCardAudit,
    advancedSchemaAudit,
    readabilityAnalysis,
    accessibilityAnalysis,
    checks: [
      ...seoChecks,
      ...trustAndAiChecks,
      ...robotsChecks,
      ...socialChecks,
      ...entityChecks,
      ...readabilityChecks,
      ...accessibilityChecks,
    ],
    siteCrawl,
  };
}

export async function POST(request: Request) {
  try {
    let body: AuditRequest;

    try {
      body = (await request.json()) as AuditRequest;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const validation = validateAuditUrl(body.url);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const page = await fetchPage(validation.url);

    let siteCrawl: SiteCrawlResult;

    try {
      siteCrawl = await crawlSite(page.finalUrl, { maxPages: 5 });
    } catch {
      siteCrawl = createFallbackSiteCrawl(validation.url, page, 5);
    }

    return NextResponse.json(
      await buildAuditResponse(validation.url, page, siteCrawl),
    );
  } catch (error) {
    if (error instanceof AuditFetchError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode && error.statusCode < 500 ? 422 : 502 },
      );
    }

    return NextResponse.json(
      { error: "Unexpected audit error." },
      { status: 500 },
    );
  }
}
