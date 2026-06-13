import type { ProcessingMetric } from "@/lib/processing-data";

type ProcessingMetricsProps = {
  metrics: ProcessingMetric[];
};

export function ProcessingMetrics({ metrics }: ProcessingMetricsProps) {
  return (
    <div className="grid grid-cols-2 border-t border-border bg-canvas md:grid-cols-4">
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className={`p-stack-md text-center ${
            index < metrics.length - 1 ? "border-r border-border" : ""
          }`}
        >
          <p className="mb-1 font-label-md text-label-md uppercase text-on-surface-variant">
            {metric.label}
          </p>
          <p className="font-headline-md text-headline-md text-on-surface">
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  );
}
