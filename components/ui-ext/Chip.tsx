import { cn } from "@/lib/design/cn";

export type ChipOption<T extends string = string> = {
  value: T;
  label: string;
  detail?: string;
};

type ChipGroupProps<T extends string> = {
  options: ChipOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  className?: string;
};

export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  className,
}: ChipGroupProps<T>) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              "min-w-[150px] flex-1 rounded-[10px] border-[1.5px] bg-superficie px-3.5 py-3 text-left text-[13.5px] transition-colors",
              selected
                ? "border-azul-medio bg-azul-claro font-semibold text-azul-marino"
                : "border-borde-fuerte text-texto-secundario hover:border-azul-medio"
            )}
          >
            <span className="block">{opt.label}</span>
            {opt.detail ? (
              <span
                className={cn(
                  "mt-0.5 block text-[11.5px] font-normal",
                  selected ? "text-azul-medio" : "text-texto-terciario"
                )}
              >
                {opt.detail}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}