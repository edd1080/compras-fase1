import { cn } from "@/lib/design/cn";

type SkeletonProps = {
  className?: string;
  style?: React.CSSProperties;
};

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      aria-hidden
      style={style}
      className={cn(
        "animate-[skeletonPulse_1.4s_ease-in-out_infinite] rounded-field bg-borde/60",
        className
      )}
    />
  );
}

export function SkeletonLines({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4" style={{ width: `${100 - i * 18}%` }} />
      ))}
    </div>
  );
}