import { Icon } from "@/components/icons/Icon";
import { reportMeta, sidebarNav } from "@/lib/report-data";

export function ReportSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-outline-variant bg-surface p-stack-md md:flex">
      <div className="mb-stack-xl px-2">
        <h2 className="mb-1 text-headline-md text-primary">
          {reportMeta.projectName}
        </h2>
        <p className="text-label-md text-on-surface-variant">
          Last audit: {reportMeta.lastAudit}
        </p>
      </div>
      <nav className="flex-1 space-y-1">
        {sidebarNav.map((item) => (
          <a
            key={item.label}
            href="#"
            className={
              item.active
                ? "flex items-center gap-3 rounded-lg bg-secondary-container px-3 py-2 font-bold text-on-secondary-container"
                : "group flex items-center gap-3 rounded-lg px-3 py-2 text-on-surface-variant transition-all duration-200 hover:bg-surface-container-high"
            }
          >
            <Icon name={item.icon} />
            <span className="text-label-md">{item.label}</span>
          </a>
        ))}
      </nav>
      <div className="mt-auto space-y-4 pt-stack-md">
        <button
          type="button"
          className="w-full rounded-xl bg-primary-blue py-3 text-label-md text-white transition-colors hover:bg-blue-800"
        >
          Upgrade Plan
        </button>
        <div className="space-y-1">
          <a
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-on-surface-variant hover:bg-surface-container-high"
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
        </div>
      </div>
    </aside>
  );
}
