import { cn } from "@/lib/design/cn";

type AlertVariant = "info" | "success" | "warning" | "error";

type AlertProps = {
  variant?: AlertVariant;
  title?: string;
  className?: string;
  children: React.ReactNode;
};

const variantClasses: Record<AlertVariant, string> = {
  info: "border-info bg-info-fondo text-texto-principal",
  success: "border-exito bg-exito-fondo text-texto-principal",
  warning: "border-advertencia bg-advertencia-fondo text-texto-principal",
  error: "border-error bg-error-fondo text-texto-principal",
};

export function Alert({ variant = "info", title, className, children }: AlertProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "rounded-field border-l-4 p-4 text-[15px] leading-relaxed",
        variantClasses[variant],
        className
      )}
    >
      {title ? <p className="font-display text-[16px] font-medium">{title}</p> : null}
      <div>{children}</div>
    </div>
  );
}
