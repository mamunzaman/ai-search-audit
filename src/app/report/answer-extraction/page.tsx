import { AnswerExtractionDetailPage } from "@/components/report/AnswerExtractionDetailPage";
import { resolveDomain } from "@/lib/domain";

type AnswerExtractionPageProps = {
  searchParams: Promise<{ domain?: string }>;
};

export default async function AnswerExtractionPage({
  searchParams,
}: AnswerExtractionPageProps) {
  const params = await searchParams;
  const domain = resolveDomain(params.domain);

  return <AnswerExtractionDetailPage domain={domain} />;
}
