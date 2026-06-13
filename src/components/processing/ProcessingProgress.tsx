const RING_RADIUS = 86;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

type ProcessingProgressProps = {
  domain: string;
  progress: number;
  currentTask: string;
  currentDescription: string;
};

export function ProcessingProgress({
  domain,
  progress,
  currentTask,
  currentDescription,
}: ProcessingProgressProps) {
  const ringOffset =
    RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * progress) / 100;

  return (
    <>
      <div className="flex items-center justify-between border-b border-border bg-white p-stack-lg">
        <div className="flex flex-col">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Analyzing {domain}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Reachable
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-8 p-stack-lg py-16">
        <div className="relative flex items-center justify-center">
          <svg className="h-48 w-48" viewBox="0 0 192 192">
            <circle
              className="text-border"
              cx="96"
              cy="96"
              fill="transparent"
              r={RING_RADIUS}
              stroke="currentColor"
              strokeWidth="12"
            />
            <circle
              className="text-primary-container progress-ring__circle"
              cx="96"
              cy="96"
              fill="transparent"
              r={RING_RADIUS}
              stroke="currentColor"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={ringOffset}
              strokeLinecap="round"
              strokeWidth="12"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="font-display-lg text-display-lg text-primary-container">
              {progress}%
            </span>
            <span className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">
              Complete
            </span>
          </div>
        </div>
        <div className="text-center">
          <p className="mb-2 animate-pulse-subtle font-headline-md text-headline-md text-on-surface">
            {currentTask}
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {currentDescription}
          </p>
        </div>
      </div>
    </>
  );
}
