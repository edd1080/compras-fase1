import { cn } from "@/lib/design/cn";

export type StepperStep = {
  numero: number;
  label?: string;
  estado: "done" | "current" | "pending" | "reachable";
  onNavigate?: () => void;
};

type StepperProps = {
  pasos: StepperStep[];
  className?: string;
};

export function Stepper({ pasos, className }: StepperProps) {
  return (
    <ol className={cn("flex w-full max-w-[520px] items-center gap-0", className)}>
      {pasos.map((p, i) => {
        const navegable = p.estado === "done" || p.estado === "reachable" || p.estado === "current";
        const dot = (
          <span
            aria-current={p.estado === "current" ? "step" : undefined}
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] font-mono text-[12px] font-medium transition-colors",
              p.estado === "done" && "border-azul-medio bg-azul-medio text-white",
              p.estado === "current" &&
                "border-azul-marino bg-azul-marino text-white shadow-[0_0_0_4px_var(--azul-claro)]",
              p.estado === "pending" &&
                "border-borde-fuerte bg-superficie text-texto-terciario",
              p.estado === "reachable" &&
                "border-borde-fuerte bg-superficie text-slate"
            )}
          >
            {p.numero}
          </span>
        );
        return (
          <li key={p.numero} className="flex flex-1 items-center">
            {navegable && p.onNavigate ? (
              <button
                type="button"
                onClick={p.onNavigate}
                aria-label={`Paso ${p.numero}${p.label ? `: ${p.label}` : ""}`}
                className="min-h-[0px] cursor-pointer bg-transparent p-0"
              >
                {dot}
              </button>
            ) : (
              dot
            )}
            {i < pasos.length - 1 ? (
              <span
                className={cn(
                  "mx-1 h-[2px] flex-1",
                  p.estado === "done" ? "bg-azul-medio" : "bg-borde-fuerte"
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}