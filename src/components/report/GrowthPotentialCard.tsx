import { Icon } from "@/components/icons/Icon";
import type { ReportV2GrowthArea } from "@/lib/audit/report-v2";

type GrowthPotentialCardProps = {
  areas: ReportV2GrowthArea[];
};

export function GrowthPotentialCard({ areas }: GrowthPotentialCardProps) {
  return (
    <div
      className="animate-fade-in rounded-[24px] border border-outline-variant bg-white p-stack-lg card-shadow"
      style={{ animationDelay: "0.4s" }}
    >
      <div className="mb-stack-md flex items-center justify-between border-b border-outline-variant pb-stack-sm">
        <h3 className="text-headline-md">Growth Potential</h3>
        <Icon name="bar_chart" className="text-outline" />
      </div>
      <div className="flex h-[300px] flex-col justify-end gap-6 px-4">
        <div className="space-y-4">
          {areas.map((area) => {
            const gainWidth = Math.max(0, area.potential - area.current);
            return (
              <div key={area.label} className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase text-outline">
                  <span className="line-clamp-1 pr-2">{area.label}</span>
                  <span className="shrink-0">
                    {area.current} / {area.potential}
                  </span>
                </div>
                <div className="flex h-4 w-full overflow-hidden rounded-full bg-surface-container">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${area.current}%` }}
                  />
                  <div
                    className="h-full bg-primary-fixed"
                    style={{ width: `${gainWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex gap-4">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-primary" />
            <span className="text-[10px] font-bold text-on-surface-variant">
              Current
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-primary-fixed" />
            <span className="text-[10px] font-bold text-on-surface-variant">
              Potential
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
