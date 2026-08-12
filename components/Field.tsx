import { useId } from "react";
import { cn } from "@/lib/design/cn";

type FieldProps = {
  label: string;
  required?: boolean;
  help?: string;
  error?: string;
  id?: string;
  className?: string;
  children: React.ReactNode;
};

export function Field({
  label,
  required = false,
  help,
  error,
  id,
  className,
  children,
}: FieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const helpId = help ? `${fieldId}-help` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label
        htmlFor={fieldId}
        className="font-sans text-[14px] font-medium leading-snug text-texto-principal"
      >
        {label}
        {required ? <span className="text-error"> *</span> : null}
      </label>
      {children && <div className="flex flex-col">{children}</div>}
      {help && (
        <p id={helpId} className="text-[13px] leading-relaxed text-texto-secundario">
          {help}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-[13px] leading-relaxed text-error">
          {error}
        </p>
      )}
    </div>
  );
}
