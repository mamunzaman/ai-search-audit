import { ContentStructureDetailPage } from "@/components/report/ContentStructureDetailPage";
import { resolveDomain } from "@/lib/domain";

type ContentStructurePageProps = {
  searchParams: Promise<{ domain?: string }>;
};

export default async function ContentStructurePage({
  searchParams,
}: ContentStructurePageProps) {
  const params = await searchParams;
  const domain = resolveDomain(params.domain);

  return <ContentStructureDetailPage domain={domain} />;
}
