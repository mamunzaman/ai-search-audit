"use client";

import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import type { IssueExampleType } from "@/types/audit";
import { useState } from "react";

const EXAMPLE_TYPE_LABELS: Record<IssueExampleType, string> = {
  html: "HTML",
  schema: "Schema",
  meta: "Meta",
  text: "Content",
};

type CategoryCopyableExampleProps = {
  code: string;
  label?: string;
  exampleType?: IssueExampleType;
  className?: string;
  compact?: boolean;
  minimal?: boolean;
};

export function CategoryCopyableExample({
  code,
  label,
  exampleType,
  className,
  compact = true,
  minimal = false,
}: CategoryCopyableExampleProps) {
  const [copied, setCopied] = useState(false);
  const displayLabel =
    label ?? (exampleType ? EXAMPLE_TYPE_LABELS[exampleType] : "Example");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (minimal) {
    return (
      <div
        className={cn(
          "min-w-0 overflow-hidden rounded border border-outline-variant bg-surface-container-low/50",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-outline-variant/60 px-2 py-1">
          <span className="text-[10px] font-bold uppercase text-on-surface-variant">
            {displayLabel}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-primary hover:underline"
          >
            <Icon name={copied ? "check" : "content_copy"} size={12} />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="max-h-[120px] overflow-x-auto overflow-y-auto p-2 font-mono text-[11px] leading-relaxed text-on-surface">
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border border-outline-variant", className)}>
      <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-2 py-1.5">
        <span className="text-[10px] font-bold uppercase text-on-surface-variant">
          {displayLabel}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-primary hover:underline"
        >
          <Icon name={copied ? "check" : "content_copy"} size={12} />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        className={cn(
          "overflow-x-auto overflow-y-auto font-mono leading-relaxed text-on-surface",
          compact ? "max-h-[120px] p-2 text-[11px]" : "max-h-none p-stack-md text-body-sm",
        )}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
