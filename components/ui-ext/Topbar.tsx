import Link from "next/link";
import { cn } from "@/lib/design/cn";

export type TopbarMeta = {
  eyebrow: string;
  title: string;
  sub?: string;
};

type TopbarProps = {
  meta: TopbarMeta;
  brandHref?: string;
  brandLabel?: string;
  acciones?: React.ReactNode;
  className?: string;
};

export function Topbar({ meta, brandHref = "/", brandLabel = "← Portal", acciones, className }: TopbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-5 border-b border-borde bg-fondo px-8 pb-5 pt-7",
        className
      )}
    >
      <div className="flex items-start justify-between gap-5">
        <div className="flex items-start gap-3.5">
          <Link
            href={brandHref}
            className="mt-0.5 shrink-0 rounded-full border border-borde-fuerte bg-superficie px-3 py-2 font-mono text-[12px] text-texto-secundario transition-colors hover:border-azul-medio hover:text-azul-marino"
          >
            {brandLabel}
          </Link>
          <div>
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-azul-claro px-2.5 py-1 font-mono text-[11.5px] text-azul-medio">
              {meta.eyebrow}
            </span>
            <h1 className="font-display text-[24px] font-semibold">{meta.title}</h1>
            {meta.sub ? (
              <p className="mt-1.5 max-w-[600px] text-[13.5px] text-slate">{meta.sub}</p>
            ) : null}
          </div>
        </div>
        {acciones ? <div className="shrink-0">{acciones}</div> : null}
      </div>
    </header>
  );
}