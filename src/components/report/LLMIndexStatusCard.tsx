import { Icon } from "@/components/icons/Icon";
import type { ReportV2LlmReadiness } from "@/lib/audit/report-v2";

type LLMIndexStatusCardProps = {
  engines: ReportV2LlmReadiness[];
};

export function LLMIndexStatusCard({ engines }: LLMIndexStatusCardProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-outline-variant bg-white p-stack-lg card-shadow">
      <div className="mb-stack-md flex h-12 shrink-0 items-center justify-between border-b border-outline-variant pb-stack-sm">
        <div className="min-w-0">
          <h3 className="line-clamp-1 text-headline-md">LLM Index Status</h3>
          <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
            Estimated readiness
          </p>
        </div>
        <Icon name="smart_toy" className="shrink-0 text-outline" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-stack-md overflow-hidden px-1">
        {engines.map((engine) => (
          <div key={engine.name} className="shrink-0 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="line-clamp-1 text-body-sm font-medium text-on-surface">
                {engine.name}
              </span>
              <span className="shrink-0 text-data-mono text-primary">
                {engine.value}%
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-surface-container">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${engine.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-stack-sm line-clamp-2 shrink-0 text-[10px] leading-relaxed text-outline">
        Derived from AI Visibility, Entity Clarity, and Trust Signals. Not an
        external ranking.
      </p>
    </div>
  );
}
