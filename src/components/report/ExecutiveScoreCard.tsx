import { ScoreRing } from "@/components/ui";
import type { ReportV2ViewData } from "@/lib/audit/report-v2";

type ExecutiveScoreCardProps = {
  data: Pick<ReportV2ViewData, "score" | "potentialGain">;
};

export function ExecutiveScoreCard({ data }: ExecutiveScoreCardProps) {
  return (
    <div className="flex animate-fade-in flex-col items-center justify-center rounded-[24px] border border-outline-variant bg-white px-stack-lg py-stack-xl card-shadow lg:col-span-4">
      <ScoreRing
        score={data.score}
        size="md"
        label="Global Score"
        trackClassName="text-gray-200"
        indicatorClassName="text-primary-blue"
        scoreClassName="text-primary"
        className="h-44 w-44 md:h-52 md:w-52"
      />
      <p className="mt-stack-md text-body-md font-semibold text-primary">
        Potential +{data.potentialGain}
      </p>
    </div>
  );
}
