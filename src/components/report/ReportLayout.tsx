import type { ReactNode } from "react";
import { ReportFooter } from "./ReportFooter";
import { ReportSidebar } from "./ReportSidebar";
import { ReportTopNav } from "./ReportTopNav";

type ReportLayoutProps = {
  children: ReactNode;
  domain: string;
  auditDate?: string;
};

export function ReportLayout({
  children,
  domain,
  auditDate,
}: ReportLayoutProps) {
  return (
    <div className="min-h-screen bg-canvas text-[16px] leading-relaxed text-on-surface">
      <ReportSidebar domain={domain} activeNav="Overview" auditDate={auditDate} />
      <div className="flex min-h-screen flex-col md:ml-64">
        <ReportTopNav domain={domain} />
        <main className="mx-auto w-full max-w-container-max flex-1 space-y-stack-lg p-margin-desktop">
          {children}
        </main>
        <ReportFooter />
      </div>
    </div>
  );
}
