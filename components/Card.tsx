import { cn } from "@/lib/design/cn";

type CardProps = {
  className?: string;
  glass?: boolean;
  interactive?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, glass = true, interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border shadow-sm",
        glass
          ? "bg-white/70 backdrop-blur-3xl border-white"
          : "bg-white border-slate-200/60",
        interactive &&
          "transition-all hover:shadow-md cursor-pointer hover:border-slate-300",
        className
      )}
      {...props}
    />
  );
}