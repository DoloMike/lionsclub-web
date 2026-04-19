import type { HTMLAttributes } from "react";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

/** Block placeholder with warm shimmer (see `.skeleton` in globals.css). */
export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`.trim()}
      aria-hidden
      {...props}
    />
  );
}

type SkeletonTextProps = {
  lines?: number;
  className?: string;
  /** Extra classes applied to each line’s skeleton block. */
  lineClassName?: string;
};

/** Stacked text-line placeholders (width tapers on last line). */
export function SkeletonText({
  lines = 3,
  className = "",
  lineClassName = "h-3.5",
}: SkeletonTextProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`.trim()}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={`${lineClassName} rounded ${i === lines - 1 ? "w-4/5 max-w-[14rem]" : "w-full"}`.trim()}
        />
      ))}
    </div>
  );
}
