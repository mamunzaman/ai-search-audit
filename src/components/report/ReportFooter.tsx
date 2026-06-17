import Link from "next/link";
import { reportOverviewHref } from "@/lib/report/navigation";

type ReportFooterProps = {
  domain?: string;
};

export function ReportFooter({ domain }: ReportFooterProps) {
  const reportHref = domain ? reportOverviewHref(domain) : "/report";

  return (
    <footer
      data-report-print-hide
      className="mt-auto border-t border-outline-variant bg-white px-margin-desktop py-8"
    >
      <div className="mx-auto flex max-w-container-max flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            aria-label="Go to homepage"
            className="cursor-pointer text-headline-md font-bold text-primary transition-colors hover:text-primary-container"
          >
            AuditMetric
          </Link>
          <span className="ml-2 border-l border-outline-variant pl-2 text-body-sm text-on-surface-variant">
            © 2026 Algorithmic Clarity Tooling.
          </span>
        </div>
        <nav className="flex flex-wrap justify-center gap-6">
          <Link
            href="/"
            className="text-label-md text-on-surface-variant transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link
            href="/"
            className="text-label-md text-on-surface-variant transition-colors hover:text-primary"
          >
            New Audit
          </Link>
          <Link
            href={reportHref}
            className="text-label-md text-on-surface-variant transition-colors hover:text-primary"
          >
            Report Overview
          </Link>
        </nav>
      </div>
    </footer>
  );
}
