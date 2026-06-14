"use client";

import { cn } from "@/lib/cn";
import { useMemo, useState } from "react";

type TimeRange = "1M" | "6M" | "1Y";

type CategoryHealthTrendCardProps = {
  score: number;
};

function buildTrendPoints(score: number, range: TimeRange): number[] {
  const count = range === "1M" ? 5 : range === "6M" ? 11 : 13;
  const start = Math.max(0, score - 12);

  return Array.from({ length: count }, (_, index) => {
    const progress = index / (count - 1);
    const target = Math.min(100, score + 4);
    return Math.round(start + (target - start) * progress);
  });
}

function buildTrendPath(
  points: number[],
  width: number,
  height: number,
  padding: number,
): string {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(1, max - min);
  const stepX = (width - padding * 2) / (points.length - 1);

  return points
    .map((value, index) => {
      const x = padding + index * stepX;
      const normalized = (value - min) / range;
      const y = height - padding - normalized * (height - padding * 2);
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

const rangeLabels: Record<TimeRange, string> = {
  "1M": "1-month performance",
  "6M": "6-month historical performance",
  "1Y": "12-month historical performance",
};

export function CategoryHealthTrendCard({ score }: CategoryHealthTrendCardProps) {
  const [range, setRange] = useState<TimeRange>("6M");
  const points = useMemo(() => buildTrendPoints(score, range), [score, range]);

  const width = 800;
  const height = 200;
  const padding = 16;
  const linePath = buildTrendPath(points, width, height, padding);
  const areaPath = `${linePath} L${width - padding},${height} L${padding},${height} Z`;
  const lastPoint = points[points.length - 1] ?? score;

  return (
    <section className="overflow-hidden rounded-[24px] border border-outline-variant bg-white card-shadow">
      <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
        <div>
          <h3 className="text-headline-md">SEO Health Trend</h3>
          <p className="text-body-sm text-outline">{rangeLabels[range]}</p>
        </div>
        <div className="flex gap-2">
          {(["1M", "6M", "1Y"] as TimeRange[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRange(item)}
              className={cn(
                "rounded px-3 py-1 text-label-md font-bold uppercase transition-colors",
                range === item
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-64 p-5">
        <div
          className="absolute inset-5 chart-grid opacity-60"
          aria-hidden="true"
        />
        <svg
          className="relative h-full w-full"
          preserveAspectRatio="none"
          viewBox={`0 0 ${width} ${height}`}
        >
          <defs>
            <linearGradient id="seo-trend-gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#00218d" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#00218d" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#seo-trend-gradient)" />
          <path
            d={linePath}
            fill="none"
            stroke="#00218d"
            strokeLinecap="round"
            strokeWidth="4"
          />
        </svg>
        <div className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 rounded-lg bg-inverse-surface px-3 py-2 text-inverse-on-surface shadow-xl">
          <p className="text-[10px] font-bold uppercase opacity-60">Current</p>
          <p className="text-body-sm">
            Score: <span className="font-bold">{lastPoint}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
