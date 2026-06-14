import { SeoHealthPageClient } from "@/components/report/SeoHealthPageClient";
import { resolveDomain } from "@/lib/domain";

type SeoHealthPageProps = {
  searchParams: Promise<{ domain?: string }>;
};

export default async function SeoHealthPage({ searchParams }: SeoHealthPageProps) {
  const params = await searchParams;
  const domain = resolveDomain(params.domain);

  return <SeoHealthPageClient domain={domain} />;
}
