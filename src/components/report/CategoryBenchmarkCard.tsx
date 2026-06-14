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
    <section className="flex h-full flex-col rounded-[24px] border border-outline-variant bg-white p-stack-lg card-shadow">
      <h3 className="mb-4 text-label-md font-bold uppercase tracking-wider text-outline">
        Benchmarking
      </h3>
      <div className="flex flex-1 flex-col space-y-5">
        <div>
          <div className="mb-2 flex items-end justify-between">
            <span className="text-body-sm font-semibold">Your Score</span>
            <span className="text-xl font-bold tabular-nums text-primary">{score}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
            <div className="h-full bg-primary" style={{ width: `${score}%` }} />
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-end justify-between">
            <span className="text-body-sm font-semibold text-outline-variant">
              Industry Avg
            </span>
            <span className="text-xl font-bold tabular-nums text-outline">
              {industryAvg}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
            <div className="h-full bg-outline" style={{ width: `${industryAvg}%` }} />
          </div>
        </div>
        <div className="mt-auto rounded-xl bg-surface-container-low p-4">
          <p className="text-body-sm font-medium text-primary">{message}</p>
        </div>
      </div>
    </section>
  );
}
