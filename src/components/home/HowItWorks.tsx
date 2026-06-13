import { howItWorksSteps } from "@/lib/home-data";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-container-max px-margin-desktop py-stack-xl"
    >
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <h2 className="mb-4 font-headline-lg text-headline-lg text-on-surface">
          Precision Auditing in 3 Steps
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Our engine crawls your site from the perspective of Large Language
          Models, providing institutional-grade insights.
        </p>
      </div>
      <div className="relative grid gap-12 md:grid-cols-3">
        <div className="absolute left-1/4 right-1/4 top-1/3 hidden h-px border-t border-dashed border-outline-variant md:block" />
        {howItWorksSteps.map((step) => (
          <div
            key={step.step}
            className="relative z-10 flex flex-col items-center space-y-6 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary font-headline-md text-headline-md text-white">
              {step.step}
            </div>
            <div>
              <h3 className="mb-2 font-headline-md text-headline-md">{step.title}</h3>
              <p className="text-on-surface-variant">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
