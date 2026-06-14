import Image from "next/image";
import { Icon } from "@/components/icons/Icon";
import { Button } from "@/components/ui";
import { avatarUrl } from "@/lib/report-data";

type ReportTopNavProps = {
  domain: string;
};

export function ReportTopNav({ domain }: ReportTopNavProps) {
  return (
    <header className="sticky top-0 z-20 flex w-full min-w-0 flex-wrap items-center justify-between gap-stack-sm border-b border-outline-variant bg-surface-container-lowest px-margin-desktop py-4 shadow-sm">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-headline-md font-bold text-primary">
          {domain} Report
        </h1>
        <p className="text-body-sm text-on-surface-variant">
          Visual Analytics Executive Summary
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-stack-sm sm:gap-stack-md">
        <Button
          variant="outline"
          className="hidden items-center gap-2 rounded-lg px-4 py-2 text-label-md sm:flex"
        >
          <Icon name="picture_as_pdf" className="text-[20px]" />
          Export PDF
        </Button>
        <Button className="rounded-lg px-6 py-2 text-label-md hover:brightness-110">
          New Audit
        </Button>
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-surface-container">
          <Image
            src={avatarUrl}
            alt="User profile photo"
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
