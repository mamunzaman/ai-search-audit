import type { HomeMetric } from "@/components/ui/MetricCard";

export const navLinks = [
  { label: "Features", href: "#features", active: true },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Sample Report", href: "#sample-report" },
  { label: "Pricing", href: "#pricing" },
];

export const trustSignals = [
  { icon: "check_circle", text: "No signup required" },
  { icon: "timer", text: "Results in 60–90 seconds" },
  { icon: "lock", text: "Your data is private" },
];

export const features = [
  { icon: "visibility", label: "AI Visibility Analysis" },
  { icon: "data_object", label: "Structured Data Checks" },
  { icon: "verified", label: "Trust Signal Detection" },
  { icon: "psychology", label: "LLM Readiness Review" },
  { icon: "analytics", label: "SEO Foundation Audit" },
];

export const howItWorksSteps = [
  {
    step: 1,
    title: "Enter Website URL",
    description:
      "Provide your domain and our bot begins a deep-scan simulated as multiple AI user-agents.",
  },
  {
    step: 2,
    title: "AI Analysis Engine",
    description:
      "We evaluate semantic clarity, citation potential, and structured markup against LLM ranking factors.",
  },
  {
    step: 3,
    title: "Get Your Report",
    description:
      "Receive a comprehensive dashboard with actionable scores and critical fixes for AI visibility.",
  },
];

export const sampleMetrics: HomeMetric[] = [
  { icon: "health_and_safety", title: "SEO Health", score: 85 },
  { icon: "visibility", title: "AI Visibility", score: 82 },
  { icon: "schema", title: "Entity Clarity", score: 78 },
  { icon: "verified_user", title: "Trust Signals", score: 88 },
  { icon: "article", title: "Content Structure", score: 80 },
  { icon: "code", title: "Schema Markup", score: 70, critical: true },
  { icon: "quiz", title: "FAQ Readiness", score: 65, critical: true },
  { icon: "smart_toy", title: "AI Answer Readiness", score: 75 },
];

export const footerLinks = [
  "Privacy Policy",
  "Terms of Service",
  "Contact Support",
  "Documentation",
];
