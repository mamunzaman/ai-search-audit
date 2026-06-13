"use client";

import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";

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
}: ScoreRingProps) {
  const circumference = 2 * Math.PI * 40;
  const targetOffset = circumference - (circumference * score) / 100;
  const sizes = sizeMap[size];
  const [strokeOffset, setStrokeOffset] = useState(circumference);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStrokeOffset(targetOffset);
    }, 100);
    return () => window.clearTimeout(timer);
  }, [targetOffset]);

  return (
    <div className={cn("relative", sizes.box, className)}>
      <svg className="score-ring h-full w-full" viewBox="0 0 100 100">
        <circle
          className={cn("stroke-current", trackClassName)}
          cx="50"
          cy="50"
          fill="transparent"
          r="40"
          strokeWidth="8"
        />
        <circle
          className={cn(
            "score-ring-circle stroke-current",
            indicatorClassName,
          )}
          cx="50"
          cy="50"
          fill="transparent"
          r="40"
          strokeDasharray={circumference}
          strokeDashoffset={strokeOffset}
          strokeLinecap="round"
          strokeWidth="8"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn(sizes.score, scoreClassName)}>{score}</span>
        {label && (
          <span className={cn(sizes.label, "text-on-surface-variant")}>
            {label}
          </span>
        )}
        {statusLabel && (
          <span className={cn(sizes.label, "font-bold", statusClassName)}>
            {statusLabel}
          </span>
        )}
      </div>
    </div>
  );
}
