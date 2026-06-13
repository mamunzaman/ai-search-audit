import * as cheerio from "cheerio";

function extractTypesFromNode(node: unknown): string[] {
  if (!node || typeof node !== "object") {
    return [];
  }

  const record = node as Record<string, unknown>;
  const types: string[] = [];

  const typeValue = record["@type"];

  if (typeof typeValue === "string") {
    types.push(typeValue);
  } else if (Array.isArray(typeValue)) {
    for (const item of typeValue) {
      if (typeof item === "string") {
        types.push(item);
      }
    }
  }

  const graph = record["@graph"];

  if (Array.isArray(graph)) {
    for (const item of graph) {
      types.push(...extractTypesFromNode(item));
    }
  }

  return types;
}

export function detectSchemaTypes(html: string): string[] {
  const $ = cheerio.load(html);
  const types = new Set<string>();

  $('script[type="application/ld+json"]').each((_, element) => {
    const raw = $(element).html()?.trim();

    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;

      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          extractTypesFromNode(item).forEach((type) => types.add(type));
        }
      } else {
        extractTypesFromNode(parsed).forEach((type) => types.add(type));
      }
    } catch {
      return;
    }
  });

  return Array.from(types).sort();
}
