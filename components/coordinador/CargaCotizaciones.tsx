"use client";

import { useState } from "react";
import type { Cotizacion } from "@/lib/domain/types";

type CargaCotizacionesProps = {
  cotizaciones: Cotizacion[];
  onPosibleGenerar: (n: number) => void;
  onGenerar: () => void;
};

export function CargaCotizaciones({ cotizaciones, onPosibleGenerar, onGenerar }: CargaCotizacionesProps) {
  const [cargadas, setCargadas] = useState<string[]>([]);
  const tiene = (id: string) => cargadas.includes(id);
  const count = cargadas.length;

  function cargar(id: string) {
    setCargadas((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      onPosibleGenerar(next.length);
      return next;
    });
  }

  return (
    <div className="step-enter">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">07 · Carga cotizaciones</h3>
          <p className="text-[11px] text-slate-500 mt-1">Acepta PDF, Word o imagen. Cada archivo se convierte internamente a Markdown antes del análisis.</p>
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">RN: min 2 cotizaciones</div>
      </div>

      <div className="space-y-3">
        {cotizaciones.map((c) => (
          <div key={c.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{c.formatoOriginal.toUpperCase()}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">·</span>
                  <span className="text-xs font-semibold text-slate-900">{c.proveedorNombre}</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-600">
                  Estado:{" "}
                  <span className={"font-semibold " + (tiene(c.id) ? "text-green-700" : "text-slate-700")}>
                    {tiene(c.id) ? "convertido a Markdown ✓" : "Sin archivo aún"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => cargar(c.id)}
                className={
                  "text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 px-3 py-2 rounded-full border shadow-sm transition-colors " +
                  (tiene(c.id)
                    ? "text-green-700 bg-green-50/60 border-green-200"
                    : "text-slate-700 hover:text-slate-900 bg-white border-slate-200")
                }
              >
                {tiene(c.id) ? "Cargado" : "Adjuntar"}
                {tiene(c.id) ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21.44 11.05a10 10 0 1 1-18.88 0A10 10 0 0 1 12 2a9.7 9.7 0 0 1 6.36 2.4M22 2l-2.5 4.5M16 6.5 22 2"/></svg>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 bg-white rounded-2xl border border-slate-200/60 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-900">Generar comparativa</div>
            {count < 2 ? (
              <div className="text-[11px] text-amber-700 mt-1 flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-[1px]"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                Se necesitan al menos 2 cotizaciones para generar una comparativa.
              </div>
            ) : null}
          </div>
          <button
            type="button"
            disabled={count < 2}
            onClick={onGenerar}
            className="bg-slate-900 text-white text-xs px-6 py-3 rounded-full font-medium hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            Generar comparativa
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}