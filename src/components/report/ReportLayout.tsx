import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ReportFooter } from "./ReportFooter";
import { ReportSidebar } from "./ReportSidebar";
import { ReportTopNav } from "./ReportTopNav";
import { reportStyles } from "./reportStyles";

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
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-canvas text-[16px] leading-relaxed text-on-surface">
      <ReportSidebar domain={domain} activeNav="Overview" auditDate={auditDate} />
      <div className="flex min-h-screen min-w-0 flex-col md:ml-64">
        <ReportTopNav domain={domain} />
        <main className={cn(reportStyles.mainShell, "space-y-stack-lg")}>
          {children}
        </main>
        <ReportFooter />
      </div>
    </div>
  );
}
