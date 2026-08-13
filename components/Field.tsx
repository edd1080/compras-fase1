import { useId } from "react";
import { cn } from "@/lib/design/cn";

type FieldProps = {
  label?: string;
  required?: boolean;
  help?: string;
  error?: string;
  id?: string;
  className?: string;
  icon?: React.ReactNode;
  variant?: "requester" | "coordinator";
} & React.InputHTMLAttributes<HTMLInputElement>;

export function Field({
  label,
  required = false,
  help,
  error,
  id,
  className,
  icon,
  variant = "coordinator",
  ...inputProps
}: FieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const accent = variant === "coordinator" ? "focus:border-sky-500 focus:ring-sky-500" : "focus:border-brand-solicitante focus:ring-brand-solicitante";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label htmlFor={fieldId} className="text-xs font-medium text-slate-700">
          {label}
          {required ? <span className="text-rose-500"> *</span> : null}
        </label>
      ) : null}
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            {icon}
          </span>
        ) : null}
        <input
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={help || error ? `${fieldId}-hint` : undefined}
          className={cn(
            "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium transition-all placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1",
            icon && "pl-10",
            accent,
            className
          )}
          {...inputProps}
        />
      </div>
      {help ? (
        <p id={`${fieldId}-hint`} className="text-[11px] text-slate-500">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={`${fieldId}-hint`} className="text-[11px] text-rose-500 font-medium">
          {error}
        </p>
      ) : null}
    </div>
  );
}