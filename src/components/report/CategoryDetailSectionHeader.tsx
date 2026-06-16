import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { reportStyles } from "./reportStyles";

type CategoryDetailSectionHeaderProps = {
  title: string;
  children?: ReactNode;
  className?: string;
};

export function CategoryDetailSectionHeader({
  title,
  children,
  className,
}: CategoryDetailSectionHeaderProps) {
  return (
    <div className={cn(reportStyles.tableSectionHeader, className)}>
      <h3 className={reportStyles.sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}
