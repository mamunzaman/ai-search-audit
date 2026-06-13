const DOMAIN_PATTERN =
  /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

export type UrlValidationResult =
  | { valid: true; url: string }
  | { valid: false; error: string };

export function validateAuditUrl(input: unknown): UrlValidationResult {
  if (typeof input !== "string" || !input.trim()) {
    return { valid: false, error: "URL is required." };
  }

  let candidate = input.trim();

  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  let parsed: URL;

  try {
    parsed = new URL(candidate);
  } catch {
    return { valid: false, error: "Invalid URL format." };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { valid: false, error: "Only HTTP and HTTPS URLs are supported." };
  }

  const hostname = parsed.hostname.replace(/^www\./i, "");

  if (!hostname || hostname === "localhost" || hostname.endsWith(".local")) {
    return { valid: false, error: "Invalid hostname." };
  }

  if (!DOMAIN_PATTERN.test(hostname) && !isValidIp(hostname)) {
    return { valid: false, error: "Invalid domain name." };
  }

  parsed.protocol = "https:";
  parsed.hostname = parsed.hostname;

  return { valid: true, url: parsed.toString() };
}

function isValidIp(hostname: string): boolean {
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  return ipv4.test(hostname);
}
