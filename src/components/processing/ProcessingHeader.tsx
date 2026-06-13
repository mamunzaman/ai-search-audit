"use client";

import { toAuditUrl } from "@/lib/domain";
import { Icon } from "@/components/icons/Icon";

type ProcessingHeaderProps = {
  domain: string;
};

export function ProcessingHeader({ domain }: ProcessingHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-outline-variant bg-surface px-margin-desktop py-4">
      <div className="flex items-center gap-8">
        <span className="font-headline-md text-headline-md font-bold text-on-surface">
          AI Search Audit
        </span>
        <div className="hidden w-full max-w-md items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-4 py-2 md:flex">
          <Icon name="language" className="text-outline" size={18} />
          <span className="truncate font-body-sm text-body-sm text-on-surface-variant">
            {toAuditUrl(domain)}
          </span>
          <Icon name="lock" className="ml-auto text-outline" size={16} />
        </div>
      </div>
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg px-6 py-2 font-body-md text-body-md text-on-surface-variant transition-colors hover:bg-surface-container"
      >
        <Icon name="close" size={20} />
        Cancel
      </button>
    </header>
  );
}
