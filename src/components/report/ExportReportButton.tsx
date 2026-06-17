"use client";

import { Icon } from "@/components/icons/Icon";
import { Button } from "@/components/ui";
import { buildExportReportTitle, exportReport } from "@/lib/report/exportReport";
import { cn } from "@/lib/cn";

type ExportReportButtonProps = {
  domain?: string;
  className?: string;
  compact?: boolean;
};

export function ExportReportButton({
  domain,
  className,
  compact = false,
}: ExportReportButtonProps) {
  function handleExport() {
    exportReport({
      title: domain ? buildExportReportTitle(domain) : undefined,
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      data-report-print-hide
      onClick={handleExport}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg text-label-md",
        compact ? "px-4 py-2" : "px-4 py-2",
        className,
      )}
    >
      <Icon name="picture_as_pdf" className="text-[20px]" />
      Export Report
    </Button>
  );
}
