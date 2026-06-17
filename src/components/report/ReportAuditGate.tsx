"use client";

import { loadAuditReportSafe } from "@/lib/audit/storage";
import { useEffect, useState, type ReactNode } from "react";
import { ReportEmptyState } from "./ReportEmptyState";

type ReportAuditGateProps = {
  children: ReactNode;
};

export function ReportAuditGate({ children }: ReportAuditGateProps) {
  const [ready, setReady] = useState(false);
  const [hasAudit, setHasAudit] = useState(true);

  useEffect(() => {
    queueMicrotask(() => {
      setHasAudit(loadAuditReportSafe() !== null);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return <>{children}</>;
  }

  if (!hasAudit) {
    return <ReportEmptyState />;
  }

  return <>{children}</>;
}
