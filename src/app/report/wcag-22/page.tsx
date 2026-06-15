import { Wcag22DetailPage } from "@/components/report/Wcag22DetailPage";
import { resolveDomain } from "@/lib/domain";

type Wcag22PageProps = {
  searchParams: Promise<{ domain?: string }>;
};

export default async function Wcag22Page({ searchParams }: Wcag22PageProps) {
  const params = await searchParams;
  const domain = resolveDomain(params.domain);

  return <Wcag22DetailPage domain={domain} />;
}
