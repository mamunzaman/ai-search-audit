import type { VisualInsights } from "@/types/audit";
import { AIVisibilityBreakdownCard } from "./AIVisibilityBreakdownCard";
import { HeadingStructureCard } from "./HeadingStructureCard";
import { SchemaCoverageCard } from "./SchemaCoverageCard";
import { SocialMetadataCoverageCard } from "./SocialMetadataCoverageCard";

type VisualInsightsSectionProps = {
  data: VisualInsights;
};

export function VisualInsightsSection({ data }: VisualInsightsSectionProps) {
  return (
    <section className="animate-fade-in space-y-stack-md" style={{ animationDelay: "0.4s" }}>
      <div className="min-w-0">
        <p className="text-label-md font-bold uppercase tracking-wider text-primary">
          Visual Insights
        </p>
        <h2 className="text-headline-md text-on-surface">
          Audit Results at a Glance
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
        <HeadingStructureCard data={data.headingStructure} />
        <AIVisibilityBreakdownCard data={data.aiVisibilityBreakdown} />
        <SchemaCoverageCard data={data.schemaCoverage} />
        <SocialMetadataCoverageCard data={data.socialMetadataCoverage} />
      </div>
    </section>
  );
}
