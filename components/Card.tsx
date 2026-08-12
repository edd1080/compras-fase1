import { cn } from "@/lib/design/cn";

type CardProps = {
  className?: string;
  interactive?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-borde bg-superficie shadow-card",
        interactive &&
          "transition-[border-color,box-shadow,transform] duration-150 ease-out hover:-translate-y-0.5 hover:border-azul-soft2 hover:shadow-pop",
        className
      )}
      {...props}
    />
  );
}