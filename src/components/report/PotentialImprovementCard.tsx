import { Icon } from "@/components/icons/Icon";
import { reportMeta, topFixes } from "@/lib/report-data";

export function PotentialImprovementCard() {
  const potential = 92;

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-[24px] bg-primary-blue p-stack-lg text-white shadow-xl">
      <div className="relative z-10">
        <h3 className="mb-6 text-headline-md">Optimization Potential</h3>
        <div className="mb-8 flex items-end gap-4">
          <div className="text-center">
            <p className="mb-1 text-label-md text-white/60">Current</p>
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/20 text-[24px] font-bold">
              {reportMeta.score}
            </div>
          </div>
          <Icon name="arrow_forward" className="mb-3" />
          <div className="text-center">
            <p className="mb-1 text-label-md text-white/60">Potential</p>
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white text-[32px] font-bold text-primary-blue shadow-lg shadow-blue-900/50">
              {potential}
            </div>
          </div>
        </div>
        <h4 className="mb-3 text-label-md uppercase tracking-widest text-white/70">
          Top Fixes for +10 pts
        </h4>
        <ul className="space-y-2">
          {topFixes.map((fix) => (
            <li key={fix} className="flex items-center gap-2 text-body-sm">
              <Icon name="add_circle" size={16} />
              {fix}
            </li>
          ))}
        </ul>
      </div>
      <div className="absolute -bottom-12 -right-12 opacity-10">
        <Icon name="trending_up" size={240} />
      </div>
    </div>
  );
}
