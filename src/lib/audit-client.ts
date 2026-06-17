import type { AuditDebugSummary } from "@/lib/audit/debugAudit";
import type { AuditRequest, AuditResponse } from "@/lib/audit/types";
import type { AuditDebugPayload } from "@/types/audit";

export type AuditDebugApiResponse = {
  success: true;
  audit: AuditResponse;
  score: number;
  debug: AuditDebugPayload;
  debugSummary: AuditDebugSummary;
};

export type RunAuditResult =
  | { mode: "normal"; audit: AuditResponse }
  | {
      mode: "debug";
      audit: AuditResponse;
      score: number;
      debug: AuditDebugPayload;
      debugSummary: AuditDebugSummary;
    };

type RunAuditOptions = {
  debug?: boolean;
  signal?: AbortSignal;
};

function isAuditDebugApiResponse(data: unknown): data is AuditDebugApiResponse {
  if (!data || typeof data !== "object") {
    return false;
  }

  const response = data as Partial<AuditDebugApiResponse>;
  return (
    response.success === true &&
    typeof response.audit === "object" &&
    response.audit !== null &&
    typeof response.score === "number" &&
    typeof response.debug === "object" &&
    response.debug !== null &&
    typeof response.debugSummary === "object" &&
    response.debugSummary !== null
  );
}

export async function runAudit(
  url: string,
  options: RunAuditOptions = {},
): Promise<RunAuditResult> {
  const endpoint = options.debug ? "/api/audit?debug=true" : "/api/audit";
  const body: AuditRequest = {
    url,
    ...(options.debug ? { debug: true } : {}),
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: options.signal,
  });

  const data = (await response.json()) as AuditDebugApiResponse & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || "Audit request failed.");
  }

  if (options.debug) {
    if (!isAuditDebugApiResponse(data)) {
      throw new Error("Debug audit response was incomplete.");
    }

    return {
      mode: "debug",
      audit: data.audit,
      score: data.score,
      debug: data.debug,
      debugSummary: data.debugSummary,
    };
  }

  return {
    mode: "normal",
    audit: data as unknown as AuditResponse,
  };
}
