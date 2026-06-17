import { cn } from "@/lib/cn";
import { isExplanationStatus } from "@/lib/report/issueExplanations";
import { Fragment } from "react";
import { IssueExplanationAccordion } from "./IssueExplanationAccordion";
import { reportStyles } from "./reportStyles";

export type SignalFindingRow = {
  id: string;
  label: string;
  statusLabel: string;
  statusClassName: string;
  message: string;
};

type CategorySignalFindingsTableProps = {
  title: string;
  findings: SignalFindingRow[];
  category?: string;
  compact?: boolean;
};

export function CategorySignalFindingsTable({
  title,
  findings,
  category,
  compact = true,
}: CategorySignalFindingsTableProps) {
  const sectionHeader = compact
    ? reportStyles.tableSectionHeaderCompact
    : reportStyles.tableSectionHeader;
  const headCell = compact ? reportStyles.tableHeadCellCompact : reportStyles.tableHeadCell;
  const bodyCell = compact ? reportStyles.tableBodyCellCompact : reportStyles.tableBodyCell;
  const accordionCell = compact ? reportStyles.accordionCellIndented : "px-stack-lg pb-3 pt-1 pl-10";
  return (
    <section className={cn(reportStyles.card, "overflow-hidden")}>
      <div className={sectionHeader}>
        <h3 className={reportStyles.sectionTitle}>{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-left">
          <thead className={reportStyles.tableHeaderRow}>
            <tr>
              <th className={headCell}>Signal</th>
              <th className={headCell}>Status</th>
              <th className={headCell}>Detail</th>
            </tr>
          </thead>
          <tbody className="text-body-sm">
            {findings.map((finding) => {
              const showAccordion = isExplanationStatus(finding.statusLabel);

              return (
                <Fragment key={finding.id}>
                  <tr
                    className={cn(
                      "transition-colors hover:bg-primary-container/5",
                      showAccordion ? "border-b-0" : "border-b border-outline-variant",
                    )}
                  >
                    <td className={cn(bodyCell, "font-medium")}>
                      {finding.label}
                    </td>
                    <td className={bodyCell}>
                      <span
                        className={cn(reportStyles.tableBadge, finding.statusClassName)}
                      >
                        {finding.statusLabel}
                      </span>
                    </td>
                    <td className={cn(bodyCell, "text-on-surface-variant")}>
                      {finding.message}
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
                          status={finding.statusLabel}
                          recommendation={finding.message}
                        />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
