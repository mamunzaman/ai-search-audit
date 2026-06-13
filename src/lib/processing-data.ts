export type ProcessingMetric = {
  label: string;
  value: number;
};

export type ActivityLogEntry = {
  time: string;
  message: string;
  status?: string;
  active?: boolean;
};

export const processingMeta = {
  domain: "coinarchive.eu",
  url: "https://coinarchive.eu",
  progress: 68,
  statusLabel: "Reachable",
  currentTask: "Evaluating AI visibility",
  currentDescription:
    "Performing deep-scan of structural relevancy for LLM agents.",
  estimatedRemaining: "Approx. 12 seconds remaining",
  processingLabel: "Processing...",
};

export const completedSteps = [
  "Website reachable",
  "Page structure analyzed",
  "Meta data extracted",
  "Headings reviewed",
];

export const currentStep = "Evaluating AI visibility";

export const pendingSteps = [
  "Schema validation",
  "Trust signal analysis",
  "FAQ detection",
  "Entity recognition",
  "LLM readiness scoring",
];

export const metrics: ProcessingMetric[] = [
  { label: "Page Audited", value: 1 },
  { label: "Headings Found", value: 0 },
  { label: "Schema Types", value: 0 },
  { label: "Passed Checks", value: 0 },
];

export const activityLog: ActivityLogEntry[] = [
  {
    time: "10:42:01",
    message: "Crawling homepage...",
    status: "OK",
  },
  {
    time: "10:42:03",
    message: "Checking structured data...",
    status: "PENDING",
  },
  {
    time: "10:42:05",
    message: "Detecting headings...",
    status: "PENDING",
  },
  {
    time: "10:42:06",
    message: "Running SEO checks...",
    active: true,
  },
];

export const footerLinks = [
  "Privacy Policy",
  "Terms of Service",
  "Contact Support",
];
