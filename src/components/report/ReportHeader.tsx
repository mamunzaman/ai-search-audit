import { Icon } from "@/components/icons/Icon";
import { reportMeta } from "@/lib/report-data";

type ReportHeaderProps = {
  domain: string;
  pageTitle?: string;
  finalUrl?: string;
  httpStatus?: number | null;
  score?: number;
  auditDate?: string;
  isRealData?: boolean;
};

export function ReportHeader({
  domain,
  pageTitle,
  finalUrl,
  httpStatus = null,
  score = reportMeta.score,
  auditDate = reportMeta.auditDate,
  isRealData = false,
}: ReportHeaderProps) {
  const statusLabel = isRealData && httpStatus ? String(httpStatus) : reportMeta.status;

  return (
    <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h2 className="text-display-lg text-on-surface">{domain}</h2>
        {pageTitle ? (
          <p className="mt-1 text-headline-md text-on-surface">{pageTitle}</p>
        ) : null}
        {finalUrl ? (
          <p className="mt-1 flex items-center gap-1.5 text-body-md text-on-surface-variant">
            <Icon name="language" size={16} className="text-outline" />
            <span className="truncate">{finalUrl}</span>
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-label-md text-green-700">
            <Icon name="check_circle" size={18} />
            Status: {statusLabel}
          </span>
          <span className="text-body-md text-on-surface-variant">
            Audit Date: {auditDate}
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className="mb-1 text-label-md uppercase tracking-wider text-on-surface-variant">
          AI Visibility Score
        </p>
        <p className="text-display-lg text-primary-blue">
          {score}
          <span className="text-headline-md text-outline">/100</span>
        </p>
      </div>
    </section>
  );
}
