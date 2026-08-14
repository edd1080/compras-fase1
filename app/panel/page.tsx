"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AmbientBackground } from "@/components/ui-ext/AmbientBackground";
import { Badge, type BadgeTone } from "@/components/Badge";
import { useSesion } from "@/lib/sesion-context";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { api } from "@/lib/api-client";
import type { Solicitud } from "@/lib/domain/types";

type Filtro = "todos" | "activa" | "esperando_cot" | "esperando_dec" | "cerrada";

const ESTADO_FILTRO: Record<string, Filtro> = {
  ENVIADA_A_COMPRAS: "activa",
  EN_COTIZACION: "esperando_cot",
  COMPARATIVA_LISTA: "esperando_cot",
  ENVIADA_A_SOLICITANTE: "esperando_dec",
  CERRADA_CON_DECISION: "cerrada",
  CERRADA_SIN_DECISION: "cerrada",
  CANCELADA: "cerrada",
};

export default function PanelPage() {
  const sesion = useSesion();
  const router = useRouter();
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);

  async function salir() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  useEffect(() => {
    if (!sesion?.localId) return;
    api
      .listarSolicitudes(sesion.localId)
      .then((d) => setSolicitudes(d))
      .catch(() => setSolicitudes([]))
      .finally(() => setCargando(false));
  }, [sesion?.localId]);

  const contadores = useMemo(() => {
    const activa = solicitudes.filter((s) => ["ENVIADA_A_COMPRAS"].includes(s.estado)).length;
    const cot = solicitudes.filter((s) => ["EN_COTIZACION", "COMPARATIVA_LISTA"].includes(s.estado)).length;
    const dec = solicitudes.filter((s) => s.estado === "ENVIADA_A_SOLICITANTE").length;
    const cerrada = solicitudes.filter((s) => ["CERRADA_CON_DECISION", "CERRADA_SIN_DECISION", "CANCELADA"].includes(s.estado)).length;
    return { activa, cot, dec, cerrada };
  }, [solicitudes]);

  const visibles = solicitudes.filter((s) => {
    if (filtro !== "todos" && ESTADO_FILTRO[s.estado] !== filtro) return false;
    if (busqueda.trim() === "") return true;
    const q = busqueda.toLowerCase();
    return [s.numeroReferencia, s.solicitanteNombre, s.titulo, s.categoria].some((v) => (v ?? "").toLowerCase().includes(q));
  });

  const contadoresUI = [
    { key: "activa", label: "Activas", valor: contadores.activa, sub: "hoy", tone: "cerrada" as BadgeTone },
    { key: "esperando_cot", label: "Esperando cotizaciones", valor: contadores.cot, sub: "pend.", tone: "cotizaciones" as BadgeTone },
    { key: "esperando_dec", label: "Esperando decisión", valor: contadores.dec, sub: "solic.", tone: "decision" as BadgeTone },
    { key: "cerrada", label: "Cerradas", valor: contadores.cerrada, sub: "mes", tone: "cerrada" as BadgeTone },
  ];

  return (
    <main className="min-h-screen flex items-start justify-center p-4 md:p-8 relative overflow-hidden">
      <AmbientBackground />
      <div className="w-full max-w-[1180px] bg-white/70 backdrop-blur-3xl rounded-3xl md:rounded-[2.5rem] border border-white shadow-[0_8px_40px_rgb(0,0,0,0.06)] flex flex-col min-h-[640px] md:min-h-[720px] overflow-hidden relative z-10">
        {/* Header */}
        <header className="shrink-0 relative overflow-hidden border-b border-white/60">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-100/80 via-white/50 to-emerald-100/50" />
          <div className="relative px-6 md:px-8 pt-5 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-slate-900 flex items-center justify-center shadow-sm">
                  <span className="text-white text-[12px] font-semibold tracking-tight">BIA</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg md:text-xl font-semibold tracking-tight text-slate-900">Panel de Compras</h1>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-white/70 border border-white text-slate-600">
                      Coordinador
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Flujo del coordinador: de bandeja a envío de comparativa.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/60 border border-white shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-700"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
                  </div>
                    <div className="leading-tight">
                      <div className="text-[11px] font-semibold text-slate-800">{sesion?.nombre ?? "Coordinador"}</div>
                      <div className="text-[10px] text-slate-500">Equipo de Compras</div>
                    </div>
                  </div>
                  <button onClick={salir} className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 hover:text-sky-600 transition-colors flex items-center gap-1.5 bg-white/70 px-3 py-2 rounded-2xl border border-white shadow-sm">
                    Salir
                  </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar px-6 md:px-8 py-8">
          {/* Contadores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {contadoresUI.map((c) => (
              <button key={c.key} type="button" onClick={() => setFiltro(c.key as Filtro)} className={"text-left bg-white rounded-2xl border p-4 shadow-sm hover:shadow transition-all " + (filtro === c.key ? "border-sky-300 ring-1 ring-sky-500/20" : "border-slate-200/60")}>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{c.label}</div>
                <div className="mt-1 flex items-end justify-between">
                  <div className="text-2xl font-semibold tracking-tight text-slate-900">{c.valor}</div>
                  <div className="text-[11px] text-slate-500">{c.sub}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Filtros + búsqueda */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <div className="inline-flex items-center gap-1.5 bg-white/60 border border-white shadow-sm rounded-2xl p-1.5">
              {([["todos", "Todos"], ["activa", "Activas"], ["esperando_cot", "Esperando cotizaciones"], ["esperando_dec", "Esperando decisión"], ["cerrada", "Cerradas"]] as [Filtro, string][]).map(([k, label]) => (
                <button key={k} type="button" onClick={() => setFiltro(k)} className={"px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-colors " + (filtro === k ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-white/70")}>
                  {label}
                </button>
              ))}
            </div>
            <div className="ml-auto relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
              <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por ref, título o solicitante..." className="w-[280px] max-w-[60vw] bg-white/70 border border-white rounded-2xl pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all" />
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-700">Solicitudes</div>
              <div className="text-[11px] text-slate-500">{cargando ? "Cargando…" : "Listo"}</div>
            </div>

            {cargando ? (
              <div className="px-5 py-10">
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8">
                    <div className="absolute inset-0 rounded-full border-2 border-slate-100" />
                    <div className="absolute inset-0 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">Cargando bandeja…</div>
                    <div className="text-[11px] text-slate-500">Sincronizando asignaciones por categoría.</div>
                  </div>
                </div>
              </div>
            ) : visibles.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
                </div>
                <div className="text-sm font-medium text-slate-900">No tenés solicitudes asignadas</div>
                <div className="text-[11px] text-slate-500 mt-1">Cuando te asignen una categoría, aparecerán acá.</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-50/70">
                    <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3 font-semibold">Referencia</th>
                      <th className="px-5 py-3 font-semibold">Solicitante</th>
                      <th className="px-5 py-3 font-semibold">Necesidad</th>
                      <th className="px-5 py-3 font-semibold">Categoría</th>
                      <th className="px-5 py-3 font-semibold">Estado</th>
                      <th className="px-5 py-3 font-semibold text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibles.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-slate-900">{s.numeroReferencia ?? "—"}</span>
                            {s.estado === "ENVIADA_A_COMPRAS" ? <Badge tone="nueva" label="Nueva" /> : null}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-xs font-medium text-slate-900">{s.solicitanteNombre} <span className="text-[11px] text-slate-500 font-normal">· {s.tipo ?? "—"}</span></div>
                          <div className="text-[11px] text-slate-500">{s.areaSolicitante ?? "—"}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-xs font-medium text-slate-900">{s.titulo}</div>
                          <div className="text-[11px] text-slate-500">Entrega requerida: {s.fechaRequerida ?? "—"}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">{s.categoria ?? "—"}</span>
                        </td>
                        <td className="px-5 py-4">
                          <Badge tone={toneDe(s.estado)} label={estadoLegible(s.estado)} />
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/panel/solicitud/${s.id}`}
                            className="inline-flex items-center gap-2 bg-white text-slate-700 text-[11px] px-4 py-2 rounded-full font-medium hover:bg-slate-50 transition-all border border-slate-200"
                          >
                            Abrir
                            <svg className="text-sm" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function estadoLegible(e: string): string {
  const m: Record<string, string> = {
    ENVIADA_A_COMPRAS: "Activa",
    EN_COTIZACION: "Esperando cotizaciones",
    COMPARATIVA_LISTA: "Esperando cotizaciones",
    ENVIADA_A_SOLICITANTE: "Esperando decisión",
    CERRADA_CON_DECISION: "Cerrada",
    CERRADA_SIN_DECISION: "Cerrada",
    CANCELADA: "Cancelada",
  };
  return m[e] ?? e;
}

function toneDe(e: string): BadgeTone {
  if (e === "EN_COTIZACION" || e === "COMPARATIVA_LISTA") return "cotizaciones";
  if (e === "ENVIADA_A_SOLICITANTE") return "decision";
  if (e === "CERRADA_CON_DECISION") return "cerrada";
  if (e === "CERRADA_SIN_DECISION" || e === "CANCELADA") return "error";
  return "activa";
}