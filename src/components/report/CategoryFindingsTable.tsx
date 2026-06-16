import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import type { CategoryFinding, FindingStatus } from "@/lib/category-detail-data";
import { Fragment } from "react";
import { reportStyles } from "./reportStyles";

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
    <section className={cn(reportStyles.card, "overflow-hidden")}>
      <div className={reportStyles.tableSectionHeader}>
        <h3 className={reportStyles.sectionTitle}>{title}</h3>
        <div className="flex flex-wrap gap-2">
          <span className={reportStyles.countBadge}>
            <span className="h-2 w-2 rounded-full bg-[#2E7D32]" />
            {passCount} Pass
          </span>
          <span className={reportStyles.countBadge}>
            <span className="h-2 w-2 rounded-full bg-[#FFC107]" />
            {warnCount} Warning
          </span>
          <span className={reportStyles.countBadge}>
            <span className="h-2 w-2 rounded-full bg-error" />
            {criticalCount} Critical
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className={reportStyles.tableHeaderRow}>
            <tr>
              <th className={reportStyles.tableHeadCell}>Parameter</th>
              <th className={reportStyles.tableHeadCell}>Status</th>
              <th className={cn(reportStyles.tableHeadCell, "text-right")}>
                Optimization
              </th>
              <th className={cn(reportStyles.tableHeadCell, "text-right")}>Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {groups.map((group) => (
              <Fragment key={group.label}>
                <tr className="bg-surface-container-low/50">
                  <td
                    colSpan={4}
                    className="px-stack-lg py-3 text-label-md font-bold uppercase text-primary"
                  >
                    {group.label}
                  </td>
                </tr>
                {group.items.map((finding) => (
                  <tr
                    key={finding.id}
                    className={cn(
                      "group border-l-4 border-l-transparent transition-colors hover:bg-primary-container/5",
                      rowAccent[finding.status],
                    )}
                  >
                    <td className={reportStyles.tableBodyCell}>
                      <div className="flex items-center gap-2.5">
                        <Icon name={finding.icon} className="text-outline" size={20} />
                        <div>
                          <span className="font-bold text-primary">{finding.label}</span>
                          <p className="line-clamp-1 text-body-sm text-on-surface-variant">
                            {finding.detail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={reportStyles.tableBodyCell}>
                      <span
                        className={cn(
                          reportStyles.tableBadge,
                          statusStyles[finding.status],
                        )}
                      >
                        {statusLabels[finding.status]}
                      </span>
                    </td>
                    <td className={cn(reportStyles.tableBodyCell, "text-right text-data-mono")}>
                      {finding.optimization}%
                    </td>
                    <td className={cn(reportStyles.tableBodyCell, "text-right")}>
                      <button
                        type="button"
                        className="text-label-md font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100 hover:underline"
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
