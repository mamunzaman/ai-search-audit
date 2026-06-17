"use client";

import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import {
  getIssueExplanation,
  isStrongFixEmphasis,
  type IssueExplanationInput,
} from "@/lib/report/issueExplanations";
import type { IssueExplanation } from "@/types/audit";
import { useState, type ReactNode } from "react";
import { CategoryCopyableExample } from "./CategoryCopyableExample";
import { reportStyles } from "./reportStyles";

type IssueExplanationAccordionProps = IssueExplanationInput & {
  explanation?: IssueExplanation;
  className?: string;
};

function FixSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
        {label}
      </p>
      <p className="mt-0.5 text-body-sm leading-snug text-on-surface">{children}</p>
    </div>
  );
}

export function IssueExplanationAccordion({
  explanation: providedExplanation,
  className,
  status,
  severity,
  ...input
}: IssueExplanationAccordionProps) {
  const [open, setOpen] = useState(false);
  const explanation = providedExplanation ?? getIssueExplanation({ ...input, status, severity });
  const strong = isStrongFixEmphasis(status, severity);

  return (
    <div className={cn("min-w-0", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(reportStyles.fixCta, strong && reportStyles.fixCtaStrong)}
        aria-expanded={open}
      >
        <span className="whitespace-nowrap">{open ? "Hide fix" : "View fix"}</span>
        {!open ? (
          <span className="hidden whitespace-nowrap text-[10px] font-normal text-primary/75 sm:inline">
            Why + how
          </span>
        ) : null}
        <Icon
          name="expand_more"
          size={14}
          className={cn("shrink-0 transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      {open ? (
        <div className={reportStyles.fixDrawer}>
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1.5">
            <span className="text-label-md font-bold text-on-surface">Recommended fix</span>
            {explanation.expectedGain ? (
              <span className="rounded-full bg-[#E8F5E9] px-1.5 py-px text-[9px] font-bold uppercase text-[#2E7D32]">
                +{explanation.expectedGain}
              </span>
            ) : null}
          </div>
          <div className="space-y-2">
            <FixSection label="Why">
              <span className="text-on-surface-variant">{explanation.whyItMatters}</span>
            </FixSection>
            <FixSection label="Fix">{explanation.howToFix}</FixSection>
            {explanation.whereToFix ? (
              <FixSection label="Where">{explanation.whereToFix}</FixSection>
            ) : null}
            {explanation.copyableExample ? (
              <div className="min-w-0">
                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
                  Example
                </p>
                <CategoryCopyableExample
                  code={explanation.copyableExample}
                  exampleType={explanation.exampleType}
                  compact
                  minimal
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
