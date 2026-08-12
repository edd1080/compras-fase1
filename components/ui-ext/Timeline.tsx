import { cn } from "@/lib/design/cn";

export type TimelineItem = {
  label: string;
  activo: boolean;
  completado?: boolean;
};

type TimelineProps = {
  items: TimelineItem[];
  className?: string;
};

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("mt-5 flex gap-0", className)}>
      {items.map((it, i) => (
        <div key={it.label} className="relative flex-1 text-center">
          {i < items.length - 1 ? (
            <span
              className={cn(
                "absolute left-1/2 top-[9px] z-0 h-[2px] w-full",
                it.completado ? "bg-borde-fuerte" : "bg-borde"
              )}
            />
          ) : null}
          <span
            className={cn(
              "relative z-[1] mx-auto mb-2 block h-[18px] w-[18px] rounded-full border-2 bg-superficie",
              it.activo ? "border-brass bg-brass" : "border-borde-fuerte"
            )}
          />
          <span
            className={cn(
              "mx-auto block max-w-[90px] text-[11px]",
              it.activo ? "font-semibold text-ink" : "text-slate"
            )}
          >
            {it.label}
          </span>
        </div>
      ))}
    </div>
  );
}