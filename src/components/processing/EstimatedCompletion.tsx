type EstimatedCompletionProps = {
  progress: number;
};

export function EstimatedCompletion({ progress }: EstimatedCompletionProps) {
  const remainingMilestones = Math.max(
    0,
    Math.ceil((100 - progress) / 15),
  );
  const estimatedRemaining =
    progress >= 100
      ? "Audit complete"
      : `Approx. ${remainingMilestones * 2} seconds remaining`;

  return (
    <div className="flex flex-col gap-3 border-t border-border bg-white p-stack-md">
      <div className="flex items-center justify-between">
        <span className="font-body-sm text-body-sm italic text-on-surface-variant">
          {estimatedRemaining}
        </span>
        <span className="font-body-sm text-body-sm font-semibold text-primary-container">
          {progress >= 100 ? "Complete" : "Processing..."}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary-container transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
