import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import type { CategoryFinding, FindingStatus } from "@/lib/category-detail-data";
import { Fragment } from "react";

type CategoryFindingsTableProps = {
  findings: CategoryFinding[];
  title?: string;
};

const statusLabels: Record<FindingStatus, string> = {
  optimized: "Pass",
  needs_attention: "Warning",
  critical: "Critical",
};

const statusStyles: Record<FindingStatus, string> = {
  optimized: "bg-[#E8F5E9] text-[#2E7D32]",
  needs_attention: "bg-[#FFF9C4] text-[#856404]",
  critical: "bg-error-container text-on-error-container",
};

const rowAccent: Record<FindingStatus, string> = {
  optimized: "group-hover:border-l-[#2E7D32]",
  needs_attention: "group-hover:border-l-[#FFC107]",
  critical: "group-hover:border-l-error",
};

const FINDING_GROUPS: { label: string; ids: string[] }[] = [
  {
    label: "Core Metadata",
    ids: ["title", "meta-description", "h1", "canonical"],
  },
  {
    label: "Crawl & Index",
    ids: ["robots-meta", "robots-txt", "sitemap"],
  },
  {
    label: "Links & Social",
    ids: ["internal-links", "open-graph", "twitter-card"],
  },
];

function groupFindings(findings: CategoryFinding[]) {
  const grouped = FINDING_GROUPS.map((group) => ({
    label: group.label,
    items: group.ids
      .map((id) => findings.find((finding) => finding.id === id))
      .filter((finding): finding is CategoryFinding => Boolean(finding)),
  }));

  const usedIds = new Set(grouped.flatMap((group) => group.items.map((i) => i.id)));
  const remainder = findings.filter((finding) => !usedIds.has(finding.id));

  if (remainder.length > 0) {
    grouped.push({ label: "Other", items: remainder });
  }

  return grouped.filter((group) => group.items.length > 0);
}

export function CategoryFindingsTable({
  findings,
  title = "Detailed Audit Findings",
}: CategoryFindingsTableProps) {
  const groups = groupFindings(findings);
  const passCount = findings.filter((f) => f.status === "optimized").length;
  const warnCount = findings.filter((f) => f.status === "needs_attention").length;
  const criticalCount = findings.filter((f) => f.status === "critical").length;

  return (
    <section className="overflow-hidden rounded-[24px] border border-outline-variant bg-white card-shadow">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant px-5 py-3">
        <h3 className="text-headline-md">{title}</h3>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-canvas px-2.5 py-0.5 text-[10px] font-bold uppercase text-on-surface-variant">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2E7D32]" />
            {passCount} Pass
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-canvas px-2.5 py-0.5 text-[10px] font-bold uppercase text-on-surface-variant">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FFC107]" />
            {warnCount} Warning
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-canvas px-2.5 py-0.5 text-[10px] font-bold uppercase text-on-surface-variant">
            <span className="h-1.5 w-1.5 rounded-full bg-error" />
            {criticalCount} Critical
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-canvas">
              <th className="px-5 py-3 text-label-md uppercase text-outline">
                Parameter
              </th>
              <th className="px-5 py-3 text-label-md uppercase text-outline">
                Status
              </th>
              <th className="px-5 py-3 text-right text-label-md uppercase text-outline">
                Optimization
              </th>
              <th className="px-5 py-3 text-right text-label-md uppercase text-outline">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <Fragment key={group.label}>
                <tr className="bg-surface-container-low/50">
                  <td
                    colSpan={4}
                    className="px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-primary"
                  >
                    {group.label}
                  </td>
                </tr>
                {group.items.map((finding) => (
                  <tr
                    key={finding.id}
                    className={cn(
                      "group border-b border-outline-variant/50 border-l-4 border-l-transparent transition-colors hover:bg-[#f0f4ff]",
                      rowAccent[finding.status],
                    )}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Icon name={finding.icon} className="text-outline" size={20} />
                        <div>
                          <span className="font-medium text-on-surface">
                            {finding.label}
                          </span>
                          <p className="line-clamp-1 text-[11px] text-on-surface-variant">
                            {finding.detail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                          statusStyles[finding.status],
                        )}
                      >
                        {statusLabels[finding.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-body-sm tabular-nums">
                      {finding.optimization}%
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        className="text-body-sm font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        {finding.status === "optimized" ? "View Details" : "Optimize"}
                      </button>
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
