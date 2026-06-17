import type { AuditDebugSummary } from "@/lib/audit/debugAudit";
import { saveAuditReport } from "@/lib/audit/storage";
import type { AuditResponse } from "@/lib/audit/types";
import type { AuditDebugPayload } from "@/types/audit";

const DEBUG_SESSION_KEY = "ai-search-audit:debug-session";

export type StoredAuditDebugSession = {
  debug: AuditDebugPayload;
  debugSummary: AuditDebugSummary;
  score: number;
  domain: string;
  timestamp: string;
};

export type SaveAuditSessionInput = {
  audit: AuditResponse;
  domain: string;
  debug?: {
    debug: AuditDebugPayload;
    debugSummary: AuditDebugSummary;
    score: number;
  };
};

export function saveAuditSession(input: SaveAuditSessionInput): void {
  if (typeof window === "undefined") {
    return;
  }

  saveAuditReport(input.audit);

  if (input.debug) {
    const session: StoredAuditDebugSession = {
      debug: input.debug.debug,
      debugSummary: input.debug.debugSummary,
      score: input.debug.score,
      domain: input.domain,
      timestamp: new Date().toISOString(),
    };

    sessionStorage.setItem(DEBUG_SESSION_KEY, JSON.stringify(session));
    return;
  }

  clearAuditDebugSession();
}

export function loadAuditDebugSession(): StoredAuditDebugSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(DEBUG_SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredAuditDebugSession>;

    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.debug !== "object" ||
      parsed.debug === null ||
      typeof parsed.debugSummary !== "object" ||
      parsed.debugSummary === null ||
      typeof parsed.score !== "number" ||
      typeof parsed.domain !== "string" ||
      typeof parsed.timestamp !== "string"
    ) {
      clearAuditDebugSession();
      return null;
    }

    return parsed as StoredAuditDebugSession;
  } catch {
    clearAuditDebugSession();
    return null;
  }
}

export function hasAuditDebugSession(): boolean {
  return loadAuditDebugSession() !== null;
}

export function clearAuditDebugSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(DEBUG_SESSION_KEY);
}
