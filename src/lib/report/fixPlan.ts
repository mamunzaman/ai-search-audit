import { calculateAuditScores } from "@/lib/audit/audit-score";
import { normalizeAuditResponse } from "@/lib/audit/audit-normalize";
import type { AuditResponse } from "@/lib/audit/types";
import { generatePriorityIssues } from "@/lib/report/priorityIssues";
import type { FixPlan, FixPlanAction, PriorityIssueSeverity } from "@/types/audit";

const MAX_ACTIONS = 3;
const MIN_GAIN = 4;

function severityRank(severity: PriorityIssueSeverity): number {
  if (severity === "Critical") {
    return 0;
  }

  if (severity === "High") {
    return 1;
  }

  if (severity === "Medium") {
    return 2;
  }

  return 3;
}

function compareActions(
  left: FixPlanAction & { severity: PriorityIssueSeverity; categoryScore: number },
  right: FixPlanAction & { severity: PriorityIssueSeverity; categoryScore: number },
): number {
  const gainDiff = right.estimatedGain - left.estimatedGain;

  if (gainDiff !== 0) {
    return gainDiff;
  }

  const severityDiff = severityRank(left.severity) - severityRank(right.severity);

  if (severityDiff !== 0) {
    return severityDiff;
  }

  return left.categoryScore - right.categoryScore;
}

export const defaultFixPlan: FixPlan = {
  actions: [
    {
      title: "Missing Organization Schema",
      estimatedGain: 6,
      category: "Schema Markup",
      why: "AI systems use Organization schema to identify the website owner and connect the brand to trusted entities.",
    },
    {
      title: "Incomplete Author Profiles",
      estimatedGain: 5,
      category: "Citation Readiness",
      why: "Missing author signals reduce citation eligibility in AI answers.",
    },
    {
      title: "Broken Semantic Links (Primary Nav)",
      estimatedGain: 4,
      category: "Content Structure",
      why: "Navigation links reduce crawl depth and context for AI systems.",
    },
  ],
  totalPotentialGain: 15,
};

export function generateFixPlan(audit: AuditResponse): FixPlan {
  const normalized = normalizeAuditResponse(audit);

  if (!normalized) {
    return defaultFixPlan;
  }

  const scores = calculateAuditScores(normalized);
  const categoryScoreMap = new Map(
    scores.categories.map((category) => [category.label, category.score]),
  );
  const issues = generatePriorityIssues(normalized);

  const ranked = issues
    .filter(
      (issue) =>
        issue.estimatedGain >= MIN_GAIN && issue.severity !== "Low",
    )
    .map((issue) => ({
      title: issue.title,
      estimatedGain: issue.estimatedGain,
      category: issue.category,
      why: issue.whyItMatters ?? issue.impact,
      severity: issue.severity,
      categoryScore: categoryScoreMap.get(issue.category) ?? 100,
    }))
    .sort(compareActions)
    .slice(0, MAX_ACTIONS);

  const candidates: FixPlanAction[] = ranked.map(
    ({ title, estimatedGain, category, why }) => ({
      title,
      estimatedGain,
      category,
      why,
    }),
  );

  if (candidates.length === 0) {
    return { actions: [], totalPotentialGain: 0 };
  }

  const totalPotentialGain = candidates.reduce(
    (sum, action) => sum + action.estimatedGain,
    0,
  );

  return {
    actions: candidates,
    totalPotentialGain,
  };
}

export function buildPlaceholderFixPlan(): FixPlan {
  return defaultFixPlan;
}
