import { cn } from "@/lib/cn";
import { ReportFadeIn } from "./ReportMotion";
import { reportStyles } from "./reportStyles";

export type SimpleKpi = {
  label: string;
  value: string;
  detail?: string;
};

type CategorySimpleKpiStripProps = {
  kpis: SimpleKpi[];
};

export function CategorySimpleKpiStrip({ kpis }: CategorySimpleKpiStripProps) {
  return (
    <ReportFadeIn>
      <div className={cn("grid grid-cols-2 lg:grid-cols-4", reportStyles.gridGap)}>
      {kpis.map((kpi) => (
        <div key={kpi.label} className={cn(reportStyles.card, reportStyles.cardPadding)}>
          <p className={reportStyles.subsectionLabel}>{kpi.label}</p>
          <p className="mt-1 text-headline-md tabular-nums text-primary">{kpi.value}</p>
          {kpi.detail ? (
            <p className="mt-1 break-words text-body-sm text-on-surface-variant">
              {kpi.detail}
            </p>
          ) : null}
        </div>
      ))}
      </div>
    </ReportFadeIn>
  );
}
