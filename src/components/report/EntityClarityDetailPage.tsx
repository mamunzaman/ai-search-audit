"use client";

import { ReportSidebar } from "@/components/report/ReportSidebar";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import {
  getEntityClarityFallbackView,
  loadEntityClarityDetailView,
  type EntityClarityDetailView,
  type EntityRelationshipNode,
} from "@/data/report/entityClarityData";
import Link from "next/link";
import { useEffect, useState } from "react";

type EntityClarityDetailPageProps = {
  domain: string;
};

const ENTITY_RING_RADIUS = 58;
const ENTITY_RING_CIRCUMFERENCE = 2 * Math.PI * ENTITY_RING_RADIUS;

function EntityScoreRing({ score }: { score: number }) {
  const targetOffset =
    ENTITY_RING_CIRCUMFERENCE - (ENTITY_RING_CIRCUMFERENCE * score) / 100;
  const [strokeOffset, setStrokeOffset] = useState(ENTITY_RING_CIRCUMFERENCE);

  useEffect(() => {
    const timer = window.setTimeout(() => setStrokeOffset(targetOffset), 100);
    return () => window.clearTimeout(timer);
  }, [targetOffset]);

  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg
        className="h-full w-full -rotate-90"
        viewBox="0 0 128 128"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="64"
          cy="64"
          fill="transparent"
          r={ENTITY_RING_RADIUS}
          stroke="currentColor"
          strokeWidth="8"
          className="text-outline-variant"
        />
        <circle
          cx="64"
          cy="64"
          fill="transparent"
          r={ENTITY_RING_RADIUS}
          stroke="currentColor"
          strokeDasharray={ENTITY_RING_CIRCUMFERENCE}
          strokeDashoffset={strokeOffset}
          strokeLinecap="round"
          strokeWidth="8"
          className="text-primary-container"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-headline-md font-bold text-primary">{score}</span>
        <span className="font-label-md text-on-surface-variant">/ 100</span>
      </div>
    </div>
  );
}

function EntityRelationshipMap({
  primaryLabel,
  nodes,
}: {
  primaryLabel: string;
  nodes: EntityRelationshipNode[];
}) {
  return (
    <div className="relative min-h-[280px] overflow-hidden bg-canvas p-4 sm:min-h-[320px] sm:p-stack-lg md:min-h-[400px]">
      <svg
        className="mx-auto h-auto w-full max-w-full"
        viewBox="0 0 600 400"
        aria-hidden="true"
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
      >
        {nodes.map((node) => (
          <line
            key={`line-${node.label}`}
            x1="300"
            x2={node.x}
            y1="200"
            y2={node.y}
            stroke="currentColor"
            className="text-primary-container"
            strokeDasharray="4"
            strokeWidth="2"
          />
        ))}
        <circle
          className="animate-pulse fill-primary-container"
          cx="300"
          cy="200"
          r="45"
        />
        <text
          fill="white"
          fontSize="12"
          fontWeight="bold"
          textAnchor="middle"
          x="300"
          y="205"
        >
          {primaryLabel}
        </text>
        {nodes.map((node) => (
          <g key={node.label}>
            <circle
              cx={node.x}
              cy={node.y}
              fill="white"
              r="30"
              stroke="currentColor"
              className="stroke-primary-container"
              strokeWidth="2"
            />
            <text
              fill="currentColor"
              className="fill-primary-container"
              fontSize="10"
              textAnchor="middle"
              x={node.x}
              y={node.y + 5}
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] rounded-lg border border-outline-variant bg-white/80 p-2 backdrop-blur sm:bottom-4 sm:left-4 sm:p-3">
        <div className="mb-1 flex min-w-0 items-center gap-2">
          <span className="h-3 w-3 shrink-0 rounded-full bg-primary" />
          <span className="break-words text-xs font-label-md leading-tight">Primary Entity</span>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-3 w-3 shrink-0 rounded-full border border-primary" />
          <span className="break-words text-xs font-label-md leading-tight">Relational Attributes</span>
        </div>
      </div>
    </div>
  );
}

function HeaderSection({ data }: { data: EntityClarityDetailView }) {
  return (
    <header className="mb-gutter flex min-w-0 flex-col items-center gap-stack-lg rounded-[24px] border border-outline-variant bg-white p-stack-lg card-shadow md:flex-row md:items-center">
      <EntityScoreRing score={data.score} />
      <div className="min-w-0 flex-1 text-center md:text-left">
        <div className="mb-stack-xs flex flex-wrap items-center justify-center gap-stack-sm md:justify-start">
          <h2 className="break-words text-headline-lg font-semibold leading-tight text-on-surface">
            {data.title}
          </h2>
          <span className={cn("rounded-full px-3 py-1 font-label-md", data.statusClassName)}>
            {data.statusLabel}
          </span>
        </div>
        <p className="max-w-2xl break-words text-body-md leading-relaxed text-on-surface-variant">
          {data.summary}
        </p>
      </div>
      <div className="flex min-w-0 w-full shrink-0 flex-wrap justify-center gap-stack-sm md:w-auto md:justify-end">
        <button
          type="button"
          className="flex min-w-[140px] flex-1 items-center justify-center rounded-lg border border-primary-container px-stack-lg py-3 font-label-md text-primary-container transition-all hover:bg-primary-container hover:text-on-primary sm:flex-none"
        >
          <Icon name="download" size={20} className="mr-2 shrink-0" />
          Export PDF
        </button>
        <button
          type="button"
          className="flex min-w-[140px] flex-1 items-center justify-center rounded-lg bg-[#FF5A4F] px-stack-lg py-3 font-label-md text-white transition-all hover:brightness-90 sm:flex-none"
        >
          <Icon name="refresh" size={20} className="mr-2 shrink-0" />
          Re-Audit
        </button>
      </div>
    </header>
  );
}

function KpiStrip({ data }: { data: EntityClarityDetailView }) {
  return (
    <div className="mb-gutter grid min-w-0 grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-4">
      {data.kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="min-w-0 rounded-[24px] border border-outline-variant bg-white p-stack-lg card-shadow"
        >
          <p className="mb-1 break-words font-label-md uppercase leading-tight text-on-surface-variant">
            {kpi.label}
          </p>
          <div className="flex min-w-0 flex-wrap items-end justify-between gap-x-2 gap-y-1">
            <span className="shrink-0 text-headline-md font-bold tabular-nums text-primary">
              {kpi.value}
            </span>
            <span
              className={cn(
                "flex min-w-0 items-center gap-0.5 break-words font-label-md leading-tight",
                kpi.trendClassName,
              )}
            >
              <Icon name={kpi.trendIcon} size={16} className="shrink-0" />
              {kpi.trendLabel}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailedFindings({ data }: { data: EntityClarityDetailView }) {
  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-outline-variant bg-white card-shadow">
      <div className="border-b border-outline-variant px-stack-lg py-4">
        <h3 className="break-words text-[18px] font-semibold leading-tight text-on-surface">
          Detailed Findings
        </h3>
      </div>
      <div className="min-w-0 flex-1 space-y-stack-md overflow-y-auto p-stack-lg">
        <div>
          <p className="font-label-md uppercase text-on-surface-variant">Primary Entity</p>
          <p className="break-words text-body-md font-bold text-on-surface">{data.primaryEntity}</p>
        </div>
        <div>
          <p className="font-label-md uppercase text-on-surface-variant">Entity Type</p>
          <p className="break-words text-body-md text-on-surface">{data.entityType}</p>
        </div>
        <div>
          <p className="font-label-md uppercase text-on-surface-variant">Knowledge Graph Signals</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {data.kgSignals.map((signal) => (
              <span
                key={signal}
                className="max-w-full break-words rounded bg-surface-container-high px-2 py-1 text-[11px] font-medium"
              >
                {signal}
              </span>
            ))}
          </div>
        </div>
        <div className="border-t border-outline-variant pt-stack-md">
          <p className="font-label-md uppercase text-on-surface-variant">Consistency Rating</p>
          <div className="mt-2 h-2 w-full rounded-full bg-surface-container-high">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: `${data.consistencyScore}%` }}
            />
          </div>
          <p className="mt-1 text-[12px] text-on-surface-variant">{data.consistencyNote}</p>
        </div>
        <div className="border-t border-outline-variant pt-stack-md">
          <p className="mb-stack-sm font-label-md uppercase text-on-surface-variant">Entity Signals</p>
          <div className="space-y-3">
            {data.entitySignals.map((signal) => (
              <div key={signal.label} className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="break-words text-body-sm font-semibold leading-tight text-on-surface">
                    {signal.label}
                  </p>
                  <span className="shrink-0 font-label-md tabular-nums text-primary">
                    {signal.score}%
                  </span>
                </div>
                <p className="break-words text-body-sm leading-tight text-on-surface-variant">
                  {signal.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
        {data.missingEntities.length > 0 ? (
          <div className="border-t border-outline-variant pt-stack-md">
            <p className="mb-stack-sm font-label-md uppercase text-on-surface-variant">
              Missing Entities
            </p>
            <ul className="space-y-1">
              {data.missingEntities.map((item) => (
                <li
                  key={item}
                  className="break-words text-body-sm leading-tight text-on-surface-variant"
                >
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function RecommendationCard({ data }: { data: EntityClarityDetailView }) {
  return (
    <div className="min-w-0 rounded-[24px] border border-outline-variant bg-white card-shadow">
      <div className="border-b border-outline-variant px-stack-lg py-4">
        <h3 className="text-[18px] font-semibold text-on-surface">Optimization Recommendations</h3>
      </div>
      <div className="p-stack-lg">
        <div className="flex min-w-0 flex-col items-start gap-4 rounded-r-lg border-l-4 border-primary bg-primary/5 p-4 sm:flex-row sm:items-start">
          <div className="shrink-0 rounded-lg bg-primary-container p-2 text-on-primary sm:mr-4">
            <Icon name="lightbulb" size={24} filled />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h4 className="break-words text-body-md font-bold leading-tight text-on-surface">
                {data.recommendation.title}
              </h4>
              <span className="shrink-0 rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-800">
                {data.recommendation.impactGain}
              </span>
            </div>
            <p className="mt-1 break-words text-body-sm leading-tight text-on-surface-variant">
              {data.recommendation.description}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <span className="rounded bg-primary/10 px-2 py-1 text-[12px] font-medium text-primary">
                Priority: {data.recommendation.priority}
              </span>
              <span className="text-[12px] font-medium text-on-surface-variant">
                Effort: {data.recommendation.effort}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BenchmarkCard({ data }: { data: EntityClarityDetailView }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[24px] border border-outline-variant bg-white card-shadow">
      <div className="border-b border-outline-variant px-stack-lg py-4">
        <h3 className="text-[18px] font-semibold text-on-surface">Industry Benchmarking</h3>
      </div>
      <div className="min-w-0 overflow-x-auto p-stack-lg">
        <table className="w-full min-w-[280px] text-left">
          <thead>
            <tr className="bg-canvas font-label-md text-on-surface-variant">
              <th className="px-3 py-2">Entity</th>
              <th className="whitespace-nowrap px-3 py-2 text-right">KG Strength</th>
              <th className="whitespace-nowrap px-3 py-2 text-right">Consistency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant text-body-sm">
            {data.benchmarkRows.map((row) => (
              <tr
                key={row.entity}
                className="transition-colors hover:bg-primary/5"
              >
                <td className="max-w-[12rem] break-words px-3 py-3 font-medium sm:max-w-none">
                  {row.entity}
                </td>
                <td
                  className={cn(
                    "px-3 py-3 text-right tabular-nums",
                    row.highlight && "font-bold text-primary",
                  )}
                >
                  {row.kgStrength}%
                </td>
                <td className="px-3 py-3 text-right tabular-nums">{row.consistency}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ImplementationSection({ data }: { data: EntityClarityDetailView }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(data.implementationCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-[24px] border border-outline-variant bg-white card-shadow">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full min-w-0 flex-col items-start justify-between gap-3 rounded-[24px] px-stack-lg py-5 transition-colors hover:bg-canvas sm:flex-row sm:items-center"
      >
        <div className="flex min-w-0 items-start text-left sm:items-center">
          <Icon name="terminal" size={24} className="mr-3 shrink-0 text-primary" />
          <h3 className="min-w-0 break-words text-[18px] font-semibold leading-tight text-on-surface">
            Developer Implementation: Organization Schema
          </h3>
        </div>
        <Icon
          name="expand_more"
          size={24}
          className={cn("shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? (
        <div className="min-w-0 border-t border-outline-variant px-stack-lg pb-stack-lg">
          <div className="relative min-w-0 overflow-hidden rounded-xl bg-[#1a1b23] p-4 sm:p-6">
            <button
              type="button"
              onClick={handleCopy}
              className="absolute right-3 top-3 text-on-surface-variant transition-colors hover:text-on-primary sm:right-4 sm:top-4"
              aria-label={copied ? "Copied" : "Copy code"}
            >
              <Icon name={copied ? "check" : "content_copy"} size={24} />
            </button>
            <pre className="max-w-full overflow-x-auto font-mono text-sm text-[#A5B4FC]">
              <code className="block min-w-max">{data.implementationCode}</code>
            </pre>
          </div>
          <p className="mt-4 break-words text-body-sm italic leading-tight text-on-surface-variant">
            Inject this JSON-LD script into the head of your homepage to resolve entity ambiguity
            for search crawlers and AI scrapers.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function EntityClarityDetailPage({ domain }: EntityClarityDetailPageProps) {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(() => getEntityClarityFallbackView(domain));

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    queueMicrotask(() => setData(loadEntityClarityDetailView(domain)));
  }, [mounted, domain]);

  const reportHref = `/report?domain=${encodeURIComponent(data.domain)}`;

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-canvas text-on-surface">
      <ReportSidebar
        domain={data.domain}
        activeNav="Entity Clarity"
        auditDate={data.auditDate}
      />

      <main className="min-w-0 p-margin-desktop md:ml-64 md:max-w-[1440px]">
        <nav className="mb-gutter flex flex-wrap items-center gap-2 font-label-md text-on-surface-variant">
          <Link href={reportHref} className="transition-colors hover:text-primary">
            AI Search Audit
          </Link>
          <Icon name="chevron_right" size={16} className="shrink-0 opacity-50" />
          <Link href={reportHref} className="transition-colors hover:text-primary">
            LLM Visibility Report
          </Link>
          <Icon name="chevron_right" size={16} className="shrink-0 opacity-50" />
          <span className="font-bold text-primary">Entity Clarity</span>
        </nav>

        <HeaderSection data={data} />
        <KpiStrip data={data} />

        <div className="mb-gutter grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 overflow-hidden rounded-[24px] border border-outline-variant bg-white card-shadow">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-outline-variant px-stack-lg py-4">
              <h3 className="break-words text-[18px] font-semibold leading-tight text-on-surface">
                Entity Relationship Map
              </h3>
              <button
                type="button"
                className="flex shrink-0 items-center font-label-md text-primary"
              >
                <Icon name="fullscreen" size={20} className="mr-1 shrink-0" />
                Expand View
              </button>
            </div>
            <EntityRelationshipMap
              primaryLabel={data.relationshipPrimaryLabel}
              nodes={data.relationshipNodes}
            />
          </div>
          <DetailedFindings data={data} />
        </div>

        <div className="mb-gutter grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-2">
          <RecommendationCard data={data} />
          <BenchmarkCard data={data} />
        </div>

        <ImplementationSection data={data} />
      </main>
    </div>
  );
}
