export const FALLBACK_DOMAIN = "example.com";

export function normalizeDomain(input: string): string {
  let value = input.trim();
  if (!value) return "";

  value = value.replace(/^https?:\/\//i, "");
  value = value.split("/")[0]?.split("?")[0] ?? "";
  value = value.replace(/^www\./i, "");

  return value;
}

export function toAuditUrl(domain: string): string {
  const normalized = normalizeDomain(domain) || FALLBACK_DOMAIN;
  return `https://${normalized}`;
}

export function resolveDomain(input?: string | null): string {
  const normalized = normalizeDomain(input ?? "");
  return normalized || FALLBACK_DOMAIN;
}

export function isValidDomainInput(input: string): boolean {
  return normalizeDomain(input).length > 0;
}
