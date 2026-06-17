"use client";

import { Icon } from "@/components/icons/Icon";
import { Badge, Button, Input } from "@/components/ui";
import { trustSignals } from "@/lib/home-data";
import { HERO_INPUT_ID, useHomeUrl } from "./HomeUrlProvider";
import { HeroDashboardPreview } from "./HeroDashboardPreview";

export function HeroSection() {
  const { urlInput, setUrlInput, debugEnabled, setDebugEnabled, navigateToProcessing } =
    useHomeUrl();

  const handleSubmit = () => {
    navigateToProcessing();
  };

  return (
    <section className="relative mx-auto max-w-container-max overflow-hidden px-margin-mobile pb-16 pt-12 md:px-margin-desktop md:pb-20 md:pt-14">
      <div className="grid items-start gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
        <div className="space-y-6">
          <Badge>AI Visibility Platform</Badge>
          <h1 className="font-display-lg text-display-lg text-on-surface">
            See Your Website Through the{" "}
            <span className="text-primary">Eyes of AI</span>
          </h1>
          <p className="max-w-xl font-body-lg text-body-lg text-text-secondary">
            Analyze any website and discover how well ChatGPT, Gemini, Claude,
            Perplexity, and AI search engines understand, trust, and cite your
            content.
          </p>
          <div className="w-full max-w-xl space-y-2">
            <div className="flex flex-col gap-2 rounded-2xl border border-outline-variant bg-white p-1.5 soft-elevation transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 sm:flex-row sm:items-center">
              <Input
                id={HERO_INPUT_ID}
                placeholder="https://yourwebsite.com"
                type="text"
                value={urlInput}
                onChange={(event) => setUrlInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSubmit();
                  }
                }}
                className="min-w-0 text-on-surface placeholder:text-text-secondary"
              />
              <Button
                type="button"
                className="w-full shrink-0 whitespace-nowrap rounded-xl px-5 py-2.5 text-body-sm font-semibold sm:w-auto"
                onClick={handleSubmit}
              >
                Get your LLM Visibility Report
              </Button>
            </div>
            <label className="flex items-center gap-2 px-1 font-label-md text-label-md text-text-secondary">
              <input
                type="checkbox"
                checked={debugEnabled}
                onChange={(event) => setDebugEnabled(event.target.checked)}
                className="h-3.5 w-3.5 rounded border-outline-variant text-primary focus:ring-primary/20"
              />
              Save debug JSON for score testing
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            {trustSignals.map((signal) => (
              <div
                key={signal.text}
                className="flex items-center gap-2 text-text-secondary"
              >
                <Icon name={signal.icon} className="text-primary" size={18} />
                <span className="font-body-sm text-body-sm">{signal.text}</span>
              </div>
            ))}
          </div>
        </div>
        <HeroDashboardPreview />
      </div>
    </section>
  );
}
