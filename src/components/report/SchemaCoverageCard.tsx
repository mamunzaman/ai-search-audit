import { Icon } from "@/components/icons/Icon";
import type { SchemaCoverageItem } from "@/types/audit";
import { cn } from "@/lib/cn";
import { reportStyles } from "./reportStyles";

type SchemaCoverageCardProps = {
  data: SchemaCoverageItem[];
};

export function SchemaCoverageCard({ data }: SchemaCoverageCardProps) {
  return (
    <article className={`${reportStyles.card} ${reportStyles.cardPadding} min-w-0`}>
      <h3 className={`${reportStyles.sectionTitle} mb-1 text-primary`}>
        Schema Coverage
      </h3>
      <p className="mb-stack-md text-body-sm text-on-surface-variant">
        Structured data types detected on the audited page.
      </p>
      <div className="grid grid-cols-1 gap-x-gutter gap-y-2 sm:grid-cols-2">
        {data.map((item) => (
          <div key={item.label} className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1">
            <Icon
              name={item.present ? "check_circle" : "warning"}
              size={18}
              className={cn(
                "shrink-0",
                item.present ? "text-primary" : "text-outline",
              )}
            />
            <span
              className={cn(
                "min-w-0 break-words text-body-sm",
                item.present ? "text-on-surface" : "text-on-surface-variant",
              )}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-stack-md border-t border-outline-variant pt-stack-md text-body-sm text-on-surface-variant">
        Schema helps AI systems understand page type, ownership, and relationships.
      </p>
    </article>
  );
}
