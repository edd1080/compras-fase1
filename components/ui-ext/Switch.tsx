import { cn } from "@/lib/design/cn";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  hint?: string;
  className?: string;
};

export function Switch({ checked, onChange, label, hint, className }: SwitchProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-field border-[1.5px] border-borde-fuerte bg-fondo px-4 py-3.5",
        className
      )}
    >
      {label ? (
        <div>
          <div className="text-[13.5px] font-semibold text-ink">{label}</div>
          {hint ? <div className="mt-0.5 text-[12px] text-slate">{hint}</div> : null}
        </div>
      ) : null}
      <label className="relative inline-block h-6 w-[42px] shrink-0">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span
          className={cn(
            "absolute inset-0 cursor-pointer rounded-full transition-colors",
            checked ? "bg-azul-medio" : "bg-borde-fuerte"
          )}
        >
          <span
            className={cn(
              "absolute left-[3px] top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-transform",
              checked && "translate-x-[18px]"
            )}
          />
        </span>
      </label>
    </div>
  );
}