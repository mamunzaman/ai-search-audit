import { SchemaMarkupDetailPage } from "@/components/report/SchemaMarkupDetailPage";
import { resolveDomain } from "@/lib/domain";

type SchemaMarkupPageProps = {
  searchParams: Promise<{ domain?: string }>;
};

export default async function SchemaMarkupPage({ searchParams }: SchemaMarkupPageProps) {
  const params = await searchParams;
  const domain = resolveDomain(params.domain);

  return <SchemaMarkupDetailPage domain={domain} />;
}
