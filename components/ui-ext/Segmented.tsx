import { cn } from "@/lib/design/cn";

export type SegmentedOption<T extends string = string> = {
  value: T;
  label: string;
};

type SegmentedProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label="selección"
      className={cn(
        "inline-flex rounded-full border border-borde-fuerte bg-fondo p-[3px]",
        className
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "min-h-[0px] rounded-full px-5 py-2 text-[13.5px] font-medium transition-colors",
            value === opt.value
              ? "bg-azul-marino text-white"
              : "bg-transparent text-texto-secundario hover:text-azul-marino"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}