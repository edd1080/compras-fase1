"use client";

import { useEffect, useState } from "react";
import { AmbientBackground } from "@/components/ui-ext/AmbientBackground";
import { Badge, type BadgeTone } from "@/components/Badge";
import { api } from "@/lib/api-client";
import type { MetricasDashboard } from "@/lib/domain/metrics";
import { usuariosFixture, solicitudesFixture } from "@/lib/fixtures";

type Rango = "all" | "hoy" | "semana" | "mes";

const METRICAS_VACIAS: MetricasDashboard = {
  tasaConversion: null,
  tiempoCicloPromedioDias: null,
  solicitudesActivas: 0,
  solicitudesSinDecision: 0,
  volumenPorCoordinador: {},
  distribucionPorTipo: {},
};

export default function AdminDashboardPage() {
  const [rango, setRango] = useState<Rango>("all");
  const [coordinador, setCoordinador] = useState("all");
  const [busqueda, setBusqueda] = useState("");
  const [metricas, setMetricas] = useState<MetricasDashboard>(METRICAS_VACIAS);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api
      .metricas()
      .then((m) => setMetricas(m))
      .catch(() => setMetricas(METRICAS_VACIAS))
      .finally(() => setCargando(false));
  }, [rango, coordinador]);

  const nombreCoord = (id: string) => usuariosFixture.find((u) => u.id === id)?.nombre.split(" ")[0] ?? id;

  const barrasVolumen = Object.entries(metricas.volumenPorCoordinador).map(([id, v]) => ({ label: nombreCoord(id), value: v }));
  const maxVolumen = Math.max(1, ...barrasVolumen.map((b) => b.value));

  const distribucion = Object.entries(metricas.distribucionPorTipo);
  const distribucionTotal = Math.max(1, distribucion.reduce((a, [, v]) => a + v, 0));

  const procesos = solicitudesFixture.filter((s) => {
    if (coordinador !== "all" && s.coordinadorId !== coordinador) return false;
    if (busqueda.trim() === "") return true;
    const q = busqueda.toLowerCase();
    return [s.numeroReferencia, s.solicitanteNombre, s.titulo].some((v) => (v ?? "").toLowerCase().includes(q));
  });

  return (
    <main className="min-h-screen flex p-0 relative overflow-hidden">
      <AmbientBackground />

      {/* Sidebar navegación (persistente) */}
      <aside className="hidden md:flex shrink-0 w-64 border-r border-white/60 bg-white/40 relative z-20 flex-col py-8 px-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-sky-600 flex items-center justify-center shadow-sm shadow-sky-600/20">
            <span className="text-white text-[13px] font-semibold tracking-tight">BIA</span>
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight text-slate-900">Admin Panel</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Trazabilidad</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1.5">
          <NavItem active icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 20V10M10 20V4M16 20v-6M22 20H2"/></svg>} label="Dashboard" />
          <NavItem icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5"/></svg>} label="Procesos" />
          <NavItem icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>} label="Coordinadores" />
          <NavItem icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>} label="Configuración" />
        </nav>
        <div className="mt-auto pt-6 border-t border-white/60">
          <div className="flex items-center gap-3 hover:bg-white/50 p-2 -ml-2 rounded-xl transition-colors">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-slate-900">Lady (Admin)</div>
              <div className="text-[10px] text-slate-500">Administración</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Contenido */}
      <section className="flex-1 p-0 relative overflow-hidden bg-white/30 flex flex-col min-h-screen">
        <header className="shrink-0 relative overflow-hidden border-b border-white/60">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-100/80 via-white/50 to-emerald-100/50" />
          <div className="relative px-6 md:px-8 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">Panel de Trazabilidad</h1>
              <p className="text-xs text-slate-500 mt-1">Control y métricas del ciclo de compras, rendimiento y estado de procesos.</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-700"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
              </div>
              <span className="text-xs font-semibold text-slate-800">Lady Matute</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar px-6 md:px-8 py-8">
          {cargando ? (
            <div className="text-xs text-slate-500">Calculando métricas…</div>
          ) : (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Conversión (Aceptación)" value="84%" trend="+2.1%" tone="emerald" />
                <StatCard label="Tiempo Promedio" value="4.2" unit="días" trend="−0.3d" tone="slate" />
                <StatCard label="Procesos Activos" value="38" sub="en curso" tone="sky" />
                <StatCard label="Sin decisión > 5 días" value="7" sub="alertas" tone="rose" danger />
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm h-64 flex flex-col">
                  <div className="text-xs font-semibold text-slate-700 mb-4">Volumen por Coordinador</div>
                  <div className="flex-1 flex items-end gap-6 px-4 pb-2">
                    {barrasVolumen.length ? barrasVolumen.map((b, i) => (
                      <div key={b.label} className="flex-1 bg-slate-50 rounded-t-lg relative flex items-end justify-center h-full">
                        <div
                          className={"w-full rounded-t-lg transition-all " + (i % 2 === 1 ? "bg-sky-400 shadow-[0_-2px_10px_rgba(56,189,248,0.2)]" : "bg-sky-200")}
                          style={{ height: `${(b.value / maxVolumen) * 100}%` }}
                        />
                        <span className="absolute -bottom-6 text-[10px] text-slate-500 whitespace-nowrap">{b.label}</span>
                      </div>
                    )) : <p className="text-[11px] text-slate-400 self-center">Sin datos</p>}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm h-64 flex flex-col">
                  <div className="text-xs font-semibold text-slate-700 mb-4">Distribución por Tipo</div>
                  <div className="flex-1 flex flex-col justify-center gap-4">
                    {distribucion.length ? distribucion.map(([tipo, v]) => (
                      <div key={tipo}>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span>{tipo}</span>
                          <span className="font-semibold text-slate-900">{Math.round((v / distribucionTotal) * 100)}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100">
                          <div className={"h-2 rounded-full " + (tipo === "RFQ" ? "bg-emerald-400" : tipo === "RFI" ? "bg-sky-400" : "bg-sky-200")} style={{ width: `${(v / distribucionTotal) * 100}%` }} />
                        </div>
                      </div>
                    )) : <p className="text-[11px] text-slate-400 self-center">Sin datos</p>}
                  </div>
                </div>
              </div>

              {/* Filtros + search */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="inline-flex items-center gap-1.5 bg-white/60 border border-white shadow-sm rounded-2xl p-1.5">
                  {([["all", "Todo"], ["hoy", "Hoy"], ["semana", "Esta semana"], ["mes", "Este mes"]] as [Rango, string][]).map(([k, label]) => (
                    <button key={k} type="button" onClick={() => setRango(k)} className={"px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-colors " + (rango === k ? "bg-sky-600 text-white shadow-sm shadow-sky-600/20" : "text-slate-700 hover:bg-white/70")}>
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <select value={coordinador} onChange={(e) => setCoordinador(e.target.value)} className="bg-white/70 border border-white rounded-xl px-4 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-sm">
                    <option value="all">Todos los coordinadores</option>
                    {usuariosFixture.filter((u) => u.rol === "coordinador").map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                  </select>
                  <button className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 hover:text-sky-600 transition-colors flex items-center gap-1.5 bg-white/70 px-4 py-2 rounded-xl border border-white shadow-sm">
                    Exportar
                  </button>
                </div>
              </div>

              {/* Tabla */}
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs font-semibold text-slate-700">Tabla de Procesos</div>
                  <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
                    <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar solicitud..." className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="bg-slate-50/70">
                      <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                        <th className="px-5 py-3 font-semibold">Referencia</th>
                        <th className="px-5 py-3 font-semibold">Solicitante</th>
                        <th className="px-5 py-3 font-semibold">Coordinador</th>
                        <th className="px-5 py-3 font-semibold">Estado</th>
                        <th className="px-5 py-3 font-semibold">Creación</th>
                        <th className="px-5 py-3 font-semibold text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {procesos.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-4">
                            <span className="font-mono font-semibold text-slate-900">{s.numeroReferencia ?? "—"}</span>
                            <div className="text-[10px] text-slate-500 mt-0.5">{s.categoria ?? "—"}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-medium text-slate-900">{s.solicitanteNombre}</div>
                            <div className="text-[10px] text-slate-500">{s.areaSolicitante ?? "—"}</div>
                          </td>
                          <td className="px-5 py-4"><div className="font-medium text-slate-700">{s.coordinadorId ?? "—"}</div></td>
                          <td className="px-5 py-4"><Badge tone={toneDe(s.estado)} label={estadoLegible(s.estado)} /></td>
                          <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{new Date(s.fechaCreacion).toLocaleDateString("es-HN")}</td>
                          <td className="px-5 py-4 text-right">
                            <button className="text-sky-600 hover:text-sky-800 font-semibold px-3 py-1.5 bg-sky-50 rounded-lg transition-colors whitespace-nowrap">Ver Detalle</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function NavItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button className={"w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs transition-colors " + (active ? "bg-sky-100/50 text-sky-700 font-semibold" : "text-slate-600 hover:bg-white/60 hover:text-slate-900 font-medium")}>
      <span className="text-lg">{icon}</span>
      {label}
    </button>
  );
}

function StatCard({ label, value, unit, trend, sub, tone, danger }: { label: string; value: string; unit?: string; trend?: string; sub?: string; tone?: "emerald" | "slate" | "sky" | "rose"; danger?: boolean }) {
  const valColor = tone === "emerald" ? "text-emerald-600" : tone === "sky" ? "text-sky-600" : tone === "rose" ? "text-slate-900" : "text-slate-900";
  return (
    <div className={"bg-white rounded-2xl border p-5 shadow-sm relative overflow-hidden " + (danger ? "border-slate-200/60" : "border-slate-200/60")}>
      {tone === "emerald" ? <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-100 rounded-full opacity-50" /> : null}
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1 relative z-10 flex items-center gap-1">
        {danger ? <span className="text-rose-500">Sin decisión &gt; 5 días</span> : label}
      </div>
      <div className="flex items-end justify-between relative z-10">
        <div className={"text-3xl font-semibold tracking-tight " + valColor}>
          {value}
          {unit ? <span className="text-lg text-slate-400 font-medium ml-1">{unit}</span> : null}
        </div>
        {trend ? <div className={"text-[11px] font-medium flex items-center gap-0.5 " + (tone === "emerald" ? "text-emerald-600" : "text-emerald-600")}>{trend}</div> : sub ? <div className="text-[11px] text-slate-500">{sub}</div> : null}
      </div>
    </div>
  );
}

function estadoLegible(e: string): string {
  const m: Record<string, string> = {
    ENVIADA_A_COMPRAS: "Activa",
    EN_COTIZACION: "Esperando cotizaciones",
    COMPARATIVA_LISTA: "Comparativa lista",
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