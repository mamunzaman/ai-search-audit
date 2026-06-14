import { AIVisibilityDetailPage } from "@/components/report/AIVisibilityDetailPage";
import { resolveDomain } from "@/lib/domain";

type AiVisibilityPageProps = {
  searchParams: Promise<{ domain?: string }>;
};

export default async function AiVisibilityPage({ searchParams }: AiVisibilityPageProps) {
  const params = await searchParams;
  const domain = resolveDomain(params.domain);

  return <AIVisibilityDetailPage domain={domain} />;
}
