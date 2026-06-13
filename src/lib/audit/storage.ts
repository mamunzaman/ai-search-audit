import {
  AUDIT_SCHEMA_VERSION,
  normalizeAuditResponse,
} from "./audit-normalize";
import type { AuditResponse, StoredAuditReport } from "./types";

export const AUDIT_STORAGE_KEY = "ai-search-audit:last-report";

export function saveAuditReport(audit: AuditResponse): void {
  if (typeof window === "undefined") {
    return;
  }

  const stored: StoredAuditReport = {
    ...audit,
    schemaVersion: AUDIT_SCHEMA_VERSION,
  };

  sessionStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(stored));
}

export function clearAuditReport(): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(AUDIT_STORAGE_KEY);
}

export function loadAuditReport(): AuditResponse | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(AUDIT_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return normalizeAuditResponse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function loadAuditReportSafe(): AuditResponse | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(AUDIT_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const normalized = normalizeAuditResponse(JSON.parse(raw));

    if (!normalized) {
      clearAuditReport();
      return null;
    }

    return normalized;
  } catch {
    clearAuditReport();
    return null;
  }
}
