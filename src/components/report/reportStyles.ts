export const reportStyles = {
  pageStack: "space-y-stack-lg",
  sectionStack: "space-y-stack-md",
  gridGap: "gap-gutter",

  card: "rounded-[24px] border border-outline-variant bg-white card-shadow",
  cardPadding: "p-stack-lg",
  cardPaddingXl: "p-stack-xl",

  pageTitle: "break-words text-headline-lg font-semibold text-on-surface",
  pageSummary:
    "max-w-3xl break-words text-body-md leading-relaxed text-on-surface-variant",
  sectionTitle: "text-headline-md text-on-surface",
  cardTitle: "text-headline-lg text-primary",
  subsectionLabel:
    "text-label-md font-bold uppercase tracking-wider text-on-surface-variant",

  statusBadge: "rounded-full px-3 py-1 text-label-md font-bold uppercase tracking-wide",
  tableBadge: "rounded px-2 py-1 text-[10px] font-bold uppercase",
  countBadge:
    "flex items-center gap-1 rounded-full border border-outline-variant bg-white px-3 py-1 text-label-md text-on-surface-variant",

  tableSectionHeader:
    "flex flex-col gap-3 border-b border-outline-variant bg-surface-container-low px-stack-lg py-stack-md sm:flex-row sm:items-center sm:justify-between",
  tableHeaderRow: "bg-surface-container-low",
  tableHeadCell:
    "px-stack-lg py-4 text-label-md uppercase text-on-surface-variant",
  tableBodyCell: "px-stack-lg py-5",

  heroCard:
    "flex min-w-0 flex-col items-center gap-stack-lg rounded-[24px] border border-outline-variant bg-white p-stack-lg card-shadow md:flex-row md:items-center",
  mainShell:
    "mx-auto w-full min-w-0 max-w-container-max flex-1 overflow-x-hidden p-margin-mobile md:p-margin-desktop",
} as const;
