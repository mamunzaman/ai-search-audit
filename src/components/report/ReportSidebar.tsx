import { Icon } from "@/components/icons/Icon";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { buildReportNavHref } from "@/lib/report/navigation";
import { reportMeta, sidebarNav } from "@/lib/report-data";

type ReportSidebarProps = {
  domain: string;
  activeNav?: string;
  auditDate?: string;
};

export function ReportSidebar({
  domain,
  activeNav = "Overview",
  auditDate,
}: ReportSidebarProps) {
  const projectLabel = domain || reportMeta.projectName;
  const lastAudit = auditDate ?? reportMeta.lastAudit;

  return (
    <aside
      data-report-sidebar
      data-report-print-hide
      className="fixed left-0 top-0 z-30 hidden h-screen w-16 flex-col border-r border-outline-variant bg-surface p-2 md:flex xl:w-64 xl:p-stack-md"
    >
      <div className="mb-stack-lg px-1 xl:mb-stack-xl xl:px-2">
        <Link
          href="/"
          aria-label="Go to homepage"
          className="flex items-center justify-center cursor-pointer text-primary transition-colors hover:text-primary-container xl:justify-start"
        >
          <span className="hidden text-headline-md font-bold xl:inline">AuditMetric</span>
          <span className="text-label-md font-bold xl:hidden" aria-hidden>
            AM
          </span>
        </Link>
      </div>

      <div className="mb-stack-md hidden px-2 xl:mb-stack-lg xl:block">
        <div className="mb-stack-xs flex items-center gap-stack-sm">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary">
            <Icon name="account_balance" className="text-[20px]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-label-md font-bold text-on-surface">
              {projectLabel}
            </p>
            <p className="text-[10px] text-on-surface-variant">
              Last audit: {lastAudit}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-stack-md flex justify-center xl:hidden">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container text-on-primary"
          title={projectLabel}
        >
          <Icon name="account_balance" className="text-[20px]" />
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden">
        {sidebarNav.map((item) => {
          const isActive = item.label === activeNav;
          const href = buildReportNavHref(item.slug, domain);

          return (
            <Link
              key={item.label}
              href={href}
              title={item.label}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center justify-center gap-3 rounded-lg px-2 py-2 transition-all duration-200 xl:justify-start xl:px-3",
                isActive
                  ? "bg-secondary-container font-bold text-on-secondary-container"
                  : "text-on-surface-variant hover:bg-surface-container-high",
              )}
            >
              <Icon name={item.icon} className="shrink-0" />
              <span className="hidden truncate text-label-md xl:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-outline-variant pt-stack-sm xl:pt-stack-md">
        <button
          type="button"
          disabled
          className="mb-1 flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-lg px-2 py-2 text-on-surface-variant opacity-60 xl:justify-start xl:px-3"
          title="Settings"
        >
          <Icon name="settings" />
          <span className="hidden text-label-md xl:inline">Settings</span>
        </button>
        <button
          type="button"
          disabled
          className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-lg px-2 py-2 text-on-surface-variant opacity-60 xl:justify-start xl:px-3"
          title="Support"
        >
          <Icon name="help" />
          <span className="hidden text-label-md xl:inline">Support</span>
        </button>
        <button
          type="button"
          disabled
          className="mt-stack-sm flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-[#FF5A4F]/70 p-2 text-[10px] font-bold uppercase tracking-wider text-white opacity-80 xl:mt-stack-md xl:py-3 xl:text-label-md"
          title="Upgrade Plan"
        >
          <span className="xl:hidden">Pro</span>
          <span className="hidden xl:inline">Upgrade Plan</span>
        </button>
      </div>
    </aside>
  );
}
