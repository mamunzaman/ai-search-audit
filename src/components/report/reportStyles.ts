export const reportStyles = {
  pageStack: "space-y-stack-lg",
  detailPageStack: "space-y-stack-md",
  sectionStack: "space-y-stack-md",
  gridGap: "gap-gutter",
  visualFindingsGrid:
    "grid min-w-0 grid-cols-1 items-start gap-gutter xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]",
  contentStructureInsightGrid:
    "flex min-w-0 flex-col gap-gutter",
  contentStructureInsightRow:
    "grid min-w-0 grid-cols-1 items-stretch gap-gutter lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
  contentStructureMainRow:
    "grid min-w-0 grid-cols-1 items-start gap-gutter lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]",
  contentStructureColumn:
    "flex min-w-0 w-full flex-col gap-stack-md",
  visualBlockMax: "max-h-[420px]",

  card: "rounded-[24px] border border-outline-variant bg-white card-shadow",
  cardPadding: "p-stack-lg",
  cardPaddingXl: "p-stack-xl",

  pageTitle: "break-words text-headline-lg font-semibold text-on-surface",
  pageSummary:
    "max-w-3xl break-words text-body-md leading-relaxed text-text-secondary",
  sectionTitle: "text-headline-md font-semibold text-on-surface",
  cardTitle: "text-headline-lg font-semibold text-primary",
  subsectionLabel:
    "text-label-md font-bold uppercase tracking-wider text-text-secondary",

  statusBadge: "rounded-full px-3 py-1 text-label-md font-bold uppercase tracking-wide",
  tableBadge: "rounded px-2 py-1 text-[10px] font-bold uppercase",
  countBadge:
    "flex items-center gap-1 rounded-full border border-outline-variant bg-white px-3 py-1 text-label-md font-medium text-text-secondary",

  tableSectionHeader:
    "flex flex-col gap-3 border-b border-outline-variant bg-surface-container-low px-stack-lg py-stack-md sm:flex-row sm:items-center sm:justify-between",
  tableSectionHeaderCompact:
    "flex flex-col gap-2 border-b border-outline-variant bg-surface-container-low px-stack-md py-stack-sm sm:flex-row sm:items-center sm:justify-between",
  tableHeaderRow: "bg-surface-container-low",
  tableHeadCell:
    "px-stack-lg py-4 text-label-md font-semibold uppercase text-text-secondary",
  tableHeadCellCompact:
    "px-stack-md py-2.5 text-label-md font-semibold uppercase text-text-secondary",
  tableBodyCell: "px-stack-lg py-5",
  tableBodyCellCompact: "px-stack-md py-3",
  accordionRow: "bg-primary-fixed/20",
  accordionRowConnected: "bg-primary-fixed/15",
  accordionCell: "px-stack-md pb-3 pt-1",
  accordionCellIndented: "px-stack-md pb-3 pt-1 pl-10 sm:pl-11",
  fixCta:
    "inline-flex max-w-full shrink-0 items-center gap-1 rounded-full border border-primary/20 bg-primary-fixed/70 px-2.5 py-1 text-label-md font-semibold text-primary transition-colors hover:border-primary/35 hover:bg-primary-fixed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-1",
  fixCtaStrong:
    "border-primary/40 bg-primary-fixed font-bold shadow-sm hover:border-primary/55 hover:bg-primary-fixed-dim",
  fixDrawer:
    "mt-1.5 rounded-lg border border-outline-variant border-l-4 border-l-primary bg-white p-2.5",
  motionFadeIn: "report-fade-in",
  motionStagger: "report-stagger",
  motionStaggerItem: "report-stagger-item",
  detailFindingsCard:
    "flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-outline-variant bg-white card-shadow",
  detailFindingsHeader: "border-b border-outline-variant px-stack-md py-3",
  detailFindingsBody: "min-w-0 flex-1 space-y-stack-sm overflow-y-auto p-stack-md",

  heroCard:
    "flex min-w-0 flex-col items-center gap-stack-lg rounded-[24px] border border-outline-variant bg-white p-stack-lg card-shadow md:flex-row md:items-center",
  mainShell:
    "mx-auto w-full min-w-0 max-w-container-max flex-1 overflow-x-hidden p-margin-mobile md:p-margin-desktop",

  codeBlock:
    "overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low",
  codeBlockHeader:
    "flex items-center justify-between border-b border-outline-variant bg-surface-container px-stack-md py-2",
  codeBlockPre:
    "max-h-[120px] overflow-x-auto overflow-y-auto p-2 font-mono text-[11px] leading-relaxed text-on-surface",
} as const;
