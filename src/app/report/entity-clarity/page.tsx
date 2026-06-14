import { EntityClarityDetailPage } from "@/components/report/EntityClarityDetailPage";
import { resolveDomain } from "@/lib/domain";

type EntityClarityPageProps = {
  searchParams: Promise<{ domain?: string }>;
};

export default async function EntityClarityPage({ searchParams }: EntityClarityPageProps) {
  const params = await searchParams;
  const domain = resolveDomain(params.domain);

  return <EntityClarityDetailPage domain={domain} />;
}
