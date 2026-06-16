import { OpenGraphDetailPage } from "@/components/report/OpenGraphDetailPage";
import { resolveDomain } from "@/lib/domain";

type OpenGraphPageProps = {
  searchParams: Promise<{ domain?: string }>;
};

export default async function OpenGraphPage({ searchParams }: OpenGraphPageProps) {
  const params = await searchParams;
  const domain = resolveDomain(params.domain);

  return <OpenGraphDetailPage domain={domain} />;
}
