import { reportStyles } from "@/components/report/reportStyles";
import { cn } from "@/lib/cn";
import type { DensityBar } from "@/data/report/contentStructureData";

type HeadingDensityChartProps = {
  bars: DensityBar[];
};

const BAR_HEIGHT_CLASS: Record<number, string> = {
  24: "h-6",
  32: "h-8",
  40: "h-10",
  48: "h-12",
  56: "h-14",
  64: "h-16",
  72: "h-[72px]",
  80: "h-20",
  96: "h-24",
  128: "h-32",
  160: "h-40",
  192: "h-48",
  224: "h-56",
};

function barHeightClass(px: number): string {
  return BAR_HEIGHT_CLASS[px] ?? "h-24";
}

function DensityBarChart({ bars }: { bars: DensityBar[] }) {
  return (
    <div className="flex min-h-[220px] flex-1 min-w-0 items-end justify-between gap-2 px-1 sm:gap-3">
      {bars.map((bar) => (
        <div key={bar.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div className="flex w-full min-w-0 items-end gap-1">
            <div
              className={cn(
                "w-full rounded-t-sm bg-primary-container",
                barHeightClass(bar.contentHeight),
                bar.contentOpacity === "light" && "opacity-20",
                bar.contentOpacity === "medium" && "opacity-60",
              )}
            />
            <div
              className={cn(
                "w-full rounded-t-sm bg-[#FF5A4F]",
                barHeightClass(bar.headingHeight),
              )}
            />
          </div>
          <span className="max-w-full truncate text-center font-label-md text-[10px] text-text-secondary">
            {bar.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function HeadingDensityChart({ bars }: HeadingDensityChartProps) {
  return (
    <section
      className={cn(
        reportStyles.card,
        reportStyles.cardPadding,
        "flex h-full min-w-0 flex-col",
      )}
    >
      <h3 className={cn(reportStyles.sectionTitle, "mb-stack-md")}>
        Heading vs Content Density
      </h3>
      <div className="flex flex-1 flex-col space-y-6">
        <p className="text-body-sm text-text-secondary">
          Distribution of semantic information across content blocks
        </p>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-primary" />
            <span className="font-label-md text-label-md text-text-secondary">Content</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#FF5A4F]" />
            <span className="font-label-md text-label-md text-text-secondary">Headings</span>
          </div>
        </div>
        <DensityBarChart bars={bars} />
      </div>
    </section>
  );
}
