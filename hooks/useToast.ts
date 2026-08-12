"use client";

import { useCallback, useRef, useState } from "react";

export type ToastTone = "info" | "success" | "warning" | "error";

export type ToastState = { id: number; mensaje: string; tone: ToastTone } | null;

export function useToast(durationMs = 2600) {
  const [toast, setToast] = useState<ToastState>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (mensaje: string, tone: ToastTone = "info") => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ id: Date.now(), mensaje, tone });
      timer.current = setTimeout(() => setToast(null), durationMs);
    },
    [durationMs]
  );

  return { toast, showToast };
}
