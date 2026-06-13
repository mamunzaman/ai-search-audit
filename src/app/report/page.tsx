import { ReportPageClient } from "@/components/report/ReportPageClient";
import { resolveDomain } from "@/lib/domain";

type ReportPageProps = {
  searchParams: Promise<{ domain?: string }>;
};

export default async function ReportPage({ searchParams }: ReportPageProps) {
  const params = await searchParams;
  const domain = resolveDomain(params.domain);

  return <ReportPageClient domain={domain} />;
}
