import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "ghost" | "outline";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-coral hover:bg-accent-coral-dark text-white font-bold coral-shadow active:scale-95",
  ghost:
    "text-primary font-semibold hover:bg-surface-container-low active:scale-95",
  outline:
    "border border-primary-blue text-primary-blue hover:bg-surface-container-low active:scale-95",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-lg px-6 py-2.5 transition-all",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
