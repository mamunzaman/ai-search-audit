import Image from "next/image";
import { Button } from "@/components/ui";
import { avatarUrl } from "@/lib/report-data";

const topNavLinks = [
  { label: "Dashboard", active: false },
  { label: "Reports", active: true },
  { label: "History", active: false },
];

export function ReportTopNav() {
  return (
    <header className="sticky top-0 z-20 w-full border-b border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="mx-auto flex max-w-container-max items-center justify-between px-margin-desktop py-4">
        <div className="flex items-center gap-8">
          <h1 className="text-headline-md font-bold text-primary">
            AuditMetric
          </h1>
          <nav className="hidden items-center gap-6 lg:flex">
            {topNavLinks.map((link) => (
              <a
                key={link.label}
                href="#"
                className={
                  link.active
                    ? "border-b-2 border-primary pb-1 text-body-md text-primary"
                    : "text-body-md text-on-surface-variant transition-colors hover:text-primary"
                }
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="rounded-full px-6 py-2 text-label-md"
          >
            Export PDF
          </Button>
          <Button className="rounded-full px-6 py-2 text-label-md shadow-lg shadow-coral-200 hover:brightness-90">
            New Audit
          </Button>
          <div className="ml-4 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-surface-container-high">
            <Image
              src={avatarUrl}
              alt="User profile photo"
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
