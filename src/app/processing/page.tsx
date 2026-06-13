import { ProcessingFlow } from "@/components/processing/ProcessingFlow";
import { resolveDomain } from "@/lib/domain";

type ProcessingPageProps = {
  searchParams: Promise<{ domain?: string }>;
};

export default async function ProcessingPage({
  searchParams,
}: ProcessingPageProps) {
  const params = await searchParams;
  const domain = resolveDomain(params.domain);

  return <ProcessingFlow domain={domain} />;
}
