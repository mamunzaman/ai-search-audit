const FETCH_TIMEOUT_MS = 10_000;

export type FetchedPage = {
  finalUrl: string;
  statusCode: number;
  html: string;
};

export class AuditFetchError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "AuditFetchError";
    this.statusCode = statusCode;
  }
}

export async function fetchPage(url: string): Promise<FetchedPage> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "AI-Search-Audit/1.0 (+https://aisearchaudit.local)",
      },
      redirect: "follow",
    });

    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.toLowerCase().includes("text/html")) {
      throw new AuditFetchError(
        `Expected HTML content but received "${contentType || "unknown"}".`,
        response.status,
      );
    }

    const html = await response.text();

    if (!html.trim()) {
      throw new AuditFetchError("Page returned empty HTML.", response.status);
    }

    return {
      finalUrl: response.url || url,
      statusCode: response.status,
      html,
    };
  } catch (error) {
    if (error instanceof AuditFetchError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new AuditFetchError("Request timed out after 10 seconds.");
    }

    throw new AuditFetchError(
      error instanceof Error ? error.message : "Failed to fetch page.",
    );
  } finally {
    clearTimeout(timeout);
  }
}
