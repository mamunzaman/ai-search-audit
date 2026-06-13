import { Icon } from "@/components/icons/Icon";

type ProcessingStepsProps = {
  completedSteps: string[];
  currentStep: string | null;
  pendingSteps: string[];
};

export function ProcessingSteps({
  completedSteps,
  currentStep,
  pendingSteps,
}: ProcessingStepsProps) {
  return (
    <div className="sticky top-28 flex flex-col gap-6 rounded-xl border border-border bg-white p-stack-lg card-shadow">
      <h3 className="border-b border-border pb-4 font-headline-md text-headline-md text-on-surface">
        Audit Journey
      </h3>
      <ul className="space-y-6">
        {completedSteps.map((step) => (
          <li key={step} className="flex items-start gap-4">
            <div className="mt-1 flex items-center justify-center rounded-full bg-[#10B981] p-1 text-white">
              <Icon name="check" size={16} />
            </div>
            <span className="font-body-md text-body-md text-on-surface-variant line-through opacity-60">
              {step}
            </span>
          </li>
        ))}
        {currentStep && (
          <li className="flex items-start gap-4">
            <div className="relative mt-1">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-primary-container" />
              </div>
            </div>
            <span className="font-body-md text-body-md font-semibold text-on-surface">
              {currentStep}
            </span>
          </li>
        )}
        {pendingSteps.map((step) => (
          <li key={step} className="flex items-start gap-4 opacity-40">
            <div className="mt-1 h-6 w-6 rounded-full border-2 border-outline-variant" />
            <span className="font-body-md text-body-md text-on-surface-variant">
              {step}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
