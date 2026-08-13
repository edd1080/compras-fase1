import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminShell } from "@/components/ui-ext/AdminShell";
import { Badge, type BadgeTone } from "@/components/Badge";
import { solicitudesFixture, usuariosFixture } from "@/lib/fixtures";

export default async function AdminSolicitudDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = solicitudesFixture.find((x) => x.id === id);
  if (!s) notFound();

  const coordinador = usuariosFixture.find((u) => u.id === s.coordinadorId);

  const timeline = [
    { titulo: "Creación", fecha: s.fechaCreacion, descripcion: `Iniciada por ${s.solicitanteNombre}.`, activo: true },
    { titulo: "Asignación", fecha: s.fechaEnvio ?? s.fechaCreacion, descripcion: `Asignada a ${coordinador?.nombre ?? "Compras"}.`, activo: true },
    { titulo: "En revisión", fecha: s.fechaCierre ?? "—", descripcion: s.estado === "ENVIADA_A_SOLICITANTE" ? "Comparativa enviada a solicitante." : "En proceso de cotización y comparativa.", activo: false },
  ];

  return (
    <AdminShell title={s.titulo} subtitle="Línea de tiempo (Trazabilidad) y contexto de la solicitud.">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-slate-700 bg-white/70 border border-white px-2.5 py-1 rounded-xl">{s.numeroReferencia ?? "—"}</span>
            <Badge tone={toneDe(s.estado)} label={estadoLegible(s.estado)} />
          </div>
        </div>
        <Link href="/admin" className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 bg-white/70 px-4 py-2 rounded-xl border border-white shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
          Volver
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-6">Línea de tiempo (Trazabilidad)</h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-sky-200 before:via-slate-200 before:to-transparent">
              {timeline.map((t, i) => (
                <div key={t.titulo} className="relative flex items-start gap-4">
                  <div className={"flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow-sm shrink-0 z-10 " + (i === 0 ? "bg-sky-100 text-sky-600" : i === timeline.length - 1 && !t.activo ? "bg-amber-100 text-amber-600" : "bg-sky-100 text-sky-600")}>
                    {i === 0 ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
                    ) : i === timeline.length - 1 ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v3M17.5 9.5h3"/></svg>
                    )}
                  </div>
                  <div className="flex-1 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 text-xs">{t.titulo}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{new Date(t.fecha).toLocaleString("es-HN", { dateStyle: "short", timeStyle: "short" })}</span>
                    </div>
                    <div className="text-[11px] text-slate-600">{t.descripcion}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden p-5">
            <h3 className="text-xs font-semibold text-slate-700 mb-4">Contexto</h3>
            <div className="space-y-4 text-[11px]">
              <div>
                <span className="text-slate-500 uppercase tracking-wider font-semibold block text-[10px] mb-1">Solicitante</span>
                <span className="font-medium text-slate-900">{s.solicitanteNombre} ({s.areaSolicitante ?? "—"})</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase tracking-wider font-semibold block text-[10px] mb-1">Coordinador</span>
                <span className="font-medium text-slate-900">{coordinador?.nombre ?? "—"}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase tracking-wider font-semibold block text-[10px] mb-1">Tipo y Categoría</span>
                <span className="font-medium text-slate-900">{s.tipo ?? "—"} - {s.categoria ?? "—"}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase tracking-wider font-semibold block text-[10px] mb-1">Ciclo Actual</span>
                <span className="font-medium text-slate-900">{s.fechaCierre ? "Cerrado" : "En curso"}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </AdminShell>
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