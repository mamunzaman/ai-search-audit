import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-secondary-fixed px-3 py-1 font-label-md text-label-md uppercase tracking-wider text-on-secondary-fixed",
        className,
      )}
    >
      {children}
    </span>
  );
}
