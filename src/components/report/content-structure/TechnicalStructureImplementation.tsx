"use client";

import { Icon } from "@/components/icons/Icon";
import { reportStyles } from "@/components/report/reportStyles";
import { cn } from "@/lib/cn";
import { useState } from "react";

type TechnicalStructureImplementationProps = {
  implementationCode: string;
};

export function TechnicalStructureImplementation({
  implementationCode,
}: TechnicalStructureImplementationProps) {
  const [open, setOpen] = useState(true);

  return (
    <section className={cn(reportStyles.card, "w-full min-w-0 overflow-hidden")}>
      <div className={reportStyles.tableSectionHeaderCompact}>
        <h4 className="flex min-w-0 items-center gap-2 break-words text-headline-md">
          <Icon name="terminal" size={20} className="shrink-0 text-primary" />
          <span>Technical Structure Implementation</span>
        </h4>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex shrink-0 items-center gap-1 font-label-md font-bold text-primary"
        >
          Toggle Snippet
          <Icon
            name="expand_more"
            size={20}
            className={cn("transition-transform", open && "rotate-180")}
          />
        </button>
      </div>
      {open ? (
        <div className="w-full min-w-0 p-stack-md">
          <p className="mb-4 break-words text-body-sm text-text-secondary">
            Ensure your CMS renders semantic HTML5 landmarks to assist LLM parsers in
            identifying core content blocks.
          </p>
          <div className={cn(reportStyles.codeBlock, "w-full min-w-0 overflow-hidden")}>
            <pre
              className={cn(
                reportStyles.codeBlockPre,
                "max-h-[220px] overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words",
              )}
            >
              <code className="block min-w-0 whitespace-pre-wrap break-words">
                {implementationCode}
              </code>
            </pre>
          </div>
        </div>
      ) : null}
    </section>
  );
}
