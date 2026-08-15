"use client";

import { useRef, useState } from "react";
import type { Cotizacion } from "@/lib/domain/types";
import { api } from "@/lib/api-client";

type CargaCotizacionesProps = {
  solicitudId: string;
  cotizaciones: Cotizacion[];
  onCotizacionCargada: () => void;
  onGenerar: () => void;
};

export function CargaCotizaciones({ solicitudId, cotizaciones, onCotizacionCargada, onGenerar }: CargaCotizacionesProps) {
  const [subiendo, setSubiendo] = useState<string | null>(null);
  const [fase, setFase] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [archivos, setArchivos] = useState<Record<string, string>>({});
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const count = cotizaciones.length;

  // Una cotización cuenta como cargada si ya trae valores extraídos o fue subida
  // en esta sesión (el backend persiste metadata, no el binario).
  function estaCargada(c: Cotizacion) {
    return c.valorNeto !== undefined || c.valorTotal !== undefined || archivos[c.id] !== undefined;
  }

  // Sube el archivo real → lo convierte a Markdown (markitdown) → persiste la
  // cotización con markdownExtraido para que el backend dispare la extracción IA.
  // Si la conversión o la IA fallan, se persiste igual con metadata (nunca bloquea).
  async function onFileSeleccionado(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const id = cotizaciones[idx]?.id ?? `${idx}`;
    setSubiendo(id);
    setError(null);
    try {
      setFase("Convirtiendo a texto…");
      const conv = await api.convertirDocumento(file);

      setFase("Extrayendo datos con IA…");
      await api.cargarCotizacion({
        solicitudId,
        proveedorNombre: cotizaciones[idx]?.proveedorNombre ?? `Proveedor ${idx + 1}`,
        formatoOriginal: extFormato(file.name),
        especificacionesOfertadas: {},
        markdownExtraido: conv.ok ? conv.markdown : undefined,
      });
      setArchivos((a) => ({ ...a, [id]: file.name }));
      onCotizacionCargada();
      if (!conv.ok) {
        setError(conv.error ?? "No se pudo extraer datos automáticamente.");
      }
    } catch {
      setError("No se pudo subir. Intenta de nuevo.");
    } finally {
      setSubiendo(null);
      setFase(null);
    }
    if (fileInputs.current[idx]) fileInputs.current[idx].value = "";
  }

  return (
    <div className="step-enter">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">07 · Carga cotizaciones</h3>
          <p className="text-[11px] text-slate-500 mt-1">Subí los archivos de cada proveedor (PDF, Word o imagen). Cada uno se convierte internamente a Markdown antes del análisis.</p>
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">RN: min 2 cotizaciones</div>
      </div>

      <div className="space-y-3">
        {cotizaciones.map((c, idx) => (
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
                  <span className={"font-semibold " + (estaCargada(c) ? "text-green-700" : "text-slate-700")}>
                    {estaCargada(c)
                      ? archivos[c.id]
                        ? `${archivos[c.id]} — cargado`
                        : "cotización cargada"
                      : "Sin archivo aún"}
                  </span>
                  {subiendo === c.id && fase ? (
                    <span className="ml-1 text-slate-400">{fase}</span>
                  ) : null}
                </div>
                {subiendo === c.id && error ? (
                  <div className="mt-1 text-[11px] text-amber-700 flex items-start gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-[1px] shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                    {error}
                  </div>
                ) : null}
              </div>
              <div>
                <label
                  htmlFor={`file-${c.id}`}
                  className={
                    "inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-3 py-2 rounded-full border shadow-sm transition-colors cursor-pointer " +
                    (subiendo === c.id
                      ? "text-slate-500 bg-slate-100 border-slate-200"
                      : estaCargada(c)
                        ? "text-green-700 bg-green-50/60 border-green-200"
                        : "text-slate-700 hover:text-slate-900 bg-white border-slate-200")
                  }
                >
                  {subiendo === c.id ? (
                    <>
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                      Subiendo…
                    </>
                  ) : estaCargada(c) ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
                      Cargado
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21.44 11.05a10 10 0 1 1-18.88 0A10 10 0 0 1 12 2a9.7 9.7 0 0 1 6.36 2.4M22 2l-2.5 4.5M16 6.5 22 2"/></svg>
                      Adjuntar archivo
                    </>
                  )}
                </label>
                <input
                  id={`file-${c.id}`}
                  type="file"
                  hidden
                  ref={(el) => { fileInputs.current[idx] = el; }}
                  onChange={(e) => onFileSeleccionado(idx, e)}
                  accept=".pdf,.doc,.docx,image/*"
                />
              </div>
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

function extFormato(nombre: string): "pdf" | "docx" | "imagen" {
  const ext = nombre.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (ext === "doc" || ext === "docx") return "docx";
  return "imagen";
}