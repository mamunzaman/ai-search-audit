import Image from "next/image";
import Link from "next/link";
import { DebugDownloadButton } from "@/components/report/DebugDownloadButton";
import { ExportReportButton } from "@/components/report/ExportReportButton";
import { Button } from "@/components/ui";
import { avatarUrl } from "@/lib/report-data";

type ReportTopNavProps = {
  domain: string;
};

export function ReportTopNav({ domain }: ReportTopNavProps) {
  return (
    <header
      data-report-print-hide
      className="sticky top-0 z-20 flex w-full min-w-0 flex-wrap items-center justify-between gap-stack-sm border-b border-outline-variant bg-surface-container-lowest px-margin-desktop py-4 shadow-sm"
    >
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-headline-md font-bold text-primary">
          {domain} Report
        </h1>
        <p className="text-body-sm text-on-surface-variant">
          Visual Analytics Executive Summary
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-stack-sm sm:gap-stack-md">
        <DebugDownloadButton />
        <ExportReportButton domain={domain} />
        <Link href="/">
          <Button
            data-report-print-hide
            type="button"
            className="rounded-lg px-6 py-2 text-label-md hover:brightness-110"
          >
            Run New Audit
          </Button>
        </Link>
        <div
          data-report-print-hide
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-surface-container"
        >
          <Image
            src={avatarUrl}
            alt="User profile photo"
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
