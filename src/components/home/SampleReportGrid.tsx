import { MetricCard } from "@/components/ui";
import { sampleMetrics } from "@/lib/home-data";

export function SampleReportGrid() {
  return (
    <section
      id="sample-report"
      className="bg-surface-container-lowest px-margin-desktop py-stack-xl"
    >
      <div className="mx-auto max-w-container-max">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-headline-lg text-on-surface">
            Sample Report Metrics
          </h2>
          <p className="text-body-md text-on-surface-variant">
            A deep dive into the 8 core pillars of AI search optimization.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sampleMetrics.map((metric) => (
            <MetricCard key={metric.title} metric={metric} />
          ))}
        </div>
      </div>
    </section>
  );
}
