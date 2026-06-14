export type ReportCategory = {
  icon: string;
  title: string;
  score: number;
  critical?: boolean;
  summary?: string;
  issueCount?: number;
};

export type ReportIssue = {
  title: string;
  impact: "Critical" | "High" | "Medium";
  difficulty: string;
  gain: number;
  explanation?: string;
};

export type ReportRecommendation = {
  title: string;
  whyThisMatters: string;
  howToFix: string;
  estimatedGain: number;
};

export type SidebarNavItem = {
  icon: string;
  label: string;
  slug?: string;
  active?: boolean;
};

export const reportMeta = {
  domain: "coinarchive.eu",
  status: "Good",
  auditDate: "13 June 2026",
  score: 82,
  projectName: "Project Alpha",
  lastAudit: "2h ago",
};

export const reportDataMode = {
  real: "Real audit data",
  demo: "Demo report data",
} as const;

export const sidebarNav: SidebarNavItem[] = [
  { icon: "dashboard", label: "Overview", slug: "overview" },
  { icon: "health_and_safety", label: "SEO Health", slug: "seo-health" },
  { icon: "visibility", label: "AI Visibility", slug: "ai-visibility" },
  { icon: "category", label: "Entity Clarity", slug: "entity-clarity" },
  { icon: "verified", label: "Trust Signals", slug: "trust-signals" },
  { icon: "article", label: "Content Structure", slug: "content-structure" },
  { icon: "code", label: "Schema Markup", slug: "schema-markup" },
];

export const strengths = [
  {
    title: "Clear structure:",
    text: "Crawlers easily identify primary content hierarchy.",
  },
  {
    title: "Trust signals:",
    text: "High volume of high-quality citations detected.",
  },
  {
    title: "Entity recognition:",
    text: 'Domain is firmly mapped to "Historical Numismatics".',
  },
];

export const criticalIssues = [
  {
    title: "Missing FAQ schema:",
    text: "Reduces eligibility for AI answer snippets.",
  },
  {
    title: "Weak author signals:",
    text: "Attribution profiles lack external validation.",
  },
  {
    title: "Missing org schema:",
    text: "LLMs struggle to verify entity ownership.",
  },
];

export const categories: ReportCategory[] = [
  { icon: "health_and_safety", title: "SEO Health", score: 85 },
  { icon: "visibility", title: "AI Visibility", score: 82 },
  { icon: "category", title: "Entity Clarity", score: 78 },
  { icon: "verified", title: "Trust Signals", score: 98 },
  { icon: "article", title: "Content Structure", score: 80 },
  { icon: "code", title: "Schema Markup", score: 70, critical: true },
  { icon: "quiz", title: "FAQ Readiness", score: 65, critical: true },
  { icon: "smart_toy", title: "AI Answer Readiness", score: 75 },
];

export const priorityIssues: ReportIssue[] = [
  {
    title: "Missing Organization Schema",
    impact: "High",
    difficulty: "Easy",
    gain: 6,
  },
  {
    title: "Broken Semantic Links (Primary Nav)",
    impact: "Medium",
    difficulty: "Moderate",
    gain: 4,
  },
  {
    title: "Incomplete Author Profiles",
    impact: "High",
    difficulty: "Moderate",
    gain: 5,
  },
];

export const topFixes = [
  "Org Schema Implementation",
  "Semantic FAQ Integration",
  "LinkedIn/Wiki Citation Linking",
];

export const avatarUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBqtXL4zEgoj8JHAOjPv4_tBpc7O7bNU-elgbEHacwXOpoQMi0-b3b-_BAIirhp6kGHizJ_18VAMMBecewsgqGHr8IiEGmz4C00yOKnK8ErNVxzveLxFvCoaiP62cWqPGZuuwqH7RLhZUgHxQHIFFMbYZQ01qqpO4Wn7ZPjh4Z-aNoyZ6hhvab8Eigctf6fHRBVuYDMWDopTNxcl-wk_bn3vsWfu2rec-wGFd13dWD50bzzuea6mZf7E_uZDuQZf6DR39xhXlIh4vU";
