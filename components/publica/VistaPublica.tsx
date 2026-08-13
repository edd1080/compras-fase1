"use client";

import { useState } from "react";
import { AmbientBackground } from "@/components/ui-ext/AmbientBackground";
import type { Cotizacion, ProsContras } from "@/lib/domain/types";
import { formato } from "@/lib/domain/comparativa";

type VistaPublicaProps = {
  cotizaciones: Cotizacion[];
  prosContras: Record<string, ProsContras>;
  recomendacion?: string;
  advertenciaGeneral?: string | null;
};

export function VistaPublica({ cotizaciones, prosContras, recomendacion, advertenciaGeneral }: VistaPublicaProps) {
  const [elegida, setElegida] = useState<string | null>(null);
  const [modal, setModal] = useState<string | null>(null);
  const [ningunaSirve, setNingunaSirve] = useState(false);

  return (
    <main className="min-h-screen flex items-start justify-center p-4 md:p-8 relative overflow-hidden">
      <AmbientBackground />
      <div className="w-full max-w-[900px] bg-white/70 backdrop-blur-3xl rounded-3xl md:rounded-[2.5rem] border border-white shadow-[0_8px_40px_rgb(0,0,0,0.06)] overflow-hidden relative z-10 p-8">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span className="bg-white/80 border border-slate-200 rounded-full px-2 py-1">Enlace público · sin iniciar sesión</span>
          </div>
          <h1 className="text-2xl font-medium tracking-tight mb-1">Comparativa lista</h1>
          <p className="text-xs text-slate-500">Los importes se muestran en su moneda original (sin conversión).</p>
        </div>

        {advertenciaGeneral ? (
          <div className="mb-5 bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-700"><path d="M12 9v4M12 17h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0z"/></svg>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider mb-1">Advertencia</div>
                <div className="text-xs font-medium text-amber-900 leading-relaxed">{advertenciaGeneral}</div>
              </div>
            </div>
          </div>
        ) : null}

        {recomendacion ? (
          <div className="mb-5 bg-gradient-to-br from-white to-sky-50/50 rounded-2xl border border-slate-200/60 p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-bl-full translate-x-4 -translate-y-4" />
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <span className="bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/></svg>
                Recomendación de Compras
              </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Humana</span>
            </div>
            <div className="text-sm text-slate-800 font-medium leading-relaxed relative z-10">{recomendacion}</div>
          </div>
        ) : null}

        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-medium text-slate-900">Opciones cotizadas</h2>
              <p className="text-[11px] text-slate-500">Los importes se muestran en su moneda original (sin conversión).</p>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Pendiente de decisión</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cotizaciones.map((c) => {
              const pc = prosContras[c.id];
              return (
                <div key={c.id} className={"rounded-2xl border bg-white p-5 shadow-sm transition-all " + (elegida === c.id ? "border-sky-300 ring-1 ring-sky-500/20" : "border-slate-200")}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Proveedor</div>
                      <div className="text-base font-medium text-slate-900">{c.proveedorNombre}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Total</div>
                      <div className="text-base font-semibold text-slate-900">{c.moneda ?? "L"} {formato(c.valorTotal)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 mb-4">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Pros</div>
                      <div className="text-[11px] text-slate-600">{(pc?.pros ?? []).join(" · ") || "no especificado"}</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Contras</div>
                      <div className="text-[11px] text-slate-600">{(pc?.contras ?? []).join(" · ") || "no especificado"}</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Plazo de entrega</div>
                      <div className="text-[11px] text-slate-700 font-medium">{c.plazoEntrega ?? "no especificado"}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={elegida !== null && elegida !== c.id}
                    onClick={() => setModal(c.proveedorNombre)}
                    className={"w-full text-xs px-6 py-3 rounded-full font-medium transition-all flex items-center justify-center gap-2 " + (elegida === c.id ? "bg-green-600 text-white" : "bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed")}
                  >
                    {elegida === c.id ? "✓ Opción elegida" : "Elegir esta opción"}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            disabled={elegida !== null || ningunaSirve}
            onClick={() => setNingunaSirve(true)}
            className="mt-4 w-full bg-white text-slate-700 text-xs px-6 py-3 rounded-full font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 border border-slate-200 shadow-sm"
          >
            {ningunaSirve ? "Se notificó a Compras — la solicitud vuelve a cotización" : "Ninguna me sirve, necesito hablar con Compras"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/></svg>
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      {modal ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-200 shadow-2xl w-full max-w-md relative z-10 p-6 md:p-8 step-enter">
            <div className="w-12 h-12 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sky-500"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/><circle cx="12" cy="12" r="10"/></svg>
            </div>
            <h3 className="text-xl font-medium tracking-tight text-slate-900 mb-2">Confirmar selección</h3>
            <p className="text-sm text-slate-500 mb-6">
              Estás por elegir <span className="font-semibold text-slate-900">{modal}</span>. Esta acción registrará tu decisión y notificará a Compras para avanzar.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setModal(null)} className="flex-1 bg-white text-slate-700 text-xs px-4 py-3 rounded-full font-medium border border-slate-200 hover:bg-slate-50 transition-all">Cancelar</button>
              <button
                type="button"
                onClick={() => {
                  setElegida(modal);
                  setModal(null);
                }}
                className="flex-1 bg-slate-900 text-white text-xs px-4 py-3 rounded-full font-medium hover:bg-slate-800 transition-all"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}