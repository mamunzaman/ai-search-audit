"use client";

import { useCallback, useRef } from "react";
import { Icon } from "@/components/icons/Icon";
import { CategoryRadarCard } from "./CategoryRadarCard";
import { GrowthPotentialCard } from "./GrowthPotentialCard";
import { LLMIndexStatusCard } from "./LLMIndexStatusCard";
import { ReadinessTrendCard } from "./ReadinessTrendCard";
import { SemanticDistributionCard } from "./SemanticDistributionCard";
import type {
  ReportV2GrowthArea,
  ReportV2LlmReadiness,
  ReportV2RadarPoint,
  ReportV2SemanticBar,
  ReportV2AccessibilityCard,
} from "@/lib/audit/report-v2";
import { AccessibilityAuditCard } from "./AccessibilityAuditCard";

type VisualInsightsCarouselProps = {
  radarPoints: ReportV2RadarPoint[];
  growthAreas: ReportV2GrowthArea[];
  trendPoints: number[];
  semanticDistribution: ReportV2SemanticBar[];
  llmIndexStatus: ReportV2LlmReadiness[];
  accessibilityCard: ReportV2AccessibilityCard;
  domain?: string;
};

const SLIDE_CLASS =
  "h-[360px] w-[calc(100%-1.5rem)] shrink-0 snap-start sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]";

export function VisualInsightsCarousel({
  radarPoints,
  growthAreas,
  trendPoints,
  semanticDistribution,
  llmIndexStatus,
  accessibilityCard,
  domain,
}: VisualInsightsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: "left" | "right") => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const slide = track.querySelector<HTMLElement>("[data-insight-slide]");
    const slideWidth = slide?.offsetWidth ?? track.clientWidth * 0.85;
    const gap = 24;
    track.scrollBy({
      left: direction === "left" ? -(slideWidth + gap) : slideWidth + gap,
      behavior: "smooth",
    });
  }, []);

  const wcagHref = domain
    ? `/report/wcag-22?domain=${encodeURIComponent(domain)}`
    : undefined;

  const slides = [
    <CategoryRadarCard key="radar" points={radarPoints} />,
    <GrowthPotentialCard key="growth" areas={growthAreas} />,
    <ReadinessTrendCard key="trend" points={trendPoints} />,
    <SemanticDistributionCard key="semantic" bars={semanticDistribution} />,
    <LLMIndexStatusCard key="llm" engines={llmIndexStatus} />,
    <AccessibilityAuditCard key="accessibility" data={accessibilityCard} href={wcagHref} />,
  ];

  return (
    <section className="space-y-stack-md">
      <div className="flex items-center justify-between gap-stack-md">
        <div>
          <h2 className="text-headline-lg text-primary">Visual Insights</h2>
          <p className="text-body-sm text-on-surface-variant">
            Category performance, growth signals, and estimated LLM readiness
          </p>
        </div>
        <div className="hidden gap-2 sm:flex" data-report-print-hide>
          <button
            type="button"
            aria-label="Scroll insights left"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-white text-primary transition-colors hover:bg-surface-container-low"
            onClick={() => scroll("left")}
          >
            <Icon name="chevron_left" />
          </button>
          <button
            type="button"
            aria-label="Scroll insights right"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-white text-primary transition-colors hover:bg-surface-container-low"
            onClick={() => scroll("right")}
          >
            <Icon name="chevron_right" />
          </button>
        </div>
      </div>

      <div className="relative -mx-1">
        <div
          ref={trackRef}
          className="flex h-[360px] snap-x snap-mandatory gap-gutter overflow-x-auto scroll-smooth px-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          data-report-print-carousel
        >
          {slides.map((slide) => (
            <div key={slide.key} className={SLIDE_CLASS} data-insight-slide>
              <div className="h-full">{slide}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
