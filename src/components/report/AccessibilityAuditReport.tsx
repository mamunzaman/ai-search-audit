"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { ReportV2AccessibilityReport } from "@/lib/audit/report-v2";

type AccessibilityAuditReportProps = {
  data: ReportV2AccessibilityReport;
};

const statusStyles = {
  pass: "bg-secondary-container text-on-secondary-container",
  warning: "bg-surface-container text-on-surface-variant",
  fail: "bg-error-container text-on-error-container",
};

const statusLabels = {
  pass: "Pass",
  warning: "Warning",
  fail: "Fail",
};

export function AccessibilityAuditReport({ data }: AccessibilityAuditReportProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleFindings = showAll ? data.findings : data.findings.slice(0, 6);

  return (
    <section className="overflow-hidden rounded-[24px] border border-outline-variant bg-white card-shadow">
      <div className="flex flex-col gap-3 border-b border-outline-variant bg-surface-container-low px-stack-lg py-stack-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-headline-md text-primary">Accessibility Audit Report</h2>
          <p className="text-body-sm text-on-surface-variant">
            Automated WCAG 2.2 readiness checks — not legal compliance or certification
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-headline-md text-primary">{data.score}</span>
          <span className="text-body-sm text-on-surface-variant">/100</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low">
            <tr>
              <th className="px-stack-lg py-4 text-label-md uppercase text-on-surface-variant">
                Check
              </th>
              <th className="px-stack-lg py-4 text-label-md uppercase text-on-surface-variant">
                WCAG
              </th>
              <th className="px-stack-lg py-4 text-label-md uppercase text-on-surface-variant">
                Status
              </th>
              <th className="px-stack-lg py-4 text-label-md uppercase text-on-surface-variant">
                Recommendation
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {visibleFindings.map((finding) => (
              <tr key={finding.id} className="hover:bg-primary-container/5">
                <td className="px-stack-lg py-4 text-body-sm font-medium text-primary">
                  {finding.label}
                </td>
                <td className="px-stack-lg py-4 text-body-sm text-on-surface-variant">
                  {finding.wcag}
                </td>
                <td className="px-stack-lg py-4">
                  <span
                    className={cn(
                      "rounded px-2 py-1 text-[10px] font-bold uppercase",
                      statusStyles[finding.status],
                    )}
                  >
                    {statusLabels[finding.status]}
                  </span>
                </td>
                <td className="px-stack-lg py-4 text-body-sm text-on-surface-variant">
                  {finding.recommendation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.totalFindings > 6 ? (
        <div className="border-t border-outline-variant px-stack-lg py-stack-md">
          <button
            type="button"
            className="text-label-md font-bold text-primary hover:underline"
            onClick={() => setShowAll((current) => !current)}
          >
            {showAll
              ? "Show fewer accessibility findings"
              : `View all accessibility findings (${data.totalFindings})`}
          </button>
        </div>
      ) : null}
    </section>
  );
}
