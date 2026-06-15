import type { ReactNode } from "react";
import { ReportBreadcrumb } from "./ReportBreadcrumb";
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
  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-canvas text-[16px] leading-relaxed text-on-surface">
      <ReportSidebar domain={domain} activeNav={activeNav} auditDate={auditDate} />
      <div className="flex min-h-screen min-w-0 flex-col md:ml-64">
        <ReportTopNav domain={domain} />
        <main className="mx-auto w-full min-w-0 max-w-container-max flex-1 overflow-x-hidden p-margin-desktop">
          <ReportBreadcrumb domain={domain} currentLabel={categoryLabel} />
          <div className="space-y-stack-lg">{children}</div>
        </main>
        <ReportFooter />
      </div>
    </div>
  );
}
