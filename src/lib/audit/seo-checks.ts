import type { AuditCheck, ParsedPageData } from "./types";

type SeoCheckInput = ParsedPageData & {
  statusCode: number;
  schemaTypes: string[];
};

export function runSeoChecks(input: SeoCheckInput): AuditCheck[] {
  const checks: AuditCheck[] = [
    {
      id: "page-reachable",
      label: "Page reachable",
      status: input.statusCode >= 200 && input.statusCode < 400 ? "pass" : "fail",
      message:
        input.statusCode >= 200 && input.statusCode < 400
          ? `Page responded with status ${input.statusCode}.`
          : `Page responded with status ${input.statusCode}.`,
    },
    {
      id: "title-exists",
      label: "Title exists",
      status: input.title ? "pass" : "fail",
      message: input.title
        ? "Page title tag is present."
        : "No page title was found.",
    },
    {
      id: "meta-description-exists",
      label: "Meta description exists",
      status: input.metaDescription ? "pass" : "fail",
      message: input.metaDescription
        ? "Meta description is present."
        : "No meta description was found.",
    },
    {
      id: "one-h1-exists",
      label: "One H1 exists",
      status: input.headings.h1.length === 1 ? "pass" : "fail",
      message:
        input.headings.h1.length === 1
          ? "Exactly one H1 heading was found."
          : `Found ${input.headings.h1.length} H1 headings.`,
    },
    {
      id: "canonical-exists",
      label: "Canonical exists",
      status: input.canonical ? "pass" : "fail",
      message: input.canonical
        ? "Canonical link tag is present."
        : "No canonical URL was found.",
    },
    {
      id: "robots-meta-detected",
      label: "Robots meta detected",
      status: input.robotsMeta ? "pass" : "warn",
      message: input.robotsMeta
        ? `Robots directive: ${input.robotsMeta}.`
        : "No robots meta tag was found.",
    },
    {
      id: "json-ld-schema-detected",
      label: "JSON-LD schema detected",
      status: input.schemaTypes.length > 0 ? "pass" : "fail",
      message:
        input.schemaTypes.length > 0
          ? `Detected schema types: ${input.schemaTypes.join(", ")}.`
          : "No JSON-LD schema was found.",
    },
    {
      id: "internal-links-found",
      label: "Internal links found",
      status: input.links.internal > 0 ? "pass" : "warn",
      message:
        input.links.internal > 0
          ? `Found ${input.links.internal} internal links.`
          : "No internal links were found.",
    },
  ];

  return checks;
}
