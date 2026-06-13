import { cn } from "@/lib/cn";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "flex-grow border-none bg-transparent px-4 text-body-md focus:ring-0",
        className,
      )}
      {...props}
    />
  );
}
