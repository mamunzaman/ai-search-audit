import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import type { ReportV2AccessibilityCard } from "@/lib/audit/report-v2";

type AccessibilityAuditCardProps = {
  data: ReportV2AccessibilityCard;
  href?: string;
};

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-outline-variant/60 py-2 last:border-b-0">
      <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
        {label}
      </span>
      <span className="line-clamp-1 text-right text-body-sm font-medium text-on-surface">
        {value}
      </span>
    </div>
  );
}

export function AccessibilityAuditCard({ data, href }: AccessibilityAuditCardProps) {
  const content = (
    <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-outline-variant bg-white p-stack-lg card-shadow">
      <div className="mb-stack-md flex h-12 shrink-0 items-center justify-between border-b border-outline-variant pb-stack-sm">
        <div className="min-w-0">
          <h3 className="line-clamp-1 text-headline-md">Accessibility Signals</h3>
          <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
            WCAG 2.2 Readiness
          </p>
        </div>
        <Icon name="accessibility_new" className="shrink-0 text-outline" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="mb-stack-md flex items-end gap-2">
          <span className="text-display-lg text-primary">{data.score}</span>
          <span className="pb-1 text-body-sm text-on-surface-variant">/100</span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden">
          <StatusRow label="Alt coverage" value={`${data.altCoverage}%`} />
          <StatusRow label="Form labels" value={data.formLabelStatus} />
          <StatusRow label="Landmarks" value={data.landmarkStatus} />
          <StatusRow label="Heading order" value={data.headingOrderStatus} />
        </div>
        <p className="mt-stack-sm line-clamp-2 shrink-0 text-body-sm text-on-surface-variant">
          <span className="font-semibold text-primary">Top issue: </span>
          {data.topIssue}
        </p>
        <p className="mt-2 line-clamp-2 shrink-0 text-[10px] text-outline">
          Automated accessibility checks only. Not legal WCAG compliance.
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full transition-opacity hover:opacity-95">
        {content}
      </Link>
    );
  }

  return content;
}
