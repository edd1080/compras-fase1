import { cn } from "@/lib/design/cn";

type CardProps = {
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-borde bg-superficie shadow-sm",
        className
      )}
      {...props}
    />
  );
}
