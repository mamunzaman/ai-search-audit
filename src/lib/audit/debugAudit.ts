import { calculateAuditScores } from "@/lib/audit/audit-score";
import type { AuditResponse } from "@/lib/audit/types";
import type { AuditDebugPayload, SiteCrawlResult } from "@/types/audit";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DEBUG_DIR_NAME = ".audit-debug";

type BuildAuditDebugInput = AuditDebugPayload;

export type AuditDebugSummary = {
  statusCode?: number;
  htmlLength?: number;
  textLength?: number;
  categoryScores?: Record<string, number>;
  lowCategoryScores: Record<string, number>;
  intent?: string;
  confidence?: number;
  reasons?: string[];
};

export function buildAuditDebugPayload(input: BuildAuditDebugInput): AuditDebugPayload {
  return input;
}

function collectFailedCheckSignals(audit: AuditResponse): string[] {
  return audit.checks
    .filter((check) => check.status === "fail")
    .map((check) => `${check.label}: ${check.message}`);
}

function collectFailedFindingSignals(audit: AuditResponse): string[] {
  const audits = [
    audit.entityClarityAudit,
    audit.citationReadinessAudit,
    audit.answerExtractionAudit,
    audit.trustSignalsAudit,
    audit.openGraphAudit,
    audit.twitterCardAudit,
    audit.advancedSchemaAudit,
  ];

  return audits.flatMap((result) =>
    result.findings
      .filter((finding) => finding.status === "fail")
      .map((finding) => finding.label),
  );
}

function collectLowCategorySignals(
  categoryScores: Record<string, number>,
): string[] {
  return Object.entries(categoryScores)
    .filter(([, score]) => score < 60)
    .map(([label, score]) => `Low category score: ${label} (${score})`);
}

export function collectAuditDebugData(
  audit: AuditResponse,
  html: string,
  siteCrawl: SiteCrawlResult,
): AuditDebugPayload {
  const scores = calculateAuditScores(audit);
  const categoryScores = Object.fromEntries(
    scores.categories.map((category) => [category.label, category.score]),
  );
  const primaryPage =
    siteCrawl.pages.find((page) => page.url === audit.finalUrl) ?? siteCrawl.pages[0];
  const missingCriticalSignals = [
    ...collectFailedCheckSignals(audit),
    ...collectFailedFindingSignals(audit),
    ...collectLowCategorySignals(categoryScores),
  ];

  return buildAuditDebugPayload({
    url: audit.finalUrl,
    statusCode: audit.statusCode,
    htmlLength: html.length,
    textLength: primaryPage?.text.length ?? 0,
    title: audit.title,
    metaDescription: audit.metaDescription,
    headings: {
      h1: audit.headings.h1.length,
      h2: audit.headings.h2.length,
      h3: audit.headings.h3.length,
      h4: audit.headings.h4.length,
      h5: audit.headings.h5.length,
      h6: audit.headings.h6.length,
    },
    categoryScores,
    crawlPages: siteCrawl.pages.map((page) => ({
      url: page.url,
      statusCode: page.statusCode,
      htmlLength: page.html.length,
      textLength: page.text.length,
    })),
    missingCriticalSignals,
    intent: audit.pageIntent?.intent,
    confidence: audit.pageIntent?.confidence,
    reasons: audit.pageIntent?.reasons,
  });
}

export function buildAuditDebugSummary(payload: AuditDebugPayload): AuditDebugSummary {
  const categoryScores = payload.categoryScores ?? {};
  const lowCategoryScores = Object.fromEntries(
    Object.entries(categoryScores).filter(([, score]) => score < 60),
  );

  return {
    statusCode: payload.statusCode,
    htmlLength: payload.htmlLength,
    textLength: payload.textLength,
    categoryScores,
    lowCategoryScores,
    intent: payload.intent,
    confidence: payload.confidence,
    reasons: payload.reasons,
  };
}

function sanitizeDomainForFilename(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./i, "");
    const sanitized = hostname
      .toLowerCase()
      .replace(/\./g, "-")
      .replace(/[^a-z0-9-]/g, "");

    return sanitized || "unknown-host";
  } catch {
    return "unknown-host";
  }
}

function formatDebugTimestamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("-");
}

function buildDebugFilename(url: string, date = new Date()): string {
  return `${sanitizeDomainForFilename(url)}-${formatDebugTimestamp(date)}.json`;
}

export async function writeAuditDebugFile(
  debugPayload: AuditDebugPayload,
): Promise<string> {
  const debugDir = path.join(process.cwd(), DEBUG_DIR_NAME);
  const filename = buildDebugFilename(debugPayload.url);
  const absolutePath = path.join(debugDir, filename);
  const relativePath = `${DEBUG_DIR_NAME}/${filename}`;

  await mkdir(debugDir, { recursive: true });
  await writeFile(absolutePath, `${JSON.stringify(debugPayload, null, 2)}\n`, "utf8");

  return relativePath;
}

export function getAuditOverallScore(audit: AuditResponse): number {
  return calculateAuditScores(audit).overallScore;
}
