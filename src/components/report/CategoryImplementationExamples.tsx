"use client";

import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import type { ImplementationExample } from "@/lib/category-detail-data";
import { useState } from "react";

type CategoryImplementationExamplesProps = {
  examples: ImplementationExample[];
};

export function CategoryImplementationExamples({
  examples,
}: CategoryImplementationExamplesProps) {
  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  if (examples.length === 0) {
    return null;
  }

  const activeExample = examples[activeTab] ?? examples[0];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(activeExample.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-[24px] border border-outline-variant bg-white card-shadow">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-surface-container-low"
      >
        <h3 className="flex items-center gap-2 text-headline-md">
          <Icon name="terminal" className="text-primary" />
          Implementation Examples
        </h3>
        <Icon
          name="expand_more"
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div className="border-t border-outline-variant px-5 pb-5">
          <div className="mb-3 flex flex-wrap gap-2 pt-4">
            {examples.map((example, index) => (
              <button
                key={example.label}
                type="button"
                onClick={() => setActiveTab(index)}
                className={cn(
                  "rounded px-3 py-1 text-[10px] font-bold uppercase transition-colors",
                  activeTab === index
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high",
                )}
              >
                {example.label}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-lg border border-outline-variant">
            <div className="flex items-center justify-between bg-inverse-surface px-3 py-2">
              <span className="text-[10px] font-bold uppercase text-inverse-on-surface">
                HTML Snippet
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold uppercase text-inverse-on-surface hover:bg-white/10"
              >
                <Icon name={copied ? "check" : "content_copy"} size={14} />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="overflow-x-auto bg-[#1a1b23] p-4">
              <code className="font-mono text-[12px] leading-relaxed text-inverse-on-surface/90">
                {activeExample.code}
              </code>
            </pre>
          </div>
        </div>
      ) : null}
    </section>
  );
}
