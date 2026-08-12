import { cn } from "@/lib/design/cn";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive" | "ghost" | "disabled";

type ButtonProps = {
  variant?: ButtonVariant;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-azul-marino text-white shadow-[0_1px_2px_rgba(27,33,48,0.2)] hover:bg-azul-medio hover:shadow-[0_2px_6px_rgba(46,95,201,0.3)] focus-visible:outline-azul-medio",
  secondary:
    "border border-azul-marino bg-transparent text-azul-marino hover:bg-azul-claro focus-visible:outline-azul-medio",
  tertiary: "bg-transparent text-azul-medio hover:underline focus-visible:outline-azul-medio",
  destructive:
    "border border-error bg-transparent text-error hover:bg-error-fondo focus-visible:outline-error",
  ghost:
    "border-[1.5px] border-borde-fuerte bg-transparent text-texto-secundario hover:border-azul-medio hover:text-azul-marino focus-visible:outline-azul-medio",
  disabled: "cursor-not-allowed border border-borde bg-borde text-texto-terciario",
};

export function Button({
  variant = "primary",
  className,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const resolvedVariant: ButtonVariant = disabled ? "disabled" : variant;
  const base =
    "inline-flex min-h-[44px] items-center justify-center rounded-field px-6 text-[15px] font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 active:scale-[0.98]";
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(base, variantClasses[resolvedVariant], className)}
      {...props}
    />
  );
}
