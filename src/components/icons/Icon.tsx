import { cn } from "@/lib/cn";
import { resolveIconDefinition } from "./iconPaths";

type IconProps = {
  name: string;
  className?: string;
  filled?: boolean;
  size?: number;
};

export function Icon({ name, className, filled, size = 24 }: IconProps) {
  const definition = resolveIconDefinition(name, filled);
  const useFill = Boolean(filled || definition.filled);
  const pixelSize = Math.round(size);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 24 24"
      className={cn("inline-block shrink-0", className)}
      aria-hidden="true"
      data-icon={name}
      fill={useFill ? "currentColor" : "none"}
      stroke={useFill ? "none" : "currentColor"}
      strokeWidth={useFill ? 0 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      {definition.paths.map((path, index) => (
        <path key={`${name}-${index}`} d={path} />
      ))}
    </svg>
  );
}
