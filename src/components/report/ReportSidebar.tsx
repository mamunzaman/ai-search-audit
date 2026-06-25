import { Icon } from "@/components/icons/Icon";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { buildReportNavHref } from "@/lib/report/navigation";
import { reportMeta, sidebarNav, type SidebarNavItem } from "@/lib/report-data";

type ReportSidebarProps = {
  domain: string;
  activeNav?: string;
  auditDate?: string;
};

const TABLET_NAV_GROUPS: string[][] = [
  ["Overview"],
  [
    "SEO Health",
    "AI Visibility",
    "Entity Clarity",
    "Citation Readiness",
    "Answer Extraction",
    "Trust Signals",
  ],
  ["Open Graph", "Twitter Card", "Schema Markup", "Advanced Schema"],
  ["Content Structure"],
  ["WCAG 2.2"],
];

const navByLabel = Object.fromEntries(
  sidebarNav.map((item) => [item.label, item]),
) as Record<string, SidebarNavItem>;

function getTabletNavGroups(): SidebarNavItem[][] {
  return TABLET_NAV_GROUPS.map((labels) =>
    labels
      .map((label) => navByLabel[label])
      .filter((item): item is SidebarNavItem => Boolean(item)),
  ).filter((group) => group.length > 0);
}

type NavLinkProps = {
  item: SidebarNavItem;
  domain: string;
  isActive: boolean;
  compact?: boolean;
};

function NavLink({ item, domain, isActive, compact = false }: NavLinkProps) {
  const href = buildReportNavHref(item.slug, domain);

  return (
    <Link
      href={href}
      title={item.label}
      aria-label={item.label}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center transition-all duration-200",
        compact
          ? "h-9 w-full shrink-0 justify-center rounded-md px-1"
          : "gap-3 rounded-lg px-3 py-2",
        isActive
          ? compact
            ? "bg-secondary-container font-bold text-on-secondary-container ring-2 ring-secondary-container/40 ring-offset-1"
            : "bg-secondary-container font-bold text-on-secondary-container"
          : "text-on-surface-variant hover:bg-surface-container-high",
      )}
    >
      <Icon name={item.icon} className="shrink-0" size={compact ? 20 : 24} />
      {!compact ? (
        <span className="truncate text-label-md">{item.label}</span>
      ) : null}
    </Link>
  );
}

export function ReportSidebar({
  domain,
  activeNav = "Overview",
  auditDate,
}: ReportSidebarProps) {
  const projectLabel = domain || reportMeta.projectName;
  const lastAudit = auditDate ?? reportMeta.lastAudit;
  const tabletGroups = getTabletNavGroups();

  return (
    <aside
      data-report-sidebar
      data-report-print-hide
      className="fixed left-0 top-0 z-30 hidden h-dvh max-h-dvh w-16 flex-col overflow-hidden border-r border-outline-variant bg-surface md:flex xl:w-64 xl:p-stack-md"
    >
      <div className="shrink-0 px-1 py-2 xl:mb-stack-xl xl:px-2">
        <Link
          href="/"
          aria-label="Go to homepage"
          className="flex items-center justify-center text-primary transition-colors hover:text-primary-container xl:justify-start"
        >
          <span className="hidden text-headline-md font-bold xl:inline">AuditMetric</span>
          <span className="text-label-md font-bold xl:hidden">AM</span>
        </Link>
      </div>

      <div className="hidden shrink-0 px-2 xl:mb-stack-lg xl:block">
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

      <nav className="flex min-h-0 flex-1 flex-col overflow-hidden px-1 xl:overflow-y-auto xl:px-0">
        <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden xl:hidden">
          {tabletGroups.map((group, groupIndex) => (
            <div key={group.map((item) => item.label).join("-")} className="shrink-0">
              {groupIndex > 0 ? (
                <div
                  className="my-0.5 border-t border-outline-variant"
                  role="separator"
                  aria-hidden
                />
              ) : null}
              {group.map((item) => (
                <NavLink
                  key={item.label}
                  item={item}
                  domain={domain}
                  isActive={item.label === activeNav}
                  compact
                />
              ))}
            </div>
          ))}
        </div>

        <div className="hidden min-h-0 flex-1 space-y-1 overflow-y-auto xl:block">
          {sidebarNav.map((item) => (
            <NavLink
              key={item.label}
              item={item}
              domain={domain}
              isActive={item.label === activeNav}
            />
          ))}
        </div>
      </nav>

      <div className="mt-auto hidden shrink-0 border-t border-outline-variant pt-stack-md xl:block">
        <button
          type="button"
          disabled
          className="mb-1 flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-on-surface-variant opacity-60"
          title="Settings"
        >
          <Icon name="settings" />
          <span className="text-label-md">Settings</span>
        </button>
        <button
          type="button"
          disabled
          className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-on-surface-variant opacity-60"
          title="Support"
        >
          <Icon name="help" />
          <span className="text-label-md">Support</span>
        </button>
        <button
          type="button"
          disabled
          className="mt-stack-md w-full cursor-not-allowed rounded-xl bg-[#FF5A4F]/70 py-3 text-label-md font-bold uppercase tracking-wider text-white opacity-80"
          title="Upgrade Plan"
        >
          Upgrade Plan
        </button>
      </div>
    </aside>
  );
}
