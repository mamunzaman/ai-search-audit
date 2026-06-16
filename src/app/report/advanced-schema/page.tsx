import { AdvancedSchemaDetailPage } from "@/components/report/AdvancedSchemaDetailPage";
import { resolveDomain } from "@/lib/domain";

type AdvancedSchemaPageProps = {
  searchParams: Promise<{ domain?: string }>;
};

export default async function AdvancedSchemaPage({
  searchParams,
}: AdvancedSchemaPageProps) {
  const params = await searchParams;
  const domain = resolveDomain(params.domain);

  return <AdvancedSchemaDetailPage domain={domain} />;
}
