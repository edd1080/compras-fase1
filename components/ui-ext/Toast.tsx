"use client";

import { cn } from "@/lib/design/cn";
import type { ToastState } from "@/hooks/useToast";

const tones: Record<NonNullable<ToastState>["tone"], string> = {
  info: "bg-azul-marino text-white",
  success: "bg-sage text-white",
  warning: "bg-brass text-white",
  error: "bg-clay text-white",
};

export function Toast({ toast }: { toast: ToastState }) {
  if (!toast) return null;
  return (
    <div
      role="status"
      className={cn(
        "fixed bottom-7 left-1/2 z-[60] -translate-x-1/2 rounded-[10px] px-5 py-3 text-[13.5px] shadow-pop animate-[toastIn_.3s_ease]",
        tones[toast.tone]
      )}
    >
      {toast.mensaje}
    </div>
  );
}