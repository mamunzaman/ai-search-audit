import {
  detectAiVisibilitySignals,
  runTrustAndAiChecks,
} from "@/lib/audit/ai-visibility-checks";
import { AuditFetchError, fetchPage } from "@/lib/audit/fetch-page";
import { parseHtml } from "@/lib/audit/html-parser";
import { analyzeTechnicalDiscovery } from "@/lib/audit/technicalSignals";
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
import type { AuditRequest, AuditResponse } from "@/lib/audit/types";
import { validateAuditUrl } from "@/lib/audit/url-validator";
import { NextResponse } from "next/server";

async function buildAuditResponse(
  url: string,
  page: { finalUrl: string; statusCode: number; html: string },
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
    headings: {
      h1: parsed.headings?.h1 ?? [],
      h2: parsed.headings?.h2 ?? [],
      h3: parsed.headings?.h3 ?? [],
    },
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

    return NextResponse.json(
      await buildAuditResponse(validation.url, page),
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
