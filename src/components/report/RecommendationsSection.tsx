import { Icon } from "@/components/icons/Icon";
import type { ReportRecommendation } from "@/lib/report-data";

type RecommendationsSectionProps = {
  recommendation?: ReportRecommendation;
};

export function RecommendationsSection({
  recommendation,
}: RecommendationsSectionProps) {
  if (!recommendation) {
    return (
      <div className="rounded-[24px] border border-gray-100 bg-white p-10 card-shadow lg:col-span-2">
        <div className="mb-6 flex items-center gap-3">
          <Icon
            name="lightbulb"
            className="rounded-lg bg-orange-100 p-2 text-orange-600"
          />
          <h3 className="text-headline-md">Add Organization Schema</h3>
        </div>
        <div className="grid grid-cols-1 gap-stack-lg md:grid-cols-2">
          <div className="space-y-3">
            <h4 className="text-label-md uppercase text-on-surface-variant">
              Why this matters
            </h4>
            <p className="text-body-md text-on-surface">
              LLMs use Organizational Schema to verify the entity that owns the
              content. Without it, your site&apos;s authority is diluted, making
              it less likely to be cited as a &quot;Source of Truth&quot; for
              historical coin data.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-label-md uppercase text-on-surface-variant">
              How to fix
            </h4>
            <p className="text-body-md text-on-surface">
              Inject a JSON-LD block into your homepage &lt;head&gt; defining
              &apos;@type&apos;: &apos;Organization&apos;, name, logo, and
              &apos;sameAs&apos; links to official social profiles.
            </p>
            <button
              type="button"
              className="flex items-center gap-1 font-bold text-primary-blue hover:underline"
            >
              Get Code Snippet
              <Icon name="code" size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-gray-100 bg-white p-10 card-shadow lg:col-span-2">
      <div className="mb-6 flex items-center gap-3">
        <Icon
          name="lightbulb"
          className="rounded-lg bg-orange-100 p-2 text-orange-600"
        />
        <h3 className="text-headline-md">{recommendation.title}</h3>
      </div>
      <div className="grid grid-cols-1 gap-stack-lg md:grid-cols-2">
        <div className="space-y-3">
          <h4 className="text-label-md uppercase text-on-surface-variant">
            Why this matters
          </h4>
          <p className="text-body-md text-on-surface">
            {recommendation.whyThisMatters}
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-label-md uppercase text-on-surface-variant">
            How to fix
          </h4>
          <p className="text-body-md text-on-surface">
            {recommendation.howToFix}
          </p>
          <p className="text-label-md text-green-700">
            Estimated gain: +{recommendation.estimatedGain}
          </p>
          <button
            type="button"
            className="flex items-center gap-1 font-bold text-primary-blue hover:underline"
          >
            Get Code Snippet
            <Icon name="code" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
