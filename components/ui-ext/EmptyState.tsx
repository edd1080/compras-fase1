import { cn } from "@/lib/design/cn";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-dashed border-borde-fuerte bg-superficie px-6 py-14 text-center",
        className
      )}
    >
      <p className="font-display text-[16px] font-semibold text-ink">{title}</p>
      {description ? (
        <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-slate">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}