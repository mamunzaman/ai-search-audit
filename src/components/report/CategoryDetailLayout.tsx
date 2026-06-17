import type { ReactNode } from "react";
import { ReportAuditGate } from "./ReportAuditGate";
import { ReportBreadcrumb } from "./ReportBreadcrumb";
import { ReportFooter } from "./ReportFooter";
import { ReportDetailMotion } from "./ReportMotion";
import { ReportSidebar } from "./ReportSidebar";
import { ReportTopNav } from "./ReportTopNav";
import { reportStyles } from "./reportStyles";

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
        <main className={reportStyles.mainShell}>
          <ReportBreadcrumb domain={domain} currentLabel={categoryLabel} />
          <ReportAuditGate>
            <ReportDetailMotion
              motionKey={`${domain}-${categoryLabel}`}
              className={reportStyles.detailPageStack}
            >
              {children}
            </ReportDetailMotion>
          </ReportAuditGate>
        </main>
        <ReportFooter domain={domain} />
      </div>
    </div>
  );
}
