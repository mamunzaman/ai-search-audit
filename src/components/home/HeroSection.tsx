"use client";

import { Icon } from "@/components/icons/Icon";
import { Badge, Button, Input } from "@/components/ui";
import { trustSignals } from "@/lib/home-data";
import { HERO_INPUT_ID, useHomeUrl } from "./HomeUrlProvider";
import { HeroDashboardPreview } from "./HeroDashboardPreview";

export function HeroSection() {
  const { urlInput, setUrlInput, navigateToProcessing } = useHomeUrl();

  const handleSubmit = () => {
    navigateToProcessing();
  };

  return (
    <section className="relative mx-auto max-w-container-max overflow-hidden px-margin-desktop pb-24 pt-16">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <div className="space-y-8">
          <Badge>AI Visibility Platform</Badge>
          <h1 className="font-display-lg text-display-lg text-on-surface">
            See Your Website Through the{" "}
            <span className="text-primary">Eyes of AI</span>
          </h1>
          <p className="max-w-xl font-body-lg text-body-lg text-on-surface-variant">
            Analyze any website and discover how well ChatGPT, Gemini, Claude,
            Perplexity, and AI search engines understand, trust, and cite your
            content.
          </p>
          <div className="relative max-w-lg">
            <div className="flex rounded-2xl border border-outline-variant bg-white p-1.5 soft-elevation transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
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
              />
              <Button
                type="button"
                className="whitespace-nowrap rounded-xl px-6 py-3"
                onClick={handleSubmit}
              >
                Get your LLM Visibility Report
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 pt-2">
            {trustSignals.map((signal) => (
              <div
                key={signal.text}
                className="flex items-center gap-2 text-on-surface-variant"
              >
                <Icon name={signal.icon} className="text-primary" size={20} />
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
