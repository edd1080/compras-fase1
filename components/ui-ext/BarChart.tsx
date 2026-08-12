import { cn } from "@/lib/design/cn";

export type BarData = {
  label: string;
  value: number;
  color?: string;
};

type BarChartProps = {
  data: BarData[];
  className?: string;
};

export function BarChart({ data, className }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3 text-[12.5px]">
          <span className="w-[110px] shrink-0 text-texto-secundario">{d.label}</span>
          <div className="h-[9px] flex-1 overflow-hidden rounded-[6px] bg-fondo">
            <div
              className="h-full rounded-[6px] bg-azul-medio"
              style={{ width: `${(d.value / max) * 100}%`, background: d.color }}
            />
          </div>
          <span className="w-[34px] text-right font-mono text-texto-secundario">{d.value}</span>
        </div>
      ))}
    </div>
  );
}