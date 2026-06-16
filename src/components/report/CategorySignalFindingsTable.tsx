import { cn } from "@/lib/cn";
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
};

export function CategorySignalFindingsTable({
  title,
  findings,
}: CategorySignalFindingsTableProps) {
  return (
    <section className={cn(reportStyles.card, "overflow-hidden")}>
      <div className={reportStyles.tableSectionHeader}>
        <h3 className={reportStyles.sectionTitle}>{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-left">
          <thead className={reportStyles.tableHeaderRow}>
            <tr>
              <th className={reportStyles.tableHeadCell}>Signal</th>
              <th className={reportStyles.tableHeadCell}>Status</th>
              <th className={reportStyles.tableHeadCell}>Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant text-body-sm">
            {findings.map((finding) => (
              <tr
                key={finding.id}
                className="transition-colors hover:bg-primary-container/5"
              >
                <td className={cn(reportStyles.tableBodyCell, "font-medium")}>
                  {finding.label}
                </td>
                <td className={reportStyles.tableBodyCell}>
                  <span
                    className={cn(reportStyles.tableBadge, finding.statusClassName)}
                  >
                    {finding.statusLabel}
                  </span>
                </td>
                <td className={cn(reportStyles.tableBodyCell, "text-on-surface-variant")}>
                  {finding.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
