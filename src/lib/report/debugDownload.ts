export function sanitizeDomainForDebugFilename(domain: string): string {
  const cleaned = domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .replace(/\./g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return cleaned || "unknown-host";
}

export function buildDebugDownloadFilename(
  domain: string,
  timestamp = new Date().toISOString(),
): string {
  const safeDomain = sanitizeDomainForDebugFilename(domain);
  const safeTimestamp = timestamp.replace(/[:.]/g, "-");

  return `ai-search-audit-debug-${safeDomain}-${safeTimestamp}.json`;
}

export function downloadDebugJson(data: unknown, filename: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], {
    type: "application/json",
  });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
