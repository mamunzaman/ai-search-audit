"use client";

import { cn } from "@/lib/cn";
import { reportStyles } from "@/components/report/reportStyles";
import {
  Children,
  createContext,
  isValidElement,
  useContext,
  type CSSProperties,
  type ReactNode,
} from "react";

const STAGGER_STEP_MS = 70;

const ReportMotionContext = createContext(false);

type ReportFadeInProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

type ReportStaggerProps = {
  children: ReactNode;
  className?: string;
  motionKey?: string;
  stepMs?: number;
};

type ReportStaggerItemProps = {
  children: ReactNode;
  index?: number;
  delay?: number;
  className?: string;
};

function motionDelayStyle(delayMs: number): CSSProperties {
  return { "--report-motion-delay": `${delayMs}ms` } as CSSProperties;
}

export function ReportFadeIn({ children, delay = 0, className }: ReportFadeInProps) {
  const inStagger = useContext(ReportMotionContext);

  if (inStagger) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={cn(reportStyles.motionFadeIn, className)}
      style={delay > 0 ? motionDelayStyle(delay) : undefined}
    >
      {children}
    </div>
  );
}

export function ReportStagger({
  children,
  className,
  motionKey,
  stepMs = STAGGER_STEP_MS,
}: ReportStaggerProps) {
  const items = Children.toArray(children).filter(Boolean);

  return (
    <div key={motionKey} className={cn(reportStyles.motionStagger, className)}>
      <ReportMotionContext.Provider value={true}>
        {items.map((child, index) => {
          if (!isValidElement(child)) {
            return child;
          }

          return (
            <ReportStaggerItem
              key={child.key ?? index}
              index={index}
              stepMs={stepMs}
            >
              {child}
            </ReportStaggerItem>
          );
        })}
      </ReportMotionContext.Provider>
    </div>
  );
}

export function ReportStaggerItem({
  children,
  index = 0,
  delay,
  className,
  stepMs = STAGGER_STEP_MS,
}: ReportStaggerItemProps & { stepMs?: number }) {
  const delayMs = delay ?? index * stepMs;

  return (
    <div
      className={cn(reportStyles.motionStaggerItem, className)}
      style={motionDelayStyle(delayMs)}
    >
      {children}
    </div>
  );
}

export function ReportDetailMotion({
  motionKey,
  children,
  className,
}: {
  motionKey: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <ReportStagger motionKey={motionKey} className={className}>
      {children}
    </ReportStagger>
  );
}
