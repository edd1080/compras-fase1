import { cn } from "@/lib/design/cn";

type ButtonVariant = "primary" | "brand" | "orange" | "secondary" | "ghost" | "danger" | "disabled";

type ButtonProps = {
  variant?: ButtonVariant;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-slate-900 text-white hover:bg-slate-800 focus-visible:outline-slate-900 shadow-sm",
  brand:
    "bg-sky-500 text-white hover:bg-sky-600 focus-visible:outline-sky-500 shadow-lg shadow-sky-500/20",
  orange:
    "bg-brand-solicitante text-white hover:bg-brand-solicitante-dark focus-visible:outline-brand-solicitante shadow-lg shadow-brand-solicitante/20",
  secondary:
    "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus-visible:outline-sky-500",
  ghost:
    "text-[11px] font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-white/70 border border-white rounded-2xl shadow-sm focus-visible:outline-slate-400",
  danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-600/20",
  disabled: "cursor-not-allowed bg-slate-900 text-white opacity-40",
};

export function Button({
  variant = "primary",
  className,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const resolvedVariant: ButtonVariant = disabled ? "disabled" : variant;
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex min-h-[44px] items-center justify-center rounded-full px-6 text-xs font-medium transition-all active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        variantClasses[resolvedVariant],
        className
      )}
      {...props}
    />
  );
}