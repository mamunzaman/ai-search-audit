export type ExportReportOptions = {
  title?: string;
};

export function exportReport(options?: ExportReportOptions): void {
  if (typeof window === "undefined") {
    return;
  }

  const previousTitle = document.title;

  if (options?.title) {
    document.title = options.title;
  }

  window.print();

  if (options?.title) {
    window.setTimeout(() => {
      document.title = previousTitle;
    }, 0);
  }
}

export function buildExportReportTitle(domain: string): string {
  const cleaned = domain.trim() || "Audit Report";
  return `${cleaned} — AI Search Audit Report`;
}
