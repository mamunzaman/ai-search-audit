import type { ReactNode } from "react";
import { ReportFooter } from "./ReportFooter";
import { ReportSidebar } from "./ReportSidebar";
import { ReportTopNav } from "./ReportTopNav";

type ReportLayoutProps = {
  children: ReactNode;
};

export function ReportLayout({ children }: ReportLayoutProps) {
  return (
    <div className="min-h-screen bg-canvas text-[16px] leading-relaxed text-on-surface">
      <ReportSidebar />
      <div className="flex min-h-screen flex-col md:ml-64">
        <ReportTopNav />
        <main className="mx-auto w-full max-w-container-max flex-1 space-y-12 p-margin-desktop">
          {children}
        </main>
        <ReportFooter />
      </div>
    </div>
  );
}
