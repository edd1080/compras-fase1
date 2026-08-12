"use client";

import { useEffect } from "react";
import { cn } from "@/lib/design/cn";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  eyebrow?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-5"
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full max-w-[480px] overflow-hidden rounded-card bg-white shadow-pop",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {eyebrow ? (
          <div className="bg-azul-marino px-6 py-5 text-white">
            <div className="font-display text-[15px] font-bold">{eyebrow}</div>
          </div>
        ) : null}
        <div className="px-6 py-6">
          {title ? <h3 className="mb-4 font-display text-[16px] font-semibold">{title}</h3> : null}
          {children}
        </div>
        {footer ?? (
          <button
            type="button"
            onClick={onClose}
            className="w-full border-t border-borde bg-fondo px-4 py-3.5 text-[13px] font-semibold text-texto-secundario hover:bg-borde"
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}