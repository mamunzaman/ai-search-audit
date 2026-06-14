import { Icon } from "@/components/icons/Icon";
import Link from "next/link";
import { reportMeta, sidebarNav } from "@/lib/report-data";

type ReportSidebarProps = {
  domain: string;
  activeNav?: string;
  auditDate?: string;
};

function buildNavHref(slug: string | undefined, domain: string): string {
  const encoded = encodeURIComponent(domain);

  if (slug === "overview") {
    return `/report?domain=${encoded}`;
  }

  if (slug === "seo-health") {
    return `/report/seo-health?domain=${encoded}`;
  }

  if (slug === "ai-visibility") {
    return `/report/ai-visibility?domain=${encoded}`;
  }

  if (slug === "trust-signals") {
    return `/report/trust-signals?domain=${encoded}`;
  }

  if (slug === "entity-clarity") {
    return `/report/entity-clarity?domain=${encoded}`;
  }

  if (slug === "content-structure") {
    return `/report/content-structure?domain=${encoded}`;
  }

  if (slug === "schema-markup") {
    return `/report/schema-markup?domain=${encoded}`;
  }

  return "#";
}

export function ReportSidebar({
  domain,
  activeNav = "Overview",
  auditDate,
}: ReportSidebarProps) {
  const projectLabel = domain || reportMeta.projectName;
  const lastAudit = auditDate ?? reportMeta.lastAudit;

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-outline-variant bg-surface p-stack-md md:flex">
      <div className="mb-stack-xl px-2">
        <span className="text-headline-md font-bold text-primary">
          AuditMetric
        </span>
      </div>
      <div className="mb-stack-lg px-2">
        <div className="mb-stack-xs flex items-center gap-stack-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container text-on-primary">
            <Icon name="account_balance" className="text-[20px]" />
          </div>
          <div>
            <p className="text-label-md font-bold text-on-surface">
              {projectLabel}
            </p>
            <p className="text-[10px] text-on-surface-variant">
              Last audit: {lastAudit}
            </p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {sidebarNav.map((item) => {
          const isActive = item.label === activeNav;
          const href = buildNavHref(item.slug, domain);

          return (
            <Link
              key={item.label}
              href={href}
              className={
                isActive
                  ? "flex items-center gap-3 rounded-lg bg-secondary-container px-3 py-2 font-bold text-on-secondary-container transition-all duration-200"
                  : "flex items-center gap-3 rounded-lg px-3 py-2 text-on-surface-variant transition-all duration-200 hover:bg-surface-container-high"
              }
            >
              <Icon name={item.icon} />
              <span className="text-label-md">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-outline-variant pt-stack-md">
        <a
          href="#"
          className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-on-surface-variant hover:bg-surface-container-high"
        >
          <Icon name="settings" />
          <span className="text-label-md">Settings</span>
        </a>
        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-on-surface-variant hover:bg-surface-container-high"
        >
          <Icon name="help" />
          <span className="text-label-md">Support</span>
        </a>
        <button
          type="button"
          className="mt-stack-md w-full rounded-xl bg-[#FF5A4F] py-3 text-label-md font-bold uppercase tracking-wider text-white transition-all hover:brightness-90"
        >
          Upgrade Plan
        </button>
      </div>
    </aside>
  );
}
