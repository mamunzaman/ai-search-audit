import * as cheerio from "cheerio";
import { normalizeDomain } from "@/lib/domain";
import type {
  AuditCheck,
  AuditHeadings,
  EntityAnalysis,
  EntityType,
  SocialMetadata,
} from "./types";

const MAX_RELATED_ENTITIES = 8;
const TITLE_SEPARATORS = /\s+[-|–—]\s+/;

const ENTITY_TYPE_PRIORITY: EntityType[] = [
  "Event",
  "LocalBusiness",
  "Article",
  "Organization",
  "Website",
];

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "das",
  "dem",
  "den",
  "der",
  "des",
  "die",
  "ein",
  "eine",
  "einem",
  "einen",
  "einer",
  "eines",
  "for",
  "from",
  "im",
  "in",
  "is",
  "it",
  "mit",
  "of",
  "on",
  "or",
  "the",
  "to",
  "und",
  "vom",
  "von",
  "with",
  "your",
  "home",
  "page",
  "website",
  "startseite",
  "willkommen",
  "für",
  "alle",
  "infos",
  "gelegenheit",
  "familie",
  "einkauf",
  "april",
  "alle infos",
]);

export const defaultEntityAnalysis: EntityAnalysis = {
  primaryEntity: null,
  entityType: "Unknown",
  confidence: 0,
  sources: [],
  relatedEntities: [],
};

type SchemaEntity = {
  type: EntityType;
  name: string;
};

type EntityCandidate = {
  name: string;
  source: string;
  confidence: number;
  entityType: EntityType;
};

function cleanText(value: string | undefined | null): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeEntityType(type: string): EntityType | null {
  const normalized = type.trim();

  switch (normalized) {
    case "Organization":
      return "Organization";
    case "WebSite":
      return "Website";
    case "Event":
      return "Event";
    case "LocalBusiness":
      return "LocalBusiness";
    case "Article":
    case "NewsArticle":
    case "BlogPosting":
      return "Article";
    default:
      return null;
  }
}

function getNodeTypes(node: Record<string, unknown>): string[] {
  const typeValue = node["@type"];
  const types: string[] = [];

  if (typeof typeValue === "string") {
    types.push(typeValue);
  } else if (Array.isArray(typeValue)) {
    for (const item of typeValue) {
      if (typeof item === "string") {
        types.push(item);
      }
    }
  }

  return types;
}

function getNodeName(node: Record<string, unknown>): string | null {
  const name = cleanText(
    typeof node.name === "string"
      ? node.name
      : typeof node.alternateName === "string"
        ? node.alternateName
        : "",
  );

  return name || null;
}

function collectSchemaEntities(html: string): SchemaEntity[] {
  const $ = cheerio.load(html);
  const entities: SchemaEntity[] = [];

  function visitNode(node: unknown): void {
    if (!node || typeof node !== "object") {
      return;
    }

    if (Array.isArray(node)) {
      for (const item of node) {
        visitNode(item);
      }
      return;
    }

    const record = node as Record<string, unknown>;
    const name = getNodeName(record);

    for (const rawType of getNodeTypes(record)) {
      const entityType = normalizeEntityType(rawType);

      if (entityType && name) {
        entities.push({ type: entityType, name });
      }
    }

    const graph = record["@graph"];

    if (Array.isArray(graph)) {
      for (const item of graph) {
        visitNode(item);
      }
    }
  }

  $('script[type="application/ld+json"]').each((_, element) => {
    const raw = $(element).html()?.trim();

    if (!raw) {
      return;
    }

    try {
      visitNode(JSON.parse(raw) as unknown);
    } catch {
      return;
    }
  });

  return entities;
}

function findSchemaEntity(
  entities: SchemaEntity[],
  type: EntityType,
): SchemaEntity | undefined {
  return entities.find((entity) => entity.type === type);
}

function extractTitleEntity(title: string): string {
  const cleaned = cleanText(title);

  if (!cleaned) {
    return "";
  }

  const parts = cleaned
    .split(TITLE_SEPARATORS)
    .map((part) => cleanText(part))
    .filter(Boolean);

  if (parts.length >= 2) {
    const [first, second] = parts;

    if (first.toLowerCase() === second.toLowerCase()) {
      return first;
    }
  }

  return cleanText(parts[0]) || cleaned;
}

function normalizeEntityName(name: string): string {
  return extractTitleEntity(cleanText(name));
}

function domainToEntity(pageUrl: string): string {
  const host = normalizeDomain(pageUrl);
  const base = host.split(".")[0] ?? host;

  return base
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function inferEntityType(
  _schemaEntities: SchemaEntity[],
  schemaTypes: string[],
  _source: string,
  candidateType?: EntityType,
): EntityType {
  for (const type of ENTITY_TYPE_PRIORITY) {
    const schemaType = type === "Website" ? "WebSite" : type;

    if (
      schemaTypes.some((item) => item.toLowerCase() === schemaType.toLowerCase())
    ) {
      return type;
    }
  }

  if (candidateType && candidateType !== "Unknown") {
    return candidateType;
  }

  return "Unknown";
}

function buildCandidates(input: {
  title: string;
  metaDescription: string;
  headings: AuditHeadings;
  socialMetadata: SocialMetadata;
  pageUrl: string;
  schemaEntities: SchemaEntity[];
}): EntityCandidate[] {
  const candidates: EntityCandidate[] = [];
  const organization = findSchemaEntity(input.schemaEntities, "Organization");
  const website = findSchemaEntity(input.schemaEntities, "Website");

  if (organization) {
    candidates.push({
      name: normalizeEntityName(organization.name),
      source: "Organization schema",
      confidence: 95,
      entityType: "Organization",
    });
  }

  if (website) {
    candidates.push({
      name: normalizeEntityName(website.name),
      source: "WebSite schema",
      confidence: 85,
      entityType: "Website",
    });
  }

  const ogSiteName = cleanText(input.socialMetadata.openGraph.siteName);

  if (ogSiteName) {
    candidates.push({
      name: normalizeEntityName(ogSiteName),
      source: "og:site_name",
      confidence: 75,
      entityType: "Unknown",
    });
  }

  const titleEntity = normalizeEntityName(extractTitleEntity(input.title));

  if (titleEntity) {
    candidates.push({
      name: titleEntity,
      source: "page title",
      confidence: 60,
      entityType: "Unknown",
    });
  }

  const domainEntity = domainToEntity(input.pageUrl);

  if (domainEntity) {
    candidates.push({
      name: domainEntity,
      source: "domain name",
      confidence: 40,
      entityType: "Unknown",
    });
  }

  return candidates;
}

function isStopTerm(term: string): boolean {
  const normalized = term.toLowerCase();

  if (STOP_WORDS.has(normalized)) {
    return true;
  }

  if (normalized.length < 3) {
    return true;
  }

  return normalized.split(/\s+/).every((word) => STOP_WORDS.has(word));
}

function normalizeRelatedTerm(term: string): string {
  return term.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "").trim();
}

function extractCapitalizedTerms(text: string): string[] {
  const matches =
    text.match(
      /\b[A-ZÄÖÜ][\p{L}\p{M}'-]*(?:\s+[A-ZÄÖÜ][\p{L}\p{M}'-]*)*\b/gu,
    ) ?? [];

  return matches.map(normalizeRelatedTerm).filter(Boolean);
}

function isPrimaryPart(term: string, primaryEntity: string | null): boolean {
  if (!primaryEntity) {
    return false;
  }

  return term.toLowerCase().trim() === primaryEntity.toLowerCase().trim();
}

function expandRelatedTerms(terms: string[]): string[] {
  const expanded: string[] = [];

  for (const term of terms) {
    expanded.push(term);

    for (const part of term.split(/\s*&\s*/)) {
      const normalized = normalizeRelatedTerm(part);

      if (normalized) {
        expanded.push(normalized);
      }

      const words = normalized.split(/\s+/).filter(Boolean);

      if (words.length > 1) {
        expanded.push(words[words.length - 1]);
      }
    }
  }

  return expanded;
}

function extractRelatedEntities(
  primaryEntity: string | null,
  title: string,
  metaDescription: string,
  headings: AuditHeadings,
): string[] {
  const counts = new Map<string, number>();
  const priorityTerms = new Set<string>();
  const allTexts = [
    title,
    metaDescription,
    ...headings.h1,
    ...headings.h2,
    ...headings.h3,
  ];

  for (const term of expandRelatedTerms(extractCapitalizedTerms(title))) {
    if (!isStopTerm(term) && !isPrimaryPart(term, primaryEntity)) {
      priorityTerms.add(term);
    }
  }

  for (const text of allTexts) {
    if (!text) {
      continue;
    }

    for (const term of expandRelatedTerms(extractCapitalizedTerms(text))) {
      if (isStopTerm(term) || isPrimaryPart(term, primaryEntity)) {
        continue;
      }

      counts.set(term, (counts.get(term) ?? 0) + 1);
    }
  }

  const ranked = [...counts.entries()]
    .filter(([term, count]) => count >= 2 || priorityTerms.has(term))
    .sort((left, right) => {
      const leftPriority = priorityTerms.has(left[0]) ? 1 : 0;
      const rightPriority = priorityTerms.has(right[0]) ? 1 : 0;

      if (leftPriority !== rightPriority) {
        return rightPriority - leftPriority;
      }

      return right[1] - left[1] || left[0].localeCompare(right[0]);
    })
    .map(([term]) => term);

  const merged = [...priorityTerms, ...ranked].filter(
    (term, index, items) => items.indexOf(term) === index,
  );

  return merged.slice(0, MAX_RELATED_ENTITIES);
}

export function extractEntityAnalysis(input: {
  title: string;
  metaDescription: string;
  headings: AuditHeadings;
  schemaTypes: string[];
  socialMetadata: SocialMetadata;
  pageUrl: string;
  html: string;
}): EntityAnalysis {
  const schemaEntities = collectSchemaEntities(input.html);
  const candidates = buildCandidates({
    title: input.title,
    metaDescription: input.metaDescription,
    headings: input.headings,
    socialMetadata: input.socialMetadata,
    pageUrl: input.pageUrl,
    schemaEntities,
  });

  const winner = candidates[0];

  if (!winner) {
    return { ...defaultEntityAnalysis };
  }

  const relatedEntities = extractRelatedEntities(
    winner.name,
    input.title,
    input.metaDescription,
    input.headings,
  );
  const entityType = inferEntityType(
    schemaEntities,
    input.schemaTypes,
    winner.source,
    winner.entityType,
  );

  return {
    primaryEntity: winner.name,
    entityType,
    confidence: winner.confidence,
    sources: [winner.source],
    relatedEntities,
  };
}

export function formatEntitySourceMessage(entityAnalysis: EntityAnalysis): string {
  if (!entityAnalysis.primaryEntity) {
    return "No primary entity could be determined.";
  }

  const source = entityAnalysis.sources[0] ?? "unknown source";

  if (source === "Organization schema") {
    return `Primary entity detected from Organization schema: ${entityAnalysis.primaryEntity}.`;
  }

  if (source === "WebSite schema") {
    return `Primary entity detected from WebSite schema: ${entityAnalysis.primaryEntity}.`;
  }

  if (source === "og:site_name") {
    return `Primary entity detected from og:site_name: ${entityAnalysis.primaryEntity}.`;
  }

  if (source === "page title") {
    return `Primary entity inferred from page title only: ${entityAnalysis.primaryEntity}.`;
  }

  return `Primary entity inferred from domain name: ${entityAnalysis.primaryEntity}.`;
}

export function runEntityChecks(entityAnalysis: EntityAnalysis): AuditCheck[] {
  const confidenceStatus =
    entityAnalysis.confidence >= 75
      ? "pass"
      : entityAnalysis.confidence >= 50
        ? "warn"
        : "fail";

  return [
    {
      id: "primary-entity-detected",
      label: "Primary entity detected",
      status: entityAnalysis.primaryEntity ? "pass" : "warn",
      message: entityAnalysis.primaryEntity
        ? `Primary entity identified as "${entityAnalysis.primaryEntity}".`
        : "No primary entity could be determined from available signals.",
    },
    {
      id: "entity-source-confidence",
      label: "Entity source confidence",
      status: confidenceStatus,
      message: entityAnalysis.primaryEntity
        ? `Entity confidence is ${entityAnalysis.confidence}% from ${entityAnalysis.sources.join(", ") || "unknown source"}.`
        : "Entity confidence is 0% because no primary entity was detected.",
    },
    {
      id: "related-entities-detected",
      label: "Related entities detected",
      status: entityAnalysis.relatedEntities.length > 0 ? "pass" : "warn",
      message:
        entityAnalysis.relatedEntities.length > 0
          ? `Found ${entityAnalysis.relatedEntities.length} related entity term(s): ${entityAnalysis.relatedEntities.join(", ")}.`
          : "No related entity terms were extracted from page content.",
    },
  ];
}
