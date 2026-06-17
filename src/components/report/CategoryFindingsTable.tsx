import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import type { CategoryFinding, FindingStatus } from "@/lib/category-detail-data";
import { isExplanationStatus } from "@/lib/report/issueExplanations";
import { Fragment } from "react";
import { IssueExplanationAccordion } from "./IssueExplanationAccordion";
import { ReportFadeIn } from "./ReportMotion";
import { reportStyles } from "./reportStyles";

type CategoryFindingsTableProps = {
  findings: CategoryFinding[];
  title?: string;
  category?: string;
  compact?: boolean;
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

function findingNeedsExplanation(status: FindingStatus): boolean {
  return isExplanationStatus(statusLabels[status]);
}

export function CategoryFindingsTable({
  findings,
  title = "Detailed Audit Findings",
  category = "SEO Health",
  compact = false,
}: CategoryFindingsTableProps) {
  const groups = groupFindings(findings);
  const passCount = findings.filter((f) => f.status === "optimized").length;
  const warnCount = findings.filter((f) => f.status === "needs_attention").length;
  const criticalCount = findings.filter((f) => f.status === "critical").length;
  const sectionHeader = compact
    ? reportStyles.tableSectionHeaderCompact
    : reportStyles.tableSectionHeader;
  const headCell = compact ? reportStyles.tableHeadCellCompact : reportStyles.tableHeadCell;
  const bodyCell = compact ? reportStyles.tableBodyCellCompact : reportStyles.tableBodyCell;
  const accordionCell = compact ? reportStyles.accordionCellIndented : "px-stack-lg pb-3 pt-1 pl-12";

  return (
    <ReportFadeIn>
      <section className={cn(reportStyles.card, "overflow-hidden")}>
      <div className={sectionHeader}>
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
              <th className={headCell}>Parameter</th>
              <th className={headCell}>Status</th>
              <th className={cn(headCell, "text-right")}>
                Optimization
              </th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <Fragment key={group.label}>
                <tr className="bg-surface-container-low/50">
                  <td
                    colSpan={3}
                    className="border-b border-outline-variant px-stack-lg py-3 text-label-md font-bold uppercase text-primary"
                  >
                    {group.label}
                  </td>
                </tr>
                {group.items.map((finding) => {
                  const showAccordion = findingNeedsExplanation(finding.status);

                  return (
                    <Fragment key={finding.id}>
                      <tr
                        className={cn(
                          "group border-l-4 border-l-transparent transition-colors hover:bg-primary-container/5",
                          rowAccent[finding.status],
                          showAccordion ? "border-b-0" : "border-b border-outline-variant",
                        )}
                      >
                        <td className={bodyCell}>
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
                        <td className={bodyCell}>
                          <span
                            className={cn(
                              reportStyles.tableBadge,
                              statusStyles[finding.status],
                            )}
                          >
                            {statusLabels[finding.status]}
                          </span>
                        </td>
                        <td
                          className={cn(
                            bodyCell,
                            "text-right text-data-mono",
                          )}
                        >
                          {finding.optimization}%
                        </td>
                      </tr>
                      {showAccordion ? (
                        <tr
                          className={cn(
                            reportStyles.accordionRowConnected,
                            "border-b border-outline-variant",
                          )}
                        >
                          <td colSpan={3} className={accordionCell}>
                            <IssueExplanationAccordion
                              title={finding.label}
                              category={category}
                              status={statusLabels[finding.status]}
                              recommendation={finding.detail}
                            />
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
    </ReportFadeIn>
  );
}
