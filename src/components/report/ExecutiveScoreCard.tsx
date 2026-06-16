import { ReportScoreRing } from "@/components/report/ScoreRing";
import type { ReportV2ViewData } from "@/lib/audit/report-v2";

type ExecutiveScoreCardProps = {
  data: Pick<ReportV2ViewData, "score" | "potentialGain">;
};

export function ExecutiveScoreCard({ data }: ExecutiveScoreCardProps) {
  return (
    <div className="flex animate-fade-in flex-col items-center justify-center rounded-[24px] border border-outline-variant bg-white px-stack-lg py-stack-xl card-shadow lg:col-span-4">
      <ReportScoreRing
        score={data.score}
        categorySlug="overview"
        label="Global Score"
      />
      <p className="mt-stack-md text-body-md font-semibold text-primary">
        Potential +{data.potentialGain}
      </p>
    </div>
  );
}
