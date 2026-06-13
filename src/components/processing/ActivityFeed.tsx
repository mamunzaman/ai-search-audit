import { Icon } from "@/components/icons/Icon";
import type { ActivityLogEntry } from "@/lib/processing-data";

type ActivityFeedProps = {
  entries: ActivityLogEntry[];
};

export function ActivityFeed({ entries }: ActivityFeedProps) {
  return (
    <section className="terminal-glow rounded-xl bg-inverse-surface p-stack-md">
      <div className="mb-4 flex items-center gap-2 border-b border-on-surface-variant/20 pb-2">
        <Icon name="terminal" className="text-[#10B981]" size={18} />
        <span className="font-data-mono text-data-mono text-[#E5E7EB]">
          Analysis Log
        </span>
      </div>
      <div className="space-y-2 font-data-mono text-data-mono text-[#A3B1FF]/80">
        {entries.map((entry, index) => (
          <div key={`${entry.time}-${entry.message}-${index}`} className="flex gap-4">
            <span className="text-text-secondary">{entry.time}</span>
            {entry.active ? (
              <span className="animate-pulse-subtle text-white">
                {entry.message}
              </span>
            ) : (
              <span>
                {entry.message}{" "}
                {entry.status && (
                  <span className="text-[#10B981]">{entry.status}</span>
                )}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
