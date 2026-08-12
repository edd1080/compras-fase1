import { cn } from "@/lib/design/cn";

type ShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function Shell({ children, className }: ShellProps) {
  return (
    <div className={cn("mx-auto max-w-[1160px] px-8 pb-[70px]", className)}>
      {children}
    </div>
  );
}