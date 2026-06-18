import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
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
      className="sticky top-0 z-20 flex w-full min-w-0 flex-col gap-stack-sm border-b border-outline-variant bg-surface-container-lowest px-margin-mobile py-3 shadow-sm md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-stack-md md:px-4 lg:px-margin-desktop lg:py-4"
    >
      <div className="min-w-0 flex-1 basis-full md:min-w-[12rem] md:basis-auto md:max-w-[min(100%,28rem)] lg:max-w-[36rem]">
        <h1 className={cn("font-bold text-primary", "text-headline-lg-mobile md:text-headline-md lg:truncate")}>
          {domain} Report
        </h1>
        <p className="text-body-sm text-text-secondary">Visual Analytics Executive Summary</p>
      </div>
      <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-stack-sm md:ml-auto md:flex-nowrap lg:gap-stack-md">
        <DebugDownloadButton />
        <ExportReportButton />
        <Link href="/" className="shrink-0">
          <Button
            data-report-print-hide
            type="button"
            className="whitespace-nowrap rounded-lg px-4 py-2 text-label-md hover:brightness-110 lg:px-6"
          >
            Run New Audit
          </Button>
        </Link>
        <div
          data-report-print-hide
          className="hidden h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-surface-container sm:flex"
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
