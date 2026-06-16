"use client";

import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";

const RING_RADIUS = 40;
const DEFAULT_STROKE_WIDTH = 8;

type ScoreRingProps = {
  score: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  statusLabel?: string;
  statusClassName?: string;
  trackClassName?: string;
  indicatorClassName?: string;
  scoreClassName?: string;
  className?: string;
  strokeWidth?: number;
  animated?: boolean;
};

const sizeMap = {
  sm: { box: "w-32 h-32", score: "text-headline-md", label: "text-label-md" },
  md: {
    box: "w-40 h-40 md:w-48 md:h-48",
    score: "text-[32px] md:text-display-lg",
    label: "text-label-md",
  },
  lg: { box: "w-48 h-48", score: "text-display-lg", label: "text-label-md" },
};

function usePrefersReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

export function ScoreRing({
  score,
  size = "sm",
  label,
  statusLabel,
  statusClassName,
  trackClassName = "text-surface-container-high",
  indicatorClassName = "text-primary",
  scoreClassName = "text-primary-blue",
  className,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  animated = true,
}: ScoreRingProps) {
  const reducedMotion = usePrefersReducedMotion();
  const shouldAnimate = animated && !reducedMotion;
  const circumference = 2 * Math.PI * RING_RADIUS;
  const targetOffset = circumference - (circumference * score) / 100;
  const sizes = sizeMap[size];
  const [animatedOffset, setAnimatedOffset] = useState(circumference);
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeOffset = shouldAnimate ? animatedOffset : targetOffset;
  const displayScore = shouldAnimate ? animatedScore : score;

  useEffect(() => {
    if (!shouldAnimate) {
      return;
    }

    const strokeTimer = window.setTimeout(() => {
      setAnimatedOffset(targetOffset);
    }, 100);

    const duration = 1000;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(score * eased));

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);

    return () => {
      window.clearTimeout(strokeTimer);
      window.cancelAnimationFrame(frame);
    };
  }, [score, targetOffset, circumference, shouldAnimate]);

  return (
    <div className={cn("relative", sizes.box, className)}>
      <svg
        className="score-ring h-full w-full"
        viewBox="0 0 100 100"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          className={cn("stroke-current", trackClassName)}
          cx="50"
          cy="50"
          fill="transparent"
          r={RING_RADIUS}
          strokeWidth={strokeWidth}
        />
        <circle
          className={cn(
            "score-ring-circle stroke-current",
            indicatorClassName,
          )}
          cx="50"
          cy="50"
          fill="transparent"
          r={RING_RADIUS}
          strokeDasharray={circumference}
          strokeDashoffset={strokeOffset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn(sizes.score, scoreClassName)}>{displayScore}</span>
        {label ? (
          <span className={cn(sizes.label, "text-on-surface-variant")}>
            {label}
          </span>
        ) : null}
        {statusLabel ? (
          <span className={cn(sizes.label, "font-bold", statusClassName)}>
            {statusLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}
