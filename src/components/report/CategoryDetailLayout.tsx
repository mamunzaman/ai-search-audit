import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import { ReportFooter } from "./ReportFooter";
import { ReportSidebar } from "./ReportSidebar";
import { ReportTopNav } from "./ReportTopNav";

type CategoryDetailLayoutProps = {
  domain: string;
  categoryLabel: string;
  activeNav: string;
  auditDate?: string;
  children: ReactNode;
};

export function CategoryDetailLayout({
  domain,
  categoryLabel,
  activeNav,
  auditDate,
  children,
}: CategoryDetailLayoutProps) {
  const reportHref = `/report?domain=${encodeURIComponent(domain)}`;

  return (
    <div className="min-h-screen bg-canvas text-[16px] leading-relaxed text-on-surface">
      <ReportSidebar domain={domain} activeNav={activeNav} auditDate={auditDate} />
      <div className="flex min-h-screen flex-col md:ml-64">
        <ReportTopNav domain={domain} />
        <main className="mx-auto w-full max-w-container-max flex-1 p-margin-desktop">
          <nav className="mb-stack-lg flex items-center gap-2 text-body-sm text-outline">
            <Link href={reportHref} className="transition-colors hover:text-primary">
              AI Search Audit
            </Link>
            <Icon name="chevron_right" size={16} />
            <Link href={reportHref} className="transition-colors hover:text-primary">
              LLM Visibility Report
            </Link>
            <Icon name="chevron_right" size={16} />
            <span className="font-semibold text-on-surface">{categoryLabel}</span>
          </nav>

          <Link
            href={reportHref}
            className="mb-stack-lg inline-flex items-center gap-2 text-body-sm font-semibold text-primary transition-colors hover:text-primary-container"
          >
            <Icon name="arrow_back" size={18} />
            Back to Report
          </Link>

          <div className="space-y-stack-lg">{children}</div>
        </main>
        <ReportFooter />
      </div>
    </div>
  );
}
