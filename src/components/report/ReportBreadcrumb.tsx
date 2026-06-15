import { Icon } from "@/components/icons/Icon";
import Link from "next/link";

type ReportBreadcrumbProps = {
  domain: string;
  currentLabel: string;
  currentHref?: string;
};

export function ReportBreadcrumb({
  domain,
  currentLabel,
  currentHref,
}: ReportBreadcrumbProps) {
  const reportHref = `/report?domain=${encodeURIComponent(domain)}`;

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-gutter flex min-w-0 flex-wrap items-center gap-2 text-body-sm text-on-surface-variant"
    >
      <Link href="/" className="transition-colors hover:text-primary">
        AI Search Audit
      </Link>
      <Icon name="chevron_right" size={16} className="shrink-0 opacity-50" />
      <Link href={reportHref} className="transition-colors hover:text-primary">
        Report
      </Link>
      <Icon name="chevron_right" size={16} className="shrink-0 opacity-50" />
      {currentHref ? (
        <Link
          href={currentHref}
          className="font-semibold text-on-surface transition-colors hover:text-primary"
        >
          {currentLabel}
        </Link>
      ) : (
        <span className="font-semibold text-on-surface">{currentLabel}</span>
      )}
    </nav>
  );
}
