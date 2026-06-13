export const auditSteps = [
  "Website reachable",
  "Page structure analyzed",
  "Meta data extracted",
  "Headings reviewed",
  "Evaluating AI visibility",
  "Schema validation",
  "Trust signal analysis",
  "FAQ detection",
  "Entity recognition",
  "LLM readiness scoring",
] as const;

export const PROGRESS_MILESTONES = [0, 10, 25, 40, 55, 68, 82, 100] as const;

export type StepState = {
  completedSteps: string[];
  currentStep: string | null;
  pendingSteps: string[];
};

export function getStepState(progress: number): StepState {
  if (progress >= 100) {
    return {
      completedSteps: [...auditSteps],
      currentStep: null,
      pendingSteps: [],
    };
  }

  const milestoneIndex = PROGRESS_MILESTONES.findLastIndex(
    (milestone) => progress >= milestone,
  );

  let activeIndex = milestoneIndex;
  if (milestoneIndex === 5) {
    activeIndex = 4;
  } else if (milestoneIndex >= 6) {
    activeIndex = 5;
  }

  return {
    completedSteps: auditSteps.slice(0, activeIndex).map(String),
    currentStep: auditSteps[activeIndex],
    pendingSteps: auditSteps.slice(activeIndex + 1).map(String),
  };
}

export const processingDescription =
  "Performing deep-scan of structural relevancy for LLM agents.";

export const PROCESSING_STEP_MS = 900;
export const COMPLETE_REDIRECT_MS = 750;
