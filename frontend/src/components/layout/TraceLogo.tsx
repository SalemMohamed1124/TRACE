import { cn } from "@/lib/utils";

interface TraceLogoProps {
  className?: string;
  iconClassName?: string;
  showName?: boolean;
  nameClassName?: string;
  rotate?: number;
}

export function TraceIcon({ className, rotate = 0 }: { className?: string; rotate?: number }) {
  return (
    <svg
      viewBox="0 0 1000 1000"
      className={cn("size-6 shrink-0 text-primary", className)}
      transform={rotate ? `rotate(${rotate})` : undefined}
    >
      <g fill="none" stroke="currentColor" strokeWidth="80" strokeLinecap="round">
        {/* Outer Rim */}
        <circle cx="500" cy="500" r="400" />
        {/* Inner Ring */}
        <circle cx="500" cy="500" r="140" />
        {/* Center Dot */}
        <circle cx="500" cy="500" r="50" fill="currentColor" stroke="none" />
        {/* Gloss/Reflection Arcs */}
        <circle
          cx="500"
          cy="500"
          r="270"
          strokeDasharray="350 498.2"
          strokeDashoffset="150"
        />
      </g>
    </svg>
  );
}

export function TraceLogo({
  className,
  iconClassName,
  showName = true,
  nameClassName,
  rotate = 90,
}: TraceLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <TraceIcon className={iconClassName} rotate={rotate} />
      {showName && (
        <span
          className={cn(
            "font-bold text-[15px] tracking-tight text-foreground",
            nameClassName
          )}
        >
          TRACE
        </span>
      )}
    </div>
  );
}
