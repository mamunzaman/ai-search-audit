import { TwitterCardDetailPage } from "@/components/report/TwitterCardDetailPage";
import { resolveDomain } from "@/lib/domain";

type TwitterCardPageProps = {
  searchParams: Promise<{ domain?: string }>;
};

export default async function TwitterCardPage({ searchParams }: TwitterCardPageProps) {
  const params = await searchParams;
  const domain = resolveDomain(params.domain);

  return <TwitterCardDetailPage domain={domain} />;
}
