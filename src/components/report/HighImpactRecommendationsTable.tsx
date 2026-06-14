import { cn } from "@/lib/cn";
import type { ReportV2RecommendationRow } from "@/lib/audit/report-v2";

type HighImpactRecommendationsTableProps = {
  rows: ReportV2RecommendationRow[];
  criticalCount: number;
  optimizationCount: number;
};

const statusStyles = {
  Critical: "bg-error-container text-on-error-container",
  Optimization: "bg-secondary-container text-on-secondary-container",
};

export function HighImpactRecommendationsTable({
  rows,
  criticalCount,
  optimizationCount,
}: HighImpactRecommendationsTableProps) {
  return (
    <section
      className="animate-fade-in overflow-hidden rounded-[24px] border border-outline-variant bg-white card-shadow"
      style={{ animationDelay: "0.6s" }}
    >
      <div className="flex flex-col gap-3 border-b border-outline-variant bg-surface-container-low px-stack-lg py-stack-md sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-headline-md">High-Impact Recommendations</h3>
        <div className="flex gap-stack-sm">
          <span className="flex items-center gap-1 rounded-full border border-outline-variant bg-white px-3 py-1 text-label-md text-on-surface-variant">
            <span className="h-2 w-2 rounded-full bg-error" />
            {criticalCount} Critical
          </span>
          <span className="flex items-center gap-1 rounded-full border border-outline-variant bg-white px-3 py-1 text-label-md text-on-surface-variant">
            <span className="h-2 w-2 rounded-full bg-secondary" />
            {optimizationCount} Optimization
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low">
            <tr>
              <th className="px-stack-lg py-4 text-label-md uppercase text-on-surface-variant">
                Issue
              </th>
              <th className="px-stack-lg py-4 text-label-md uppercase text-on-surface-variant">
                Status
              </th>
              <th className="px-stack-lg py-4 text-label-md uppercase text-on-surface-variant">
                Potential Impact
              </th>
              <th className="px-stack-lg py-4 text-right text-label-md uppercase text-on-surface-variant">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {rows.map((row) => (
              <tr
                key={row.title}
                className="transition-colors hover:bg-primary-container/5"
              >
                <td className="px-stack-lg py-5">
                  <div className="flex flex-col">
                    <span className="font-bold text-primary">{row.title}</span>
                    {row.description ? (
                      <span className="line-clamp-2 text-body-sm text-on-surface-variant">
                        {row.description}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-stack-lg py-5">
                  <span
                    className={cn(
                      "rounded px-2 py-1 text-[10px] font-bold uppercase",
                      statusStyles[row.status],
                    )}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-stack-lg py-5">
                  <span className="text-data-mono text-primary">{row.impact}</span>
                </td>
                <td className="px-stack-lg py-5 text-right">
                  <button
                    type="button"
                    className="text-label-md font-bold text-primary hover:underline"
                  >
                    {row.action}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
