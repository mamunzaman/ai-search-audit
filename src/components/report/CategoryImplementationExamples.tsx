"use client";

import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import type { ImplementationExample } from "@/lib/category-detail-data";
import { useState } from "react";
import { reportStyles } from "./reportStyles";

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
    <section className={cn(reportStyles.card, "overflow-hidden")}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-stack-lg py-stack-md transition-colors hover:bg-surface-container-low"
      >
        <h3 className={cn(reportStyles.sectionTitle, "flex items-center gap-2")}>
          <Icon name="terminal" className="text-primary" />
          Implementation Examples
        </h3>
        <Icon
          name="expand_more"
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div className="border-t border-outline-variant px-stack-lg pb-stack-lg">
          <div className="mb-3 flex flex-wrap gap-2 pt-stack-md">
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
            <div className="flex items-center justify-between bg-inverse-surface px-stack-md py-2">
              <span className={reportStyles.subsectionLabel}>HTML Snippet</span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold uppercase text-inverse-on-surface hover:bg-white/10"
              >
                <Icon name={copied ? "check" : "content_copy"} size={14} />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="overflow-x-auto bg-[#1a1b23] p-stack-md">
              <code className="font-mono text-body-sm leading-relaxed text-inverse-on-surface/90">
                {activeExample.code}
              </code>
            </pre>
          </div>
        </div>
      ) : null}
    </section>
  );
}
