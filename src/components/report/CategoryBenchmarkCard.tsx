import { cn } from "@/lib/cn";
import { reportStyles } from "./reportStyles";

type CategoryBenchmarkCardProps = {
  score: number;
  industryAvg: number;
  message: string;
};

export function CategoryBenchmarkCard({
  score,
  industryAvg,
  message,
}: CategoryBenchmarkCardProps) {
  return (
    <section className={cn(reportStyles.card, reportStyles.cardPadding, "flex h-full flex-col")}>
      <h3 className={cn(reportStyles.subsectionLabel, "mb-4")}>Benchmarking</h3>
      <div className="flex flex-1 flex-col space-y-5">
        <div>
          <div className="mb-2 flex items-end justify-between">
            <span className="text-body-sm font-semibold text-on-surface">Your Score</span>
            <span className="text-headline-md tabular-nums text-primary">{score}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
            <div className="h-full bg-primary" style={{ width: `${score}%` }} />
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-end justify-between">
            <span className="text-body-sm font-semibold text-on-surface-variant">
              Industry Avg
            </span>
            <span className="text-headline-md tabular-nums text-outline">{industryAvg}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
            <div className="h-full bg-outline" style={{ width: `${industryAvg}%` }} />
          </div>
        </div>
        <div className="mt-auto rounded-xl bg-surface-container-low p-stack-md">
          <p className="text-body-sm font-medium text-primary">{message}</p>
        </div>
      </div>
    </section>
  );
}
