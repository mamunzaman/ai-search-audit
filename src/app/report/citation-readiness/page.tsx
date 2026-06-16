import { CitationReadinessDetailPage } from "@/components/report/CitationReadinessDetailPage";
import { resolveDomain } from "@/lib/domain";

type CitationReadinessPageProps = {
  searchParams: Promise<{ domain?: string }>;
};

export default async function CitationReadinessPage({
  searchParams,
}: CitationReadinessPageProps) {
  const params = await searchParams;
  const domain = resolveDomain(params.domain);

  return <CitationReadinessDetailPage domain={domain} />;
}
