import { TrustSignalsDetailPage } from "@/components/report/TrustSignalsDetailPage";
import { resolveDomain } from "@/lib/domain";

type TrustSignalsPageProps = {
  searchParams: Promise<{ domain?: string }>;
};

export default async function TrustSignalsPage({ searchParams }: TrustSignalsPageProps) {
  const params = await searchParams;
  const domain = resolveDomain(params.domain);

  return <TrustSignalsDetailPage domain={domain} />;
}
