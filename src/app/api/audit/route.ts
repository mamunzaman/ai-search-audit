import {
  detectAiVisibilitySignals,
  runTrustAndAiChecks,
} from "@/lib/audit/ai-visibility-checks";
import { AuditFetchError, fetchPage } from "@/lib/audit/fetch-page";
import { parseHtml } from "@/lib/audit/html-parser";
import { analyzeRobotsTxt, runRobotsChecks } from "@/lib/audit/robots-check";
import { analyzeSitemaps, runSitemapChecks } from "@/lib/audit/sitemap-check";
import {
  extractSocialMetadata,
  runSocialMetadataChecks,
} from "@/lib/audit/social-metadata";
import { detectSchemaTypes } from "@/lib/audit/schema-detector";
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
  const trustSignals = detectTrustSignals({
    pageUrl: page.finalUrl,
    anchors: parsed.anchors ?? [],
  });
  const robotsAnalysis = await analyzeRobotsTxt(page.finalUrl);
  const sitemapAnalysis = await analyzeSitemaps(page.finalUrl, robotsAnalysis);
  const socialMetadata = extractSocialMetadata(page.html);
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
  const robotsChecks = runRobotsChecks(robotsAnalysis);
  const sitemapChecks = runSitemapChecks(sitemapAnalysis);
  const socialChecks = runSocialMetadataChecks(socialMetadata);

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
    socialMetadata,
    checks: [
      ...seoChecks,
      ...trustAndAiChecks,
      ...robotsChecks,
      ...sitemapChecks,
      ...socialChecks,
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
