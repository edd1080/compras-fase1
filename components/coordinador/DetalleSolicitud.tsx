"use client";

import { useState } from "react";
import Link from "next/link";
import { CargaCotizaciones } from "./CargaCotizaciones";
import { ComparativaView } from "./Comparativa";
import { Recomendacion } from "./Recomendacion";
import { cotizacionesFixture, comparativaFixture } from "@/lib/fixtures";
import type { Solicitud } from "@/lib/domain/types";

type Etapa = 7 | 8 | 9;

export function DetalleSolicitud({ solicitud }: { solicitud: Solicitud }) {
  const [etapa, setEtapa] = useState<Etapa>(7);
  const [enviada, setEnviada] = useState(false);
  const cotizaciones = cotizacionesFixture[solicitud.id] ?? [];
  const comparativa = comparativaFixture(solicitud.id);

  const tabs: { n: Etapa; label: string }[] = [
    { n: 7, label: "07 · Cotizaciones" },
    { n: 8, label: "08 · Comparativa" },
    { n: 9, label: "09 · Recomendación" },
  ];

  return (
    <div className="pt-2">
      <Link href="/panel" className="mb-5 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-colors">
        Volver
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
      </Link>

      {enviada ? (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600 mt-0.5 shrink-0"><path d="M4 12l5 5L20 6"/></svg>
            <div>
              <div className="text-sm font-semibold">ENVIADA_A_SOLICITANTE · Comparativa enviada</div>
              <div className="text-xs mt-1">La solicitud queda en espera de la decisión del solicitante. El ciclo del coordinador termina aquí.</div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label="Etapas">
                {tabs.map((t) => (
                  <button
                    key={t.n}
                    type="button"
                    aria-pressed={etapa === t.n}
                    disabled={!comparativa && t.n === 8}
                    onClick={() => setEtapa(t.n)}
                    className={
                      "px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-colors " +
                      (etapa === t.n ? "bg-slate-900 text-white shadow-sm" : "text-slate-700 hover:bg-white/70")
                    }
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {enviada ? null : etapa === 7 ? (
                <CargaCotizaciones cotizaciones={cotizaciones} onPosibleGenerar={() => undefined} onGenerar={() => setEtapa(8)} />
              ) : etapa === 8 ? (
                comparativa ? (
                  <ComparativaView comparativa={comparativa} cotizaciones={cotizaciones} onContinuar={() => setEtapa(9)} />
                ) : (
                  <p className="text-[11px] text-slate-500">Aún no hay cotizaciones cargadas para esta solicitud.</p>
                )
              ) : (
                <Recomendacion cotizaciones={cotizaciones} prosContras={comparativa?.prosContras ?? {}} sugerenciaIA={comparativa?.sugerenciaIA} cotizacionSugeridaId={comparativa?.cotizacionSugeridaId} onEnviar={() => setEnviada(true)} />
              )}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-4 flex items-center gap-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-700"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">{solicitud.solicitanteNombre}</div>
                <div className="text-[11px] text-slate-500">{solicitud.areaSolicitante ?? "—"}</div>
              </div>
            </div>
            <div className="p-4 bg-slate-50/50">
              <div className="text-[11px] text-slate-600 leading-relaxed">{solicitud.descripcion || "Sin descripción."}</div>
              <div className="mt-3 flex items-center gap-2 text-slate-500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sm"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
                <span className="text-[11px] font-medium text-slate-700">{solicitud.solicitanteEmail}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4">
            <div className="text-xs font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5"/></svg>
              Detalles de la solicitud
            </div>
            <div className="space-y-3 text-[11px]">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Tipo</span>
                <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{solicitud.tipo ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Subtipo</span>
                <span className="font-semibold text-slate-900 text-right">{solicitud.subtipo ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Fecha requerida</span>
                <span className="font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">{solicitud.fechaRequerida ?? "—"}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}