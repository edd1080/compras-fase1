import { cn } from "@/lib/design/cn";

type AvatarProps = {
  nombre: string;
  className?: string;
};

export function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({ nombre, className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-azul-marino font-display text-[14px] font-semibold text-white",
        className
      )}
    >
      {iniciales(nombre)}
    </span>
  );
}