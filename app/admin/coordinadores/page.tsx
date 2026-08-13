import { AdminShell } from "@/components/ui-ext/AdminShell";

const EQUIPO = [
  { iniciales: "CO", color: "bg-sky-100 border-sky-200 text-sky-700", nombre: "Carla Ortega", rol: "Coord. Senior Compras", activos: 12, promedio: 3.2, dot: "bg-emerald-400" },
  { iniciales: "MG", color: "bg-emerald-100 border-emerald-200 text-emerald-700", nombre: "Mario Gómez", rol: "Especialista RFI", activos: 18, promedio: 4.5, dot: "bg-emerald-400" },
  { iniciales: "LF", color: "bg-purple-100 border-purple-200 text-purple-700", nombre: "Luis Fernández", rol: "Analista Junior", activos: 8, promedio: 5.1, dot: "bg-amber-400" },
];

export default function AdminCoordinadoresPage() {
  return (
    <AdminShell title="Equipo de Coordinadores" subtitle="Rendimiento, carga de trabajo y asignación del equipo.">
      <div className="mb-6 flex items-center justify-between">
        <div></div>
        <div className="relative w-full sm:w-64">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" placeholder="Buscar coordinador..." className="w-full bg-white/70 border border-white shadow-sm rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {EQUIPO.map((m) => (
          <div key={m.nombre} className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <span className={"w-2.5 h-2.5 rounded-full block shadow-[0_0_8px_rgba(52,211,153,0.8)] " + m.dot}></span>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <div className={"w-14 h-14 rounded-full flex items-center justify-center border text-lg font-semibold " + m.color}>{m.iniciales}</div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{m.nombre}</h3>
                <p className="text-[11px] text-slate-500 font-medium">{m.rol}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <div className="text-[10px] text-slate-500 font-medium mb-0.5">Activos</div>
                <div className="text-lg font-semibold text-slate-900 tracking-tight">{m.activos}</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <div className="text-[10px] text-slate-500 font-medium mb-0.5">Promedio</div>
                <div className="text-lg font-semibold text-slate-900 tracking-tight">{m.promedio} <span className="text-[10px] text-slate-400 ml-1 font-medium">días</span></div>
              </div>
            </div>
            <button className="w-full text-[11px] font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 py-2.5 rounded-xl transition-colors">Ver métricas detalladas</button>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}