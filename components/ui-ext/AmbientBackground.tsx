import { cn } from "@/lib/design/cn";

type AmbientBackgroundProps = {
  className?: string;
};

export function AmbientBackground({ className }: AmbientBackgroundProps) {
  return (
    <div aria-hidden className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)}>
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-r from-sky-200/40 to-emerald-100/40 mix-blend-multiply blur-[80px] animate-fluid-blob" />
      <div
        className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-r from-sky-500/10 to-emerald-200/20 mix-blend-multiply blur-[80px] animate-fluid-blob"
        style={{ animationDelay: "-4s" }}
      />
    </div>
  );
}