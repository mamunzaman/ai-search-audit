type IconDefinition = {
  paths: string[];
  filled?: boolean;
};

const stroke = (paths: string[]): IconDefinition => ({ paths });
const filled = (paths: string[]): IconDefinition => ({ paths, filled: true });

export const ICON_PATHS: Record<string, IconDefinition> = {
  accessibility_new: stroke([
    "M12 2a2 2 0 1 0 0 4",
    "M7 8h10",
    "M9 8v5l-2 9",
    "M15 8v5l2 9",
    "M8 13h8",
  ]),
  account_balance: stroke([
    "M3 10h18",
    "M5 10V20",
    "M10 10V20",
    "M14 10V20",
    "M19 10V20",
    "M12 3l9 4H3l9-4z",
  ]),
  account_tree: stroke([
    "M12 3v6",
    "M6 9h12",
    "M8 9v12",
    "M16 9v12",
    "M12 15v6",
  ]),
  add_circle: stroke(["M12 8v8", "M8 12h8", "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"]),
  analytics: stroke([
    "M4 19V5",
    "M4 19h16",
    "M8 17V9",
    "M12 17V7",
    "M16 17v-4",
  ]),
  arrow_forward: stroke(["M5 12h14", "M13 6l6 6-6 6"]),
  arrow_upward: stroke(["M12 19V5", "M6 11l6-6 6 6"]),
  article: stroke([
    "M6 4h12v16H6z",
    "M9 8h6",
    "M9 12h6",
    "M9 16h4",
  ]),
  auto_awesome: stroke([
    "M12 3l1.4 4.3L18 8.8l-3.5 1.5L13 14.6 11.5 10.3 8 8.8l4.6-1.5L12 3z",
    "M5 16l.8 2.4L8 19l-2.2.6L5 22l-.8-2.4L2 19l2.2-.6L5 16z",
  ]),
  bar_chart: stroke([
    "M6 20V10",
    "M12 20V4",
    "M18 20v-7",
    "M4 20h16",
  ]),
  block: stroke(["M4 4h16v16H4z", "M4 4l16 16"]),
  bolt: stroke(["M13 2L4 14h7l-1 8 9-12h-7l1-8z"]),
  cancel: stroke(["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M9 9l6 6", "M15 9l-6 6"]),
  category: stroke(["M4 7h7V4H4v3z", "M13 7h7V4h-7v3z", "M4 20h7v-3H4v3z", "M13 20h7v-3h-7v3z"]),
  check: stroke(["M20 6L9 17l-5-5"]),
  check_circle: filled([
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  ]),
  checklist: stroke([
    "M9 6h11",
    "M9 12h11",
    "M9 18h11",
    "M5 6l1 1 2-2",
    "M5 12l1 1 2-2",
    "M5 18l1 1 2-2",
  ]),
  chevron_left: stroke(["M15 18l-6-6 6-6"]),
  chevron_right: stroke(["M9 18l6-6-6-6"]),
  close: stroke(["M18 6L6 18", "M6 6l12 12"]),
  code: stroke(["M16 18l6-6-6-6", "M8 6l-6 6 6 6"]),
  content_copy: stroke([
    "M9 9h10v10H9z",
    "M5 15H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1",
  ]),
  corporate_fare: stroke([
    "M3 21h18",
    "M6 21V7l6-3 6 3v14",
    "M10 11h4",
    "M10 15h4",
  ]),
  dashboard: stroke(["M4 13h7V4H4v9z", "M13 13h7V4h-7v9z", "M4 20h7v-5H4v5z", "M13 20h7v-9h-7v9z"]),
  data_object: stroke([
    "M4 7l8-4 8 4-8 4-8-4z",
    "M4 12l8 4 8-4",
    "M4 17l8 4 8-4",
  ]),
  description: stroke([
    "M6 4h12v16H6z",
    "M9 8h6",
    "M9 12h6",
    "M9 16h6",
  ]),
  done_outline: stroke(["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M9 12l2 2 4-4"]),
  download: stroke(["M12 3v12", "M8 11l4 4 4-4", "M5 21h14"]),
  error: filled([
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
  ]),
  error_outline: stroke(["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 8v5", "M12 16h.01"]),
  expand_more: stroke(["M6 9l6 6 6-6"]),
  format_align_left: stroke([
    "M4 6h16",
    "M4 10h10",
    "M4 14h14",
    "M4 18h8",
  ]),
  format_h1: stroke(["M4 6V18", "M4 12h6", "M14 6V18", "M20 12H14"]),
  format_list_numbered: stroke([
    "M10 6h11",
    "M10 12h11",
    "M10 18h11",
    "M4 7h1",
    "M4 12h1",
    "M4 17h1",
  ]),
  format_quote: stroke(["M7 7h4v6H6l1-4H6V7h1z", "M15 7h4v6h-5l1-4h-1V7h1z"]),
  fullscreen: stroke([
    "M8 3H5a2 2 0 0 0-2 2v3",
    "M21 8V5a2 2 0 0 0-2-2h-3",
    "M3 16v3a2 2 0 0 0 2 2h3",
    "M16 21h3a2 2 0 0 0 2-2v-3",
  ]),
  health_and_safety: stroke([
    "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    "M9 12l2 2 4-4",
  ]),
  help: stroke(["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-.7.6-1.2 1.4-1.2 2.7", "M12 17h.01"]),
  hub: stroke([
    "M12 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    "M4 20a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    "M20 20a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    "M8.5 14.5l3-2.5",
    "M15.5 14.5l-3-2.5",
  ]),
  image: stroke([
    "M5 5h14v14H5z",
    "M9 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    "M5 17l4-4 3 3 2-2 5 5",
  ]),
  info: stroke(["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 10v6", "M12 7h.01"]),
  label: stroke(["M21 12l-9 9-9-9V3h9l9 9z", "M7 7h.01"]),
  language: stroke([
    "M5 8h14",
    "M12 20V4",
    "M7 4c-2 3-2 7 0 10",
    "M17 4c2 3 2 7 0 10",
  ]),
  lightbulb: filled([
    "M9 21h6",
    "M10 18h4",
    "M12 2a7 7 0 0 0-4 12.7V18h8v-3.3A7 7 0 0 0 12 2z",
  ]),
  link: stroke(["M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1", "M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1"]),
  lock: stroke([
    "M7 11V8a5 5 0 0 1 10 0v3",
    "M6 11h12v10H6z",
  ]),
  mediation: stroke([
    "M12 3v18",
    "M5 8h14",
    "M7 16h10",
  ]),
  menu_book: stroke([
    "M6 4h10a2 2 0 0 1 2 2v14H8a2 2 0 0 0-2 2V4z",
    "M8 4v16",
  ]),
  monitoring: stroke([
    "M4 19V5",
    "M4 19h16",
    "M8 17V9",
    "M12 17V7",
    "M16 17v-4",
    "M20 3v2",
  ]),
  open_in_new: stroke([
    "M14 3h7v7",
    "M10 14L21 3",
    "M21 14v7H3V3h7",
  ]),
  palette: stroke([
    "M12 22a10 10 0 1 0 0-20c4 0 7 2 7 6a3 3 0 0 1-3 3h-1a2 2 0 0 0-2 2c0 1.5 1 3 3 5z",
    "M8 10h.01",
    "M12 8h.01",
    "M16 10h.01",
  ]),
  picture_as_pdf: stroke([
    "M6 4h9l5 5v11H6z",
    "M15 4v5h5",
    "M9 13h6",
    "M9 17h4",
  ]),
  priority_high: stroke(["M12 3l9 18H3L12 3z", "M12 10v4", "M12 17h.01"]),
  psychology: stroke([
    "M12 3a6 6 0 0 0-6 6c0 2.2 1.2 4.1 3 5.2V18h6v-3.8c1.8-1.1 3-3 3-5.2a6 6 0 0 0-6-6z",
    "M9 21h6",
  ]),
  quiz: stroke([
    "M6 4h12v16H6z",
    "M9 8h6",
    "M9 12h6",
    "M9 16h3",
    "M16 16h.01",
  ]),
  refresh: stroke([
    "M21 12a9 9 0 1 1-3-6.7",
    "M21 3v6h-6",
  ]),
  remove: stroke(["M5 12h14"]),
  schema: stroke([
    "M4 7l8-4 8 4-8 4-8-4z",
    "M4 12l8 4 8-4",
    "M4 17l8 4 8-4",
  ]),
  search_check: stroke([
    "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z",
    "M21 21l-4.3-4.3",
    "M9 11l2 2 4-4",
  ]),
  settings: stroke([
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    "M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z",
  ]),
  share: stroke([
    "M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7",
    "M16 6l-4-4-4 4",
    "M12 2v14",
  ]),
  short_text: stroke([
    "M4 6h16",
    "M4 10h10",
    "M4 14h14",
  ]),
  smart_toy: stroke([
    "M9 3h6",
    "M7 8h10v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8z",
    "M9 13h.01",
    "M15 13h.01",
    "M10 17h4",
  ]),
  stacked_bar_chart: stroke([
    "M8 20V10",
    "M12 20V6",
    "M16 20v-8",
    "M4 20h16",
  ]),
  tag: stroke([
    "M21 12l-9 9-9-9V3h9l9 9z",
    "M7 7h.01",
  ]),
  terminal: stroke([
    "M4 5h16v14H4z",
    "M8 9l3 3-3 3",
    "M13 15h3",
  ]),
  thumb_up: stroke([
    "M7 11v10",
    "M7 11l4-8 2 4h5a2 2 0 0 1 2 2l-2 8H7z",
  ]),
  timer: stroke([
    "M10 2h4",
    "M12 14V8",
    "M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16z",
  ]),
  title: stroke([
    "M4 6h16",
    "M10 6v14",
    "M14 10h6",
    "M14 14h4",
  ]),
  trending_down: stroke(["M23 18l-9.5-9.5-5 5L1 18"]),
  trending_flat: stroke(["M23 12H1"]),
  trending_up: stroke(["M23 6l-9.5 9.5-5-5L1 6"]),
  verified: stroke([
    "M12 2l2.4 1.2 2.6-.2 1.8 2-2 2.4.2 2.6-2.4 1-1 2.6-2.6-.2-2.4 2-1.8-2-2.6.2-2.4L12 2z",
    "M9 12l2 2 4-4",
  ]),
  verified_user: stroke([
    "M12 2l2.4 1.2 2.6-.2 1.8 2-2 2.4.2 2.6-2.4 1-1 2.6-2.6-.2-2.4 2-1.8-2-2.6.2-2.4L12 2z",
    "M9 12l2 2 4-4",
  ]),
  video_library: stroke([
    "M4 6h12v12H4z",
    "M16 10l4-2v8l-4-2",
  ]),
  view_agenda: stroke([
    "M6 4h12v16H6z",
    "M9 8h6",
    "M9 12h6",
    "M9 16h6",
  ]),
  visibility: stroke([
    "M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z",
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  ]),
  warning: filled([
    "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  ]),
};

const ICON_ALIASES: Record<string, string> = {
  add: "add_circle",
};

export function resolveIconDefinition(
  name: string,
  filledOverride?: boolean,
): IconDefinition {
  const resolvedName = ICON_ALIASES[name] ?? name;
  const definition = ICON_PATHS[resolvedName] ?? ICON_PATHS.help;

  if (filledOverride && !definition.filled) {
    return definition;
  }

  return definition;
}
