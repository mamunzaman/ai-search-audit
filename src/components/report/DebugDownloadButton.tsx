"use client";

import { Icon } from "@/components/icons/Icon";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  buildDebugDownloadFilename,
  downloadDebugJson,
} from "@/lib/report/debugDownload";
import { loadAuditDebugSession } from "@/lib/report-storage";
import { useEffect, useState } from "react";

type DebugDownloadButtonProps = {
  className?: string;
};

export function DebugDownloadButton({ className }: DebugDownloadButtonProps) {
  const [hasDebugData, setHasDebugData] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setHasDebugData(loadAuditDebugSession() !== null);
    });
  }, []);

  if (!hasDebugData) {
    return null;
  }

  function handleDownload() {
    const session = loadAuditDebugSession();

    if (!session) {
      setHasDebugData(false);
      return;
    }

    downloadDebugJson(
      {
        domain: session.domain,
        score: session.score,
        timestamp: session.timestamp,
        debugSummary: session.debugSummary,
        debug: session.debug,
      },
      buildDebugDownloadFilename(session.domain, session.timestamp),
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      data-report-print-hide
      onClick={handleDownload}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-label-md",
        className,
      )}
    >
      <Icon name="download" className="text-[20px]" />
      Download Debug JSON
    </Button>
  );
}
