import { cn } from "@/lib/design/cn";

type BadgeTone = "neutral" | "blue" | "success" | "warning" | "gray";

type BadgeProps = {
  tone?: BadgeTone;
  label: string;
  className?: string;
};

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-azul-tenue text-texto-secundario",
  blue: "bg-azul-claro text-azul-marino",
  success: "bg-exito-fondo text-exito",
  warning: "bg-advertencia-fondo text-advertencia",
  gray: "bg-borde/50 text-texto-terciario",
};

export function Badge({ tone = "neutral", label, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-field px-2.5 py-1 text-[13px] font-medium",
        toneClasses[tone],
        className
      )}
    >
      {label}
    </span>
  );
}
