import { Icon } from "@/components/icons/Icon";
import { ScoreRing } from "@/components/ui";
import type {
  ExtractedDataSummary,
  ReportStrength,
} from "@/lib/audit/audit-to-report";
import { criticalIssues, reportDataMode, reportMeta, strengths } from "@/lib/report-data";

type ScoreHeroCardProps = {
  score?: number;
  strengths?: ReportStrength[];
  criticalIssues?: ReportStrength[];
  summary?: string;
  isRealData?: boolean;
  extractedSummary?: ExtractedDataSummary;
};

function DataModeBadge({ isRealData }: { isRealData: boolean }) {
  if (isRealData) {
    return (
      <span className="mb-4 flex items-center gap-1.5 rounded-full bg-primary-blue/10 px-3 py-1 text-label-md text-primary-blue">
        <Icon name="verified" size={16} />
        {reportDataMode.real}
      </span>
    );
  }

  return (
    <span className="mb-4 flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-label-md text-amber-800">
      <Icon name="info" size={16} />
      {reportDataMode.demo}
    </span>
  );
}

function ExtractedDataPanel({ summary }: { summary: ExtractedDataSummary }) {
  const schemaLabel =
    summary.schemaTypes.length > 0
      ? summary.schemaTypes.join(", ")
      : "None";

  const items = [
    { label: "H1", value: summary.h1Count },
    { label: "H2", value: summary.h2Count },
    { label: "Schema", value: `${summary.schemaTypesCount} (${schemaLabel})` },
    { label: "Internal links", value: summary.internalLinks },
    { label: "External links", value: summary.externalLinks },
    {
      label: "robots.txt",
      value: summary.robotsTxtExists ? "Found" : "Missing",
    },
    {
      label: "Sitemaps in robots",
      value: summary.robotsSitemapCount,
    },
    {
      label: "Disallow rules",
      value: summary.robotsDisallowCount,
    },
    {
      label: "Sitemap.xml",
      value: summary.sitemapExists ? "Found" : "Missing",
    },
    {
      label: "Sitemap URLs",
      value: summary.sitemapUrlCount,
    },
    {
      label: "Child sitemaps",
      value: summary.sitemapChildCount,
    },
    {
      label: "OG title",
      value: summary.ogTitleFound ? "Found" : "Missing",
    },
    {
      label: "OG description",
      value: summary.ogDescriptionFound ? "Found" : "Missing",
    },
    {
      label: "OG image",
      value: summary.ogImageFound ? "Found" : "Missing",
    },
    {
      label: "Twitter card",
      value: summary.twitterCard,
    },
    {
      label: "Primary entity",
      value: summary.primaryEntity,
    },
    {
      label: "Entity type",
      value: summary.entityType,
    },
    {
      label: "Entity confidence",
      value: `${summary.entityConfidence}%`,
    },
    {
      label: "Related entities",
      value:
        summary.relatedEntities.length > 0
          ? summary.relatedEntities.join(", ")
          : "None",
    },
    {
      label: "Word count",
      value: summary.wordCount,
    },
    {
      label: "Paragraphs",
      value: summary.paragraphCount,
    },
    {
      label: "Lists / tables",
      value: `${summary.listCount} / ${summary.tableCount}`,
    },
    {
      label: "Question headings",
      value: summary.questionHeadingCount,
    },
    {
      label: "FAQ text",
      value: summary.hasFAQText ? "Found" : "Missing",
    },
  ];

  return (
    <div className="mt-4 w-full rounded-lg border border-outline-variant bg-white p-3">
      <p className="mb-2 text-label-md uppercase tracking-wider text-on-surface-variant">
        Extracted data
      </p>
      <ul className="space-y-1.5 text-body-sm text-on-surface">
        {items.map((item) => (
          <li key={item.label} className="flex items-start justify-between gap-3">
            <span className="text-on-surface-variant">{item.label}</span>
            <span className="text-right font-medium">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ScoreHeroCard({
  score = reportMeta.score,
  strengths: strengthItems = strengths,
  criticalIssues: issueItems = criticalIssues,
  summary = "Your domain exhibits high authority in niche entity associations.",
  isRealData = false,
  extractedSummary,
}: ScoreHeroCardProps) {
  return (
    <section className="grid grid-cols-1 gap-8 rounded-[24px] border border-gray-100 bg-white p-8 card-shadow lg:grid-cols-12 lg:gap-stack-xl md:p-10">
      <div className="flex flex-col items-center justify-center rounded-xl bg-surface-container-low p-6 md:p-stack-lg lg:col-span-4">
        <DataModeBadge isRealData={isRealData} />
        <ScoreRing
          score={score}
          size="md"
          statusLabel="GOOD"
          statusClassName="text-green-600"
          trackClassName="text-gray-200"
          indicatorClassName="text-primary-blue"
        />
        <p className="mt-6 max-w-[280px] text-center text-body-md text-on-surface-variant">
          {summary}
        </p>
        {isRealData && extractedSummary ? (
          <ExtractedDataPanel summary={extractedSummary} />
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-stack-lg lg:col-span-8">
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-headline-md">
            <Icon name="thumb_up" className="text-green-600" />
            Strengths
          </h3>
          <ul className="space-y-4">
            {strengthItems.map((item, index) => (
              <li
                key={`${item.title}-${index}`}
                className="flex items-start gap-3 rounded-lg border border-green-100 bg-green-50/50 p-3"
              >
                <Icon
                  name="check_circle"
                  className="mt-0.5 text-green-600"
                />
                <div className="text-body-md">
                  <strong>{item.title}</strong> {item.text}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-headline-md">
            <Icon name="warning" className="text-accent-coral" />
            Critical Issues
          </h3>
          <ul className="space-y-4">
            {issueItems.length > 0 ? (
              issueItems.map((item, index) => (
                <li
                  key={`${item.title}-${index}`}
                  className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50/50 p-3"
                >
                  <Icon name="error" className="mt-0.5 text-accent-coral" />
                  <div className="text-body-md">
                    <strong>{item.title}</strong> {item.text}
                  </div>
                </li>
              ))
            ) : (
              <li className="rounded-lg border border-outline-variant bg-surface-container-low p-3 text-body-md text-on-surface-variant">
                No warning or failed checks detected.
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
