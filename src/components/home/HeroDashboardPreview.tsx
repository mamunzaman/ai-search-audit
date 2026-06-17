import { Icon } from "@/components/icons/Icon";
import { ScoreRing } from "@/components/ui";

const sidebarIcons = ["monitoring", "search_check", "hub"];

export function HeroDashboardPreview() {
  return (
    <div className="group relative w-full lg:pt-1">
      <div className="absolute -inset-3 rounded-[28px] bg-primary/5 opacity-50 blur-2xl transition-opacity group-hover:opacity-80" />
      <div className="relative flex min-h-[360px] overflow-hidden rounded-[24px] border border-outline-variant bg-white card-shadow sm:min-h-[400px] lg:min-h-[440px]">
        <div className="flex w-16 flex-col items-center gap-8 bg-primary py-8 md:w-20">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Icon name="analytics" className="text-white" filled />
          </div>
          {sidebarIcons.map((icon) => (
            <Icon key={icon} name={icon} className="text-white/60" />
          ))}
          <div className="mt-auto">
            <Icon name="settings" className="text-white/40" />
          </div>
        </div>
        <div className="flex flex-grow flex-col gap-6 bg-surface-container-low p-8">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 rounded bg-outline-variant/30" />
            <div className="flex gap-2">
              <div className="h-8 w-24 rounded-lg border border-outline-variant bg-white" />
              <div className="h-8 w-8 rounded-lg border border-outline-variant bg-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-outline-variant bg-white p-6">
              <ScoreRing score={82} label="/100" scoreClassName="text-on-surface" />
              <p className="mt-4 text-body-sm font-semibold text-on-surface">
                AI Visibility Score
              </p>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-outline-variant bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-body-sm font-semibold">Strengths</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-green-100" />
                <div className="mt-1 h-2 w-3/4 rounded-full bg-green-100" />
              </div>
              <div className="rounded-xl border border-outline-variant bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-accent-coral" />
                  <span className="text-body-sm font-semibold">Issues</span>
                </div>
                <div className="mt-2 h-2 w-2/3 rounded-full bg-red-100" />
              </div>
              <div className="rounded-xl border border-outline-variant bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-body-sm font-semibold">
                    Recommendations
                  </span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-primary/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
