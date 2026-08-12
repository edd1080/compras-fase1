import { cn } from "@/lib/design/cn";

type MetricCardProps = {
  label: string;
  value: string;
  note?: string;
  hero?: boolean;
  valueClassName?: string;
  className?: string;
};

export function MetricCard({ label, value, note, hero, valueClassName, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-card border bg-superficie px-5 py-5 shadow-card",
        hero && "border-azul-marino bg-azul-marino",
        className
      )}
    >
      <div
        className={cn(
          "text-[11.5px] font-semibold uppercase tracking-[0.06em]",
          hero ? "text-[#9FB3E0]" : "text-slate"
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          "mt-2.5 font-display text-[32px] font-semibold",
          hero ? "text-brass" : "text-ink",
          valueClassName
        )}
      >
        {value}
      </div>
      {note ? (
        <div className={cn("mt-1.5 text-[12px]", hero ? "text-[#C9D3F0]" : "text-texto-terciario")}>
          {note}
        </div>
      ) : null}
    </div>
  );
}