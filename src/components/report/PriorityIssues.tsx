import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import type { ReportIssue } from "@/lib/report-data";

const impactStyles: Record<ReportIssue["impact"], string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-amber-100 text-amber-800",
};

type PriorityIssuesProps = {
  issues: ReportIssue[];
};

export function PriorityIssues({ issues }: PriorityIssuesProps) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-gray-100 bg-white card-shadow">
      <div className="flex items-center justify-between border-b border-gray-100 p-stack-lg">
        <h3 className="text-headline-md">High Priority Issues</h3>
        <button
          type="button"
          className="flex items-center gap-1 text-label-md text-primary-blue hover:underline"
        >
          View All Issues
          <Icon name="chevron_right" size={18} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-100 bg-surface-container-low">
            <tr>
              <th className="p-stack-lg text-label-md uppercase tracking-wider text-on-surface-variant">
                Issue
              </th>
              <th className="p-stack-lg text-label-md uppercase tracking-wider text-on-surface-variant">
                Impact
              </th>
              <th className="p-stack-lg text-right text-label-md uppercase tracking-wider text-on-surface-variant">
                Difficulty
              </th>
              <th className="p-stack-lg text-right text-label-md uppercase tracking-wider text-on-surface-variant">
                Est. Gain
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {issues.map((issue) => (
              <tr
                key={issue.title}
                className="transition-colors hover:bg-blue-50/30"
              >
                <td className="p-stack-lg py-6">
                  <p className="text-body-md font-semibold text-primary-blue">
                    {issue.title}
                  </p>
                  {issue.explanation ? (
                    <p className="mt-1 text-body-sm text-on-surface-variant">
                      {issue.explanation}
                    </p>
                  ) : null}
                </td>
                <td className="p-stack-lg py-6">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-label-md",
                      impactStyles[issue.impact],
                    )}
                  >
                    {issue.impact}
                  </span>
                </td>
                <td className="p-stack-lg py-6 text-right text-body-md">
                  {issue.difficulty}
                </td>
                <td className="p-stack-lg py-6 text-right text-data-mono font-bold text-green-600">
                  +{issue.gain}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
