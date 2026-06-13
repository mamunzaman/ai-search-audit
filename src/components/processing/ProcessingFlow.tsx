"use client";

import {
  ActivityFeed,
  EstimatedCompletion,
  ProcessingHeader,
  ProcessingMetrics,
  ProcessingProgress,
  ProcessingSteps,
} from "@/components/processing";
import { auditToActivityLog, auditToProcessingMetrics } from "@/lib/audit/audit-to-report";
import { saveAuditReport } from "@/lib/audit/storage";
import type { AuditResponse } from "@/lib/audit/types";
import { normalizeDomain } from "@/lib/domain";
import {
  activityLog,
  footerLinks,
  metrics as placeholderMetrics,
} from "@/lib/processing-data";
import {
  COMPLETE_REDIRECT_MS,
  getStepState,
  PROCESSING_STEP_MS,
  processingDescription,
  PROGRESS_MILESTONES,
} from "@/lib/processing-steps";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ProcessingFlowProps = {
  domain: string;
};

export function ProcessingFlow({ domain }: ProcessingFlowProps) {
  const router = useRouter();
  const [milestoneIndex, setMilestoneIndex] = useState(0);
  const [audit, setAudit] = useState<AuditResponse | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditReady, setAuditReady] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const progress = PROGRESS_MILESTONES[milestoneIndex];
  const { completedSteps, currentStep, pendingSteps } = getStepState(progress);
  const currentTask = currentStep ?? "LLM readiness scoring";
  const displayMetrics = audit
    ? auditToProcessingMetrics(audit)
    : placeholderMetrics;
  const displayActivityLog = audit ? auditToActivityLog(audit) : activityLog;

  useEffect(() => {
    const controller = new AbortController();

    async function fetchAudit() {
      try {
        const response = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: domain }),
          signal: controller.signal,
        });

        const data = (await response.json()) as AuditResponse & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error || "Audit request failed.");
        }

        saveAuditReport(data);
        setAudit(data);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setAuditError(
          error instanceof Error ? error.message : "Audit request failed.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setAuditReady(true);
        }
      }
    }

    void fetchAudit();

    return () => controller.abort();
  }, [domain, retryKey]);

  useEffect(() => {
    if (milestoneIndex >= PROGRESS_MILESTONES.length - 1) {
      if (!auditReady) {
        return;
      }

      if (auditError || !audit) {
        return;
      }

      const normalizedDomain = normalizeDomain(audit.finalUrl || domain);
      const redirectTimer = window.setTimeout(() => {
        router.push(`/report?domain=${encodeURIComponent(normalizedDomain)}`);
      }, COMPLETE_REDIRECT_MS);

      return () => window.clearTimeout(redirectTimer);
    }

    const stepTimer = window.setTimeout(() => {
      setMilestoneIndex((index) => index + 1);
    }, PROCESSING_STEP_MS);

    return () => window.clearTimeout(stepTimer);
  }, [audit, auditError, auditReady, domain, milestoneIndex, router]);

  if (auditError) {
    return (
      <div className="flex min-h-screen flex-col bg-canvas font-body-md text-on-surface">
        <ProcessingHeader domain={domain} />
        <main className="flex flex-grow items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-lg rounded-xl border border-border bg-white p-stack-lg card-shadow">
            <h2 className="mb-2 font-headline-md text-headline-md text-on-surface">
              Audit failed
            </h2>
            <p className="mb-6 font-body-md text-body-md text-on-surface-variant">
              {auditError}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-lg bg-primary-container px-4 py-2 font-body-md text-white"
                onClick={() => {
                  setMilestoneIndex(0);
                  setAuditError(null);
                  setAuditReady(false);
                  setAudit(null);
                  setRetryKey((key) => key + 1);
                }}
              >
                Try again
              </button>
              <Link
                href="/"
                className="rounded-lg border border-outline-variant px-4 py-2 font-body-md text-on-surface-variant"
              >
                Back to homepage
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas font-body-md text-on-surface">
      <ProcessingHeader domain={domain} />
      <main className="flex flex-grow items-center justify-center p-6 md:p-12">
        <div className="grid w-full max-w-[1200px] grid-cols-1 gap-gutter lg:grid-cols-12">
          <div className="flex flex-col gap-gutter lg:col-span-8">
            <section className="overflow-hidden rounded-xl border border-border bg-white card-shadow">
              <ProcessingProgress
                domain={normalizeDomain(audit?.finalUrl || domain)}
                progress={progress}
                currentTask={currentTask}
                currentDescription={processingDescription}
              />
              <ProcessingMetrics metrics={displayMetrics} />
              <EstimatedCompletion progress={progress} />
            </section>
            <ActivityFeed entries={displayActivityLog} />
          </div>
          <aside className="lg:col-span-4">
            <ProcessingSteps
              completedSteps={completedSteps}
              currentStep={currentStep}
              pendingSteps={pendingSteps}
            />
          </aside>
        </div>
      </main>
      <footer className="mt-auto border-t border-outline-variant bg-surface-container-low py-stack-xl">
        <div className="mx-auto flex w-full max-w-container-max flex-col items-center justify-between px-margin-desktop md:flex-row">
          <span className="font-headline-md text-headline-md font-bold text-primary">
            AI Search Audit
          </span>
          <div className="mt-6 flex gap-8 md:mt-0">
            {footerLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="font-body-sm text-body-sm text-on-surface-variant hover:underline decoration-primary"
              >
                {link}
              </a>
            ))}
          </div>
          <p className="mt-6 font-body-sm text-body-sm text-on-surface-variant opacity-80 md:mt-0">
            © 2024 AI Search Audit. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
