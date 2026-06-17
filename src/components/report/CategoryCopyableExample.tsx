"use client";

import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import { useState } from "react";
import { reportStyles } from "./reportStyles";

type CategoryCopyableExampleProps = {
  code: string;
  label?: string;
  className?: string;
};

export function CategoryCopyableExample({
  code,
  label = "Example",
  className,
}: CategoryCopyableExampleProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={cn(reportStyles.codeBlock, className)}>
      <div className={reportStyles.codeBlockHeader}>
        <span className={reportStyles.subsectionLabel}>{label}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold uppercase text-primary hover:bg-primary/5"
        >
          <Icon name={copied ? "check" : "content_copy"} size={14} />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className={reportStyles.codeBlockPre}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
